import { useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import BottomSheetModal from '@/components/Modals/BottomSheetModal';
import AppText from '@/components/ui/AppText';
import IconBadge from '@/components/ui/IconBadge';
import { colors } from '@/constants/colors';
import { fonts } from '@/constants/fonts';
import { radius } from '@/constants/layout';

const SHEET_PADDING = 16; // left / right padding of the sheet
const ROW_PADDING = 12; // inner left / right padding of an option row

// Bottom-sheet picker. options: [{ value, label, caption?, icon? }] (icon = MaterialCommunityIcons name).
// Optional search, and optional "use what I typed" entry
// so the user can type a value that is not in the list (e.g. a Masjid name).
export default function SelectSheet({
  visible,
  title,
  options,
  value,
  onSelect,
  onClose,
  searchable = false,
  allowManual = false,
  manualHint = 'Not in the list? Type the name above.',
}) {
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState('');

  const trimmed = query.trim();
  const filtered = useMemo(() => {
    if (!trimmed) return options;
    const q = trimmed.toLowerCase();
    return options.filter(
      (o) => o.label.toLowerCase().includes(q) || o.caption?.toLowerCase().includes(q)
    );
  }, [options, trimmed]);

  const exactMatch = options.some((o) => o.label.toLowerCase() === trimmed.toLowerCase());
  const showManual = allowManual && trimmed.length > 0 && !exactMatch;

  const close = () => {
    setQuery('');
    onClose();
  };
  const select = (next) => {
    setQuery('');
    onSelect(next);
  };

  const renderItem = ({ item }) => {
    const selected = item.value === value;
    return (
      <Pressable
        onPress={() => select(item.value)}
        style={({ pressed }) => [styles.row, selected && styles.rowSelected, pressed && { opacity: 0.75 }]}
      >
        {item.icon ? <IconBadge name={item.icon} size={44} tone="dark" /> : null}
        <View style={styles.rowTexts}>
          <AppText variant="subheading" color={selected ? colors.primary : colors.text}>
            {item.label}
          </AppText>
          {item.caption ? <AppText variant="caption">{item.caption}</AppText> : null}
        </View>
        {selected ? (
          <Ionicons name="checkmark-circle" size={22} color={colors.primary} />
        ) : item.icon ? (
          <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
        ) : null}
      </Pressable>
    );
  };

  return (
    <BottomSheetModal
      visible={visible}
      onClose={close}
      sheetStyle={[styles.sheet, { paddingBottom: Math.max(insets.bottom, 16) }]}
    >
      <View style={styles.handle} />
      <View style={styles.header}>
        <AppText variant="title">{title}</AppText>
        <Pressable onPress={close} hitSlop={10}>
          <Ionicons name="close" size={24} color={colors.textMuted} />
        </Pressable>
      </View>

      {searchable ? (
        <View style={styles.search}>
          <Ionicons name="search" size={18} color={colors.textMuted} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search (Talash karein)"
            placeholderTextColor={colors.textMuted}
            cursorColor={colors.primary}
            style={styles.searchInput}
            autoCorrect={false}
          />
          {query ? (
            <Pressable onPress={() => setQuery('')} hitSlop={8}>
              <Ionicons name="close-circle" size={18} color={colors.textMuted} />
            </Pressable>
          ) : null}
        </View>
      ) : null}

      {showManual ? (
        <Pressable
          onPress={() => select(trimmed)}
          style={({ pressed }) => [styles.manual, pressed && { opacity: 0.8 }]}
        >
          <Ionicons name="add-circle" size={22} color={colors.goldDark} />
          <View style={styles.rowTexts}>
            <AppText variant="subheading">Use “{trimmed}”</AppText>
            <AppText variant="caption">Enter manually (Khud likhein)</AppText>
          </View>
        </Pressable>
      ) : null}

      <FlatList
        data={filtered}
        keyExtractor={(item) => String(item.value)}
        renderItem={renderItem}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        style={styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <AppText variant="caption">{allowManual ? manualHint : 'No results found'}</AppText>
          </View>
        }
      />
    </BottomSheetModal>
  );
}

const styles = StyleSheet.create({
  sheet: {
    maxHeight: '78%',
    backgroundColor: colors.background,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    paddingHorizontal: SHEET_PADDING,
    paddingTop: 10,
  },
  handle: {
    alignSelf: 'center',
    width: 44,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
    marginBottom: 14,
  },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 },
  search: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    height: 48,
    paddingHorizontal: 14,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    marginBottom: 10,
  },
  searchInput: { flex: 1, fontFamily: fonts.bodyMedium, fontSize: 14, color: colors.text, paddingVertical: 0 },
  manual: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    marginBottom: 6,
    borderRadius: radius.md,
    backgroundColor: colors.goldSoft,
    borderWidth: 1,
    borderColor: colors.goldLight,
  },
  // The list is wider than the sheet's padding by exactly the row padding, so the row
  // content (icon / text / arrow) lines up with the title and the close button above it.
  list: { flexGrow: 0, marginHorizontal: -ROW_PADDING },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: ROW_PADDING,
    borderRadius: radius.md,
  },
  rowSelected: { backgroundColor: colors.primaryLight },
  rowTexts: { flex: 1, gap: 2 },
  empty: { paddingVertical: 28, alignItems: 'center' },
});
