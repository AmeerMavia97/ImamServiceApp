import { useMemo } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';

import { STATUS_STYLE } from '@/components/Cards/BookingCard';
import { useCities } from '@/components/hooks/useCities';
import { useServices } from '@/components/hooks/useServices';
import AppText from '@/components/ui/AppText';
import Badge from '@/components/ui/Badge';
import BarChart from '@/components/ui/BarChart';
import EmptyState from '@/components/ui/EmptyState';
import { colors } from '@/constants/colors';
import { radius } from '@/constants/layout';
import { BOOKING_STATUS } from '@/constants/options';
import { APPROVAL } from '@/constants/roles';
import { getServiceById } from '@/constants/services';
import { getAccountsForApproval } from '@/services/approvalService';
import { getAllBookings } from '@/services/bookingService';
import { getMasjids } from '@/services/masjidService';
import { countByStatus, countPerDay, labelledDays } from '@/utils/dashboardStats';
import { formatAmount, formatDate } from '@/utils/formatters';

const TONES = {
  green: { soft: colors.primaryLight, solid: colors.primary },
  gold: { soft: colors.goldSoft, solid: colors.goldDark },
};

// Flat coloured tile: icon, big number and label. No border, no shadow.
function StatTile({ icon, label, value, tone }) {
  return (
    <View style={[styles.tile, { backgroundColor: tone.soft }]}>
      <View style={[styles.tileIcon, { backgroundColor: tone.solid }]}>
        <Ionicons name={icon} size={18} color={colors.textOnPrimary} />
      </View>
      <AppText variant="display" style={styles.tileValue}>
        {value}
      </AppText>
      <AppText variant="label">{label}</AppText>
    </View>
  );
}

function MiniStat({ icon, label, value }) {
  return (
    <View style={styles.mini}>
      <Ionicons name={icon} size={18} color={colors.primary} />
      <AppText variant="heading">{value}</AppText>
      <AppText variant="caption">{label}</AppText>
    </View>
  );
}

// One booking on a single line: icon, customer + service/date/amount, status.
function BookingRow({ booking, last, onPress }) {
  const service = getServiceById(booking.serviceId);
  const status = STATUS_STYLE[booking.status] ?? STATUS_STYLE[BOOKING_STATUS.PENDING];

  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.row, !last && styles.rowDivider, pressed && { opacity: 0.8 }]}>
      <View style={styles.rowIcon}>
        <Ionicons name={status.icon} size={20} color={colors.primary} />
      </View>
      <View style={styles.rowTexts}>
        <AppText variant="subheading" numberOfLines={1}>
          {booking.name}
        </AppText>
        <AppText variant="caption" numberOfLines={1}>
          {service?.title} · {formatDate(booking.date)}
          {booking.total != null ? ` · ₹${formatAmount(booking.total)}` : ''}
        </AppText>
      </View>
      <Badge label={booking.status} tone={status.tone} />
    </Pressable>
  );
}

