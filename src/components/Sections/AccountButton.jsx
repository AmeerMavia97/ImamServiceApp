import { useRef, useState } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

import { useDashboardNavigation } from '@/components/hooks/useDashboardNavigation';
import DropdownMenu from '@/components/Modals/DropdownMenu';
import Avatar from '@/components/ui/Avatar';
import { colors } from '@/constants/colors';
import { fonts } from '@/constants/fonts';
import { radius } from '@/constants/layout';
import { ROLE_LABELS } from '@/constants/roles';
import { useAuth } from '@/store/AuthContext';

// Top-right button of the Home header:
//  - not logged in -> "Join Us" (opens the Login page)
//  - logged in     -> the person's photo; tapping it opens a small dropdown: Dashboard / Logout
export default function AccountButton() {
  const navigation = useNavigation();
  const { role, profile, logout } = useAuth();
  const { openDashboard } = useDashboardNavigation();
  const buttonRef = useRef(null);
  const [anchor, setAnchor] = useState(null); // where the photo is on screen, so the menu opens right under it
  const [menuOpen, setMenuOpen] = useState(false);

  const openMenu = () => {
    buttonRef.current?.measureInWindow((x, y, width, height) => {
      setAnchor({ x, y, width, height });
      setMenuOpen(true);
    });
  };

  if (role) {
    const menu = [
      { value: 'dashboard', icon: 'view-dashboard-outline', label: 'Dashboard' },
      { value: 'logout', icon: 'logout', label: 'Logout', danger: true },
    ];

    const onSelect = (value) => {
      setMenuOpen(false);
      if (value === 'dashboard') openDashboard(role);
      else logout(); // Home is already showing, it just switches back to "Join Us"
    };

    return (
      <>
        <Pressable
          ref={buttonRef}
          collapsable={false}
          accessibilityRole="button"
          accessibilityLabel="Account menu"
          onPress={openMenu}
          hitSlop={6}
          style={({ pressed }) => pressed && { opacity: 0.85 }}
        >
          {/* 35px photo + 1.5px gold border on each side = a 38px circle, the photo fills it completely */}
          <Avatar uri={profile?.photoUrl} name={profile?.name ?? ROLE_LABELS[role]} size={35} ringSpace={3} />
        </Pressable>

        <DropdownMenu
          visible={menuOpen}
          anchor={anchor}
          items={menu}
          onSelect={onSelect}
          onClose={() => setMenuOpen(false)}
        />
      </>
    );
  }

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Join us"
      onPress={() => navigation.navigate('Login')}
      hitSlop={8}
      style={({ pressed }) => [styles.button, pressed && { opacity: 0.85 }]}
    >
      <MaterialCommunityIcons name="account-plus" size={16} color={colors.primaryDeep} />
      <Text style={styles.label}>Join Us</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    height: 38,
    paddingHorizontal: 12,
    borderRadius: radius.pill,
    backgroundColor: colors.goldLight,
  },
  label: { fontFamily: fonts.bodyBold, fontSize: 12, color: colors.primaryDeep },
});
