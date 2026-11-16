import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useContinueAsUser } from '@/components/hooks/useContinueAsUser';
import AppText from '@/components/ui/AppText';
import { colors } from '@/constants/colors';
import { fonts } from '@/constants/fonts';
import { radius } from '@/constants/layout';
import { ROLES } from '@/constants/roles';

function RoleCard({ icon, title, description, action, onPress }) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      <MaterialCommunityIcons name={icon} size={28} color={colors.primary} />
      <AppText variant="title" color={colors.primaryDeep} style={styles.cardTitle}>
        {title}
      </AppText>
      <AppText variant="body" color={colors.textMuted}>
        {description}
      </AppText>
      <View style={styles.action}>
        <AppText variant="label" color={colors.primary}>
          {action}
        </AppText>
        <MaterialCommunityIcons name="arrow-right" size={16} color={colors.primary} />
      </View>
    </Pressable>
  );
}

// Shown once after "Get Started". Tapping a card moves on straight away:
// User finishes setup and opens Home; Imam / Masjid Representative open their register page.
export default function RoleSelect() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const focused = useIsFocused();
  const continueAsUser = useContinueAsUser();

  return (
    <View style={styles.container}>
      {/* Light screen: dark status bar icons (only while this screen is in front) */}
      {focused ? <StatusBar style="dark" /> : null}

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scroll,
          { paddingTop: insets.top + 28, paddingBottom: Math.max(insets.bottom, 16) + 16 },
        ]}
      >
        <View style={styles.header}>
          <MaterialCommunityIcons name="mosque" size={64} color={colors.primary} />
          <AppText variant="display" color={colors.primaryDeep} style={styles.title}>
            How would you like to use the app?
          </AppText>
          <AppText variant="body" color={colors.textMuted} style={styles.center}>
            Choose your role to get started
          </AppText>
        </View>

        <View style={styles.cards}>
          <RoleCard
            icon="account-outline"
            title="I'm a User"
            description="Find and book an Imam for your needs."
            action="Continue to Home"
            onPress={continueAsUser}
          />
          <RoleCard
            icon="mosque-outline"
            title="I'm an Imam"
            description="Register your profile and manage bookings."
            action="Imam Registration"
            onPress={() => navigation.navigate('Register', { role: ROLES.IMAM })}
          />
          <RoleCard
            icon="home-city-outline"
            title="I'm a Masjid Representative"
            description="Register and manage your Masjid."
            action="Masjid Registration"
            onPress={() => navigation.navigate('Register', { role: ROLES.MASJID })}
          />
        </View>

        <Text style={styles.footer}>
          You can switch roles anytime from the <Text style={styles.footerBold}>Home</Text> page.
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scroll: { flexGrow: 1, paddingHorizontal: 20, gap: 26 },

  header: { alignItems: 'center', gap: 8 },
  title: { fontSize: 30, lineHeight: 38, textAlign: 'center', marginTop: 8 },
  center: { textAlign: 'center' },

  cards: { gap: 12 },
  card: {
    gap: 4,
    padding: 18,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  pressed: { backgroundColor: colors.primarySoft },
  cardTitle: { fontSize: 22, lineHeight: 28, marginTop: 8 },
  action: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 10 },

  footer: {
    marginTop: 'auto',
    textAlign: 'center',
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.textMuted,
  },
  footerBold: { fontFamily: fonts.bodyBold, color: colors.text },
});
