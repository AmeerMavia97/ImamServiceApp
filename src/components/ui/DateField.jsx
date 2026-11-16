import { useState } from 'react';
import { Platform, Pressable, StyleSheet, Text } from 'react-native';
import DateTimePicker, { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import BottomSheetModal from '@/components/Modals/BottomSheetModal';
import AppButton from './AppButton';
import FormField from './FormField';
import AppText from './AppText';
import { colors } from '@/constants/colors';
import { fonts } from '@/constants/fonts';
import { radius } from '@/constants/layout';
import { formatDateLong } from '@/utils/formatters';

function startOfToday() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

export default function DateField({ label, labelUr, value, onChange, error }) {
  const insets = useSafeAreaInsets();
  const [iosOpen, setIosOpen] = useState(false);
  const [draft, setDraft] = useState(value);

  const openPicker = () => {
    if (Platform.OS === 'android') {
      DateTimePickerAndroid.open({
        value,
        mode: 'date',
        minimumDate: startOfToday(),
        onChange: (event, selected) => {
          if (event.type === 'set' && selected) onChange(selected);
        },
      });
    } else {
      setDraft(value);
      setIosOpen(true);
    }
  };

  return (
    <FormField label={label} labelUr={labelUr} error={error}>
      <Pressable
        accessibilityRole="button"
        onPress={openPicker}
        style={({ pressed }) => [styles.box, pressed && { opacity: 0.85 }]}
      >
        <Ionicons name="calendar" size={19} color={colors.primary} />
        <Text style={styles.text}>{formatDateLong(value)}</Text>
        <Ionicons name="chevron-down" size={18} color={colors.textMuted} />
      </Pressable>

      {Platform.OS === 'ios' ? (
        <BottomSheetModal
          visible={iosOpen}
          onClose={() => setIosOpen(false)}
          sheetStyle={[styles.sheet, { paddingBottom: Math.max(insets.bottom, 16) }]}
        >
          <AppText variant="title" style={styles.sheetTitle}>
            Select Date
          </AppText>
          <DateTimePicker
            value={draft}
            mode="date"
            display="inline"
            minimumDate={startOfToday()}
            accentColor={colors.primary}
            onChange={(_, selected) => selected && setDraft(selected)}
          />
          <AppButton
            title="Confirm Date"
            onPress={() => {
              onChange(draft);
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
    minHeight: 52,
    paddingHorizontal: 14,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  text: { flex: 1, fontFamily: fonts.bodyMedium, fontSize: 14, color: colors.text },
  sheet: {
    backgroundColor: colors.background,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    paddingHorizontal: 20,
    paddingTop: 20,
    gap: 12,
  },
  sheetTitle: { marginBottom: 4 },
});
