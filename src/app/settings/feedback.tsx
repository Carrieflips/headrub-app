import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  TextInput,
  KeyboardAvoidingView,
  Keyboard,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import { Headline, Body, ButtonText } from '@/components/Text';
import { colors } from '@/constants/colors';
import { useTheme } from '@/contexts/ThemeContext';
import { supabase } from '@/lib/supabase';
import { getDeviceId } from '@/lib/deviceId';
import AccessibilityMenu from '@/components/AccessibilityMenu';

export default function Feedback() {
  const { textPrimary, textMuted, accentHex } = useTheme();
  const [message, setMessage] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [sent, setSent] = useState<boolean>(false);
  const [error, setError] = useState<boolean>(false);

  async function handleSubmit() {
    if (!message.trim() || submitting) return;
    setSubmitting(true);
    setError(false);
    try {
      const deviceId = await getDeviceId();
      const { error: dbError } = await supabase.from('feedback').insert({
        device_id: deviceId,
        message: message.trim(),
        created_at: new Date().toISOString(),
      });
      if (dbError) throw dbError;
      setSent(true);
      setTimeout(() => router.back(), 2000);
    } catch {
      setError(true);
      setSubmitting(false);
    }
  }

  // Accent border at ~20% opacity
  const accentBorder = `${accentHex}33`;
  const canSubmit = message.trim().length > 0 && !submitting;

  return (
    <SafeAreaView edges={['top', 'bottom']} style={styles.root} testID="feedback-screen">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
          <View style={styles.inner}>

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

            {sent ? (
              /* ── Confirmation state ── */
              <View style={styles.confirmationContainer} testID="feedback-confirmation">
                <Body style={{ color: textPrimary }}>Sent. Thank you</Body>
              </View>
            ) : (
              /* ── Form ── */
              <View style={styles.content}>
                <Headline style={{ color: textPrimary }}>Give Feedback</Headline>
                <Body style={[styles.supporting, { color: textMuted }]}>
                  Your feedback goes directly to the founder.
                </Body>

                <TextInput
                  style={[
                    styles.input,
                    { color: textPrimary, borderColor: accentBorder },
                  ]}
                  multiline
                  placeholder="What's on your mind?"
                  placeholderTextColor={textMuted}
                  value={message}
                  onChangeText={setMessage}
                  selectionColor={accentHex}
                  textAlignVertical="top"
                  autoFocus={false}
                  testID="feedback-input"
                />

                <TouchableOpacity
                  onPress={handleSubmit}
                  disabled={!canSubmit}
                  activeOpacity={0.85}
                  testID="feedback-submit-button"
                  style={[
                    styles.sendButton,
                    { backgroundColor: accentHex, opacity: canSubmit ? 1 : 0.4 },
                  ]}
                >
                  {submitting ? (
                    <ActivityIndicator color={colors.black} size="small" />
                  ) : (
                    <ButtonText style={{ color: colors.black }}>Send</ButtonText>
                  )}
                </TouchableOpacity>

                {error ? (
                  <Body style={[styles.errorText, { color: textMuted }]} testID="feedback-error">
                    Something went wrong. Try again.
                  </Body>
                ) : null}
              </View>
            )}

          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  keyboardView: {
    flex: 1,
  },
  inner: {
    flex: 1,
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
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 8,
  },
  supporting: {
    marginTop: 8,
    marginBottom: 24,
  },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    lineHeight: 24,
    minHeight: 140,
    marginBottom: 16,
    fontFamily: undefined,
  },
  sendButton: {
    alignSelf: 'flex-start',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 80,
  },
  errorText: {
    marginTop: 12,
  },
  confirmationContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
