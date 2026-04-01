import React from 'react';
import { Text, TextProps, StyleSheet } from 'react-native';
import { textStyles } from '../constants/typography';

export const Headline: React.FC<TextProps> = ({ style, ...props }) => (
  <Text style={[styles.headline, style]} {...props} />
);
export const Subtitle: React.FC<TextProps> = ({ style, ...props }) => (
  <Text style={[styles.subtitle, style]} {...props} />
);
export const Subheadline: React.FC<TextProps> = ({ style, ...props }) => (
  <Text style={[styles.subheadline, style]} {...props} />
);
export const SubtitleBold: React.FC<TextProps> = ({ style, ...props }) => (
  <Text style={[styles.subtitleBold, style]} {...props} />
);
export const Subheading: React.FC<TextProps> = ({ style, ...props }) => (
  <Text style={[styles.subheading, style]} {...props} />
);
export const Body: React.FC<TextProps> = ({ style, ...props }) => (
  <Text style={[styles.body, style]} {...props} />
);
export const BodyMicro: React.FC<TextProps> = ({ style, ...props }) => (
  <Text style={[styles.bodyMicro, style]} {...props} />
);
export const Label: React.FC<TextProps> = ({ style, ...props }) => (
  <Text style={[styles.label, style]} {...props} />
);
export const ButtonText: React.FC<TextProps> = ({ style, ...props }) => (
  <Text style={[styles.buttonText, style]} {...props} />
);
export const LinkText: React.FC<TextProps> = ({ style, ...props }) => (
  <Text style={[styles.linkText, style]} {...props} />
);
export const Quote: React.FC<TextProps> = ({ style, ...props }) => (
  <Text style={[styles.quote, style]} {...props} />
);
export const Disclaimer: React.FC<TextProps> = ({ style, ...props }) => (
  <Text style={[styles.disclaimer, style]} {...props} />
);
export const Microtext: React.FC<TextProps> = ({ style, ...props }) => (
  <Text style={[styles.microtext, style]} {...props} />
);
export const BigNumber: React.FC<TextProps> = ({ style, ...props }) => (
  <Text style={[styles.bigNumber, style]} {...props} />
);

const styles = StyleSheet.create({
  headline:     textStyles.headline,
  subtitle:     textStyles.subtitle,
  subheadline:  textStyles.subheadline,
  subtitleBold: textStyles.subtitleBold,
  subheading: textStyles.subheading,
  body:       textStyles.body,
  bodyMicro:  textStyles.bodyMicro,
  label:      textStyles.label,
  buttonText: textStyles.buttonText,
  linkText:   textStyles.linkText,
  quote:      textStyles.quote,
  disclaimer: textStyles.disclaimer,
  microtext:  textStyles.microtext,
  bigNumber:  textStyles.bigNumber,
});
