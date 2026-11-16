import { Pressable, StyleSheet, View } from 'react-native';

import AppText from './AppText';
import { colors } from '@/constants/colors';

export default function SectionHeader({ eyebrow, title, subtitle, actionLabel, onAction, style }) {
  return (
    <View style={[styles.row, style]}>
      <View style={styles.texts}>
        {eyebrow ? <AppText variant="overline">{eyebrow}</AppText> : null}
        <AppText variant="title">{title}</AppText>
        {subtitle ? <AppText variant="caption">{subtitle}</AppText> : null}
      </View>
      {actionLabel ? (
        <Pressable onPress={onAction} hitSlop={8}>
          <AppText variant="label" color={colors.primary}>
            {actionLabel}
          </AppText>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', gap: 12 },
  texts: { flex: 1, gap: 2 },
});
