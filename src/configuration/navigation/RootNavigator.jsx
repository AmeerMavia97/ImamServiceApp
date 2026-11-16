import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { colors } from '@/constants/colors';
import { fonts } from '@/constants/fonts';
import AdminDashboard from '@/screens/admin/AdminDashboard';
import ForgotPassword from '@/screens/Auth/ForgotPassword';
import Login from '@/screens/Auth/Login';
import Register from '@/screens/Auth/Register';
import BookingForm from '@/screens/Booking/BookingForm';
import ImamDashboard from '@/screens/Imam/ImamDashboard';
import MasjidDashboard from '@/screens/Masjid/MasjidDashboard';
import Onboarding from '@/screens/Onboarding/Onboarding';
import RoleSelect from '@/screens/RoleSelect/RoleSelect';
import TabNavigator from './TabNavigator';

const Stack = createNativeStackNavigator();

const navigationTheme = {
  dark: false,
  colors: {
    primary: colors.primary,
    background: colors.background,
    card: colors.background,
    text: colors.text,
    border: colors.border,
    notification: colors.danger,
  },
  fonts: {
    regular: { fontFamily: fonts.body, fontWeight: '400' },
    medium: { fontFamily: fonts.bodyMedium, fontWeight: '500' },
    bold: { fontFamily: fonts.bodyBold, fontWeight: '700' },
    heavy: { fontFamily: fonts.bodyBold, fontWeight: '800' },
  },
};

// Dark green header shared by the form and admin screens.
const greenHeader = {
  headerStyle: { backgroundColor: colors.primaryDeep },
  headerTintColor: colors.textOnPrimary,
  headerTitleStyle: { fontFamily: fonts.displaySemi, fontSize: 22 },
  headerShadowVisible: false,
  headerBackButtonDisplayMode: 'minimal',
};

// The intro is only part of the navigator until the user has completed it once.
// After it, someone who has not finished the role screen starts on RoleSelect; a visitor who chose
// "User" (or anyone logged in) goes straight to the Home tabs.
//
// Dashboards (Admin / Imam / Masjid) are wrapped in <RoleGuard> inside each screen: a logged-out
// person is sent to Login and a person with another role to their own dashboard.
export default function RootNavigator({ hasOnboarded, startOnHome, onOnboardingDone }) {
  return (
    <NavigationContainer theme={navigationTheme}>
      {/* Before the intro is done only "Onboarding" exists, so no initialRouteName then.
          Afterwards RoleSelect is the first screen; a returning person goes straight to MainTabs. */}
      <Stack.Navigator initialRouteName={hasOnboarded && startOnHome ? 'MainTabs' : undefined}>
        {hasOnboarded ? (
          <>
            <Stack.Screen
              name="RoleSelect"
              component={RoleSelect}
              options={{ headerShown: false, animation: 'fade' }}
            />
            <Stack.Screen name="MainTabs" component={TabNavigator} options={{ headerShown: false }} />
            <Stack.Screen
              name="BookingForm"
              component={BookingForm}
              options={{ ...greenHeader, title: 'Book a Service' }}
            />

            {/* Login / Sign Up for Imam, Masjid and Admin (these pages draw their own header) */}
            <Stack.Screen name="Login" component={Login} options={{ headerShown: false }} />
            <Stack.Screen name="Register" component={Register} options={{ headerShown: false }} />
            <Stack.Screen name="ForgotPassword" component={ForgotPassword} options={{ headerShown: false }} />

            {/* One dashboard per role. Imam / Masjid have their own tabs, so no stack header */}
            <Stack.Screen
              name="ImamDashboard"
              component={ImamDashboard}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="MasjidDashboard"
              component={MasjidDashboard}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="AdminDashboard"
              component={AdminDashboard}
              options={{ headerShown: false, gestureEnabled: false }}
            />
          </>
        ) : (
          <Stack.Screen name="Onboarding" options={{ headerShown: false, animation: 'fade' }}>
            {() => <Onboarding onDone={onOnboardingDone} />}
          </Stack.Screen>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
