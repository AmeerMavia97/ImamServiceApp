import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import FormField from './FormField';
import SelectSheet from '@/components/Modals/SelectSheet';
import { colors } from '@/constants/colors';
import { fonts } from '@/constants/fonts';
import { radius } from '@/constants/layout';

// Dropdown trigger + bottom-sheet picker.
// options: [{ value, label, caption? }]. An option with value '' acts as "All / clear".
// `compact`: small label sits inside the box (used for the Home filters to save space).
export default function SelectField({
  label,
  labelUr,
  placeholder = 'Select',
  value,
  options,
  onChange,
  icon,
  error,
  sheetTitle,
  searchable = false,
  allowManual = false,
  manualHint,
  compact = false,
  variant = 'outline',
  style,
}) {
  const [open, setOpen] = useState(false);

  const match = options.find((o) => o.value === value);
  // A value that is not in the list was typed manually.
  const display = match ? match.label : value || '';
  const showPlaceholder = !display || (match && match.value === '');
  const active = !showPlaceholder;

  const sheet = (
    <SelectSheet
      visible={open}
      title={sheetTitle || label || placeholder}
      options={options}
      value={value}
      searchable={searchable}
      allowManual={allowManual}
      manualHint={manualHint}
      onSelect={(next) => {
        onChange(next);
        setOpen(false);
      }}
      onClose={() => setOpen(false)}
    />
  );

  if (compact) {
    return (
      <View style={style}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={label}
          onPress={() => setOpen(true)}
          style={({ pressed }) => [
            styles.compactBox,
            active && styles.compactBoxActive,
            pressed && { opacity: 0.85 },
          ]}
        >
          <View style={styles.compactTexts}>
            <Text style={styles.compactLabel}>{label}</Text>
            <Text numberOfLines={1} style={[styles.compactValue, active && styles.compactValueActive]}>
              {showPlaceholder ? placeholder : display}
            </Text>
          </View>
          <Ionicons name="chevron-down" size={16} color={active ? colors.primary : colors.textMuted} />
        </Pressable>
        {sheet}
      </View>
    );
  }

  return (
    <FormField label={label} labelUr={labelUr} error={error} style={style}>
      <Pressable
        accessibilityRole="button"
        onPress={() => setOpen(true)}
        style={({ pressed }) => [
          styles.box,
          variant === 'simple' && styles.boxSimple,
          error && styles.boxError,
          pressed && { opacity: 0.85 },
        ]}
      >
        {icon && variant !== 'simple' ? <Ionicons name={icon} size={19} color={colors.primary} /> : null}
        <Text numberOfLines={1} style={[styles.text, showPlaceholder && styles.placeholder]}>
          {showPlaceholder ? placeholder : display}
        </Text>
        <Ionicons name="chevron-down" size={18} color={colors.textMuted} />
      </Pressable>
      {sheet}
    </FormField>
  );
}

const styles = StyleSheet.create({
  box: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    minHeight: 52,
    paddingHorizontal: 14,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  boxSimple: { minHeight: 50, borderRadius: radius.sm, backgroundColor: colors.transparent },
  boxError: { borderColor: colors.danger },
  text: { flex: 1, fontFamily: fonts.bodyMedium, fontSize: 14, color: colors.text },
  placeholder: { color: colors.textMuted },

  compactBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    height: 50,
    paddingHorizontal: 12,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  compactBoxActive: { backgroundColor: colors.primarySoft, borderColor: colors.primary },
  compactTexts: { flex: 1 },
  compactLabel: { fontFamily: fonts.bodySemi, fontSize: 10, letterSpacing: 0.4, color: colors.goldDark },
  compactValue: { fontFamily: fonts.bodyMedium, fontSize: 13, color: colors.textMuted },
  compactValueActive: { color: colors.primary, fontFamily: fonts.bodyBold },
});
