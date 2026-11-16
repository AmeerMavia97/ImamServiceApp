import { Pressable, StyleSheet, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import AppText from '@/components/ui/AppText';
import { colors } from '@/constants/colors';
import { radius } from '@/constants/layout';

// Row of boxes to pick a role (Imam / Masjid / Admin). options: [{ value, label, icon }]
export default function RoleTabs({ options, value, onChange }) {
  return (
    <View style={styles.row}>
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <Pressable
            key={option.value}
            accessibilityRole="tab"
            accessibilityState={{ selected }}
            onPress={() => onChange(option.value)}
            style={({ pressed }) => [styles.box, selected && styles.boxSelected, pressed && { opacity: 0.85 }]}
          >
            <MaterialCommunityIcons
              name={option.icon}
              size={24}
              color={selected ? colors.goldLight : colors.textMuted}
            />
            <AppText variant="label" color={selected ? colors.textOnPrimary : colors.text}>
              {option.label}
            </AppText>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 10 },
  box: {
    flex: 1,
    alignItems: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.transparent,
  },
  boxSelected: { backgroundColor: colors.primary, borderColor: colors.primary },
});
