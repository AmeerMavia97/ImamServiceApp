import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors } from '@/constants/colors';
import { fonts } from '@/constants/fonts';
import { radius } from '@/constants/layout';

// Small pill switch with a few options. options: [{ value, label }]
export default function SegmentedTabs({ options, value, onChange, style }) {
  return (
    <View style={[styles.track, style]}>
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <Pressable
            key={option.value}
            accessibilityRole="tab"
            accessibilityState={{ selected }}
            onPress={() => onChange(option.value)}
            style={[styles.tab, selected && styles.tabSelected]}
          >
            <Text style={[styles.label, selected && styles.labelSelected]}>{option.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    flexDirection: 'row',
    padding: 3,
    borderRadius: radius.pill,
    backgroundColor: colors.primaryLight,
  },
  tab: { paddingHorizontal: 14, height: 32, alignItems: 'center', justifyContent: 'center', borderRadius: radius.pill },
  tabSelected: { backgroundColor: colors.primary },
  label: { fontFamily: fonts.bodySemi, fontSize: 13, color: colors.primary },
  labelSelected: { color: colors.textOnPrimary },
});
