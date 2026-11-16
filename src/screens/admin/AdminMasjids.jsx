import { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { useCities } from '@/components/hooks/useCities';
import AppButton from '@/components/ui/AppButton';
import AppText from '@/components/ui/AppText';
import FormField from '@/components/ui/FormField';
import FormSection from '@/components/ui/FormSection';
import SelectField from '@/components/ui/SelectField';
import TextField from '@/components/ui/TextField';
import { colors } from '@/constants/colors';
import { radius } from '@/constants/layout';
import { addMasjid, getMasjids } from '@/services/masjidService';

// Admin: add a masjid to one of the added cities (pick the city, type the masjid name).
export default function AdminMasjids() {
  const queryClient = useQueryClient();
  const { options: cityOptions } = useCities();
  const { data: masjids = [] } = useQuery({ queryKey: ['masjids', ''], queryFn: () => getMasjids('') });

  const [city, setCity] = useState('');
  const [name, setName] = useState('');
  const [errors, setErrors] = useState({});

  const mutation = useMutation({
    mutationFn: addMasjid,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['masjids'] });
      setName('');
    },
    onError: (e) => setErrors({ name: e.message }),
  });

  // { Delhi: [masjid, ...], Jaipur: [...] }
  const byCity = useMemo(() => {
    const groups = {};
    masjids.forEach((m) => {
      groups[m.caption] = [...(groups[m.caption] ?? []), m.label];
    });
    return Object.entries(groups).sort(([a], [b]) => a.localeCompare(b));
  }, [masjids]);

  const onAdd = () => {
    const found = {};
    if (!city) found.city = 'Please select a city';
    if (!name.trim()) found.name = 'Please enter the masjid name';
    setErrors(found);
    if (Object.keys(found).length > 0) return;
    mutation.mutate({ city, name });
  };

  return (
    <View style={styles.wrap}>
      <FormSection icon="add-circle" title="Add Masjid" titleUr="Shehar mein nayi masjid shamil karein">
        <SelectField
          label="City"
          labelUr="Shehar"
          icon="location-outline"
          placeholder="Select city"
          sheetTitle="Select City"
          value={city}
          options={cityOptions}
          error={errors.city}
          searchable
          onChange={(value) => {
            setCity(value);
            setErrors({});
          }}
        />
        <FormField label="Masjid name" labelUr="Masjid ka naam" error={errors.name}>
          <TextField
            icon="business-outline"
            placeholder="e.g. Jama Masjid Jaipur"
            value={name}
            onChangeText={(value) => {
              setName(value);
              setErrors((prev) => ({ ...prev, name: undefined }));
            }}
            autoCapitalize="words"
            hasError={Boolean(errors.name)}
          />
        </FormField>
        <AppButton title="Add Masjid" icon="add" loading={mutation.isPending} onPress={onAdd} />
        {mutation.isSuccess && !errors.name ? (
          <View style={styles.success}>
            <Ionicons name="checkmark-circle" size={18} color={colors.success} />
            <AppText variant="caption" color={colors.success}>
              Masjid added to {city}
            </AppText>
          </View>
        ) : null}
      </FormSection>

      {byCity.map(([cityName, names]) => (
        <View key={cityName} style={styles.listCard}>
          <AppText variant="overline">
            {cityName} · {names.length}
          </AppText>
          {names.map((masjid) => (
            <View key={masjid} style={styles.row}>
              <Ionicons name="business" size={15} color={colors.primary} />
              <AppText variant="body" style={styles.rowText}>
                {masjid}
              </AppText>
            </View>
          ))}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 16 },
  success: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  listCard: {
    gap: 10,
    padding: 16,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.divider,
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  rowText: { flex: 1 },
});
