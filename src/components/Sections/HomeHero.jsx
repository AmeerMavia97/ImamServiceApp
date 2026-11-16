import { StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import AccountButton from '@/components/Sections/AccountButton';
import LanguageSwitcher from '@/components/Sections/LanguageSwitcher';
import AppText from '@/components/ui/AppText';
import IslamicPattern from '@/components/ui/IslamicPattern';
import { colors } from '@/constants/colors';
import { radius } from '@/constants/layout';

export default function HomeHero() {
  const insets = useSafeAreaInsets();

  return (
    <LinearGradient
      colors={[colors.primaryDeep, colors.primaryDark, colors.primary]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.container, { paddingTop: insets.top + 14 }]}
    >

      {/* Stars cover the whole hero; the solid mosque (zIndex 1) sits on top of them */}
      <IslamicPattern />

      <View pointerEvents="none" style={styles.watermarkLayer}>
        <MaterialCommunityIcons name="mosque" size={190} color={colors.primaryMid} />
      </View>

      <View style={styles.brandRow}>
        <View style={styles.brand}>
          <View style={styles.logo}>
            <MaterialCommunityIcons name="mosque" size={20} color={colors.primaryDeep} />
          </View>
          <AppText variant="title" color={colors.textOnPrimary} numberOfLines={1} style={styles.brandName}>
            Arzi Services
          </AppText>
        </View>
        <View style={styles.controls}>
          <LanguageSwitcher />
          <AccountButton />
        </View>
      </View>

      <View style={styles.texts}>
        <AppText variant="overline" color={colors.goldLight}>
          Assalamu Alaikum
        </AppText>
        <AppText variant="display" color={colors.textOnPrimary}>
          Masjid Services,{'\n'}Made Easy
        </AppText>
        {/* <AppText variant="body" color={colors.textOnPrimaryMuted} style={styles.subtitle}>
          Masjid ki khidmat ke liye Imam, Moazzin, Khadim aur Cleaning Worker — asaan booking.
        </AppText> */}
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingBottom: 56,
    borderBottomLeftRadius: radius.xl,
    borderBottomRightRadius: radius.xl,
    overflow: 'hidden',
    gap: 16,
  },

  watermarkLayer: {
    position: 'absolute',
    right: -34,
    bottom: 6,
    zIndex: 1,
  },
  brandRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', zIndex: 2 },
  brand: { flexShrink: 1, flexDirection: 'row', alignItems: 'center', gap: 8 },
  brandName: { flexShrink: 1, fontSize: 21, lineHeight: 28 },
  controls: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  logo: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.goldLight,
  },
  // zIndex 2 keeps the heading above the mosque vector (zIndex 1)
  texts: { gap: 6, zIndex: 2 },
  subtitle: { maxWidth: '88%', marginTop: 4 , zIndex:2 },
});
