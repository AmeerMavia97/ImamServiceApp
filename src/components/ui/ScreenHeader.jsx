import { StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import AppText from './AppText';
import IslamicPattern from './IslamicPattern';
import { colors } from '@/constants/colors';
import { radius } from '@/constants/layout';

// Green header band used on tab screens (e.g. My Bookings).
// `left` / `right`: optional elements on each side of the title (e.g. a menu and a logout button).
export default function ScreenHeader({ title, subtitle, left, right }) {
  const insets = useSafeAreaInsets();
  return (
    <LinearGradient
      colors={[colors.primaryDeep, colors.primary]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.container, { paddingTop: insets.top + 18 }]}
    >
      <IslamicPattern />
      <View style={styles.row}>
        {left}
        <View style={styles.texts}>
          <AppText variant="display" color={colors.textOnPrimary}>
            {title}
          </AppText>
          {subtitle ? (
            <AppText variant="body" color={colors.goldLight}>
              {subtitle}
            </AppText>
          ) : null}
        </View>
        {right}
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingBottom: 26,
    borderBottomLeftRadius: radius.xl,
    borderBottomRightRadius: radius.xl,
    overflow: 'hidden',
  },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  texts: { flex: 1, gap: 2 },
});
