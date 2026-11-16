import { useCallback } from 'react';
import { useNavigation } from '@react-navigation/native';

import { useAuth } from '@/store/AuthContext';

// Logout: go back to Home first (so the screen's role guard does not react), then end the session.
// The reset must run on the main stack, even when called from a tab inside a dashboard.
export function useLogout() {
  const navigation = useNavigation();
  const { logout } = useAuth();

  return useCallback(async () => {
    let stack = navigation;
    while (stack.getState().type !== 'stack' && stack.getParent()) stack = stack.getParent();
    stack.reset({ index: 0, routes: [{ name: 'MainTabs' }] });
    await logout();
  }, [navigation, logout]);
}
