import { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

import { STATUS_STYLE } from '@/components/Cards/BookingCard';
import { useConfirmLogout } from '@/components/hooks/useConfirmLogout';
import AppText from '@/components/ui/AppText';
import Badge from '@/components/ui/Badge';
import BarChart from '@/components/ui/BarChart';
import ScreenHeader from '@/components/ui/ScreenHeader';
import { colors } from '@/constants/colors';
import { DEMO_RECENT, DEMO_STATS, DEMO_WEEK } from '@/constants/demoDashboard';
import { radius, TAB_BAR_CLEARANCE } from '@/constants/layout';
import { BOOKING_STATUS } from '@/constants/options';
import { getServiceById } from '@/constants/services';
import { useAuth } from '@/store/AuthContext';
import { labelledDays } from '@/utils/dashboardStats';
import { formatAmount, formatDate } from '@/utils/formatters';

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

function SectionTitle({ title, action, onAction }) {
  return (
    <View style={styles.sectionTitle}>
      <AppText variant="title">{title}</AppText>
      {action ? (
        <Pressable onPress={onAction} hitSlop={8}>
          <AppText variant="label" color={colors.primary}>
            {action}
          </AppText>
        </Pressable>
      ) : null}
    </View>
  );
}

// One request on a single line: icon, service + masjid/date/amount, status.
function RequestRow({ request, last }) {
  const service = getServiceById(request.serviceId);
  const status = STATUS_STYLE[request.status] ?? STATUS_STYLE[BOOKING_STATUS.PENDING];

  return (
    <View style={[styles.row, !last && styles.rowDivider]}>
      <View style={styles.rowIcon}>
        <Ionicons name={status.icon} size={20} color={colors.primary} />
      </View>
      <View style={styles.rowTexts}>
        <AppText variant="subheading" numberOfLines={1}>
          {service?.title ?? 'Service'}
        </AppText>
        <AppText variant="caption" numberOfLines={1}>
          {request.masjid} · {formatDate(request.date)} · ₹{formatAmount(request.total)}
        </AppText>
      </View>
      <Badge label={request.status} tone={status.tone} />
    </View>
  );
}

// First tab (Imam and Masjid). For now it shows DEMO numbers (constants/demoDashboard.js).
export default function DashboardOverview() {
  const navigation = useNavigation();
  const { profile } = useAuth();
  const { confirmLogout, logoutDialog } = useConfirmLogout();

  const week = useMemo(() => labelledDays(DEMO_WEEK), []);
  const weekTotal = DEMO_WEEK.reduce((sum, value) => sum + value, 0);

  return (
    <View style={styles.container}>
      {logoutDialog}
      <ScreenHeader
        title="Dashboard"
        subtitle={`Assalamu Alaikum, ${profile?.name ?? ''}`}
        right={
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Logout"
            onPress={confirmLogout}
            hitSlop={8}
            style={({ pressed }) => [styles.logout, pressed && { opacity: 0.7 }]}
          >
            <Ionicons name="log-out-outline" size={22} color={colors.textOnPrimary} />
          </Pressable>
        }
      />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <View style={styles.tiles}>
          <StatTile
            icon="time"
            label="Pending requests"
            value={DEMO_STATS.pending}
            tone={{ soft: colors.goldSoft, solid: colors.goldDark }}
          />
          <StatTile
            icon="checkmark-done"
            label="Accepted"
            value={DEMO_STATS.accepted}
            tone={{ soft: colors.primaryLight, solid: colors.primary }}
          />
        </View>

        <View style={styles.section}>
          <View style={styles.chartHeader}>
            <View>
              <AppText variant="title">This week</AppText>
              <AppText variant="caption">Booking requests per day</AppText>
            </View>
            <View style={styles.chartTotal}>
              <AppText variant="display" style={styles.chartTotalValue}>
                {weekTotal}
              </AppText>
              <AppText variant="caption">requests</AppText>
            </View>
          </View>
          <BarChart data={week} />
        </View>

        <View style={styles.section}>
          <SectionTitle title="Recent requests" action="View all" onAction={() => navigation.navigate('Requests')} />
          <View>
            {DEMO_RECENT.map((request, index) => (
              <RequestRow key={request.id} request={request} last={index === DEMO_RECENT.length - 1} />
            ))}
          </View>
        </View>

        <AppText variant="caption" style={styles.demoNote}>
          Demo data for preview
        </AppText>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scroll: { padding: 20, gap: 28, paddingBottom: TAB_BAR_CLEARANCE },

  logout: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.glass,
    borderWidth: 1,
    borderColor: colors.glassBorder,
  },

  tiles: { flexDirection: 'row', gap: 12 },
  tile: { flex: 1, gap: 2, padding: 16, borderRadius: radius.lg },
  tileIcon: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
  tileValue: { fontSize: 38, lineHeight: 44, marginTop: 10, color: colors.primaryDeep },

  section: { gap: 14 },
  sectionTitle: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },

  chartHeader: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' },
  chartTotal: { alignItems: 'flex-end' },
  chartTotalValue: { fontSize: 30, lineHeight: 34, color: colors.primary },

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

  demoNote: { textAlign: 'center' },
});
