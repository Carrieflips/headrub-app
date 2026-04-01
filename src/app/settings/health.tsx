import React from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import {
  Headline,
  Subtitle,
  Subheading,
  Body,
  Label,
  BigNumber,
  Quote,
} from '@/components/Text';
import { colors } from '@/constants/colors';
import { useTheme } from '@/contexts/ThemeContext';
import AccessibilityMenu from '@/components/AccessibilityMenu';

// ─── Section block ───────────────────────────────────────────────────────────

interface SectionProps {
  num: string;
  title: string;
  textPrimary: string;
  textMuted: string;
  children: React.ReactNode;
}

function Section({ num, title, textPrimary, textMuted, children }: SectionProps) {
  const numWidth = parseInt(num) > 9 ? 80 : 40;
  return (
    <View style={section.row}>
      <BigNumber style={[section.num, { color: textMuted, width: numWidth }]}>{num}</BigNumber>
      <View style={section.content}>
        <Subheading style={[section.title, { color: textPrimary }]}>{title}</Subheading>
        {children}
      </View>
    </View>
  );
}

const section = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 40,
  },
  num: {
    lineHeight: 56,
    paddingTop: 16,
    marginRight: 16,
  },
  content: {
    flex: 1,
  },
  title: {
    marginBottom: 10,
  },
});

// ─── Helpers ──────────────────────────────────────────────────────────────────

function P({ color, children }: { color: string; children: React.ReactNode }) {
  return <Body style={[styles.bodyText, { color }]}>{children}</Body>;
}

