import { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { colors } from '@/constants/colors';
import { fonts } from '@/constants/fonts';
import { radius } from '@/constants/layout';

// `prefix`: fixed text before the input (e.g. "+91" on a phone number field).
// `right`: optional element shown at the end of the field (e.g. a show / hide password button).
// `variant="simple"`: transparent field, light border, small radius, no icon (green border on focus).
export default function TextField({ icon, prefix, right, multiline = false, hasError = false, variant = 'outline', style, ...props }) {
  const [focused, setFocused] = useState(false);
  const simple = variant === 'simple';

  return (
    <View
      style={[
        styles.box,
        multiline && styles.boxMultiline,
        simple && styles.boxSimple,
        focused && styles.boxFocused,
        hasError && styles.boxError,
        style,
      ]}
    >
      {icon && !simple ? (
        <Ionicons
          name={icon}
          size={19}
          color={focused ? colors.primary : colors.textMuted}
          style={multiline ? styles.iconTop : null}
        />
      ) : null}
      {prefix ? <Text style={styles.prefix}>{prefix}</Text> : null}
      <TextInput
        {...props}
        multiline={multiline}
        placeholderTextColor={colors.textMuted}
        cursorColor={colors.primary}
        onFocus={(e) => {
          setFocused(true);
          props.onFocus?.(e);
        }}
        onBlur={(e) => {
          setFocused(false);
          props.onBlur?.(e);
        }}
        style={[styles.input, multiline && styles.inputMultiline]}
      />
      {right}
    </View>
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
  boxMultiline: { alignItems: 'flex-start', paddingVertical: 12 },
  boxFocused: { borderColor: colors.primary },
  boxSimple: { minHeight: 50, borderRadius: radius.sm, backgroundColor: colors.transparent },
  boxError: { borderColor: colors.danger },
  iconTop: { marginTop: 2 },
  input: {
    flex: 1,
    fontFamily: fonts.bodyMedium,
    fontSize: 14,
    color: colors.text,
    paddingVertical: 0,
  },
  prefix: { fontFamily: fonts.bodySemi, fontSize: 14, color: colors.text },
  inputMultiline: { minHeight: 80, textAlignVertical: 'top' },
});
