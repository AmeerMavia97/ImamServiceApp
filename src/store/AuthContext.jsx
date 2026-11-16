import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';

import { getAccount, signOut } from '@/services/authService';
import { supabase } from '@/services/supabase';

const AuthContext = createContext({
  user: null,
  role: null,
  profile: null,
  ready: false,
  logout: async () => {},
  refresh: async () => {},
});

// Who is logged in. Supabase keeps the session on the phone, so a person stays logged in
// until they press Logout. The ROLE and profile come from the database (React Query key
// ['account', userId]). `ready` turns true once the saved session (and its role) is checked.
export function AuthProvider({ children }) {
  const queryClient = useQueryClient();
  const [session, setSession] = useState(undefined); // undefined = still checking the saved session

  useEffect(() => {
    let active = true;

    supabase.auth
      .getSession()
      .then(({ data }) => active && setSession(data.session ?? null))
      .catch(() => active && setSession(null));

    // Only store the session here (no other Supabase calls inside this callback).
    const { data } = supabase.auth.onAuthStateChange((_event, next) => setSession(next ?? null));

    return () => {
      active = false;
      data.subscription.unsubscribe();
    };
  }, []);

  const user = session?.user ?? null;

  const accountQuery = useQuery({
    queryKey: ['account', user?.id],
    queryFn: () => getAccount(user),
    enabled: Boolean(user),
  });

  const account = user ? accountQuery.data ?? null : null;
  const ready = session !== undefined && (!user || !accountQuery.isLoading);

  const logout = useCallback(async () => {
    await signOut();
    queryClient.removeQueries({ queryKey: ['account'] });
    queryClient.removeQueries({ queryKey: ['admin-bookings'] });
  }, [queryClient]);

  // Reload the account (e.g. to see that the admin has approved it).
  const refresh = accountQuery.refetch;

  const value = useMemo(
    () => ({ user, role: account?.role ?? null, profile: account?.profile ?? null, ready, logout, refresh }),
    [user, account, ready, logout, refresh]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
