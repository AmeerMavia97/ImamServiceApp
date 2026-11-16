import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import AppText from './AppText';
import { colors } from '@/constants/colors';
import { radius } from '@/constants/layout';

// − [ 3 Persons ] + counter.
export default function Stepper({ value, onChange, min = 1, max = 10, unit = 'Persons' }) {
  const canDecrease = value > min;
  const canIncrease = value < max;

  return (
    <View style={styles.box}>
      <StepButton icon="remove" disabled={!canDecrease} onPress={() => onChange(value - 1)} />
      <View style={styles.center}>
        <AppText variant="title">{value}</AppText>
        <AppText variant="caption">{value === 1 ? unit.replace(/s$/, '') : unit}</AppText>
      </View>
      <StepButton icon="add" disabled={!canIncrease} onPress={() => onChange(value + 1)} />
    </View>
  );
}

function StepButton({ icon, onPress, disabled }) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [styles.button, disabled && styles.buttonDisabled, pressed && { opacity: 0.8 }]}
    >
      <Ionicons name={icon} size={22} color={disabled ? colors.textMuted : colors.textOnPrimary} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  box: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 8,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  center: { alignItems: 'center' },
  button: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
  },
  buttonDisabled: { backgroundColor: colors.divider },
});
