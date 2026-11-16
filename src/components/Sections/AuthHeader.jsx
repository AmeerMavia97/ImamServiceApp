import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import AppText from '@/components/ui/AppText';
import { colors } from '@/constants/colors';

// Bordered back button (top left), below the status bar.
export function AuthBackButton() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  return (
    <View style={{ paddingTop: insets.top + 24 }}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Go back"
        onPress={() => navigation.goBack()}
        hitSlop={8}
        style={({ pressed }) => [styles.back, pressed && { opacity: 0.7 }]}
      >
        <Ionicons name="chevron-back" size={20} color={colors.text} />
      </Pressable>
    </View>
  );
}

// Heading and a short paragraph, both left aligned.
export function AuthTitle({ title, subtitle }) {
  return (
    <View style={styles.texts}>
      <AppText variant="display" color={colors.primaryDeep}>
        {title}
      </AppText>
      <AppText variant="body" color={colors.textMuted}>
        {subtitle}
      </AppText>
    </View>
  );
}

// Top of the Imam / Masjid sign-up page: back button, then heading + paragraph.
export default function AuthHeader({ title, subtitle }) {
  return (
    <View style={styles.wrap}>
      <AuthBackButton />
      <AuthTitle title={title} subtitle={subtitle} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 28 },
  back: {
    width: 36,
    height: 36,
    borderRadius: 18, // fully round
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.transparent,
    borderWidth: 1,
    borderColor: colors.border,
  },
  texts: { gap: 6 },
});
