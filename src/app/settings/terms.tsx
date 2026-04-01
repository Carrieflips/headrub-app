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
        <Subheading style={[section.title, { color: textPrimary }]}>
          {title}
        </Subheading>
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

function Sub({ color, children }: { color: string; children: React.ReactNode }) {
  return <Subheading style={[styles.inlineSub, { color }]}>{children}</Subheading>;
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function TermsOfUse() {
  const { textPrimary, textMuted } = useTheme();

  return (
    <View style={styles.root} testID="terms-of-use-screen">
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
        <Headline style={[styles.headline, { color: textPrimary }]}>Terms of Use</Headline>
        <Subtitle style={[styles.subtitle, { color: textPrimary }]}>
          These Terms govern your use of Head Rub. By using the app, you agree to them.
        </Subtitle>

        <View style={styles.divider} />

        <P color={textPrimary}>
          These Terms of Use ("Terms") govern your use of the Head Rub app and website
          (headrub.app), published by Carrie Phillips, based in California. By downloading,
          installing, or using Head Rub, you agree to these Terms.
        </P>
        <P color={textPrimary}>If you do not agree, do not use Head Rub.</P>

        <View style={styles.sectionGap} />

        {/* ── 1 ── */}
        <Section num="1" title="WHO WE ARE" textPrimary={textPrimary} textMuted={textMuted}>
          <P color={textPrimary}>
            Head Rub is an independent app published by Carrie Phillips, based in California.
          </P>
          <P color={textPrimary}>Contact: hello@headrub.app</P>
        </Section>

        {/* ── 2 ── */}
        <Section num="2" title="ELIGIBILITY" textPrimary={textPrimary} textMuted={textMuted}>
          <P color={textPrimary}>
            You must be at least 13 years of age to use Head Rub. If you are under 18, you
            represent that you have your parent or guardian's permission to use the app. You must
            also reside in a jurisdiction where this type of wellness app is permitted.
          </P>
          <P color={textPrimary}>
            You may not use Head Rub if you are prohibited from receiving wellness software under
            the laws of the United States or your jurisdiction.
          </P>
        </Section>

        {/* ── 3 ── */}
        <Section num="3" title="LICENSE" textPrimary={textPrimary} textMuted={textMuted}>
          <P color={textPrimary}>
            Subject to these Terms, Carrie Phillips grants you a limited, non-transferable,
            non-exclusive, revocable license to download and use Head Rub on your personal Apple
            device for personal, non-commercial purposes.
          </P>
          <P color={textPrimary}>You may not:</P>
          <Bullet color={textPrimary}>· Copy, reproduce, distribute, or publicly display any part of the app or its content</Bullet>
          <Bullet color={textPrimary}>· Modify, decompile, reverse engineer, or create derivative works from the app</Bullet>
          <Bullet color={textPrimary}>· Use the app or its content to build a competing product</Bullet>
          <Bullet color={textPrimary}>· Resell, sublicense, or otherwise transfer your rights under this license</Bullet>
          <Bullet color={textPrimary}>· Use automated tools to scrape, extract, or harvest any content from the app</Bullet>
        </Section>

        {/* ── 4 ── */}
        <Section num="4" title="HEALTH AND SAFETY" textPrimary={textPrimary} textMuted={textMuted}>
          <P color={textPrimary}>
            Head Rub is a wellness app. It is not a medical product.
          </P>
          <P color={textPrimary}>
            The routines and guidance in Head Rub are intended for general wellness purposes only.
            They are not intended to diagnose, treat, cure, or prevent any medical condition.
            Nothing in the app constitutes medical advice.
          </P>
          <P color={textPrimary}>
            You should consult a qualified healthcare professional before beginning any new physical
            practice, particularly if you have an existing health condition, are pregnant, or have
            recently experienced injury or illness.
          </P>
          <P color={textPrimary}>By using Head Rub, you acknowledge that:</P>
          <Bullet color={textPrimary}>· You are using the app at your own risk</Bullet>
          <Bullet color={textPrimary}>· Carrie Phillips is not a healthcare provider and does not offer medical advice</Bullet>
          <Bullet color={textPrimary}>· The app's content is for informational and wellness purposes only</Bullet>
          <Bullet color={textPrimary}>· You will seek professional medical advice for any health concerns</Bullet>
          <P color={textPrimary}>
            If you experience pain, discomfort, or unusual symptoms during use, stop immediately and
            consult a healthcare professional.
          </P>
        </Section>

        {/* ── 5 ── */}
        <Section num="5" title="PRICING AND ACCESS" textPrimary={textPrimary} textMuted={textMuted}>
          <P color={textPrimary}>
            Head Rub is currently free to use. All routines are available at no charge during this
            period.
          </P>
          <P color={textPrimary}>
            Paid subscription options may be introduced in a future update. If and when that
            happens, these Terms will be updated to reflect the applicable pricing, billing terms,
            and cancellation rights before any charges apply. You will not be charged without clear
            notice and your agreement.
          </P>
        </Section>

        {/* ── 6 ── */}
        <Section num="6" title="INTELLECTUAL PROPERTY" textPrimary={textPrimary} textMuted={textMuted}>
          <P color={textPrimary}>
            All content within Head Rub — including but not limited to audio recordings, step
            descriptions, routine scripts, imagery, and the app's code and design — is the property
            of Carrie Phillips or her licensors and is protected by applicable intellectual property
            laws.
          </P>
          <P color={textPrimary}>
            The voiceover recordings in Head Rub are original recordings made for this app. They
            may not be copied, extracted, redistributed, or used outside of the app without written
            permission.
          </P>
        </Section>

        {/* ── 7 ── */}
        <Section num="7" title="USER CONTENT" textPrimary={textPrimary} textMuted={textMuted}>
          <P color={textPrimary}>
            Head Rub includes a Give Feedback screen where you can submit written feedback. When
            you submit feedback, you grant Carrie Phillips a non-exclusive, royalty-free, perpetual,
            worldwide license to use, display, and reproduce that content in connection with the app
            and its promotion — for example, as a testimonial on the website or in marketing
            materials.
          </P>
          <P color={textPrimary}>
            We will never attribute a testimonial to you by name without your explicit permission.
            If you would like your feedback removed, contact us at hello@headrub.app and we will
            delete it promptly.
          </P>
          <P color={textPrimary}>By submitting feedback, you represent that:</P>
          <Bullet color={textPrimary}>· The content is your own and does not infringe any third party's rights</Bullet>
          <Bullet color={textPrimary}>· The content is accurate and not misleading</Bullet>
          <Bullet color={textPrimary}>· The content does not contain personal information about anyone other than yourself</Bullet>
          <P color={textPrimary}>
            Carrie Phillips reserves the right to decline to display or remove any feedback at her
            discretion, without obligation to explain why.
          </P>
        </Section>

        {/* ── 8 ── */}
        <Section num="8" title="PRIVACY" textPrimary={textPrimary} textMuted={textMuted}>
          <P color={textPrimary}>
            Your use of Head Rub is also governed by our Privacy Policy, available at
            headrub.app/privacy. The Privacy Policy explains what we collect, why, and how it is
            used. The short version: we collect almost nothing, and we never sell anything.
          </P>
        </Section>

        {/* ── 9 ── */}
        <Section num="9" title="DISCLAIMERS" textPrimary={textPrimary} textMuted={textMuted}>
          <P color={textPrimary}>
            HEAD RUB IS PROVIDED ON AN "AS IS" AND "AS AVAILABLE" BASIS. CARRIE PHILLIPS MAKES NO
            WARRANTIES, EXPRESS OR IMPLIED, INCLUDING WARRANTIES OF MERCHANTABILITY, FITNESS FOR A
            PARTICULAR PURPOSE, OR NON-INFRINGEMENT. WE DO NOT WARRANT THAT THE APP WILL BE
            UNINTERRUPTED, ERROR-FREE, OR FREE FROM HARMFUL COMPONENTS.
          </P>
          <P color={textPrimary}>
            TO THE FULLEST EXTENT PERMITTED BY LAW, CARRIE PHILLIPS DISCLAIMS ALL LIABILITY FOR
            ANY HARM, INJURY, OR LOSS ARISING FROM YOUR USE OF HEAD RUB, INCLUDING ANY PHYSICAL
            INJURY RESULTING FROM MASSAGE TECHNIQUES PERFORMED BASED ON THE APP'S GUIDANCE.
          </P>
        </Section>

        {/* ── 10 ── */}
        <Section num="10" title="LIMITATION OF LIABILITY" textPrimary={textPrimary} textMuted={textMuted}>
          <P color={textPrimary}>
            TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, IN NO EVENT SHALL CARRIE PHILLIPS BE
            LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES,
            INCLUDING LOSS OF PROFITS, DATA, OR GOODWILL, ARISING OUT OF OR IN CONNECTION WITH
            THESE TERMS OR YOUR USE OF HEAD RUB.
          </P>
          <P color={textPrimary}>
            CARRIE PHILLIPS' TOTAL LIABILITY TO YOU FOR ANY CLAIMS ARISING UNDER THESE TERMS SHALL
            NOT EXCEED FIFTY DOLLARS ($50).
          </P>
          <P color={textPrimary}>
            Some jurisdictions do not allow the exclusion of certain warranties or limitations on
            liability. In those jurisdictions, the exclusions and limitations above apply to the
            maximum extent permitted by law.
          </P>
        </Section>

        {/* ── 11 ── */}
        <Section num="11" title="INDEMNIFICATION" textPrimary={textPrimary} textMuted={textMuted}>
          <P color={textPrimary}>
            You agree to defend, indemnify, and hold harmless Carrie Phillips from any claims,
            damages, losses, liabilities, costs, and expenses (including reasonable attorney fees)
            arising from your use of the app, your violation of these Terms, or your violation of
            any applicable law.
          </P>
        </Section>

        {/* ── 12 ── */}
        <Section num="12" title="APP STORE TERMS" textPrimary={textPrimary} textMuted={textMuted}>
          <P color={textPrimary}>
            Head Rub is available through the Apple App Store. Your use of the app is also subject
            to Apple's App Store Terms of Use. Apple is not a party to these Terms and has no
            obligation or liability with respect to Head Rub or these Terms. In the event of a
            conflict between these Terms and Apple's App Store Terms, Apple's Terms govern.
          </P>
        </Section>

        {/* ── 13 ── */}
        <Section num="13" title="CHANGES TO THESE TERMS" textPrimary={textPrimary} textMuted={textMuted}>
          <P color={textPrimary}>
            We may update these Terms from time to time. Changes will be posted at headrub.app/terms
            with an updated date. Continued use of Head Rub after changes take effect constitutes
            acceptance of the revised Terms.
          </P>
        </Section>

        {/* ── 14 ── */}
        <Section num="14" title="GOVERNING LAW AND DISPUTES" textPrimary={textPrimary} textMuted={textMuted}>
          <P color={textPrimary}>
            These Terms are governed by the laws of the State of California, without regard to its
            conflict of law principles.
          </P>
          <P color={textPrimary}>
            Before initiating any formal dispute, we ask that you first contact us at
            hello@headrub.app to try to resolve the matter informally. We genuinely want to make
            things right.
          </P>
          <P color={textPrimary}>
            If informal resolution fails, any dispute arising from or relating to these Terms or
            your use of Head Rub shall be resolved in the state or federal courts located in
            California. You consent to the personal jurisdiction of those courts.
          </P>
        </Section>

        {/* ── 15 ── */}
        <Section num="15" title="CONTACT" textPrimary={textPrimary} textMuted={textMuted}>
          <P color={textPrimary}>
            Questions about these Terms should be directed to:
          </P>
          <P color={textPrimary}>hello@headrub.app</P>
          <P color={textPrimary}>Carrie Phillips is based in California, United States.</P>
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
  inlineSub: {
    marginTop: 16,
    marginBottom: 6,
  },
  bullet: {
    marginBottom: 4,
    paddingLeft: 4,
  },
});
