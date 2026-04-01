/**
 * useAudioPlaylist — Head Rub
 *
 * Uses expo-av Audio.Sound.createAsync for reliable async playback.
 * One Sound instance at a time; old sound is unloaded before next is created.
 *
 * Segment sequence per step: title → desc → tone
 * Full sequence: begin → intro → [title → desc → tone] × 9 → close
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { Audio, AVPlaybackStatus } from 'expo-av';
import * as Haptics from 'expo-haptics';

const BEGIN_URL =
  'https://patqmwdcosxgrbskvdpu.supabase.co/storage/v1/object/public/audio/begin-routine.m4a';

// ── Types ──────────────────────────────────────────────────────────────────────

export interface PlaylistStep {
  id: string;
  title: string;
  description: string;
  audio_title_url: string;
  audio_description_url: string;
  has_switch_sides: boolean;
}

export interface PlaylistRoutine {
  audio_intro_url: string;
  audio_close_url: string;
  audio_tone_url: string;
}

export interface PlaylistReturn {
  currentStepIndex: number;
  currentSegKind: string | null;
  isPlaying: boolean;
  progress: number;
  play: () => void;
  pause: () => void;
  next: () => void;
  previous: () => void;
  release: () => void;
}

// ── Segments ───────────────────────────────────────────────────────────────────

type SegKind = 'begin' | 'intro' | 'title' | 'desc' | 'tone' | 'close';

interface Seg {
  kind: SegKind;
  uri: string;
  stepIndex: number; // -1 for intro/close, 0-based for steps
}

function buildSegments(routine: PlaylistRoutine, steps: PlaylistStep[]): Seg[] {
  const segs: Seg[] = [];
  segs.push({ kind: 'begin', uri: BEGIN_URL,                stepIndex: -1 });
  segs.push({ kind: 'intro', uri: routine.audio_intro_url,  stepIndex: -1 });
  for (let i = 0; i < steps.length; i++) {
    segs.push({ kind: 'title', uri: steps[i].audio_title_url,       stepIndex: i });
    segs.push({ kind: 'desc',  uri: steps[i].audio_description_url, stepIndex: i });
    segs.push({ kind: 'tone',  uri: routine.audio_tone_url,           stepIndex: i });
  }
  segs.push({ kind: 'close', uri: routine.audio_close_url, stepIndex: -1 });
  return segs;
}

// Segment index helpers (0 = begin, 1 = intro, then groups of 3)
const titleSegIdx = (i: number) => 2 + i * 3;
const descSegIdx  = (i: number) => 3 + i * 3;
const toneSegIdx  = (i: number) => 4 + i * 3;

// ── Hook ───────────────────────────────────────────────────────────────────────

export function useAudioPlaylist(
  routine: PlaylistRoutine,
  steps: PlaylistStep[],
  callbacks: {
    onStepChange: (index: number) => void;
    onComplete: () => void;
  },
): PlaylistReturn {

  // ── State (drives UI) ──────────────────────────────────────────────────────
  const [currentStepIndex, setCurrentStepIndex] = useState(-1);
  const [currentSegKind, setCurrentSegKind]     = useState<SegKind | null>(null);
  const [isPlaying, setIsPlaying]               = useState(false);
  const [progress, setProgress]                 = useState(0);

  // ── Refs (no re-render needed) ─────────────────────────────────────────────
  const soundRef         = useRef<Audio.Sound | null>(null);
  const segsRef          = useRef<Seg[]>([]);
  const curSegRef        = useRef(0);
  const isPlayingRef     = useRef(false);
  const isReleasedRef    = useRef(false);
  const hasAutoStartedRef = useRef(false);
  const prevTapTimeRef   = useRef(0);
  const callbacksRef     = useRef(callbacks);

  // Progress tracking
  const titleDurRef      = useRef(0);
  const descDurRef       = useRef(0);
  const clipStartRef     = useRef(0);
  const segTotalRef      = useRef(30);

  // Stable ref to playAt so callbacks can call it without stale closures
  const playAtRef = useRef<(idx: number) => void>(() => {});
  // Generation counter — incremented on every playAt call to cancel in-flight loads
  const playGenRef = useRef(0);

  // Keep callbacks fresh
  useEffect(() => { callbacksRef.current = callbacks; });

  // Rebuild segments when data changes
  useEffect(() => {
    segsRef.current = steps.length > 0 ? buildSegments(routine, steps) : [];
  }, [routine, steps]);

  // One-time audio mode setup
  useEffect(() => {
    Audio.setAudioModeAsync({
      playsInSilentModeIOS: true,
      staysActiveInBackground: true,
    }).catch((e) => console.warn('[playlist] setAudioMode failed', e));
  }, []);

  // ── playAt ─────────────────────────────────────────────────────────────────

  const playAt = useCallback(async (idx: number) => {
    if (isReleasedRef.current) return;
    const segs = segsRef.current;
    if (!segs.length || idx < 0 || idx >= segs.length) return;

    // Claim this generation — any concurrent in-flight playAt will bail after their awaits
    const gen = ++playGenRef.current;

    const seg = segs[idx];
    curSegRef.current = idx;
    setCurrentStepIndex(seg.stepIndex);
    setCurrentSegKind(seg.kind);

    // Callbacks + haptics on step start
    if (seg.kind === 'title') {
      callbacksRef.current.onStepChange(seg.stepIndex);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    }

    // Progress tracking setup
    if (seg.kind === 'intro') {
      setProgress(0);
    } else if (seg.kind === 'title') {
      titleDurRef.current  = 0;
      descDurRef.current   = 0;
      clipStartRef.current = 0;
      segTotalRef.current  = 30;
      setProgress(0);
    } else if (seg.kind === 'desc') {
      clipStartRef.current = 0;
    } else if (seg.kind === 'tone') {
      clipStartRef.current = descDurRef.current;
    }

    // Reset previous-tap window on tone
    if (seg.kind === 'tone') prevTapTimeRef.current = 0;

    // Skip empty URIs gracefully
    if (!seg.uri) {
      playAtRef.current(idx + 1);
      return;
    }

    // Unload previous sound
    const prevSound = soundRef.current;
    soundRef.current = null;
    if (prevSound) {
      try { await prevSound.unloadAsync(); } catch (_) {}
    }

    // A newer playAt call superseded us — abort
    if (gen !== playGenRef.current || isReleasedRef.current) return;

    // Create and immediately play new sound
    try {
      const { sound } = await Audio.Sound.createAsync(
        { uri: seg.uri },
        { shouldPlay: true, progressUpdateIntervalMillis: 80 },
      );

      if (isReleasedRef.current) {
        sound.unloadAsync().catch(() => {});
        return;
      }

      // A newer playAt call superseded us — discard this sound
      if (gen !== playGenRef.current) {
        sound.unloadAsync().catch(() => {});
        return;
      }

      soundRef.current     = sound;
      isPlayingRef.current = true;
      setIsPlaying(true);

      sound.setOnPlaybackStatusUpdate((status: AVPlaybackStatus) => {
        if (isReleasedRef.current) return;
        if (!status.isLoaded) return;

        // Segment finished — advance to next
        if (status.didJustFinish) {
          if (seg.kind === 'close') {
            isPlayingRef.current = false;
            setIsPlaying(false);
            Haptics.notificationAsync(
              Haptics.NotificationFeedbackType.Success,
            ).catch(() => {});
            console.log('[playlist] close segment didJustFinish');
            callbacksRef.current.onComplete();
            return;
          }
          playAtRef.current(idx + 1);
          return;
        }

        // External interruption (phone call, headphone unplug)
        if (isPlayingRef.current && !status.isPlaying && !status.isBuffering) {
          isPlayingRef.current = false;
          setIsPlaying(false);
        }

        // Progress — frozen at 0 during title; animates during desc and tone only
        if (seg.kind === 'intro') {
          const ct  = status.positionMillis / 1000;
          const dur = status.durationMillis != null && status.durationMillis > 0
            ? status.durationMillis / 1000 : 0;
          setProgress(dur > 0 ? Math.min(ct / dur, 1) : 0);
        } else if (seg.kind === 'desc' || seg.kind === 'tone') {
          const ct  = status.positionMillis / 1000;
          const dur =
            status.durationMillis != null && status.durationMillis > 0
              ? status.durationMillis / 1000
              : 0;

          if (dur > 0) {
            if (seg.kind === 'desc') {
              descDurRef.current  = dur;
              segTotalRef.current = Math.max(segTotalRef.current, descDurRef.current + 5);
            } else if (seg.kind === 'tone') {
              segTotalRef.current = Math.max(segTotalRef.current, descDurRef.current + dur);
            }
          }

          const elapsed = clipStartRef.current + ct;
          setProgress(
            segTotalRef.current > 0
              ? Math.min(elapsed / segTotalRef.current, 1)
              : 0,
          );
        }
      });

    } catch (e) {
      console.warn('[playlist] createAsync failed', `idx=${idx} kind=${seg.kind}`, e instanceof Error ? e.message : e);
      // Do not auto-advance on network/resource error — stop and let the
      // user manually advance. This prevents a runaway loop when audio
      // files are temporarily unavailable.
      if (!isReleasedRef.current) {
        isPlayingRef.current = false;
        setIsPlaying(false);
      }
    }
  }, []);

  useEffect(() => { playAtRef.current = playAt; }, [playAt]);

  // Auto-start when steps are ready (audio_intro_url may be empty — playAt
  // skips segments with empty URIs, so no need to gate on it here)
  useEffect(() => {
    if (!hasAutoStartedRef.current && steps.length > 0) {
      hasAutoStartedRef.current = true;
      playAt(0);
    }
  }, [steps.length, playAt]);

  // ── Public controls ────────────────────────────────────────────────────────

  const play = useCallback(async () => {
    if (isReleasedRef.current || isPlayingRef.current) return;
    const sound = soundRef.current;
    if (!sound) return; // createAsync in progress with shouldPlay:true — no action needed
    try {
      await sound.playAsync();
      isPlayingRef.current = true;
      setIsPlaying(true);
    } catch (e) {
      console.warn('[playlist] playAsync failed', e);
    }
  }, []);

  const pause = useCallback(async () => {
    if (!isPlayingRef.current) return;
    isPlayingRef.current = false;
    setIsPlaying(false);
    const sound = soundRef.current;
    if (!sound) return;
    try { await sound.pauseAsync(); } catch (_) {}
  }, []);

  const next = useCallback(() => {
    if (isReleasedRef.current) return;
    const segs = segsRef.current;
    const seg  = segs[curSegRef.current];
    if (!seg || seg.kind === 'close') return;
    if (seg.kind === 'begin') { playAtRef.current(1); return; } // advance to intro
    if (seg.kind === 'intro') { playAtRef.current(titleSegIdx(0)); return; }
    const nextStep = seg.stepIndex + 1;
    const n = steps.length;
    playAtRef.current(nextStep < n ? titleSegIdx(nextStep) : segs.length - 1);
  }, [steps.length]);

  const previous = useCallback(() => {
    if (isReleasedRef.current) return;
    const seg = segsRef.current[curSegRef.current];
    if (!seg || seg.kind === 'begin' || seg.kind === 'close' || seg.kind === 'tone') return;
    if (seg.kind === 'intro') { playAtRef.current(1); return; } // restart intro
    const i   = seg.stepIndex;
    const now = Date.now();
    if (prevTapTimeRef.current > 0 && now - prevTapTimeRef.current < 3000) {
      prevTapTimeRef.current = 0;
      if (i > 0) {
        playAtRef.current(titleSegIdx(i - 1));
      } else {
        playAtRef.current(1); // double-tap on step 1 → go to intro
      }
    } else {
      prevTapTimeRef.current = now;
      playAtRef.current(titleSegIdx(i));
    }
  }, []);

  const release = useCallback(async () => {
    isReleasedRef.current  = true;
    isPlayingRef.current   = false;
    curSegRef.current      = 0;
    prevTapTimeRef.current = 0;
    setIsPlaying(false);
    setCurrentStepIndex(-1);
    setCurrentSegKind(null);
    setProgress(0);
    const sound = soundRef.current;
    soundRef.current = null;
    if (sound) {
      try { await sound.unloadAsync(); } catch (_) {}
    }
  }, []);

  // App backgrounded — pause
  useEffect(() => {
    const sub = AppState.addEventListener('change', (state: AppStateStatus) => {
      if (state !== 'active' && isPlayingRef.current) pause();
    });
    return () => sub.remove();
  }, [pause]);

  return { currentStepIndex, currentSegKind, isPlaying, progress, play, pause, next, previous, release };
}
