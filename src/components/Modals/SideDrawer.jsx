import { useEffect, useState } from 'react';
import {
  Animated,
  Easing,
  Modal,
  Pressable,
  StyleSheet,
  View,
  useWindowDimensions,
} from 'react-native';

import { colors } from '@/constants/colors';

// Side drawer: the dark backdrop fades while the panel slides in from the left.
export default function SideDrawer({ visible, onClose, width = 300, children }) {
  const { width: screenWidth } = useWindowDimensions();
  const drawerWidth = Math.min(width, screenWidth * 0.82);

  const [mounted, setMounted] = useState(visible);
  const [fade] = useState(() => new Animated.Value(0));
  const [slide] = useState(() => new Animated.Value(0)); // 0 = hidden, 1 = open

  // Keep the Modal mounted from the moment it opens until the close animation ends.
  if (visible && !mounted) setMounted(true);

  useEffect(() => {
    const open = visible;

    Animated.parallel([
      Animated.timing(fade, {
        toValue: open ? 1 : 0,
        duration: open ? 240 : 200,
        easing: open ? Easing.out(Easing.quad) : Easing.in(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(slide, {
        toValue: open ? 1 : 0,
        duration: open ? 280 : 220,
        easing: open ? Easing.out(Easing.cubic) : Easing.in(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start(({ finished }) => {
      if (finished && !open) setMounted(false);
    });
  }, [visible, fade, slide]);

  const translateX = slide.interpolate({ inputRange: [0, 1], outputRange: [-drawerWidth, 0] });

  return (
    <Modal
      visible={visible || mounted}
      transparent
      animationType="none"
      statusBarTranslucent
      navigationBarTranslucent
      onRequestClose={onClose}
    >
      <View style={styles.root}>
        <Animated.View style={[StyleSheet.absoluteFill, styles.backdrop, { opacity: fade }]}>
          <Pressable style={styles.fill} onPress={onClose} />
        </Animated.View>
        <Animated.View style={[styles.panel, { width: drawerWidth, transform: [{ translateX }] }]}>
          {children}
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  backdrop: { backgroundColor: colors.overlay },
  fill: { flex: 1 },
  panel: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    backgroundColor: colors.primaryDeep,
    borderTopRightRadius: 28,
    borderBottomRightRadius: 28,
    overflow: 'hidden',
  },
});
