import { useCallback } from 'react';
import { useNavigation } from '@react-navigation/native';

import { saveUserRole } from '@/utils/storage';

// "Continue as User": remember the choice and open the Home tabs (clearing the screens behind).
export function useContinueAsUser() {
  const navigation = useNavigation();

  return useCallback(async () => {
    await saveUserRole('user');
    navigation.reset({ index: 0, routes: [{ name: 'MainTabs' }] });
  }, [navigation]);
}
