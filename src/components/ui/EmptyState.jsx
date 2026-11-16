import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import AppText from './AppText';
import { colors } from '@/constants/colors';

// Plain "nothing here" message, centred in the available space: icon, title, description.
// No box or card around it. Put it directly inside a screen / scroll content that can grow.
export default function EmptyState({ icon, title, description, children, style }) {
  return (
    <View style={[styles.wrap, style]}>
      <Ionicons name={icon} size={56} color={colors.primary} style={styles.icon} />
      <AppText variant="title" style={styles.center}>
        {title}
      </AppText>
      {description ? (
        <AppText variant="body" color={colors.textMuted} style={[styles.center, styles.description]}>
          {description}
        </AppText>
      ) : null}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    minHeight: 220,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 24,
  },
  icon: { opacity: 0.85, marginBottom: 4 },
  center: { textAlign: 'center' },
  description: { maxWidth: 300 },
});
