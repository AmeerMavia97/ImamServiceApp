import { useState } from 'react';
import { Platform, Pressable, StyleSheet, Text } from 'react-native';
import DateTimePicker, { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import BottomSheetModal from '@/components/Modals/BottomSheetModal';
import AppButton from './AppButton';
import AppText from './AppText';
import FormField from './FormField';
import { colors } from '@/constants/colors';
import { fonts } from '@/constants/fonts';
import { radius } from '@/constants/layout';
import { formatTime, toTimeOnly } from '@/utils/formatters';

// 'HH:MM' -> a Date today at that time (9:00 when empty), for the picker.
function toDate(value) {
  const [h, m] = (value || '09:00').split(':').map(Number);
  const date = new Date();
  date.setHours(h, m, 0, 0);
  return date;
}

// Time input: shows e.g. "6:30 PM" and opens the phone's time picker. value / onChange use 'HH:MM'.
export default function TimeField({ label, value, onChange, error, placeholder = 'Select time', style }) {
  const insets = useSafeAreaInsets();
  const [iosOpen, setIosOpen] = useState(false);
  const [draft, setDraft] = useState(toDate(value));

  const openPicker = () => {
    if (Platform.OS === 'android') {
      DateTimePickerAndroid.open({
        value: toDate(value),
        mode: 'time',
        is24Hour: false,
        onChange: (event, selected) => {
          if (event.type === 'set' && selected) onChange(toTimeOnly(selected));
        },
      });
    } else {
      setDraft(toDate(value));
      setIosOpen(true);
    }
  };

  return (
    <FormField label={label} error={error} style={style}>
      <Pressable
        accessibilityRole="button"
        onPress={openPicker}
        style={({ pressed }) => [styles.box, error && styles.boxError, pressed && { opacity: 0.85 }]}
      >
        <Text numberOfLines={1} style={[styles.text, !value && styles.placeholder]}>
          {value ? formatTime(value) : placeholder}
        </Text>
        <Ionicons name="time-outline" size={19} color={colors.textMuted} />
      </Pressable>

      {Platform.OS === 'ios' ? (
        <BottomSheetModal
          visible={iosOpen}
          onClose={() => setIosOpen(false)}
          sheetStyle={[styles.sheet, { paddingBottom: Math.max(insets.bottom, 16) }]}
        >
          <AppText variant="title">{label}</AppText>
          <DateTimePicker
            value={draft}
            mode="time"
            display="spinner"
            accentColor={colors.primary}
            onChange={(_, selected) => selected && setDraft(selected)}
          />
          <AppButton
            title="Confirm Time"
            onPress={() => {
              onChange(toTimeOnly(draft));
              setIosOpen(false);
            }}
          />
        </BottomSheetModal>
      ) : null}
    </FormField>
  );
}

const styles = StyleSheet.create({
  box: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    minHeight: 50,
    paddingHorizontal: 14,
    backgroundColor: colors.transparent,
    borderRadius: radius.sm,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  boxError: { borderColor: colors.danger },
  text: { flex: 1, fontFamily: fonts.bodyMedium, fontSize: 14, color: colors.text },
  placeholder: { color: colors.textMuted },
  sheet: {
    backgroundColor: colors.background,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    paddingHorizontal: 20,
    paddingTop: 20,
    gap: 12,
  },
});
