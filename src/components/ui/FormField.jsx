import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import AppText from './AppText';
import { colors } from '@/constants/colors';

// Label (English + Roman Urdu) above any input, with an error line below.
export default function FormField({ label, labelUr, error, children, style }) {
  return (
    <View style={[styles.wrap, style]}>
      {label ? (
        <View style={styles.labelRow}>
          <AppText variant="label">{label}</AppText>
          {labelUr ? (
            <AppText variant="caption" color={colors.goldDark}>
              · {labelUr}
            </AppText>
          ) : null}
        </View>
      ) : null}
      {children}
      {error ? (
        <View style={styles.errorRow}>
          <Ionicons name="alert-circle" size={14} color={colors.danger} />
          <AppText variant="caption" color={colors.danger} style={styles.errorText}>
            {error}
          </AppText>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 8 },
  labelRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  errorRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  errorText: { flex: 1 },
});
