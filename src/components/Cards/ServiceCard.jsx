import { StyleSheet, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import AppButton from '@/components/ui/AppButton';
import AppText from '@/components/ui/AppText';
import Badge from '@/components/ui/Badge';
import IconBadge from '@/components/ui/IconBadge';
import Price from '@/components/ui/Price';
import { colors } from '@/constants/colors';
import { radius, shadows } from '@/constants/layout';

export default function ServiceCard({ service, onBook }) {
  return (
    <View style={styles.shadow}>
      <View style={styles.card}>
        <MaterialCommunityIcons name={service.icon} size={120} color={colors.primaryLight} style={styles.watermark} />

        <View style={styles.top}>
          <IconBadge name={service.icon} size={64} tone="dark" />
          <View style={styles.texts}>
            <AppText variant="title" style={styles.title}>
              {service.title}
            </AppText>
            <AppText variant="overline">{service.titleUr}</AppText>
            <AppText variant="caption" style={styles.description}>
              {service.description}
            </AppText>
          </View>
        </View>

        <Badge label={service.limit} icon="time" tone="gold" />

        <View style={styles.footer}>
          <View>
            {service.price == null ? (
              <AppText variant="heading" color={colors.primary}>
                Rate on request
              </AppText>
            ) : (
              <Price amount={service.price} size={30} />
            )}
            <AppText variant="caption">{service.price == null ? 'Rate baad mein' : service.unit}</AppText>
          </View>
          <AppButton title="Book Now" size="sm" iconRight="arrow-forward" onPress={() => onBook(service)} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  shadow: { borderRadius: radius.lg, backgroundColor: colors.surface, ...shadows.card },
  card: {
    gap: 14,
    padding: 16,
    overflow: 'hidden',
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.divider,
  },
  watermark: { position: 'absolute', right: -18, top: -14, opacity: 0.7 },
  top: { flexDirection: 'row', gap: 14, alignItems: 'center' },
  texts: { flex: 1, gap: 2 },
  title: { fontSize: 23, lineHeight: 30 },
  description: { marginTop: 4 },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
  },
});
