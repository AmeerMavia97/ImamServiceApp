import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { useConfirmLogout } from '@/components/hooks/useConfirmLogout';
import AppText from '@/components/ui/AppText';
import Avatar from '@/components/ui/Avatar';
import ScreenHeader from '@/components/ui/ScreenHeader';
import { colors } from '@/constants/colors';
import { radius, TAB_BAR_CLEARANCE } from '@/constants/layout';
import { ROLE_LABELS, ROLES } from '@/constants/roles';
import { uploadAvatar } from '@/services/profileService';
import { useAuth } from '@/store/AuthContext';
import { formatAmount, formatTime } from '@/utils/formatters';
import { pickPhoto } from '@/utils/imagePicker';

// One line of the details box: soft round icon, small label, value.
function DetailRow({ icon, label, value, last }) {
  return (
    <View style={[styles.row, !last && styles.rowDivider]}>
      <View style={styles.rowIcon}>
        <Ionicons name={icon} size={18} color={colors.primary} />
      </View>
      <View style={styles.rowTexts}>
        <AppText variant="caption">{label}</AppText>
        <AppText variant="subheading">{value || '—'}</AppText>
      </View>
    </View>
  );
}

// Third tab (Imam and Masjid): same green header as the Dashboard (with logout), a box with the
// photo + name + email, and a box with every detail on its own line. Profile is read live from
// the database. The pencil on the photo changes it.
export default function DashboardProfile() {
  const queryClient = useQueryClient();
  const { profile, user, role } = useAuth();
  const { confirmLogout, logoutDialog } = useConfirmLogout();

  // Pick a new photo, upload it, and show it straight away (the account is cached by React Query).
  const photoMutation = useMutation({
    mutationFn: async () => {
      const asset = await pickPhoto();
      return asset ? uploadAvatar(user.id, asset) : null; // null = cancelled
    },
    onSuccess: (photoUrl) => {
      if (!photoUrl) return;
      queryClient.setQueryData(['account', user.id], (old) =>
        old ? { ...old, profile: { ...old.profile, photoUrl } } : old
      );
    },
  });

  const isImam = role === ROLES.IMAM;
  const name = profile?.name ?? user?.email ?? '';
  const email = profile?.email ?? user?.email;

  return (
    <View style={styles.container}>
      {logoutDialog}
      <ScreenHeader
        title="Profile"
        subtitle={`${ROLE_LABELS[role] ?? ''} account`}
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
        {/* Box 1: photo (pencil = change), name, email */}
        <View style={[styles.box, styles.identityBox]}>
          <View>
            <Avatar uri={profile?.photoUrl} name={name} size={96} />
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Change photo"
              onPress={() => photoMutation.mutate()}
              disabled={photoMutation.isPending}
              hitSlop={8}
              style={({ pressed }) => [styles.pencil, pressed && { opacity: 0.8 }]}
            >
              {photoMutation.isPending ? (
                <ActivityIndicator size="small" color={colors.textOnPrimary} />
              ) : (
                <Ionicons name="pencil" size={15} color={colors.textOnPrimary} />
              )}
            </Pressable>
          </View>

          <View style={styles.identityTexts}>
            <AppText variant="title" style={styles.center}>
              {name}
            </AppText>
            <AppText variant="body" color={colors.textMuted} style={styles.center}>
              {email}
            </AppText>
          </View>

          {photoMutation.isError ? (
            <AppText variant="caption" color={colors.danger} style={styles.center}>
              {photoMutation.error.message}
            </AppText>
          ) : null}
        </View>

        {/* Box 2: every detail on its own line */}
        <View style={styles.box}>
          <DetailRow icon="shield-checkmark" label="Account" value={`${ROLE_LABELS[role] ?? ''} account`} />
          <DetailRow icon="call" label="Mobile" value={profile?.mobile ? `+91 ${profile.mobile}` : ''} />
          <DetailRow icon="mail" label="Email" value={email} />
          <DetailRow icon="location" label="City" value={profile?.city} />
          {isImam ? (
            <>
              <DetailRow icon="map" label="Area" value={profile?.address} />
              <DetailRow icon="ribbon" label="Experience" value={profile?.experience?.join(', ')} />
              <DetailRow icon="language" label="Languages" value={profile?.languages?.join(', ')} />
              <DetailRow
                icon="cash"
                label="Fees per day"
                value={profile?.fee != null ? `₹${formatAmount(profile.fee)}` : ''}
                last
              />
            </>
          ) : (
            <>
              <DetailRow icon="business" label="Masjid name" value={profile?.masjidName} />
              <DetailRow icon="map" label="Address" value={profile?.address} />
              <DetailRow
                icon="time"
                label="Timing"
                value={
                  profile?.openingTime && profile?.closingTime
                    ? `${formatTime(profile.openingTime)} - ${formatTime(profile.closingTime)}`
                    : ''
                }
                last
              />
            </>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scroll: { padding: 20, gap: 16, paddingBottom: TAB_BAR_CLEARANCE },
  center: { textAlign: 'center' },

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

  // Flat boxes: a thin border, no shadow
  box: {
    paddingHorizontal: 16,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  identityBox: { alignItems: 'center', gap: 14, paddingVertical: 24 },
  identityTexts: { alignItems: 'center', gap: 2 },

  // Pencil sits on the bottom-right corner of the photo
  pencil: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    borderWidth: 2,
    borderColor: colors.surface,
  },

  row: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 14 },
  rowDivider: { borderBottomWidth: 1, borderBottomColor: colors.border },
  rowIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primaryLight,
  },
  rowTexts: { flex: 1, gap: 1 },
});