function Bullet({ color, children }: { color: string; children: React.ReactNode }) {
  return <Body style={[styles.bullet, { color }]}>{children}</Body>;
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function HealthAndSafety() {
  const { textPrimary, textMuted } = useTheme();

  return (
    <View style={styles.root} testID="health-and-safety-screen">
      <SafeAreaView edges={['top']}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingRight: 8 }}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backBtn}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            testID="back-button"
          >
            <ChevronLeft size={28} color={textPrimary} />
          </TouchableOpacity>
          <AccessibilityMenu />
        </View>
      </SafeAreaView>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Header ── */}
        <Label style={[styles.label, { color: textMuted }]}>LAST UPDATED MARCH 2026</Label>
        <Headline style={[styles.headline, { color: textPrimary }]}>Health &amp; Safety</Headline>
        <Subtitle style={[styles.subtitle, { color: textPrimary }]}>
          Please read before your first session.
        </Subtitle>

        {/* ── Founder quote block ── */}
        <View style={styles.quoteBlock}>
          <Quote style={[styles.quoteText, { color: textPrimary }]}>
            "I built Head Rub because I needed it. I'm a designer who spends most of her day
            staring at screens, and I live with migraines. Head massage offered real relief that
            fitted into my life in a way that other options didn't. I'm not a doctor. I built this
            app as a practical tool for myself, and I'm sharing it because it helps me and I hope
            it helps you."
          </Quote>
          <Label style={[styles.attribution, { color: textMuted }]}>
            — Carrie
          </Label>
        </View>

        <View style={styles.divider} />

        {/* ── Intro body ── */}
        <P color={textPrimary}>
          Head Rub provides guided self-massage routines for general wellness purposes. Nothing in
          this app is intended to diagnose, treat, cure, or prevent any medical condition. The
          content is not medical advice and should not be used as a substitute for professional
          healthcare.
        </P>
        <P color={textPrimary}>
          If you are experiencing severe or unusual symptoms, please speak with a qualified
          healthcare provider before using this app.
        </P>

        <View style={styles.sectionGap} />

        {/* ── 1 ── */}
        <Section num="1" title="BEFORE YOU BEGIN" textPrimary={textPrimary} textMuted={textMuted}>
          <P color={textPrimary}>
            Please read the following before starting any Head Rub routine:
          </P>
          <Bullet color={textPrimary}>· Consult your doctor or healthcare provider before beginning any new physical practice, particularly if you have an existing medical condition, are pregnant, or have recently had surgery, injury, or illness.</Bullet>
          <Bullet color={textPrimary}>· Do not use this app if you have been advised by a healthcare professional to avoid massage or physical pressure to the head, neck, or face.</Bullet>
          <Bullet color={textPrimary}>· If you have a history of blood clots, vascular conditions, or recent head or neck injury, consult your doctor before using this app.</Bullet>
          <Bullet color={textPrimary}>· If you are currently experiencing a severe migraine attack with unusual symptoms — sudden onset "thunderbolt" headache, vision changes, weakness, difficulty speaking, or fever — stop and seek emergency care immediately. These may indicate a serious medical condition.</Bullet>
          <Bullet color={textPrimary}>· The routines in this app use varying levels of pressure. Do not apply force beyond what feels comfortable. Pain is a signal to stop.</Bullet>
        </Section>

        {/* ── 2 ── */}
        <Section num="2" title="DURING A ROUTINE" textPrimary={textPrimary} textMuted={textMuted}>
          <Bullet color={textPrimary}>· Stop immediately if you experience increased pain, dizziness, nausea, vision changes, or any symptom that feels unusual or worsening.</Bullet>
          <Bullet color={textPrimary}>· Sit or lie in a comfortable, supported position before beginning. Do not use this app while driving or operating machinery.</Bullet>
          <Bullet color={textPrimary}>· Listen to your body. The guidance in this app is general — your body's response is specific to you. You are always the authority on what feels appropriate.</Bullet>
          <Bullet color={textPrimary}>· The routines in this app are designed for mild-to-moderate symptoms, not for use during a severe migraine at peak intensity. If you're in significant pain, rest first.</Bullet>
        </Section>

        {/* ── 3 ── */}
        <Section num="3" title="WHO SHOULD BE ESPECIALLY CAREFUL" textPrimary={textPrimary} textMuted={textMuted}>
          <P color={textPrimary}>
            Please take extra care — and consider consulting your doctor before using this app —
            if you:
          </P>
          <Bullet color={textPrimary}>· Have been diagnosed with a vascular condition affecting the head or neck</Bullet>
          <Bullet color={textPrimary}>· Are pregnant or recently postpartum</Bullet>
          <Bullet color={textPrimary}>· Have recently had any surgical procedure involving the head, neck, face, or ears</Bullet>
          <Bullet color={textPrimary}>· Have skin conditions, wounds, or inflammation in the areas being massaged</Bullet>
          <Bullet color={textPrimary}>· Have osteoporosis or fragile bone conditions affecting the skull or neck</Bullet>
          <Bullet color={textPrimary}>· Experience neurological symptoms as part of your migraines (aura, weakness, sensory changes)</Bullet>
          <Bullet color={textPrimary}>· Are taking blood-thinning medication or have a bleeding disorder</Bullet>
        </Section>

        {/* ── 4 ── */}
        <Section num="4" title="SELF-MASSAGE IS NOT A SUBSTITUTE FOR PROFESSIONAL CARE" textPrimary={textPrimary} textMuted={textMuted}>
          <P color={textPrimary}>
            Regular massage with a licensed massage therapist or other qualified practitioner
            provides benefits that a self-guided app cannot replicate. Head Rub is designed to
            support your day-to-day wellness — not to replace professional care.
          </P>
          <P color={textPrimary}>
            If your headaches are frequent, severe, or changing in character, please speak with your
            doctor. Migraines and chronic headaches can have many causes, and a healthcare
            professional can help identify the right care approach for you.
          </P>
        </Section>

        {/* ── 5 ── */}
        <Section num="5" title="A NOTE ON MIGRAINE SPECIFICALLY" textPrimary={textPrimary} textMuted={textMuted}>
          <P color={textPrimary}>
            Migraine is a neurological condition. Head Rub uses language like "may help," "some
            people find," and "can ease" intentionally — because individual experience with
            self-massage varies, and we don't want to overpromise.
          </P>
          <P color={textPrimary}>
            Research on self-massage for migraine relief is limited but promising for some people.
            Many people who experience migraines — including me — find that regular head and neck
            massage helps reduce tension and the frequency of attacks. For others, the effect may
            be minimal. This is a practice, not a prescription.
          </P>
        </Section>

        {/* ── 6 ── */}
        <Section num="6" title="EMERGENCY RESOURCES" textPrimary={textPrimary} textMuted={textMuted}>
          <P color={textPrimary}>
            Head Rub is not designed for emergencies. If you or someone near you is experiencing a
            medical emergency, call 911 (or your local emergency number) immediately.
          </P>
          <P color={textPrimary}>
            For non-emergency migraine support and information, your doctor or a qualified
            neurologist is the best resource.
          </P>
        </Section>

        {/* ── 7 ── */}
        <Section num="7" title="CONTACT" textPrimary={textPrimary} textMuted={textMuted}>
          <P color={textPrimary}>
            Questions about the health and safety guidance in this app can be directed to:
          </P>
          <P color={textPrimary}>hello@headrub.app</P>
        </Section>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  backBtn: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    alignSelf: 'flex-start',
  },
  scroll: {
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 48,
  },
  label: {
    marginBottom: 12,
  },
  headline: {
    marginBottom: 14,
  },
  subtitle: {
    marginBottom: 28,
  },
  quoteBlock: {
    marginBottom: 32,
    paddingVertical: 32,
  },
  quoteText: {
    marginBottom: 16,
  },
  attribution: {
    lineHeight: 20,
  },
  divider: {
    height: 1,
    backgroundColor: colors.surfaceBorder,
    marginBottom: 32,
  },
  sectionGap: {
    height: 40,
  },
  bodyText: {
    marginBottom: 12,
  },
  bullet: {
    marginBottom: 4,
    paddingLeft: 4,
  },
});
