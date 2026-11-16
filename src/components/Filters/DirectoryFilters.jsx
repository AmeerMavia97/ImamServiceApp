import { Pressable, StyleSheet, View } from 'react-native';

import { useCities } from '@/components/hooks/useCities';
import AppText from '@/components/ui/AppText';
import SelectField from '@/components/ui/SelectField';
import { colors } from '@/constants/colors';
import { radius, shadows } from '@/constants/layout';
import { EXPERIENCE_OPTIONS, FEE_RANGES, LANGUAGES } from '@/constants/options';
import { ROLES } from '@/constants/roles';

const toOptions = (list, allLabel) => [
  { value: '', label: allLabel },
  ...list.map((item) => ({ value: item, label: item })),
];

const EXPERIENCE_FILTER = toOptions(EXPERIENCE_OPTIONS, 'All Experience');
const LANGUAGE_FILTER = toOptions(LANGUAGES, 'All Languages');
const FEE_FILTER = [{ value: '', label: 'Any Fees' }, ...FEE_RANGES.map(({ value, label }) => ({ value, label }))];

// Compact filter grid. Imams: city, language, experience and fees. Masjids: only the city.
export default function DirectoryFilters({ kind, filters, onChange, onReset }) {
  const hasFilters = Object.values(filters).some(Boolean);
  const { options: cityList } = useCities();
  const cityOptions = [{ value: '', label: 'All Cities' }, ...cityList];
  const isImam = kind === ROLES.IMAM;

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <AppText variant="heading">{isImam ? 'Find an Imam' : 'Find a Masjid'}</AppText>
        {hasFilters ? (
          <Pressable onPress={onReset} hitSlop={8}>
            <AppText variant="label" color={colors.goldDark}>
              Clear all
            </AppText>
          </Pressable>
        ) : (
          <AppText variant="caption">{isImam ? 'Imam talash karein' : 'Masjid talash karein'}</AppText>
        )}
      </View>

      <View style={styles.row}>
        <SelectField
          compact
          style={styles.half}
          label="CITY"
          placeholder="All Cities"
          value={filters.city}
          options={cityOptions}
          sheetTitle="City (Shehar)"
          searchable
          onChange={(city) => onChange({ city })}
        />
        {isImam ? (
          <SelectField
            compact
            style={styles.half}
            label="LANGUAGE"
            placeholder="All"
            value={filters.language}
            options={LANGUAGE_FILTER}
            sheetTitle="Language (Zubaan)"
            onChange={(language) => onChange({ language })}
          />
        ) : null}
      </View>

      {isImam ? (
        <View style={styles.row}>
          <SelectField
            compact
            style={styles.half}
            label="EXPERIENCE"
            placeholder="All"
            value={filters.experience}
            options={EXPERIENCE_FILTER}
            sheetTitle="Experience (Janaza, Juma, Nikah ...)"
            onChange={(experience) => onChange({ experience })}
          />
          <SelectField
            compact
            style={styles.half}
            label="FEES / DAY"
            placeholder="Any Fees"
            value={filters.fee}
            options={FEE_FILTER}
            sheetTitle="Fees (Ujrat per day)"
            onChange={(fee) => onChange({ fee })}
          />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginTop: -40,
    marginHorizontal: 16,
    padding: 14,
    gap: 10,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.divider,
    ...shadows.raised,
  },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  row: { flexDirection: 'row', gap: 10 },
  half: { flex: 1 },
});
