import { Modal, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import AppButton from '@/components/ui/AppButton';
import AppText from '@/components/ui/AppText';
import { colors } from '@/constants/colors';
import { radius, shadows } from '@/constants/layout';

export default function SuccessModal({ visible, bookingId, onPrimary, onSecondary }) {
  return (
    <Modal visible={visible} transparent animationType="fade" statusBarTranslucent onRequestClose={onSecondary}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <View style={styles.iconOuter}>
            <View style={styles.iconInner}>
              <Ionicons name="checkmark" size={38} color={colors.primaryDeep} />
            </View>
          </View>

          <View style={styles.texts}>
            <AppText variant="title" style={styles.center}>
              Booking Submitted
            </AppText>
            {bookingId ? (
              <AppText variant="label" color={colors.goldDark} style={styles.center}>
                {bookingId}
              </AppText>
            ) : null}
            <AppText variant="body" color={colors.textMuted} style={styles.center}>
              JazakAllah Khair! Hamari team jald aap se rabta karegi, InshaAllah.
            </AppText>
          </View>

          <View style={styles.actions}>
            <AppButton title="View My Bookings" onPress={onPrimary} style={styles.fill} />
            <AppButton title="Back to Home" variant="soft" onPress={onSecondary} style={styles.fill} />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: colors.overlay, alignItems: 'center', justifyContent: 'center', padding: 24 },
  card: {
    width: '100%',
    alignItems: 'center',
    gap: 20,
    padding: 24,
    backgroundColor: colors.background,
    borderRadius: radius.xl,
    ...shadows.raised,
  },
  iconOuter: {
    width: 92,
    height: 92,
    borderRadius: 46,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.goldSoft,
  },
  iconInner: {
    width: 68,
    height: 68,
    borderRadius: 34,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.goldLight,
  },
  texts: { gap: 6, alignItems: 'center' },
  center: { textAlign: 'center' },
  actions: { alignSelf: 'stretch', gap: 10 },
  fill: { alignSelf: 'stretch' },
});
