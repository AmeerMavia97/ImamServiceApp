import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import AppText from '@/components/ui/AppText';
import Badge from '@/components/ui/Badge';
import IconBadge from '@/components/ui/IconBadge';
import Price from '@/components/ui/Price';
import { colors } from '@/constants/colors';
import { radius, shadows } from '@/constants/layout';
import { BOOKING_STATUS } from '@/constants/options';
import { getServiceById } from '@/constants/services';
import { formatDateLong } from '@/utils/formatters';

export const STATUS_STYLE = {
  [BOOKING_STATUS.PENDING]: { tone: 'warning', icon: 'time' },
  [BOOKING_STATUS.ACCEPTED]: { tone: 'success', icon: 'checkmark-circle' },
  [BOOKING_STATUS.REJECTED]: { tone: 'danger', icon: 'close-circle' },
};

function DetailRow({ icon, text }) {
  return (
    <View style={styles.detailRow}>
      <Ionicons name={icon} size={15} color={colors.primary} />
      <AppText variant="body" style={styles.detailText} numberOfLines={3}>
        {text}
      </AppText>
    </View>
  );
}

// `showCustomer` + `footer` are used by the admin screen (customer details and Accept / Reject).
export default function BookingCard({ booking, showCustomer = false, footer }) {
  const service = getServiceById(booking.serviceId);
  const status = STATUS_STYLE[booking.status] ?? STATUS_STYLE[BOOKING_STATUS.PENDING];

  return (
    <View style={styles.shadow}>
      <View style={styles.card}>
        <View style={styles.header}>
          <IconBadge name={service?.icon ?? 'mosque'} size={46} tone="dark" />
          <View style={styles.headerTexts}>
            <AppText variant="title" style={styles.title}>
              {service?.title ?? 'Service'}
            </AppText>
            <AppText variant="caption">Booking {booking.code}</AppText>
          </View>
          <Badge label={booking.status} tone={status.tone} icon={status.icon} />
        </View>

        <View style={styles.divider} />

        <View style={styles.details}>
          {showCustomer ? (
            <>
              <DetailRow icon="person" text={booking.name} />
              {booking.mobile ? <DetailRow icon="call" text={booking.mobile} /> : null}
            </>
          ) : null}
          <DetailRow icon="business" text={`${booking.masjid}, ${booking.city}`} />
          <DetailRow icon="calendar" text={formatDateLong(booking.date)} />
          {booking.selected?.length ? <DetailRow icon="time" text={booking.selected.join(', ')} /> : null}
          {booking.people ? (
            <DetailRow icon="people" text={`${booking.people} ${booking.people === 1 ? 'person' : 'persons'}`} />
          ) : null}
          {showCustomer && booking.notes ? <DetailRow icon="create" text={booking.notes} /> : null}
        </View>

        <View style={styles.totalRow}>
          <View>
            <AppText variant="overline">Total · Cash</AppText>
            <AppText variant="caption">Pay at the time of service</AppText>
          </View>
          {booking.total == null ? (
            <AppText variant="subheading" color={colors.primary}>
              Rate on request
            </AppText>
          ) : (
            <Price amount={booking.total} size={28} />
          )}
        </View>

        {footer}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  shadow: { borderRadius: radius.lg, backgroundColor: colors.surface, ...shadows.card },
  card: {
    padding: 16,
    gap: 14,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.divider,
  },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  headerTexts: { flex: 1 },
  title: { fontSize: 22, lineHeight: 28 },
  divider: { height: 1, backgroundColor: colors.divider },
  details: { gap: 8 },
  detailRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  detailText: { flex: 1 },
  totalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: radius.md,
    backgroundColor: colors.goldSoft,
  },
});
