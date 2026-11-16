import { useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useHeaderHeight } from '@react-navigation/elements';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useCities } from '@/components/hooks/useCities';
import { useServices } from '@/components/hooks/useServices';
import SuccessModal from '@/components/Modals/SuccessModal';
import AppButton from '@/components/ui/AppButton';
import AppText from '@/components/ui/AppText';
import Badge from '@/components/ui/Badge';
import Chip from '@/components/ui/Chip';
import DateField from '@/components/ui/DateField';
import FormField from '@/components/ui/FormField';
import FormSection from '@/components/ui/FormSection';
import IconBadge from '@/components/ui/IconBadge';
import IslamicPattern from '@/components/ui/IslamicPattern';
import KeyboardAwareView from '@/components/ui/KeyboardAwareView';
import Price from '@/components/ui/Price';
import SelectField from '@/components/ui/SelectField';
import Stepper from '@/components/ui/Stepper';
import TextField from '@/components/ui/TextField';
import { colors } from '@/constants/colors';
import { radius } from '@/constants/layout';
import { MAX_PEOPLE, MIN_PEOPLE } from '@/constants/options';
import { createBooking } from '@/services/bookingService';
import { getMasjids } from '@/services/masjidService';
import { toDateOnly } from '@/utils/formatters';
import { calcTotal } from '@/utils/pricing';
import { validateBooking } from '@/validations/booking';

function tomorrow() {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  d.setHours(0, 0, 0, 0);
  return d;
}

// Loads the services (with the admin's latest prices) first, then shows the form.
export default function BookingForm() {
  const { params } = useRoute();
  const { services, getService, isLoading, isError, refetch } = useServices();
  const service = getService(params?.serviceId) ?? services[0];

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }
  if (isError || !service) {
    return (
      <View style={styles.center}>
        <AppText variant="body" color={colors.textMuted}>
          Could not load the service. Please try again.
        </AppText>
        <AppButton title="Retry" size="sm" variant="soft" onPress={refetch} />
      </View>
    );
  }
  return <BookingFormContent service={service} />;
}

