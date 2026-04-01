import React from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import { Headline, Subheading, Body, Label } from '@/components/Text';
import { colors } from '@/constants/colors';
import AccessibilityMenu from '@/components/AccessibilityMenu';

function BackHeader({ title }: { title: string }) {
  return (
    <View style={headerStyles.row}>
      <TouchableOpacity onPress={() => router.back()} style={headerStyles.backBtn} hitSlop={8} testID="back-button">
        <ChevronLeft size={28} color={colors.accent} />
      </TouchableOpacity>
      <Label style={[headerStyles.title, { color: colors.textMuted }]}>{title}</Label>
      <AccessibilityMenu />
    </View>
  );
}

const headerStyles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 16 },
  backBtn: { width: 44, alignItems: 'flex-start' },
  title: { flex: 1, textAlign: 'center' },
  spacer: { width: 44 },
});

export default function Values() {
  return (
    <View style={styles.root} testID="values-screen">
      <SafeAreaView edges={['top']}>
        <BackHeader title="GOSHDANG VALUES" />
      </SafeAreaView>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Headline style={styles.headline}>Goshdang Values</Headline>

        <View style={styles.valueBlock}>
          <Subheading style={styles.valueTitle}>CALM OVER NOISE</Subheading>
          <Body style={styles.valueBody}>Placeholder value description. Copy coming soon.</Body>
        </View>

        <View style={styles.valueBlock}>
          <Subheading style={styles.valueTitle}>PURPOSEFUL SIMPLICITY</Subheading>
          <Body style={styles.valueBody}>Placeholder value description. Copy coming soon.</Body>
        </View>

        <View style={styles.valueBlock}>
          <Subheading style={styles.valueTitle}>HONESTY</Subheading>
          <Body style={styles.valueBody}>Placeholder value description. Copy coming soon.</Body>
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
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 48,
  },
  headline: {
    color: colors.textPrimary,
    letterSpacing: 8,
    marginTop: 8,
    marginBottom: 40,
  },
  valueBlock: {
    marginBottom: 40,
  },
  valueTitle: {
    color: colors.textPrimary,
    marginBottom: 8,
  },
  valueBody: {
    color: colors.textPrimary,
  },
});
