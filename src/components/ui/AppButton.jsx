import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { colors } from '@/constants/colors';
import { fonts } from '@/constants/fonts';
import { radius } from '@/constants/layout';

const VARIANTS = {
  primary: { bg: colors.primary, fg: colors.textOnPrimary, border: colors.primary },
  gold: { bg: colors.goldLight, fg: colors.primaryDeep, border: colors.goldLight },
  outline: { bg: colors.transparent, fg: colors.primary, border: colors.primary },
  soft: { bg: colors.primaryLight, fg: colors.primary, border: colors.primaryLight },
  danger: { bg: colors.transparent, fg: colors.danger, border: colors.danger },
  dangerSolid: { bg: colors.danger, fg: colors.white, border: colors.danger },
};

const SIZES = {
  sm: { height: 40, paddingHorizontal: 14, fontSize: 13, icon: 16 },
  md: { height: 50, paddingHorizontal: 20, fontSize: 15, icon: 18 },
  lg: { height: 56, paddingHorizontal: 24, fontSize: 16, icon: 20 },
};

export default function AppButton({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  icon,
  iconRight,
  loading = false,
  disabled = false,
  style,
}) {
  const v = VARIANTS[variant];
  const s = SIZES[size];
  const inactive = disabled || loading;

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      disabled={inactive}
      style={({ pressed }) => [
        styles.base,
        {
          backgroundColor: v.bg,
          borderColor: v.border,
          height: s.height,
          paddingHorizontal: s.paddingHorizontal,
          opacity: inactive ? 0.55 : pressed ? 0.85 : 1,
          transform: [{ scale: pressed ? 0.98 : 1 }],
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={v.fg} />
      ) : (
        <>
          {icon ? <Ionicons name={icon} size={s.icon} color={v.fg} /> : null}
          <Text style={[styles.text, { color: v.fg, fontSize: s.fontSize }]} numberOfLines={1}>
            {title}
          </Text>
          {iconRight ? <Ionicons name={iconRight} size={s.icon} color={v.fg} /> : null}
        </>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1.5,
    borderRadius: radius.pill,
  },
  text: { fontFamily: fonts.bodyBold },
});
