import { ActivityIndicator, ScrollView, StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';

import ServiceCard from '@/components/Cards/ServiceCard';
import { useServices } from '@/components/hooks/useServices';
import AppButton from '@/components/ui/AppButton';
import AppText from '@/components/ui/AppText';
import ScreenHeader from '@/components/ui/ScreenHeader';
import { colors } from '@/constants/colors';
import { TAB_BAR_CLEARANCE } from '@/constants/layout';

export default function Services() {
  const navigation = useNavigation();
  const { services, isLoading, isError, refetch } = useServices();

  return (
    <View style={styles.container}>
      <ScreenHeader title="Book a Service" subtitle="Waqti khidmat ke liye booking karein" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {isLoading ? (
          <ActivityIndicator color={colors.primary} style={styles.loader} />
        ) : isError ? (
          <View style={styles.state}>
            <AppText variant="body" color={colors.textMuted}>
              Could not load services. Please try again.
            </AppText>
            <AppButton title="Retry" size="sm" variant="soft" onPress={refetch} />
          </View>
        ) : (
          services.map((service) => (
            <ServiceCard
              key={service.id}
              service={service}
              onBook={(item) => navigation.navigate('BookingForm', { serviceId: item.id })}
            />
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scroll: { padding: 16, gap: 14, paddingBottom: TAB_BAR_CLEARANCE },
  loader: { paddingVertical: 40 },
  state: { alignItems: 'center', gap: 10, paddingVertical: 30 },
});
