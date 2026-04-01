import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import { Headline, Body, Label } from '@/components/Text';
import { colors } from '@/constants/colors';
import { useTheme } from '@/contexts/ThemeContext';
import AccessibilityMenu from '@/components/AccessibilityMenu';

type TabKey = 'story' | 'voice' | 'maker';

const TABS: { key: TabKey; label: string }[] = [
  { key: 'story', label: 'THE STORY' },
  { key: 'voice', label: 'THE VOICE' },
  { key: 'maker', label: 'THE MAKER' },
];

export default function About() {
  const { textPrimary, textMuted, accentHex } = useTheme();
  const [activeTab, setActiveTab] = useState<TabKey>('story');

  // 15% opacity — matches colors.accentMuted but driven by theme
  const accentMuted = `${accentHex}26`;

  return (
    <SafeAreaView edges={['top', 'bottom']} style={styles.root} testID="about-screen">

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          hitSlop={8}
          testID="back-button"
          style={styles.backBtn}
        >
          <ChevronLeft size={28} color={accentHex} />
        </TouchableOpacity>
        <AccessibilityMenu />
      </View>

      {/* Screen title */}
      <View style={styles.titleRow}>
        <Headline style={{ color: textPrimary }}>About</Headline>
      </View>

      {/* Tab bar — same pattern as Home screen filter bar */}
      <View style={styles.filterBar} testID="about-tab-bar">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <TouchableOpacity
              key={tab.key}
              onPress={() => setActiveTab(tab.key)}
              activeOpacity={0.75}
              testID={`tab-${tab.key}`}
              style={[
                styles.filterPill,
                { backgroundColor: isActive ? accentMuted : colors.black },
              ]}
            >
              <Label style={{ color: textPrimary }}>{tab.label}</Label>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Tab content */}
      {activeTab === 'story' ? (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          testID="tab-content-story"
        >
          <Body style={{ color: textPrimary }}>
            Head Rub is a guided massage app for people with eye strain and headaches.
          </Body>
          <Body style={[styles.para, { color: textPrimary }]}>
            The illustrations and collages in Head Rub are human-made, the animations hand-drawn, and the recordings provided by the app maker's Dad.
          </Body>
          <Body style={[styles.para, { color: textPrimary }]}>
            As our world tips further toward the fast and fake, Head Rub is a tiny labor of love for anyone stressed, overwhelmed, or in pain. We hope it provides you some relief.
          </Body>
        </ScrollView>
      ) : activeTab === 'voice' ? (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          testID="tab-content-voice"
        >
          <Headline style={{ color: textPrimary }}>Bob Phillips</Headline>
          <Body style={[styles.subtitle, { color: textMuted }]}>Carrie's Dad</Body>
          <Body style={[styles.para, { color: textPrimary }]}>
            Bob works as head custodian at one of Fairfield's elementary schools in southern Ohio. Burdened with a voice for radio, he has recorded several answering machine greetings, a handful of church readings, and a couple commercials as a young man in Kingsport, Tennessee.
          </Body>
          <Body style={[styles.para, { color: textPrimary }]}>
            As a baseball umpire, Bob calls balls and strikes with the precision of an expert and the baritone voice of an angel. (Minimal enunciation is a stylistic choice.)
          </Body>
          <Body style={[styles.para, { color: textPrimary }]}>
            Between December 20th and the 26th, he sings Christmas songs like a champ.
          </Body>
        </ScrollView>
      ) : (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          testID="tab-content-maker"
        >
          <Headline style={{ color: textPrimary }}>Carrie Phillips</Headline>
          <Body style={[styles.subtitle, { color: textMuted }]}>Founder, Head Rub</Body>
          <Body style={[styles.para, { color: textPrimary }]}>
            Carrie is a San Francisco-based product designer and polycraft (maker of many, many crafts).
          </Body>
          <Body style={[styles.para, { color: textPrimary }]}>
            She was voted 'Most likely to look like Elton John in the office,' on account of often wearing sunglasses indoors. Migraines and the accompanying light sensitivity have only added to her signature style. (If it weren't for the pain and nausea, she'd be pretty jazzed.)
          </Body>
          <Body style={[styles.para, { color: textPrimary }]}>
            She's got lots of gray hairs and still likes building stuff with her Dad.
          </Body>
          <Body style={[styles.para, { color: textPrimary }]}>
            Carrie is enormously grateful that you're supporting this app, and her mission to support people experiencing migraines with literally whatever helps.
          </Body>
        </ScrollView>
      )}
      {/* Restore Purchases removed for free MVP. Re-add when PAYWALL_ENABLED = true. */}

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  backBtn: {
    width: 44,
    alignItems: 'flex-start',
  },
  titleRow: {
    paddingHorizontal: 24,
    paddingBottom: 8,
  },
  // Matches home.tsx filterBar exactly
  filterBar: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 12,
    paddingTop: 24,
    paddingBottom: 12,
  },
  // Matches home.tsx filterPill exactly
  filterPill: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 48,
  },
  para: {
    marginTop: 20,
  },
  subtitle: {
    marginTop: 4,
    marginBottom: 4,
  },
});
