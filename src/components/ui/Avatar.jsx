import { useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';

import { colors } from '@/constants/colors';
import { fonts } from '@/constants/fonts';
import { getInitials } from '@/utils/formatters';

// Shows the photo; falls back to initials if there is no photo or it fails to load.
// `ringSpace`: how much bigger the outer ring is than the photo (10 = a white gap around it,
// 3 = only the thin gold border, so the photo fills the whole circle).
export default function Avatar({ uri, name, size = 64, ringSpace = 10, style }) {
  const [failedUri, setFailedUri] = useState(null); // remember WHICH photo failed, so a new photo is tried
  const dimension = { width: size, height: size, borderRadius: size / 2 };
  // Fixed square outer box so the ring stays a perfect circle even inside a stretching flex row.
  const outer = size + ringSpace;

  return (
    <View style={[styles.ring, { width: outer, height: outer, borderRadius: outer / 2 }, style]}>
      {uri && failedUri !== uri ? (
        <Image source={{ uri }} style={dimension} onError={() => setFailedUri(uri)} />
      ) : (
        <View style={[styles.fallback, dimension]}>
          <Text style={[styles.initials, { fontSize: size * 0.34 }]}>{getInitials(name)}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  ring: {
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: colors.gold,
    backgroundColor: colors.surface,
  },
  fallback: {
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: { fontFamily: fonts.displaySemi, color: colors.primary },
});
