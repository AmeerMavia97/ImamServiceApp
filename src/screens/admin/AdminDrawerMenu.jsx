import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import AppText from '@/components/ui/AppText';
import IslamicPattern from '@/components/ui/IslamicPattern';
import { colors } from '@/constants/colors';
import { fonts } from '@/constants/fonts';
import { radius } from '@/constants/layout';

export const ADMIN_SECTIONS = [
  { id: 'overview', label: 'Overview', icon: 'grid' },
  { id: 'bookings', label: 'Bookings', icon: 'calendar' },
  { id: 'approvals', label: 'Approvals', icon: 'person-add' },
  { id: 'services', label: 'Services', icon: 'pricetag' },
  { id: 'cities', label: 'Cities', icon: 'location' },
  { id: 'masjids', label: 'Masjids', icon: 'business' },
];

// Content of the admin side drawer: header, the sections, and Logout.
export default function AdminDrawerMenu({ section, onSelect, pendingCount, approvalCount = 0, email, onLogout }) {
  const insets = useSafeAreaInsets();
  // red number next to a section: pending bookings / registrations waiting for approval
  const badgeCount = (id) => (id === 'bookings' ? pendingCount : id === 'approvals' ? approvalCount : 0);

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 20 }]}>
        <IslamicPattern opacity={0.1} />
        <View style={styles.logo}>
          <MaterialCommunityIcons name="mosque" size={28} color={colors.primaryDeep} />
        </View>
        <AppText variant="title" color={colors.textOnPrimary}>
          Arzi Services
        </AppText>
        <AppText variant="overline" color={colors.goldLight}>
          Admin Panel
        </AppText>
        {email ? (
          <AppText variant="caption" color={colors.textOnPrimaryMuted} numberOfLines={1}>
            {email}
          </AppText>
        ) : null}
      </View>

      <View style={styles.items}>
        {ADMIN_SECTIONS.map((item) => {
          const active = item.id === section;
          return (
            <Pressable
              key={item.id}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              onPress={() => onSelect(item.id)}
              style={({ pressed }) => [styles.item, active && styles.itemActive, pressed && { opacity: 0.8 }]}
            >
              <Ionicons
                name={active ? item.icon : `${item.icon}-outline`}
                size={22}
                color={active ? colors.goldLight : colors.textOnPrimaryMuted}
              />
              <AppText
                variant="subheading"
                color={active ? colors.goldLight : colors.textOnPrimary}
                style={styles.itemLabel}
              >
                {item.label}
              </AppText>
              {badgeCount(item.id) > 0 ? (
                <View style={styles.count}>
                  <AppText variant="caption" color={colors.white} style={styles.countText}>
                    {badgeCount(item.id)}
                  </AppText>
                </View>
              ) : null}
            </Pressable>
          );
        })}
      </View>

      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        <Pressable
          accessibilityRole="button"
          onPress={onLogout}
          style={({ pressed }) => [styles.item, pressed && { opacity: 0.8 }]}
        >
          <Ionicons name="log-out-outline" size={22} color={colors.goldLight} />
          <AppText variant="subheading" color={colors.goldLight} style={styles.itemLabel}>
            Logout
          </AppText>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    gap: 4,
    paddingHorizontal: 20,
    paddingBottom: 22,
    backgroundColor: colors.primaryDark,
    overflow: 'hidden',
  },
  logo: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.goldLight,
    marginBottom: 8,
  },
  items: { flex: 1, padding: 12, gap: 4 },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderRadius: radius.md,
  },
  itemActive: { backgroundColor: 'rgba(233,215,166,0.14)' },
  itemLabel: { flex: 1 },
  count: {
    minWidth: 22,
    height: 22,
    paddingHorizontal: 6,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.danger,
  },
  countText: { fontFamily: fonts.bodyBold, fontSize: 11, lineHeight: 14 },
  footer: {
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(233,215,166,0.18)',
  },
});
