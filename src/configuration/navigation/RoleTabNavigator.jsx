import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import FloatingTabBar from '@/components/Tabs/FloatingTabBar';
import DashboardOverview from '@/screens/Dashboard/DashboardOverview';
import DashboardProfile from '@/screens/Dashboard/DashboardProfile';
import DashboardRequests from '@/screens/Dashboard/DashboardRequests';

const Tab = createBottomTabNavigator();

// The dashboard of an Imam and of a Masjid Representative: Dashboard / Bookings / Profile.
// Both roles use the same three screens; the data each one sees is decided by the database.
export default function RoleTabNavigator() {
  return (
    <Tab.Navigator screenOptions={{ headerShown: false }} tabBar={(props) => <FloatingTabBar {...props} />}>
      <Tab.Screen name="Overview" component={DashboardOverview} />
      <Tab.Screen name="Requests" component={DashboardRequests} />
      <Tab.Screen name="Profile" component={DashboardProfile} />
    </Tab.Navigator>
  );
}
