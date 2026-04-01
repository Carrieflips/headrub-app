export const fonts = {
  faustina: {
    regular:      'Faustina_400Regular',
    medium:       'Faustina_500Medium',
    mediumItalic: 'Faustina_500Medium_Italic',
  },
  geist: {
    thin:     'Geist_100Thin',
    medium:   'Geist_500Medium',
    semiBold: 'Geist_600SemiBold',
  },
  martianMono: {
    light:    'MartianMono_300Light',
    regular:  'MartianMono_400Regular',
    semiBold: 'MartianMono_600SemiBold',
  },
} as const;

export const textStyles = {
  headline:     { fontFamily: fonts.geist.medium,         fontSize: 32, lineHeight: 40 },
  subtitle:     { fontFamily: fonts.geist.medium,          fontSize: 20, lineHeight: 32 },
  subheadline:  { fontFamily: fonts.geist.semiBold,         fontSize: 24, lineHeight: 32 },
  subtitleBold: { fontFamily: fonts.geist.semiBold,        fontSize: 20, lineHeight: 32 },
  subheading: { fontFamily: fonts.martianMono.semiBold,  fontSize: 14, lineHeight: 24 },
  body:       { fontFamily: fonts.geist.medium,          fontSize: 16, lineHeight: 26 },
  bodyMicro:  { fontFamily: fonts.geist.medium,          fontSize: 12, lineHeight: 14 },
  label:      { fontFamily: fonts.martianMono.light,     fontSize: 10, lineHeight: 32,
                letterSpacing: 0.4, textTransform: 'uppercase' as const },
  buttonText: { fontFamily: fonts.martianMono.semiBold,  fontSize: 12,
                letterSpacing: 1.2, textTransform: 'uppercase' as const },
  linkText:   { fontFamily: fonts.martianMono.semiBold,  fontSize: 10, lineHeight: 32,
                letterSpacing: 0.4, textTransform: 'uppercase' as const,
                textDecorationLine: 'underline' as const },
  quote:      { fontFamily: fonts.faustina.mediumItalic, fontSize: 20, lineHeight: 32 },
  disclaimer: { fontFamily: fonts.geist.medium,          fontSize: 12, lineHeight: 20,
                opacity: 0.7 },
  microtext:  { fontFamily: fonts.martianMono.light,     fontSize: 8,  lineHeight: 16,
                letterSpacing: 0.8, textTransform: 'uppercase' as const },
  bigNumber:  { fontFamily: fonts.geist.thin,            fontSize: 64, lineHeight: 80 },
} as const;

export type TextStyleName = keyof typeof textStyles;
