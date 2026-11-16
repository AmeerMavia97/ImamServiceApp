import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import BottomSheetModal from '@/components/Modals/BottomSheetModal';
import AppButton from '@/components/ui/AppButton';
import AppText from '@/components/ui/AppText';
import FormField from '@/components/ui/FormField';
import TextField from '@/components/ui/TextField';
import { colors } from '@/constants/colors';
import { radius } from '@/constants/layout';

// Admin: edit a service's price and text. Mount it with `key={service.id}` so the form
// starts from that service's current values.
export default function ServiceEditSheet({ service, visible, onClose, onSave, saving }) {
  const insets = useSafeAreaInsets();
  const [price, setPrice] = useState(service.price == null ? '' : String(service.price));
  const [unit, setUnit] = useState(service.unit);
  const [limit, setLimit] = useState(service.limit);
  const [description, setDescription] = useState(service.description);
  const [errors, setErrors] = useState({});

  const submit = () => {
    const found = {};
    const rawPrice = price.trim();
    if (rawPrice !== '' && !/^\d+$/.test(rawPrice)) found.price = 'Enter a whole number, e.g. 1000';
    if (!unit.trim()) found.unit = 'Required (e.g. per namaz)';
    if (!limit.trim()) found.limit = 'Required';
    if (!description.trim()) found.description = 'Required';
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    onSave({
      price: rawPrice === '' ? null : Number(rawPrice), // empty = "Rate on request"
      unit: unit.trim(),
      limit: limit.trim(),
      description: description.trim(),
    });
  };

  return (
    <BottomSheetModal
      visible={visible}
      onClose={onClose}
      sheetStyle={[styles.sheet, { paddingBottom: Math.max(insets.bottom, 16) }]}
    >
      <View style={styles.handle} />
      <View style={styles.header}>
        <AppText variant="title" style={styles.title}>
          Edit {service.title}
        </AppText>
        <Pressable onPress={onClose} hitSlop={10}>
          <Ionicons name="close" size={24} color={colors.textMuted} />
        </Pressable>
      </View>

      <ScrollView
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        style={styles.scroll}
        contentContainerStyle={styles.fields}
      >
        <FormField label="Price (₹)" labelUr="Rate" error={errors.price}>
          <TextField
            icon="pricetag-outline"
            placeholder="Leave empty for “Rate on request”"
            value={price}
            onChangeText={setPrice}
            keyboardType="number-pad"
            hasError={Boolean(errors.price)}
          />
        </FormField>
        <FormField label="Price unit" error={errors.unit}>
          <TextField
            icon="text-outline"
            placeholder="per namaz / per day"
            value={unit}
            onChangeText={setUnit}
            hasError={Boolean(errors.unit)}
          />
        </FormField>
        <FormField label="Limit" error={errors.limit}>
          <TextField
            icon="time-outline"
            placeholder="For 1 Day / 1 Namaz only"
            value={limit}
            onChangeText={setLimit}
            hasError={Boolean(errors.limit)}
          />
        </FormField>
        <FormField label="Description" error={errors.description}>
          <TextField
            icon="create-outline"
            placeholder="Short description"
            value={description}
            onChangeText={setDescription}
            multiline
            hasError={Boolean(errors.description)}
          />
        </FormField>
      </ScrollView>

      <View style={styles.buttons}>
        <AppButton title="Cancel" variant="soft" style={styles.button} onPress={onClose} />
        <AppButton title="Save" style={styles.button} loading={saving} onPress={submit} />
      </View>
    </BottomSheetModal>
  );
}

const styles = StyleSheet.create({
  sheet: {
    maxHeight: '88%',
    backgroundColor: colors.background,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  handle: {
    alignSelf: 'center',
    width: 44,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
    marginBottom: 14,
  },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  title: { flex: 1 },
  scroll: { flexGrow: 0 },
  fields: { gap: 14, paddingBottom: 12 },
  buttons: { flexDirection: 'row', gap: 10, paddingTop: 8 },
  button: { flex: 1 },
});
