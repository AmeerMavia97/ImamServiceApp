import { useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useIsFocused } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useConfirmLogout } from '@/components/hooks/useConfirmLogout';
import AppButton from '@/components/ui/AppButton';
import EmptyState from '@/components/ui/EmptyState';
import { colors } from '@/constants/colors';
import { APPROVAL } from '@/constants/roles';
import { useAuth } from '@/store/AuthContext';

// Wrap an Imam / Masjid dashboard: only an APPROVED account sees it. A new account waits for
// the admin ("pending"), a refused one is told so ("rejected"). Both can reload or logout.
export default function ApprovalGate({ children }) {
  const insets = useSafeAreaInsets();
  const focused = useIsFocused();
  const { profile, refresh } = useAuth();
  const { confirmLogout, logoutDialog } = useConfirmLogout();
  const [refreshing, setRefreshing] = useState(false);

  if (profile?.approvalStatus === APPROVAL.APPROVED) return children;

  const rejected = profile?.approvalStatus === APPROVAL.REJECTED;

  const reload = async () => {
    setRefreshing(true);
    try {
      await refresh();
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <View style={styles.container}>
      {logoutDialog}
      {focused ? <StatusBar style="dark" /> : null}

      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingTop: insets.top + 24, paddingBottom: insets.bottom + 24 }]}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={reload} tintColor={colors.primary} />}
      >
        <EmptyState
          icon={rejected ? 'close-circle-outline' : 'hourglass-outline'}
          title={rejected ? 'Registration rejected' : 'Waiting for approval'}
          description={
            rejected
              ? 'Admin ne aapki registration approve nahi ki. Zyada maloomat ke liye admin se rabta karein.'
              : 'Aapki registration admin ke paas hai. Approve hote hi aap apna dashboard istemal kar sakenge.'
          }
        >
          <View style={styles.actions}>
            {rejected ? null : <AppButton title="Check again" icon="refresh" loading={refreshing} onPress={reload} />}
            <AppButton title="Logout" icon="log-out-outline" variant="outline" onPress={confirmLogout} />
          </View>
        </EmptyState>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scroll: { flexGrow: 1, paddingHorizontal: 20, justifyContent: 'center' },
  actions: { alignSelf: 'stretch', gap: 10, marginTop: 14, paddingHorizontal: 20 },
});
