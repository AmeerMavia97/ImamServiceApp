import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors } from '@/constants/colors';
import { fonts } from '@/constants/fonts';
import { radius, shadows } from '@/constants/layout';

const TABS = {
  Home: { label: 'Home', icon: 'home' },
  Services: { label: 'Services', icon: 'grid' },
  MyBookings: { label: 'My Bookings', icon: 'calendar' },
  // Imam / Masjid dashboard tabs
  Overview: { label: 'Dashboard', icon: 'stats-chart' },
  Requests: { label: 'Bookings', icon: 'calendar' },
  Profile: { label: 'Profile', icon: 'person' },
};

// Floating pill-shaped tab bar that hovers above the screen content.
// Screens leave room for it with TAB_BAR_CLEARANCE (constants/layout.js).
export default function FloatingTabBar({ state, navigation }) {
  const insets = useSafeAreaInsets();

  return (
    <View pointerEvents="box-none" style={[styles.wrap, { paddingBottom: Math.max(insets.bottom, 12) }]}>
      <View style={styles.bar}>
        {state.routes.map((route, index) => {
          const focused = state.index === index;
          const tab = TABS[route.name];

          const onPress = () => {
            const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
            if (!focused && !event.defaultPrevented) navigation.navigate(route.name, route.params);
          };

          return (
            <Pressable
              key={route.key}
              accessibilityRole="button"
              accessibilityLabel={tab.label}
              accessibilityState={{ selected: focused }}
              onPress={onPress}
              style={[styles.item, focused && styles.itemActive]}
            >
              <Ionicons
                name={focused ? tab.icon : `${tab.icon}-outline`}
                size={22}
                color={focused ? colors.primaryDeep : colors.textOnPrimaryMuted}
              />
              {focused ? <Text style={styles.label}>{tab.label}</Text> : null}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'absolute', left: 0, right: 0, bottom: 0, paddingHorizontal: 20 },
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    gap: 4,
    backgroundColor: colors.primaryDeep,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: 'rgba(233,215,166,0.18)',
    ...shadows.raised,
  },
  item: {
    flex: 1,
    height: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: radius.pill,
  },
  itemActive: { flex: 1.8, backgroundColor: colors.goldLight },
  label: { fontFamily: fonts.bodyBold, fontSize: 13, color: colors.primaryDeep },
});
