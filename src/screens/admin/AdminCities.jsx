import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { useCities } from '@/components/hooks/useCities';
import AppButton from '@/components/ui/AppButton';
import AppText from '@/components/ui/AppText';
import FormField from '@/components/ui/FormField';
import FormSection from '@/components/ui/FormSection';
import TextField from '@/components/ui/TextField';
import { colors } from '@/constants/colors';
import { radius } from '@/constants/layout';
import { addCity, sameCity } from '@/services/cityService';

// Admin: add a new city. It then shows up in the booking form and the Imam filter.
export default function AdminCities() {
  const queryClient = useQueryClient();
  const { cities } = useCities();
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const mutation = useMutation({
    mutationFn: addCity,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cities'] });
      setName('');
    },
    onError: (e) => setError(e.message),
  });

  const onAdd = () => {
    if (!name.trim()) {
      setError('Please enter a city name');
      return;
    }
    // instant check against the cities already on screen (upper / lower case ignored)
    const existing = cities.find((city) => sameCity(city, name));
    if (existing) {
      setError(`${existing} is already in the list`);
      return;
    }
    setError('');
    mutation.mutate(name);
  };

  return (
    <View style={styles.wrap}>
      <FormSection icon="add-circle" title="Add City" titleUr="Naya shehar shamil karein">
        <FormField label="City name" error={error}>
          <TextField
            icon="location-outline"
            placeholder="e.g. Jaipur"
            value={name}
            onChangeText={(value) => {
              setName(value);
              setError('');
            }}
            autoCapitalize="words"
            hasError={Boolean(error)}
          />
        </FormField>
        <AppButton title="Add City" icon="add" loading={mutation.isPending} onPress={onAdd} />
        {mutation.isSuccess && !error ? (
          <View style={styles.success}>
            <Ionicons name="checkmark-circle" size={18} color={colors.success} />
            <AppText variant="caption" color={colors.success}>
              City added
            </AppText>
          </View>
        ) : null}
      </FormSection>

      <View style={styles.listCard}>
        <AppText variant="overline">All cities · {cities.length}</AppText>
        <View style={styles.chips}>
          {cities.map((city) => (
            <View key={city} style={styles.chip}>
              <Ionicons name="location" size={13} color={colors.primary} />
              <AppText variant="caption" color={colors.text}>
                {city}
              </AppText>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 16 },
  success: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  listCard: {
    gap: 12,
    padding: 16,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.divider,
  },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: radius.pill,
    backgroundColor: colors.primarySoft,
  },
});
