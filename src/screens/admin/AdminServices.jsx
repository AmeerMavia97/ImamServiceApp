import { useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { useServices } from '@/components/hooks/useServices';
import ServiceEditSheet from '@/components/Modals/ServiceEditSheet';
import AppButton from '@/components/ui/AppButton';
import AppText from '@/components/ui/AppText';
import IconBadge from '@/components/ui/IconBadge';
import Price from '@/components/ui/Price';
import { colors } from '@/constants/colors';
import { radius, shadows } from '@/constants/layout';
import { updateService } from '@/services/serviceService';

// Admin: the 4 services with their price; tap Edit to change price and text.
export default function AdminServices() {
  const queryClient = useQueryClient();
  const { services, isLoading, isError, refetch } = useServices();
  const [editing, setEditing] = useState(null); // service being edited (kept while the sheet closes)
  const [open, setOpen] = useState(false);

  const mutation = useMutation({
    mutationFn: ({ id, patch }) => updateService(id, patch),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
      setOpen(false);
    },
  });

  if (isLoading) return <ActivityIndicator color={colors.primary} style={styles.loader} />;
  if (isError) {
    return (
      <View style={styles.errorBox}>
        <AppText variant="body" color={colors.textMuted}>
          Could not load services.
        </AppText>
        <AppButton title="Retry" size="sm" variant="soft" onPress={refetch} />
      </View>
    );
  }

  return (
    <View style={styles.list}>
      {services.map((service) => (
        <View key={service.id} style={styles.shadow}>
          <View style={styles.card}>
            <View style={styles.top}>
              <IconBadge name={service.icon} size={50} tone="dark" />
              <View style={styles.texts}>
                <AppText variant="title" style={styles.title}>
                  {service.title}
                </AppText>
                <AppText variant="caption">{service.limit}</AppText>
              </View>
            </View>

            <AppText variant="caption" numberOfLines={2}>
              {service.description}
            </AppText>

            <View style={styles.footer}>
              <View>
                {service.price == null ? (
                  <AppText variant="heading" color={colors.primary}>
                    Rate on request
                  </AppText>
                ) : (
                  <Price amount={service.price} size={28} />
                )}
                <AppText variant="caption">{service.unit}</AppText>
              </View>
              <AppButton
                title="Edit"
                icon="create-outline"
                size="sm"
                variant="soft"
                onPress={() => {
                  setEditing(service);
                  setOpen(true);
                }}
              />
            </View>
          </View>
        </View>
      ))}

      {editing ? (
        <ServiceEditSheet
          key={editing.id}
          service={editing}
          visible={open}
          saving={mutation.isPending}
          onClose={() => setOpen(false)}
          onSave={(patch) => mutation.mutate({ id: editing.id, patch })}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  list: { gap: 14 },
  loader: { paddingVertical: 40 },
  errorBox: { alignItems: 'center', gap: 10, paddingVertical: 30 },
  shadow: { borderRadius: radius.lg, backgroundColor: colors.surface, ...shadows.card },
  card: {
    padding: 16,
    gap: 12,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.divider,
  },
  top: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  texts: { flex: 1 },
  title: { fontSize: 22, lineHeight: 28 },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
  },
});
