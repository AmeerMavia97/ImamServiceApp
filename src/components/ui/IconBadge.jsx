import { StyleSheet, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { colors } from '@/constants/colors';

// Rounded square holding a MaterialCommunityIcons glyph.
export default function IconBadge({ name, size = 52, tone = 'green', style }) {
  const dark = tone === 'dark';
  return (
    <View
      style={[
        styles.box,
        {
          width: size,
          height: size,
          borderRadius: size * 0.32,
          backgroundColor: dark ? colors.primary : colors.primaryLight,
        },
        style,
      ]}
    >
      <MaterialCommunityIcons
        name={name}
        size={size * 0.5}
        color={dark ? colors.goldLight : colors.primary}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  box: { alignItems: 'center', justifyContent: 'center' },
});
