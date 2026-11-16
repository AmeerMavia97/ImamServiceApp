import { useState } from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { useQuery } from '@tanstack/react-query';

import DirectoryCard from '@/components/Cards/DirectoryCard';
import DirectoryFilters from '@/components/Filters/DirectoryFilters';
import HomeHero from '@/components/Sections/HomeHero';
import AppButton from '@/components/ui/AppButton';
import AppText from '@/components/ui/AppText';
import EmptyState from '@/components/ui/EmptyState';
import SegmentedTabs from '@/components/ui/SegmentedTabs';
import { colors } from '@/constants/colors';
import { TAB_BAR_CLEARANCE } from '@/constants/layout';
import { ROLES } from '@/constants/roles';
import { getDirectory } from '@/services/directoryService';

const EMPTY_FILTERS = { city: '', experience: '', language: '', fee: '' };

const KIND_OPTIONS = [
  { value: ROLES.IMAM, label: 'Imams' },
  { value: ROLES.MASJID, label: 'Masjids' },
];

// Home: the Imams and Masjids that registered in the app (read from the database).
export default function Home() {
  const [kind, setKind] = useState(ROLES.IMAM);
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const isImam = kind === ROLES.IMAM;
  const hasFilters = Object.values(filters).some(Boolean);

  const {
    data: entries = [],
    isLoading,
    isError,
    isRefetching,
    refetch,
  } = useQuery({
    queryKey: ['directory', kind, filters],
    queryFn: () => getDirectory({ role: kind, ...filters }),
    placeholderData: (previous) => previous,
  });

  const changeKind = (next) => {
    setKind(next);
    setFilters(EMPTY_FILTERS);
  };

  const noun = isImam ? 'Imam' : 'Masjid';

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={colors.primary} />}
      >
        <HomeHero />
        <DirectoryFilters
          kind={kind}
          filters={filters}
          onChange={(patch) => setFilters((prev) => ({ ...prev, ...patch }))}
          onReset={() => setFilters(EMPTY_FILTERS)}
        />

        <View style={styles.section}>
          {/* "Available" on the left, the Imams / Masjids switch in the right corner */}
          <View style={styles.sectionHead}>
            <View style={styles.sectionTitle}>
              <AppText variant="overline">Registered</AppText>
              <AppText variant="title">Available</AppText>
            </View>
            <SegmentedTabs options={KIND_OPTIONS} value={kind} onChange={changeKind} />
          </View>
          <AppText variant="caption">{isLoading ? 'Loading…' : `${entries.length} found`}</AppText>

          {isLoading ? (
            <ActivityIndicator color={colors.primary} style={styles.loader} />
          ) : isError ? (
            <EmptyState
              icon="cloud-offline-outline"
              title="Could not load the list"
              description="Internet check karke dobara koshish karein."
            >
              <AppButton title="Retry" size="sm" variant="soft" onPress={refetch} style={styles.emptyAction} />
            </EmptyState>
          ) : entries.length === 0 ? (
            <EmptyState
              icon={hasFilters ? 'search-outline' : isImam ? 'people-outline' : 'business-outline'}
              title={`No ${noun} found`}
              description={
                hasFilters
                  ? `Koi ${noun} nahi mila. Filters change karein.`
                  : `Abhi koi ${noun} register nahi hua. "Join Us" se register karein.`
              }
            >
              {hasFilters ? (
                <AppButton
                  title="Clear filters"
                  size="sm"
                  variant="soft"
                  onPress={() => setFilters(EMPTY_FILTERS)}
                  style={styles.emptyAction}
                />
              ) : null}
            </EmptyState>
          ) : (
            <View style={styles.list}>
              {entries.map((entry) => (
                <DirectoryCard key={entry.id} entry={entry} />
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scroll: { paddingBottom: TAB_BAR_CLEARANCE },
  section: { paddingHorizontal: 16, marginTop: 20, gap: 12 },
  sectionHead: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', gap: 14 },
  sectionTitle: { gap: 2 },
  list: { gap: 14 },
  loader: { paddingVertical: 40 },
  emptyAction: { marginTop: 8 },
});