function BookingFormContent({ service }) {
  const navigation = useNavigation();
  const headerHeight = useHeaderHeight();
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();

  const { options: cityOptions } = useCities();
  const isSelectMode = service.mode === 'select';

  const [values, setValues] = useState({
    name: '',
    mobile: '',
    city: '',
    masjid: '',
    date: tomorrow(),
    selected: [], // chosen namaz / occasions (select-mode services)
    people: MIN_PEOPLE, // persons (Khadim / Cleaning Worker)
    notes: '',
  });
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [createdBooking, setCreatedBooking] = useState(null);

  const { data: masjids = [] } = useQuery({
    queryKey: ['masjids', values.city],
    queryFn: () => getMasjids(values.city),
  });

  const mutation = useMutation({
    mutationFn: createBooking,
    onSuccess: (booking) => {
      queryClient.invalidateQueries({ queryKey: ['my-bookings'] });
      setCreatedBooking(booking);
    },
  });

  const { count, total } = calcTotal(service, values.selected, values.people);

  const update = (patch) => {
    setValues((prev) => ({ ...prev, ...patch }));
    setErrors((prev) => {
      const next = { ...prev };
      Object.keys(patch).forEach((key) => delete next[key]);
      return next;
    });
  };

  const toggleItem = (item) =>
    update({
      selected: values.selected.includes(item)
        ? values.selected.filter((i) => i !== item)
        : [...values.selected, item],
    });

  const onSubmit = () => {
    const found = validateBooking(values, service);
    setErrors(found);
    setSubmitted(true);
    if (Object.keys(found).length > 0) return;

    mutation.mutate({
      serviceId: service.id,
      selected: values.selected,
      people: service.perPerson ? values.people : undefined,
      name: values.name.trim(),
      mobile: `+91${values.mobile.trim()}`,
      city: values.city,
      masjid: values.masjid.trim(),
      date: toDateOnly(values.date), // the database works out the price itself
      notes: values.notes.trim(),
    });
  };

  const goToTab = (screen) => {
    setCreatedBooking(null);
    navigation.navigate('MainTabs', { screen });
  };

  const hasErrors = submitted && Object.keys(errors).length > 0;

  let totalCaption = 'Rate will be confirmed';
  if (total != null) {
    const rate = `₹${service.price.toLocaleString('en-US')}`;
    if (isSelectMode) {
      totalCaption = count === 0 ? 'Select Namaz / Occasion above' : `${count} × ${rate}`;
    } else {
      totalCaption = `${count} ${count === 1 ? 'person' : 'persons'} × ${rate}`;
    }
  }

  return (
    <View style={styles.container}>
      <KeyboardAwareView keyboardVerticalOffset={headerHeight} style={styles.flex}>
        <ScrollView
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scroll}
        >
          {/* Selected service + its rate */}
          <LinearGradient
            colors={[colors.primaryDeep, colors.primary]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.service}
          >
            <IslamicPattern />
            <View style={styles.serviceTop}>
              <IconBadge name={service.icon} size={58} />
              <View style={styles.serviceTexts}>
                <AppText variant="overline" color={colors.goldLight}>
                  Selected service
                </AppText>
                <AppText variant="title" color={colors.textOnPrimary}>
                  {service.title}
                </AppText>
                <AppText variant="caption" color={colors.textOnPrimaryMuted}>
                  {service.titleUr}
                </AppText>
              </View>
            </View>
            <View style={styles.rateRow}>
              <View style={styles.rateTexts}>
                <AppText variant="overline" color={colors.goldLight}>
                  Rate
                </AppText>
                <AppText variant="caption" color={colors.textOnPrimaryMuted}>
                  {service.limit}
                </AppText>
              </View>
              {service.price == null ? (
                <AppText variant="heading" color={colors.goldLight}>
                  Rate on request
                </AppText>
              ) : (
                <View style={styles.rateValue}>
                  <Price amount={service.price} size={30} color={colors.goldLight} />
                  <AppText variant="caption" color={colors.textOnPrimaryMuted}>
                    {service.unit}
                  </AppText>
                </View>
              )}
            </View>
          </LinearGradient>

          <FormSection icon="person" title="Your Details" titleUr="Aap ki maloomat">
            <FormField label="Name" labelUr="Naam" error={errors.name}>
              <TextField
                icon="person-outline"
                placeholder="Enter your full name"
                value={values.name}
                onChangeText={(name) => update({ name })}
                hasError={Boolean(errors.name)}
                autoCapitalize="words"
              />
            </FormField>
            <FormField label="Mobile Number (+91)" error={errors.mobile}>
              <TextField
                icon="call-outline"
                placeholder="+91 98XXXXXXXX"
                value={values.mobile}
                onChangeText={(mobile) => update({ mobile: mobile.replace(/\D/g, '').slice(0, 10) })}
                hasError={Boolean(errors.mobile)}
                keyboardType="number-pad"
                maxLength={10}
              />
            </FormField>
          </FormSection>

          <FormSection icon="business" title="Masjid & Date" titleUr="Masjid aur tareekh">
            <SelectField
              label="City"
              labelUr="Shehar"
              icon="location-outline"
              placeholder="Select city"
              value={values.city}
              options={cityOptions}
              error={errors.city}
              searchable
              onChange={(city) => update({ city, masjid: '' })}
            />
            {/* Appears only after a city is chosen. Pick from the list or type your own. */}
            {values.city ? (
              <SelectField
                label="Masjid Name"
                labelUr="Masjid ka naam"
                icon="business-outline"
                placeholder="Select or type Masjid name"
                sheetTitle="Select Masjid"
                value={values.masjid}
                options={masjids}
                error={errors.masjid}
                searchable
                allowManual
                manualHint={
                  masjids.length > 0
                    ? 'Masjid list mein nahi? Naam type karke khud add karein.'
                    : 'Is shehar ki list abhi nahi hai. Masjid ka naam type karke add karein.'
                }
                onChange={(masjid) => update({ masjid })}
              />
            ) : null}
            <DateField
              label="Booking Date"
              labelUr="Kis tareekh ko chahiye"
              value={values.date}
              onChange={(date) => update({ date })}
            />
          </FormSection>

          {isSelectMode ? (
            <FormSection
              icon="time"
              title={service.selectTitle}
              titleUr={`${service.selectTitleUr} · ek se zyada chun sakte hain`}
            >
              {service.groups.map((group) => (
                <FormField
                  key={group.title}
                  label={group.title}
                  labelUr={group.titleUr}
                  error={group === service.groups[service.groups.length - 1] ? errors.selected : undefined}
                >
                  <View style={styles.chips}>
                    {group.items.map((item) => {
                      const selected = values.selected.includes(item);
                      return (
                        <Chip
                          key={item}
                          label={item}
                          icon={selected ? 'checkmark-circle' : undefined}
                          selected={selected}
                          onPress={() => toggleItem(item)}
                        />
                      );
                    })}
                  </View>
                </FormField>
              ))}
            </FormSection>
          ) : (
            <FormSection icon="checkmark-done" title={service.dutiesTitle} titleUr={service.dutiesTitleUr}>
              <View style={styles.duties}>
                {service.duties.map((duty) => (
                  <View key={duty} style={styles.duty}>
                    <Ionicons name="checkmark-circle" size={20} color={colors.primary} />
                    <AppText variant="subheading" style={styles.dutyText}>
                      {duty}
                    </AppText>
                  </View>
                ))}
              </View>
              <Badge label={`${service.limit} · all included`} icon="time" tone="gold" />
              {service.perPerson ? (
                <FormField label="Number of Persons" labelUr="Kitne afraad chahiye">
                  <Stepper
                    value={values.people}
                    min={MIN_PEOPLE}
                    max={MAX_PEOPLE}
                    onChange={(people) => update({ people })}
                  />
                </FormField>
              ) : null}
            </FormSection>
          )}

          <FormSection icon="wallet" title="Payment & Notes" titleUr="Adaigi aur mazeed maloomat">
            <FormField label="Payment Method" labelUr="Adaigi">
              <View style={styles.payment}>
                <View style={styles.paymentIcon}>
                  <Ionicons name="cash" size={20} color={colors.primary} />
                </View>
                <View style={styles.paymentTexts}>
                  <AppText variant="subheading">Cash Only (Sirf Naqd)</AppText>
                  <AppText variant="caption">Pay directly at the time of service</AppText>
                </View>
                <Ionicons name="checkmark-circle" size={24} color={colors.primary} />
              </View>
            </FormField>
            <FormField label="Additional Notes" labelUr="Mazeed maloomat">
              <TextField
                icon="create-outline"
                placeholder="Anything we should know? (Optional)"
                value={values.notes}
                onChangeText={(notes) => update({ notes })}
                multiline
              />
            </FormField>
          </FormSection>
        </ScrollView>

        {/* Price + submit */}
        <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 14) }]}>
          <View style={styles.totalRow}>
            <View style={styles.totalTexts}>
              <AppText variant="overline">Total</AppText>
              <AppText variant="caption">{totalCaption}</AppText>
            </View>
            {total == null ? (
              <AppText variant="heading" color={colors.primary}>
                Rate on request
              </AppText>
            ) : (
              <Price amount={total} size={34} />
            )}
          </View>
          {hasErrors ? (
            <AppText variant="caption" color={colors.danger} style={styles.footerError}>
              Please complete the highlighted fields (Zaroori maloomat poori karein).
            </AppText>
          ) : null}
          <AppButton
            title="Submit Booking"
            size="lg"
            iconRight="arrow-forward"
            loading={mutation.isPending}
            onPress={onSubmit}
          />
          {mutation.isError ? (
            <AppText variant="caption" color={colors.danger} style={styles.footerError}>
              Something went wrong. Please try again.
            </AppText>
          ) : null}
        </View>
      </KeyboardAwareView>

      <SuccessModal
        visible={Boolean(createdBooking)}
        bookingId={createdBooking?.code}
        onPrimary={() => goToTab('MyBookings')}
        onSecondary={() => goToTab('Home')}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, backgroundColor: colors.background },
  flex: { flex: 1 },
  scroll: { padding: 16, gap: 16, paddingBottom: 24 },
  service: {
    gap: 14,
    padding: 18,
    borderRadius: radius.lg,
    overflow: 'hidden',
  },
  serviceTop: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  serviceTexts: { flex: 1, gap: 2 },
  rateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(233,215,166,0.25)',
  },
  rateTexts: { flex: 1 },
  rateValue: { alignItems: 'flex-end' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  duties: { gap: 12 },
  duty: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  dutyText: { flex: 1 },
  payment: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: radius.md,
    backgroundColor: colors.primarySoft,
    borderWidth: 1.5,
    borderColor: colors.primary,
  },
  paymentIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primaryLight,
  },
  paymentTexts: { flex: 1 },
  footer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    gap: 10,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
  },
  totalRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  totalTexts: { flex: 1 },
  footerError: { textAlign: 'center' },
});
