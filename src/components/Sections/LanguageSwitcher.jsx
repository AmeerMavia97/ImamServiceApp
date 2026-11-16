import { useState } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import SelectSheet from '@/components/Modals/SelectSheet';
import { colors } from '@/constants/colors';
import { LANGUAGES_UI } from '@/constants/languages';
import { useLanguage } from '@/store/LanguageContext';

// Small round language button (globe icon only, to save space) for dark headers.
export default function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();
  const [open, setOpen] = useState(false);
  const current = LANGUAGES_UI.find((l) => l.value === language) ?? LANGUAGES_UI[0];

  return (
    <>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Change language (now ${current.label})`}
        onPress={() => setOpen(true)}
        hitSlop={8}
        style={({ pressed }) => [styles.button, pressed && { opacity: 0.8 }]}
      >
        <Ionicons name="globe-outline" size={20} color={colors.goldLight} />
      </Pressable>

      <SelectSheet
        visible={open}
        title="Language (Zubaan)"
        options={LANGUAGES_UI}
        value={language}
        onSelect={(next) => {
          setLanguage(next);
          setOpen(false);
        }}
        onClose={() => setOpen(false)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.glass,
    borderWidth: 1,
    borderColor: colors.glassBorder,
  },
});
