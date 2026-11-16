import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import FloatingTabBar from '@/components/Tabs/FloatingTabBar';
import Home from '@/screens/Home/Home';
import MyBookings from '@/screens/MyBookings/MyBookings';
import Services from '@/screens/Services/Services';

const Tab = createBottomTabNavigator();

export default function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{ headerShown: false }}
      tabBar={(props) => <FloatingTabBar {...props} />}
    >
      <Tab.Screen name="Home" component={Home} />
      <Tab.Screen name="Services" component={Services} />
      <Tab.Screen name="MyBookings" component={MyBookings} />
    </Tab.Navigator>
  );
}
