import { Text, StyleSheet } from 'react-native';

import { colors } from '@/constants/colors';
import { fonts } from '@/constants/fonts';

export default function AppText({ variant = 'body', color, style, ...props }) {
  return <Text style={[styles[variant], color && { color }, style]} {...props} />;
}

const styles = StyleSheet.create({
  display: { fontFamily: fonts.display, fontSize: 34, lineHeight: 42, color: colors.text },
  title: { fontFamily: fonts.displaySemi, fontSize: 24, lineHeight: 31, color: colors.text },
  heading: { fontFamily: fonts.bodyBold, fontSize: 16, lineHeight: 22, color: colors.text },
  subheading: { fontFamily: fonts.bodySemi, fontSize: 14, lineHeight: 20, color: colors.text },
  body: { fontFamily: fonts.body, fontSize: 14, lineHeight: 21, color: colors.text },
  label: { fontFamily: fonts.bodySemi, fontSize: 13, lineHeight: 18, color: colors.text },
  caption: { fontFamily: fonts.body, fontSize: 12, lineHeight: 17, color: colors.textMuted },
  overline: {
    fontFamily: fonts.bodyBold,
    fontSize: 11,
    lineHeight: 15,
    letterSpacing: 1.3,
    textTransform: 'uppercase',
    color: colors.goldDark,
  },
});
