import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';

import { useConfirmLogout } from '@/components/hooks/useConfirmLogout';
import { useLogout } from '@/components/hooks/useLogout';
import SideDrawer from '@/components/Modals/SideDrawer';
import KeyboardAwareView from '@/components/ui/KeyboardAwareView';
import ScreenHeader from '@/components/ui/ScreenHeader';
import RoleGuard from '@/configuration/protection/RoleGuard';
import { colors } from '@/constants/colors';
import { BOOKING_STATUS } from '@/constants/options';
import { APPROVAL, ROLES } from '@/constants/roles';
import { getAccountsForApproval } from '@/services/approvalService';
import { getAllBookings } from '@/services/bookingService';
import { useAuth } from '@/store/AuthContext';
import AdminApprovals from './AdminApprovals';
import AdminBookings from './AdminBookings';
import AdminCities from './AdminCities';
import AdminDrawerMenu, { ADMIN_SECTIONS } from './AdminDrawerMenu';
import AdminMasjids from './AdminMasjids';
import AdminOverview from './AdminOverview';
import AdminServices from './AdminServices';

// Round button for the dark green header (menu on the left, logout on the right).
function HeaderButton({ icon, label, onPress, dot }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      hitSlop={8}
      style={({ pressed }) => [styles.headerButton, pressed && { opacity: 0.7 }]}
    >
      <Ionicons name={icon} size={22} color={colors.textOnPrimary} />
      {dot ? <View style={styles.dot} /> : null}
    </Pressable>
  );
}

// Admin panel: green header (drawer icon, section name, logout icon) and the section below it.
// The drawer switches between Overview / Bookings / Services / Cities / Masjids.
function DashboardContent() {
  const { user } = useAuth();
  const logout = useLogout();
  const { confirmLogout, logoutDialog } = useConfirmLogout();
  const [section, setSection] = useState('overview');
  const [menuOpen, setMenuOpen] = useState(false);

  const { data: bookings = [] } = useQuery({ queryKey: ['admin-bookings'], queryFn: getAllBookings });
  const pending = bookings.filter((b) => b.status === BOOKING_STATUS.PENDING).length;

  const { data: accounts = [] } = useQuery({ queryKey: ['admin-accounts'], queryFn: getAccountsForApproval });
  const approvalCount = accounts.filter((a) => a.approvalStatus === APPROVAL.PENDING).length;

  const current = ADMIN_SECTIONS.find((s) => s.id === section);

  const selectSection = (id) => {
    setSection(id);
    setMenuOpen(false);
  };

  const onLogout = () => {
    setMenuOpen(false);
    logout(); // back to Home and ends the saved Supabase session
  };

  return (
    <KeyboardAwareView style={styles.container}>
      {logoutDialog}
      <ScreenHeader
        title={current.label}
        subtitle="Admin Panel"
        left={<HeaderButton icon="menu" label="Open menu" onPress={() => setMenuOpen(true)} dot={pending + approvalCount > 0} />}
        right={<HeaderButton icon="log-out-outline" label="Logout" onPress={confirmLogout} />}
      />

      <ScrollView
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        {section === 'overview' ? <AdminOverview onOpenSection={setSection} /> : null}
        {section === 'bookings' ? <AdminBookings /> : null}
        {section === 'approvals' ? <AdminApprovals /> : null}
        {section === 'services' ? <AdminServices /> : null}
        {section === 'cities' ? <AdminCities /> : null}
        {section === 'masjids' ? <AdminMasjids /> : null}
      </ScrollView>

      <SideDrawer visible={menuOpen} onClose={() => setMenuOpen(false)}>
        <AdminDrawerMenu
          section={section}
          onSelect={selectSection}
          pendingCount={pending}
          approvalCount={approvalCount}
          email={user?.email}
          onLogout={onLogout}
        />
      </SideDrawer>
    </KeyboardAwareView>
  );
}

export default function AdminDashboard() {
  return (
    <RoleGuard allow={ROLES.ADMIN}>
      <DashboardContent />
    </RoleGuard>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  // flexGrow lets an empty state centre itself in the whole screen
  scroll: { flexGrow: 1, padding: 16, paddingBottom: 40 },
  headerButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.glass,
    borderWidth: 1,
    borderColor: colors.glassBorder,
  },
  dot: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.danger,
    borderWidth: 1.5,
    borderColor: colors.primaryDeep,
  },
});
