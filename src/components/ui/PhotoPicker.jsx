import { useState } from 'react';
import { Image, Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import AppText from '@/components/ui/AppText';
import { colors } from '@/constants/colors';
import { pickPhoto } from '@/utils/imagePicker';

// Optional photo on a form: a round picture (or a dashed placeholder) with "Add photo" text.
// Tapping opens the gallery; tapping again changes it. `onChange` gets { uri, base64, mimeType }
// (or null when removed).
export default function PhotoPicker({ uri, onChange, title = 'Add photo', hint = 'Optional · JPG or PNG' }) {
  const [error, setError] = useState('');

  const pick = async () => {
    setError('');
    try {
      const asset = await pickPhoto();
      if (asset) onChange(asset);
    } catch (e) {
      setError(e.message || 'Could not open your photos. Please allow photo access and try again.');
    }
  };

  return (
    <View style={styles.wrap}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={uri ? 'Change photo' : title}
        onPress={pick}
        style={({ pressed }) => [styles.row, pressed && { opacity: 0.8 }]}
      >
        <View style={[styles.circle, !uri && styles.circleEmpty]}>
          {uri ? (
            <Image source={{ uri }} style={styles.image} />
          ) : (
            <Ionicons name="camera-outline" size={28} color={colors.primary} />
          )}
          <View style={styles.badge}>
            <Ionicons name={uri ? 'pencil' : 'add'} size={13} color={colors.textOnPrimary} />
          </View>
        </View>

        <View style={styles.texts}>
          <AppText variant="subheading">{uri ? 'Change photo' : title}</AppText>
          <AppText variant="caption">{hint}</AppText>
        </View>
      </Pressable>

      {uri ? (
        <Pressable onPress={() => onChange(null)} hitSlop={8}>
          <AppText variant="caption" color={colors.danger}>
            Remove
          </AppText>
        </Pressable>
      ) : null}

      {error ? (
        <AppText variant="caption" color={colors.danger}>
          {error}
        </AppText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 8, alignItems: 'flex-start' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  circle: {
    width: 84,
    height: 84,
    borderRadius: 42,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primarySoft,
  },
  circleEmpty: { borderWidth: 1.5, borderStyle: 'dashed', borderColor: colors.primary },
  image: { width: 84, height: 84, borderRadius: 42 },
  badge: {
    position: 'absolute',
    right: -2,
    bottom: -2,
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    borderWidth: 2,
    borderColor: colors.background,
  },
  texts: { gap: 2 },
});
