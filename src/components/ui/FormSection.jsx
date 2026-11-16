import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import AppText from './AppText';
import { colors } from '@/constants/colors';
import { radius, shadows } from '@/constants/layout';

// White rounded card that groups related form fields under a titled header.
export default function FormSection({ icon, title, titleUr, children }) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.iconWrap}>
          <Ionicons name={icon} size={18} color={colors.primary} />
        </View>
        <View>
          <AppText variant="heading">{title}</AppText>
          {titleUr ? <AppText variant="caption">{titleUr}</AppText> : null}
        </View>
      </View>
      <View style={styles.body}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 16,
    gap: 16,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.divider,
    ...shadows.card,
  },
  header: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  iconWrap: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primaryLight,
  },
  body: { gap: 16 },
});
