import { useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import AppButton from '@/components/ui/AppButton';
import AppText from '@/components/ui/AppText';
import Avatar from '@/components/ui/Avatar';
import Badge from '@/components/ui/Badge';
import Chip from '@/components/ui/Chip';
import EmptyState from '@/components/ui/EmptyState';
import { colors } from '@/constants/colors';
import { radius } from '@/constants/layout';
import { APPROVAL, ROLE_LABELS, ROLES } from '@/constants/roles';
import { getAccountsForApproval, setApproval } from '@/services/approvalService';
import { formatAmount, formatDate, formatTime } from '@/utils/formatters';

const FILTERS = [
  { status: APPROVAL.PENDING, label: 'Pending', empty: 'Koi registration approval ke liye baaki nahi.' },
  { status: APPROVAL.APPROVED, label: 'Approved', empty: 'Abhi koi account approve nahi hua.' },
  { status: APPROVAL.REJECTED, label: 'Rejected', empty: 'Abhi koi account reject nahi hua.' },
];

const STATUS_BADGE = {
  [APPROVAL.PENDING]: { tone: 'warning', icon: 'time' },
  [APPROVAL.APPROVED]: { tone: 'success', icon: 'checkmark-circle' },
  [APPROVAL.REJECTED]: { tone: 'danger', icon: 'close-circle' },
};

function Line({ icon, text }) {
  return (
    <View style={styles.line}>
      <Ionicons name={icon} size={14} color={colors.primary} />
      <AppText variant="caption" color={colors.text} numberOfLines={2} style={styles.lineText}>
        {text}
      </AppText>
    </View>
  );
}

// Admin: new Imam / Masjid registrations. Approve lets them in; Reject keeps them out.
// Only approved accounts get their dashboard and are listed on Home.
export default function AdminApprovals() {
  const queryClient = useQueryClient();
  const [status, setStatus] = useState(APPROVAL.PENDING);

  const { data: accounts = [], isLoading, isError, refetch } = useQuery({
    queryKey: ['admin-accounts'],
    queryFn: getAccountsForApproval,
  });

  const mutation = useMutation({
    mutationFn: ({ id, status: next }) => setApproval(id, next),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-accounts'] });
      queryClient.invalidateQueries({ queryKey: ['directory'] }); // Home list changes
    },
  });

  const countOf = (s) => accounts.filter((a) => a.approvalStatus === s).length;
  const visible = accounts.filter((a) => a.approvalStatus === status);
  const filter = FILTERS.find((f) => f.status === status);

  const isBusy = (id, next) =>
    mutation.isPending && mutation.variables?.id === id && mutation.variables?.status === next;

  if (isLoading) return <ActivityIndicator color={colors.primary} style={styles.loader} />;

  if (isError) {
    return (
      <EmptyState
        icon="cloud-offline-outline"
        title="Could not load registrations"
        description="Internet check karke dobara koshish karein."
      >
        <AppButton title="Retry" size="sm" variant="soft" onPress={refetch} style={styles.retry} />
      </EmptyState>
    );
  }

  return (
    <View style={styles.wrap}>
      <View style={styles.filters}>
        {FILTERS.map((item) => (
          <Chip
            key={item.status}
            label={`${item.label} (${countOf(item.status)})`}
            selected={item.status === status}
            onPress={() => setStatus(item.status)}
            style={styles.filter}
          />
        ))}
      </View>

      {mutation.isError ? (
        <View style={styles.error}>
          <AppText variant="caption" color={colors.danger}>
            {mutation.error.message}
          </AppText>
        </View>
      ) : null}

      {visible.length === 0 ? (
        <EmptyState icon="person-add-outline" title={`No ${filter.label.toLowerCase()} accounts`} description={filter.empty} />
      ) : (
        visible.map((account) => {
          const isImam = account.role === ROLES.IMAM;
          const badge = STATUS_BADGE[account.approvalStatus];
          return (
            <View key={account.id} style={styles.card}>
              <View style={styles.top}>
                <Avatar uri={account.photoUrl} name={account.name} size={56} />
                <View style={styles.topTexts}>
                  <AppText variant="title" numberOfLines={1} style={styles.name}>
                    {isImam ? account.name : account.masjidName}
                  </AppText>
                  <View style={styles.badges}>
                    <Badge label={ROLE_LABELS[account.role]} icon={isImam ? 'ribbon' : 'business'} tone="gold" />
                    <Badge label={account.approvalStatus} icon={badge.icon} tone={badge.tone} />
                  </View>
                </View>
              </View>

              <View style={styles.details}>
                {isImam ? null : <Line icon="person" text={`Contact: ${account.name}`} />}
                <Line icon="call" text={`+91 ${account.mobile}`} />
                <Line icon="mail" text={account.email} />
                <Line icon="location" text={[account.address, account.city].filter(Boolean).join(', ')} />
                {isImam ? (
                  <>
                    {account.experience.length > 0 ? <Line icon="ribbon" text={account.experience.join(', ')} /> : null}
                    {account.languages.length > 0 ? <Line icon="language" text={account.languages.join(', ')} /> : null}
                    {account.fee != null ? <Line icon="cash" text={`₹${formatAmount(account.fee)} per day`} /> : null}
                  </>
                ) : account.openingTime && account.closingTime ? (
                  <Line icon="time" text={`${formatTime(account.openingTime)} - ${formatTime(account.closingTime)}`} />
                ) : null}
                <Line icon="calendar" text={`Registered ${formatDate(account.createdAt)}`} />
              </View>

              <View style={styles.actions}>
                {account.approvalStatus !== APPROVAL.APPROVED ? (
                  <AppButton
                    title="Approve"
                    icon="checkmark"
                    size="sm"
                    style={styles.action}
                    loading={isBusy(account.id, APPROVAL.APPROVED)}
                    disabled={mutation.isPending}
                    onPress={() => mutation.mutate({ id: account.id, status: APPROVAL.APPROVED })}
                  />
                ) : null}
                {account.approvalStatus !== APPROVAL.REJECTED ? (
                  <AppButton
                    title="Reject"
                    icon="close"
                    variant="danger"
                    size="sm"
                    style={styles.action}
                    loading={isBusy(account.id, APPROVAL.REJECTED)}
                    disabled={mutation.isPending}
                    onPress={() => mutation.mutate({ id: account.id, status: APPROVAL.REJECTED })}
                  />
                ) : null}
              </View>
            </View>
          );
        })
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 14 },
  loader: { paddingVertical: 40 },
  retry: { marginTop: 8 },
  filters: { flexDirection: 'row', gap: 8 },
  filter: { flex: 1, paddingHorizontal: 6 },
  error: { padding: 10, borderRadius: radius.md, backgroundColor: colors.dangerSoft },

  card: {
    gap: 14,
    padding: 16,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  top: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  topTexts: { flex: 1, gap: 6 },
  name: { fontSize: 21, lineHeight: 27 },
  badges: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  details: { gap: 8 },
  line: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  lineText: { flex: 1 },
  actions: { flexDirection: 'row', gap: 10 },
  action: { flex: 1 },
});
