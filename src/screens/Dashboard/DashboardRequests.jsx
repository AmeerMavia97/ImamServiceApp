import { useState } from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import BookingCard from '@/components/Cards/BookingCard';
import { useMyRequests } from '@/components/hooks/useMyRequests';
import AppButton from '@/components/ui/AppButton';
import AppText from '@/components/ui/AppText';
import Chip from '@/components/ui/Chip';
import EmptyState from '@/components/ui/EmptyState';
import ScreenHeader from '@/components/ui/ScreenHeader';
import { colors } from '@/constants/colors';
import { TAB_BAR_CLEARANCE } from '@/constants/layout';
import { BOOKING_STATUS } from '@/constants/options';
import { respondToRequest } from '@/services/requestService';
import { countByStatus } from '@/utils/dashboardStats';

const FILTERS = [
  { status: BOOKING_STATUS.PENDING, label: 'Pending', empty: 'Koi pending request nahi hai.' },
  { status: BOOKING_STATUS.ACCEPTED, label: 'Accepted', empty: 'Abhi koi request accept nahi ki.' },
  { status: BOOKING_STATUS.REJECTED, label: 'Rejected', empty: 'Abhi koi request reject nahi ki.' },
];

// Second tab (Imam and Masjid): booking requests with Accept / Reject.
// What each person sees (and may answer) is decided by the database, not here.
export default function DashboardRequests() {
  const queryClient = useQueryClient();
  const { requests, isLoading, isError, isRefetching, refetch } = useMyRequests();
  const [status, setStatus] = useState(BOOKING_STATUS.PENDING);

  const counts = countByStatus(requests);
  const countOf = { Pending: counts.pending, Accepted: counts.accepted, Rejected: counts.rejected };
  const visible = requests.filter((request) => request.status === status);
  const filter = FILTERS.find((f) => f.status === status);

  const mutation = useMutation({
    mutationFn: ({ id, action }) => respondToRequest(id, action),
    onSettled: () => {
      // Always reload: someone else may have answered the request in the meantime.
      queryClient.invalidateQueries({ queryKey: ['my-requests'] });
      queryClient.invalidateQueries({ queryKey: ['admin-bookings'] });
      queryClient.invalidateQueries({ queryKey: ['my-bookings'] });
    },
  });

  const isBusy = (id, action) =>
    mutation.isPending && mutation.variables?.id === id && mutation.variables?.action === action;

  return (
    <View style={styles.container}>
      <ScreenHeader title="Bookings" subtitle="Booking requests" />

      <View style={styles.filters}>
        {FILTERS.map((item) => (
          <Chip
            key={item.status}
            label={`${item.label} (${countOf[item.status]})`}
            selected={item.status === status}
            onPress={() => setStatus(item.status)}
            style={styles.filter}
          />
        ))}
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={colors.primary} />}
      >
        {mutation.isError ? (
          <View style={styles.error}>
            <AppText variant="caption" color={colors.danger}>
              {mutation.error.message}
            </AppText>
          </View>
        ) : null}

        {isLoading ? (
          <ActivityIndicator color={colors.primary} style={styles.loader} />
        ) : isError ? (
          <EmptyState
            icon="cloud-offline-outline"
            title="Could not load requests"
            description="Internet check karke neeche kheench kar dobara koshish karein."
          />
        ) : visible.length === 0 ? (
          <EmptyState icon="calendar-outline" title={`No ${filter.label.toLowerCase()} requests`} description={filter.empty} />
        ) : (
          visible.map((request) => (
            <BookingCard
              key={request.id}
              booking={request}
              showCustomer
              footer={
                request.status === BOOKING_STATUS.PENDING ? (
                  <View style={styles.actions}>
                    <AppButton
                      title="Accept"
                      icon="checkmark"
                      size="sm"
                      style={styles.action}
                      loading={isBusy(request.id, 'accept')}
                      disabled={mutation.isPending}
                      onPress={() => mutation.mutate({ id: request.id, action: 'accept' })}
                    />
                    <AppButton
                      title="Reject"
                      icon="close"
                      variant="danger"
                      size="sm"
                      style={styles.action}
                      loading={isBusy(request.id, 'reject')}
                      disabled={mutation.isPending}
                      onPress={() => mutation.mutate({ id: request.id, action: 'reject' })}
                    />
                  </View>
                ) : null
              }
            />
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  filters: { flexDirection: 'row', gap: 8, paddingHorizontal: 16, paddingTop: 14 },
  filter: { flex: 1, paddingHorizontal: 6 },
  scroll: { flexGrow: 1, padding: 16, gap: 14, paddingBottom: TAB_BAR_CLEARANCE },
  loader: { paddingVertical: 40 },
  error: { padding: 10, borderRadius: 12, backgroundColor: colors.dangerSoft },
  actions: { flexDirection: 'row', gap: 10 },
  action: { flex: 1 },
});