// Admin overview: number tiles, a 7-day chart of bookings and the latest bookings.
// All numbers come from the database.
export default function AdminOverview({ onOpenSection }) {
  const { data: bookings = [], isLoading } = useQuery({ queryKey: ['admin-bookings'], queryFn: getAllBookings });
  const { data: masjids = [] } = useQuery({ queryKey: ['masjids', ''], queryFn: () => getMasjids('') });
  const { data: accounts = [] } = useQuery({ queryKey: ['admin-accounts'], queryFn: getAccountsForApproval });
  const { cities } = useCities();
  const { services } = useServices();

  const counts = useMemo(() => countByStatus(bookings), [bookings]);
  const perDay = useMemo(() => countPerDay(bookings, 7), [bookings]);
  const week = useMemo(() => labelledDays(perDay), [perDay]);
  const weekTotal = perDay.reduce((sum, value) => sum + value, 0);
  const recent = bookings.slice(0, 4);
  const waiting = accounts.filter((a) => a.approvalStatus === APPROVAL.PENDING).length;

  return (
    <View style={styles.wrap}>
      {waiting > 0 ? (
        <Pressable onPress={() => onOpenSection('approvals')} style={({ pressed }) => [styles.alert, pressed && { opacity: 0.85 }]}>
          <Ionicons name="person-add" size={20} color={colors.goldDark} />
          <AppText variant="subheading" color={colors.goldDark} style={styles.alertText}>
            {waiting} {waiting === 1 ? 'registration is' : 'registrations are'} waiting for approval
          </AppText>
          <Ionicons name="chevron-forward" size={18} color={colors.goldDark} />
        </Pressable>
      ) : null}

      <View style={styles.tiles}>
        <StatTile icon="calendar" label="Total bookings" value={counts.total} tone={TONES.green} />
        <StatTile icon="time" label="Pending" value={counts.pending} tone={TONES.gold} />
        <StatTile icon="checkmark-done" label="Accepted" value={counts.accepted} tone={TONES.green} />
        <StatTile icon="close-circle" label="Rejected" value={counts.rejected} tone={TONES.gold} />
      </View>

      <View style={styles.section}>
        <View style={styles.chartHeader}>
          <View>
            <AppText variant="title">This week</AppText>
            <AppText variant="caption">Bookings per day</AppText>
          </View>
          <View style={styles.chartTotal}>
            <AppText variant="display" style={styles.chartTotalValue}>
              {weekTotal}
            </AppText>
            <AppText variant="caption">bookings</AppText>
          </View>
        </View>
        <BarChart data={week} />
      </View>

      <View style={styles.minis}>
        <MiniStat icon="pricetag" label="Services" value={services.length} />
        <MiniStat icon="location" label="Cities" value={cities.length} />
        <MiniStat icon="business" label="Masjids" value={masjids.length} />
      </View>

      <View style={styles.section}>
        <View style={styles.sectionTitle}>
          <AppText variant="title">Recent bookings</AppText>
          {recent.length > 0 ? (
            <Pressable onPress={() => onOpenSection('bookings')} hitSlop={8}>
              <AppText variant="label" color={colors.primary}>
                View all
              </AppText>
            </Pressable>
          ) : null}
        </View>

        {isLoading ? (
          <ActivityIndicator color={colors.primary} style={styles.loader} />
        ) : recent.length === 0 ? (
          <EmptyState
            icon="calendar-outline"
            title="No bookings yet"
            description="Jab koi user booking karega, wo yahan nazar aayegi."
          />
        ) : (
          <View>
            {recent.map((booking, index) => (
              <BookingRow
                key={booking.id}
                booking={booking}
                last={index === recent.length - 1}
                onPress={() => onOpenSection('bookings')}
              />
            ))}
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, gap: 26, paddingTop: 4 },

  alert: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 14,
    borderRadius: radius.md,
    backgroundColor: colors.goldSoft,
  },
  alertText: { flex: 1 },

  tiles: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  tile: { width: '48%', flexGrow: 1, gap: 2, padding: 16, borderRadius: radius.lg },
  tileIcon: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
  tileValue: { fontSize: 38, lineHeight: 44, marginTop: 10, color: colors.primaryDeep },

  section: { gap: 14 },
  sectionTitle: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  chartHeader: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' },
  chartTotal: { alignItems: 'flex-end' },
  chartTotalValue: { fontSize: 30, lineHeight: 34, color: colors.primary },

  minis: { flexDirection: 'row', gap: 10 },
  mini: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
    paddingVertical: 12,
    borderRadius: radius.md,
    backgroundColor: colors.primarySoft,
  },

  loader: { paddingVertical: 30 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14 },
  rowDivider: { borderBottomWidth: 1, borderBottomColor: colors.border },
  rowIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primaryLight,
  },
  rowTexts: { flex: 1, gap: 2 },
});
