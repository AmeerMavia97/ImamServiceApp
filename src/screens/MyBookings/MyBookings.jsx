import { ActivityIndicator, Alert, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';

import BookingCard from '@/components/Cards/BookingCard';
import AppButton from '@/components/ui/AppButton';
import AppText from '@/components/ui/AppText';
import ScreenHeader from '@/components/ui/ScreenHeader';
import { colors } from '@/constants/colors';
import { radius, TAB_BAR_CLEARANCE } from '@/constants/layout';
import { BOOKING_STATUS } from '@/constants/options';
import { cancelBooking, getMyBookings } from '@/services/bookingService';

export default function MyBookings() {
  const navigation = useNavigation();
  const queryClient = useQueryClient();
  const { data: bookings = [], isLoading, isError, isRefetching, refetch } = useQuery({
    queryKey: ['my-bookings'],
    queryFn: getMyBookings,
  });

  const cancelMutation = useMutation({
    mutationFn: cancelBooking,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-bookings'] });
      queryClient.invalidateQueries({ queryKey: ['admin-bookings'] });
    },
    onError: (e) => Alert.alert('Could not cancel', e.message),
  });

  const confirmCancel = (booking) => {
    Alert.alert(
      'Cancel this booking?',
      `Booking ${booking.code} will be deleted. Booking cancel karein?`,
      [
        { text: 'Keep it', style: 'cancel' },
        { text: 'Yes, cancel', style: 'destructive', onPress: () => cancelMutation.mutate(booking.id) },
      ]
    );
  };

  // Re-check every time the tab is opened, so Accepted / Rejected shows up quickly.
  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch])
  );

  return (
    <View style={styles.container}>
      <ScreenHeader title="My Bookings" subtitle="Meri bookings" />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={colors.primary} />
        }
      >
        {isLoading ? (
          <ActivityIndicator color={colors.primary} style={styles.loader} />
        ) : isError ? (
          <View style={styles.empty}>
            <AppText variant="body" color={colors.textMuted} style={styles.center}>
              Could not load your bookings. Check your internet and pull down to retry.
            </AppText>
            <AppButton title="Retry" size="sm" variant="soft" onPress={refetch} />
          </View>
        ) : bookings.length === 0 ? (
          <View style={styles.empty}>
            <View style={styles.emptyIcon}>
              <Ionicons name="calendar-outline" size={34} color={colors.primary} />
            </View>
            <AppText variant="title">No bookings yet</AppText>
            <AppText variant="body" color={colors.textMuted} style={styles.center}>
              Abhi koi booking nahi hai. Masjid ki kisi bhi temporary service ke liye booking karein.
            </AppText>
            <AppButton
              title="Book a Service"
              iconRight="arrow-forward"
              onPress={() => navigation.navigate('Services')}
            />
          </View>
        ) : (
          bookings.map((booking) => (
            <BookingCard
              key={booking.id}
              booking={booking}
              footer={
                booking.status === BOOKING_STATUS.PENDING ? (
                  <AppButton
                    title="Cancel Booking"
                    icon="close-circle-outline"
                    variant="danger"
                    size="sm"
                    loading={cancelMutation.isPending && cancelMutation.variables === booking.id}
                    disabled={cancelMutation.isPending}
                    onPress={() => confirmCancel(booking)}
                  />
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
  scroll: { padding: 16, gap: 14, paddingBottom: TAB_BAR_CLEARANCE },
  loader: { paddingVertical: 40 },
  empty: {
    alignItems: 'center',
    gap: 12,
    padding: 28,
    marginTop: 8,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.divider,
  },
  emptyIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primaryLight,
  },
  center: { textAlign: 'center' },
});
