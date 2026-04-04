import React from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity, Linking, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import {
  Headline,
  Subtitle,
  Body,
  Label,
  BigNumber,
  Disclaimer,
} from '@/components/Text';
import { colors } from '@/constants/colors';
import { fonts } from '@/constants/typography';
import { useTheme } from '@/contexts/ThemeContext';
import AccessibilityMenu from '@/components/AccessibilityMenu';

// ─── Citation block ───────────────────────────────────────────────────────────

interface CitationProps {
  num: string;
  tag: string;
  title: string;
  authors: string;
  year: string;
  journal: string;
  linkLabel: string;
  url: string;
  textPrimary: string;
  textMuted: string;
}

function CitationBlock({
  num,
  tag,
  title,
  authors,
  year,
  journal,
  linkLabel,
  url,
  textPrimary,
  textMuted,
}: CitationProps) {
  const numWidth = parseInt(num, 10) > 9 ? 80 : 40;
  return (
    <View style={citation.row}>
      <BigNumber
        style={[
          citation.num,
          { color: textPrimary, width: numWidth },
        ]}
      >
        {num}
      </BigNumber>
      <View style={citation.content}>
        <View style={citation.tagWrap}>
          <Label style={{ color: textPrimary }}>{tag}</Label>
        </View>
        <Body
          style={[
            citation.stack4,
            { color: textPrimary, fontFamily: fonts.geist.semiBold },
          ]}
        >
          {title}
        </Body>
        <Disclaimer style={[citation.stack4, { color: textPrimary }]}>
          {authors} · {year}
        </Disclaimer>
        <Disclaimer
          style={[
            citation.stack4,
            { color: textPrimary, fontFamily: fonts.faustina.mediumItalic },
          ]}
        >
          {journal}
        </Disclaimer>
        <Pressable
          onPress={() => {
            void Linking.openURL(url);
          }}
          style={({ pressed }) => [
            citation.linkPressable,
            pressed && { opacity: 0.7 },
          ]}
          accessibilityRole="link"
        >
          <Label
            style={{
              color: textPrimary,
              textDecorationLine: 'underline',
            }}
          >
            {linkLabel}
          </Label>
        </Pressable>
      </View>
    </View>
  );
}

const citation = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 30,
  },
  num: {
    lineHeight: 56,
    paddingTop: 16,
    marginRight: 16,
  },
  content: {
    flex: 1,
  },
  tagWrap: {
    alignSelf: 'flex-start',
    backgroundColor: colors.accentMuted,
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginBottom: 4,
  },
  stack4: {
    marginBottom: 4,
  },
  linkPressable: {
    minHeight: 44,
    justifyContent: 'center',
    marginBottom: 0,
  },
});

const CITATIONS: Omit<CitationProps, 'textPrimary' | 'textMuted'>[] = [
  {
    num: '1',
    tag: 'Randomized Controlled Trial',
    title: 'Massage therapy and frequency of chronic tension headaches',
    authors: 'Quinn, C., Chandler, C., & Moraska, A.',
    year: '2002',
    journal: 'American Journal of Public Health',
    linkLabel: 'PMID 12356617',
    url: 'https://pubmed.ncbi.nlm.nih.gov/12356617/',
  },
  {
    num: '2',
    tag: 'Randomized Controlled Trial',
    title: 'A randomized, controlled trial of massage therapy as a treatment for migraine',
    authors: 'Lawler, S.P., & Cameron, L.D.',
    year: '2006',
    journal: 'Annals of Behavioral Medicine',
    linkLabel: 'PMID 16827629',
    url: 'https://pubmed.ncbi.nlm.nih.gov/16827629/',
  },
  {
    num: '3',
    tag: 'Randomized Controlled Trial',
    title: 'Effect of acupressure and trigger points in treating headache: a randomized controlled trial',
    authors: 'Hsieh, L.L., Liou, H.H., Lee, L.H., Chen, T.H., & Yen, A.M.',
    year: '2010',
    journal: 'American Journal of Chinese Medicine',
    linkLabel: 'PMID 20128040',
    url: 'https://pubmed.ncbi.nlm.nih.gov/20128040/',
  },
  {
    num: '4',
    tag: 'SYSTEMATIC REVIEW',
    title: 'The effectiveness of acupressure on relieving pain: a systematic review',
    authors: 'Chen, Y.W., & Hwang, H.H.',
    year: '2014',
    journal: 'Pain Management Nursing',
    linkLabel: 'PMID 23415783',
    url: 'https://pubmed.ncbi.nlm.nih.gov/23415783/',
  },
  {
    num: '5',
    tag: 'Randomized Controlled Trial',
    title:
      'The impact of myofascial release and stretching techniques on the clinical outcomes of migraine headache',
    authors: 'Rezaeian, T., Ahmadi, M., Mosallanezhad, Z., & Nourbakhsh, M.R.',
    year: '2021',
    journal: 'Journal of Research in Medical Sciences',
    linkLabel: 'PMID 34484377',
    url: 'https://pubmed.ncbi.nlm.nih.gov/34484377/',
  },
  {
    num: '6',
    tag: 'META ANALYSIS',
    title:
      'Myofascial release for the treatment of tension-type, cervicogenic headache or migraine: a systematic review and meta-analysis',
    authors: 'Lu, Z., et al.',
    year: '2024',
    journal: 'Pain Medicine',
    linkLabel: 'PMCID PMC10999287',
    url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC10999287/',
  },
];

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function Citations() {
  const { textPrimary, textMuted } = useTheme();

  return (
    <View style={styles.root} testID="citations-screen">
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
        <Label style={[styles.label, { color: textMuted }]}>LAST UPDATED APRIL 2026</Label>
        <Headline style={[styles.headline, { color: textPrimary }]}>
          Citations
        </Headline>
        <Subtitle style={[styles.subtitle, { color: textPrimary }]}>
          The studies that inspired the routines in Head Rub
        </Subtitle>

        <View style={styles.divider} />

        <View style={styles.sectionGap} />

        {CITATIONS.map((c, index) => (
          <React.Fragment key={c.num}>
            <CitationBlock
              num={c.num}
              tag={c.tag}
              title={c.title}
              authors={c.authors}
              year={c.year}
              journal={c.journal}
              linkLabel={c.linkLabel}
              url={c.url}
              textPrimary={textPrimary}
              textMuted={textMuted}
            />
            <View
              style={
                index === CITATIONS.length - 1
                  ? styles.sectionDividerLast
                  : styles.sectionDivider
              }
            />
          </React.Fragment>
        ))}

        <View style={styles.closing}>
          <Disclaimer style={[styles.closingLine, { color: textMuted }]}>
            Research in manual therapies for headache is ongoing. These studies represent the
            strongest available evidence at the time Head Rub was built.
          </Disclaimer>
        </View>
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
  disclaimerCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 24,
  },
  sectionGap: {
    height: 40,
  },
  sectionDivider: {
    height: 1,
    backgroundColor: colors.surfaceBorder,
    marginBottom: 40,
  },
  sectionDividerLast: {
    height: 1,
    backgroundColor: colors.surfaceBorder,
    marginBottom: 0,
  },
  closing: {
    marginTop: 40,
  },
  closingLine: {
    textAlign: 'center',
  },
  closingLineSecond: {
    textAlign: 'center',
    marginTop: 20,
  },
});
