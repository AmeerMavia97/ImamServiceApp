import { useCallback, useState } from 'react';

import { useLogout } from '@/components/hooks/useLogout';
import ConfirmDialog from '@/components/Modals/ConfirmDialog';

// "Do you want to logout?" dialog.
//   const { confirmLogout, logoutDialog } = useConfirmLogout();
//   <Button onPress={confirmLogout} />   and render {logoutDialog} anywhere in the screen.
export function useConfirmLogout() {
  const logout = useLogout();
  const [visible, setVisible] = useState(false);

  const confirmLogout = useCallback(() => setVisible(true), []);

  const logoutDialog = (
    <ConfirmDialog
      visible={visible}
      danger
      icon="log-out-outline"
      title="Logout?"
      message="Are you sure you want to logout? Kya aap logout karna chahte hain?"
      confirmLabel="Logout"
      onCancel={() => setVisible(false)}
      onConfirm={() => {
        setVisible(false);
        logout();
      }}
    />
  );

  return { confirmLogout, logoutDialog };
}
