import { useEffect, useState } from 'react';
import { ActivityIndicator, Animated, StyleSheet, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import AppText from '@/components/ui/AppText';
import { colors } from '@/constants/colors';

// First screen on every app launch: plain background, logo centred on the screen,
// spinner pinned to the bottom.
export default function LoadingScreen() {
  const insets = useSafeAreaInsets();
  const [opacity] = useState(() => new Animated.Value(0));
  const [lift] = useState(() => new Animated.Value(14));

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 700, useNativeDriver: true }),
      Animated.timing(lift, { toValue: 0, duration: 700, useNativeDriver: true }),
    ]).start();
  }, [opacity, lift]);

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.brand, { opacity, transform: [{ translateY: lift }] }]}>
        <View style={styles.logo}>
          <MaterialCommunityIcons name="mosque" size={44} color={colors.primaryDeep} />
        </View>
        <AppText variant="display" color={colors.textOnPrimary} style={styles.title}>
          Arzi Services
        </AppText>
        <AppText variant="overline" color={colors.goldLight}>
          Masjid Services, Made Easy
        </AppText>
      </Animated.View>

      <View style={[styles.loader, { bottom: Math.max(insets.bottom, 16) + 36 }]}>
        <ActivityIndicator size="large" color={colors.goldLight} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.primaryDeep, alignItems: 'center', justifyContent: 'center' },
  brand: { alignItems: 'center', gap: 8 },
  logo: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.goldLight,
    marginBottom: 10,
  },
  title: { fontSize: 38, lineHeight: 48, textAlign: 'center' },
  loader: { position: 'absolute', left: 0, right: 0, alignItems: 'center' },
});
