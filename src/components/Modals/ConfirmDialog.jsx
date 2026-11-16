import { Modal, Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import AppButton from '@/components/ui/AppButton';
import AppText from '@/components/ui/AppText';
import { colors } from '@/constants/colors';
import { radius, shadows } from '@/constants/layout';

// Centred confirmation dialog: round icon, title, message and two buttons.
// Tapping the dark area (or the phone's back button) cancels.
export default function ConfirmDialog({
  visible,
  icon = 'help-circle-outline',
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  danger = false,
  onConfirm,
  onCancel,
}) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      navigationBarTranslucent
      onRequestClose={onCancel}
    >
      <View style={styles.root}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onCancel} accessibilityLabel="Close" />

        <View style={styles.card} accessibilityViewIsModal>
          <View style={[styles.iconCircle, danger && styles.iconCircleDanger]}>
            <Ionicons name={icon} size={30} color={danger ? colors.danger : colors.primary} />
          </View>

          <View style={styles.texts}>
            <AppText variant="title" style={styles.center}>
              {title}
            </AppText>
            {message ? (
              <AppText variant="body" color={colors.textMuted} style={styles.center}>
                {message}
              </AppText>
            ) : null}
          </View>

          <View style={styles.buttons}>
            <AppButton title={cancelLabel} variant="outline" style={styles.button} onPress={onCancel} />
            <AppButton
              title={confirmLabel}
              variant={danger ? 'dangerSolid' : 'primary'}
              style={styles.button}
              onPress={onConfirm}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, backgroundColor: colors.overlay },
  card: {
    width: '100%',
    maxWidth: 360,
    alignItems: 'center',
    gap: 18,
    padding: 24,
    borderRadius: radius.xl,
    backgroundColor: colors.surface,
    ...shadows.raised,
  },
  iconCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primaryLight,
  },
  iconCircleDanger: { backgroundColor: colors.dangerSoft },
  texts: { gap: 6, alignItems: 'center' },
  center: { textAlign: 'center' },
  buttons: { flexDirection: 'row', gap: 10, alignSelf: 'stretch' },
  button: { flex: 1 },
});
