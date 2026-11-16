import { useCallback } from 'react';
import { useNavigation } from '@react-navigation/native';

import { DASHBOARD_ROUTE } from '@/constants/roles';

// Opens the dashboard that belongs to a role (admin / imam / masjid).
export function useDashboardNavigation() {
  const navigation = useNavigation();

  // From Home: just open it on top (back returns to Home).
  const openDashboard = useCallback((role) => navigation.navigate(DASHBOARD_ROUTE[role]), [navigation]);

  // After login / sign up: clear the auth screens, keep Home underneath.
  const resetToDashboard = useCallback(
    (role) =>
      navigation.reset({ index: 1, routes: [{ name: 'MainTabs' }, { name: DASHBOARD_ROUTE[role] }] }),
    [navigation]
  );

  return { openDashboard, resetToDashboard };
}
