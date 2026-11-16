import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import BookingCard from '@/components/Cards/BookingCard';
import AppButton from '@/components/ui/AppButton';
import EmptyState from '@/components/ui/EmptyState';
import { colors } from '@/constants/colors';
import { BOOKING_STATUS } from '@/constants/options';
import { getAllBookings, updateBookingStatus } from '@/services/bookingService';

// Admin: every booking made by users, with Accept / Reject.
export default function AdminBookings() {
  const queryClient = useQueryClient();
  const {
    data: bookings = [],
    isLoading,
    isError,
    refetch,
  } = useQuery({ queryKey: ['admin-bookings'], queryFn: getAllBookings });

  const mutation = useMutation({
    mutationFn: ({ id, status }) => updateBookingStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-bookings'] });
      queryClient.invalidateQueries({ queryKey: ['my-bookings'] });
    },
  });

  const isBusy = (id, status) =>
    mutation.isPending && mutation.variables?.id === id && mutation.variables?.status === status;

  if (isLoading) return <ActivityIndicator color={colors.primary} style={styles.loader} />;

  if (isError) {
    return (
      <EmptyState
        icon="cloud-offline-outline"
        title="Could not load bookings"
        description="Internet check karke dobara koshish karein."
      >
        <AppButton title="Retry" size="sm" variant="soft" onPress={refetch} style={styles.retry} />
      </EmptyState>
    );
  }

  if (bookings.length === 0) {
    return (
      <EmptyState
        icon="calendar-outline"
        title="No bookings yet"
        description="Jab koi user booking karega, wo yahan nazar aayegi."
      />
    );
  }

  return (
    <View style={styles.list}>
      {bookings.map((booking) => (
        <BookingCard
          key={booking.id}
          booking={booking}
          showCustomer
          footer={
            <View style={styles.actions}>
              {booking.status !== BOOKING_STATUS.ACCEPTED ? (
                <AppButton
                  title="Accept"
                  icon="checkmark"
                  size="sm"
                  style={styles.action}
                  loading={isBusy(booking.id, BOOKING_STATUS.ACCEPTED)}
                  disabled={mutation.isPending}
                  onPress={() => mutation.mutate({ id: booking.id, status: BOOKING_STATUS.ACCEPTED })}
                />
              ) : null}
              {booking.status !== BOOKING_STATUS.REJECTED ? (
                <AppButton
                  title="Reject"
                  icon="close"
                  variant="danger"
                  size="sm"
                  style={styles.action}
                  loading={isBusy(booking.id, BOOKING_STATUS.REJECTED)}
                  disabled={mutation.isPending}
                  onPress={() => mutation.mutate({ id: booking.id, status: BOOKING_STATUS.REJECTED })}
                />
              ) : null}
            </View>
          }
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  list: { gap: 14 },
  loader: { paddingVertical: 40 },
  retry: { marginTop: 8 },
  actions: { flexDirection: 'row', gap: 10 },
  action: { flex: 1 },
});
