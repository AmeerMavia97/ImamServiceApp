import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import AppText from '@/components/ui/AppText';
import Avatar from '@/components/ui/Avatar';
import Badge from '@/components/ui/Badge';
import IslamicPattern from '@/components/ui/IslamicPattern';
import Price from '@/components/ui/Price';
import { colors } from '@/constants/colors';
import { radius, shadows } from '@/constants/layout';
import { ROLES } from '@/constants/roles';
import { formatTime } from '@/utils/formatters';

function InfoChip({ icon, text }) {
  return (
    <View style={styles.chip}>
      <Ionicons name={icon} size={13} color={colors.primary} />
      <AppText variant="caption" color={colors.text} numberOfLines={1} style={styles.chipText}>
        {text}
      </AppText>
    </View>
  );
}

// One registered Imam or Masjid on Home.
//  Imam:   photo, name, city / area, languages, what he does (experience) and his fees per day.
//  Masjid: photo, name, contact person, address and the opening - closing time.
export default function DirectoryCard({ entry }) {
  const isImam = entry.role === ROLES.IMAM;
  const title = isImam ? entry.name : entry.masjidName;
  const place = [entry.address, entry.city].filter(Boolean).join(', ');
  const hasFee = isImam && entry.fee != null;
  const timing =
    entry.openingTime && entry.closingTime ? `${formatTime(entry.openingTime)} - ${formatTime(entry.closingTime)}` : '';

  return (
    // Outer view carries the shadow, inner view clips the fee strip to the rounded corners.
    <View style={styles.shadow}>
      <View style={styles.card}>
        <View style={styles.body}>
        <View style={styles.top}>
          <View>
            <Avatar uri={entry.photoUrl} name={title} size={72} />
            <View style={styles.seal}>
              <Ionicons name="checkmark" size={12} color={colors.goldLight} />
            </View>
          </View>

          <View style={styles.info}>
            <AppText variant="title" numberOfLines={2} style={styles.name}>
              {title}
            </AppText>
            {isImam ? null : (
              <AppText variant="caption" numberOfLines={1}>
                Contact: {entry.name}
              </AppText>
            )}
            <View style={styles.badges}>
              <Badge label={isImam ? 'Imam' : 'Masjid'} icon={isImam ? 'ribbon' : 'business'} tone="gold" />
            </View>
          </View>
        </View>

        <View style={styles.chips}>
          <InfoChip icon="location" text={place} />
          {isImam && entry.languages.length > 0 ? <InfoChip icon="language" text={entry.languages.join(', ')} /> : null}
          {!isImam && timing ? <InfoChip icon="time" text={timing} /> : null}
        </View>

        {isImam && entry.experience.length > 0 ? (
          <View style={styles.block}>
            <AppText variant="overline">Available for</AppText>
            <View style={styles.badges}>
              {entry.experience.map((item) => (
                <Badge key={item} label={item} icon="checkmark-circle" tone="green" />
              ))}
            </View>
          </View>
        ) : null}
        </View>

        {hasFee ? (
          <LinearGradient
            colors={[colors.primaryDeep, colors.primary]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.fee}
          >
            <IslamicPattern opacity={0.12} />
            <View>
              <AppText variant="overline" color={colors.goldLight}>
                Fees
              </AppText>
              <AppText variant="caption" color={colors.textOnPrimaryMuted}>
                Per day · Cash on service
              </AppText>
            </View>
            <Price amount={entry.fee} size={36} color={colors.goldLight} />
          </LinearGradient>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  shadow: { borderRadius: radius.lg, backgroundColor: colors.surface, ...shadows.card },
  card: {
    borderRadius: radius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.divider,
    backgroundColor: colors.surface,
  },
  body: { padding: 16, gap: 14 },
  top: { flexDirection: 'row', gap: 14, alignItems: 'center' },
  seal: {
    position: 'absolute',
    right: 2,
    bottom: 2,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    borderWidth: 2,
    borderColor: colors.surface,
  },
  info: { flex: 1, gap: 6 },
  name: { fontSize: 22, lineHeight: 28 },
  badges: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: radius.pill,
    backgroundColor: colors.primarySoft,
  },
  chipText: { flexShrink: 1 },
  block: { gap: 8 },
  fee: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    overflow: 'hidden',
  },
});
