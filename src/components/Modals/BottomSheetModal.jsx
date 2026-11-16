import { useEffect, useState } from 'react';
import {
  Animated,
  Easing,
  KeyboardAvoidingView,
  Modal,
  Pressable,
  StyleSheet,
  useWindowDimensions,
} from 'react-native';

import { colors } from '@/constants/colors';

// Bottom sheet where the dark backdrop FADES in/out while only the sheet SLIDES up/down.
// (The built-in Modal "slide" animation moves the backdrop together with the sheet.)
export default function BottomSheetModal({ visible, onClose, sheetStyle, children }) {
  const { height } = useWindowDimensions();
  const [mounted, setMounted] = useState(visible);
  const [fade] = useState(() => new Animated.Value(0)); // backdrop opacity
  const [slide] = useState(() => new Animated.Value(0)); // 0 = off-screen, 1 = in place

  // Keep the Modal mounted from the moment it opens until the close animation ends.
  if (visible && !mounted) setMounted(true);

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fade, {
          toValue: 1,
          duration: 260,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(slide, {
          toValue: 1,
          duration: 320,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(fade, {
          toValue: 0,
          duration: 220,
          easing: Easing.in(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(slide, {
          toValue: 0,
          duration: 240,
          easing: Easing.in(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start(({ finished }) => {
        if (finished) setMounted(false);
      });
    }
  }, [visible, fade, slide]);

  const translateY = slide.interpolate({ inputRange: [0, 1], outputRange: [height, 0] });

  return (
    <Modal
      visible={visible || mounted}
      transparent
      animationType="none"
      statusBarTranslucent
      navigationBarTranslucent
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView behavior="padding" style={styles.root}>
        <Animated.View style={[StyleSheet.absoluteFill, styles.backdrop, { opacity: fade }]}>
          <Pressable style={styles.fill} onPress={onClose} />
        </Animated.View>
        <Animated.View style={[sheetStyle, { transform: [{ translateY }] }]}>{children}</Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, justifyContent: 'flex-end' },
  backdrop: { backgroundColor: colors.overlay },
  fill: { flex: 1 },
});
