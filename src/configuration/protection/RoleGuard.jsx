import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';

import { colors } from '@/constants/colors';
import { DASHBOARD_ROUTE } from '@/constants/roles';
import { useAuth } from '@/store/AuthContext';

// Wrap a role's screens (dashboards). `allow` is one role or a list of roles.
//  - not logged in            -> sent to the Login page
//  - logged in as another role -> sent to their own dashboard
// This only controls what is shown. The real protection is in the database (RLS).
export default function RoleGuard({ allow, children }) {
  const { role, ready } = useAuth();
  const navigation = useNavigation();

  const allowed = ready && role !== null && [].concat(allow).includes(role);

  useEffect(() => {
    if (!ready || allowed) return;
    navigation.replace(role ? DASHBOARD_ROUTE[role] : 'Login');
  }, [ready, allowed, role, navigation]);

  if (!ready) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }
  return allowed ? children : null;
}
