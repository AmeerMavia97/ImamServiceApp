import { Modal, Pressable, StyleSheet, View, useWindowDimensions } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import AppText from '@/components/ui/AppText';
import { colors } from '@/constants/colors';
import { radius, shadows } from '@/constants/layout';

// Small dropdown that opens right under a button (not a full-width sheet).
// anchor: { x, y, width, height } of the button on screen (from measureInWindow).
// items: [{ value, label, icon, danger? }]. The menu lines up with the button's right edge.
export default function DropdownMenu({ visible, anchor, items, onSelect, onClose }) {
  const { width: screenWidth } = useWindowDimensions();
  if (!anchor) return null;

  const position = { top: anchor.y + anchor.height + 8, right: Math.max(8, screenWidth - (anchor.x + anchor.width)) };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      navigationBarTranslucent
      onRequestClose={onClose}
    >
      {/* Tap anywhere outside the menu to close it */}
      <Pressable style={StyleSheet.absoluteFill} onPress={onClose} accessibilityLabel="Close menu" />

      <View style={[styles.menu, position]}>
        {items.map((item, index) => (
          <Pressable
            key={item.value}
            accessibilityRole="menuitem"
            onPress={() => onSelect(item.value)}
            style={({ pressed }) => [styles.row, index > 0 && styles.rowDivider, pressed && styles.rowPressed]}
          >
            <MaterialCommunityIcons
              name={item.icon}
              size={20}
              color={item.danger ? colors.danger : colors.primary}
            />
            <AppText variant="subheading" color={item.danger ? colors.danger : colors.text}>
              {item.label}
            </AppText>
          </Pressable>
        ))}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  menu: {
    position: 'absolute',
    minWidth: 168,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.divider,
    overflow: 'hidden',
    ...shadows.card,
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 13, paddingHorizontal: 16 },
  rowDivider: { borderTopWidth: 1, borderTopColor: colors.divider },
  rowPressed: { backgroundColor: colors.primarySoft },
});
