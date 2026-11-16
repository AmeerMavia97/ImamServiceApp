import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useIsFocused, useNavigation, useRoute } from '@react-navigation/native';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { useCities } from '@/components/hooks/useCities';
import { useDashboardNavigation } from '@/components/hooks/useDashboardNavigation';
import AuthHeader from '@/components/Sections/AuthHeader';
import AppButton from '@/components/ui/AppButton';
import Chip from '@/components/ui/Chip';
import AppText from '@/components/ui/AppText';
import FormField from '@/components/ui/FormField';
import KeyboardAwareView from '@/components/ui/KeyboardAwareView';
import PasswordField from '@/components/ui/PasswordField';
import PhotoPicker from '@/components/ui/PhotoPicker';
import RoleTabs from '@/components/ui/RoleTabs';
import SelectField from '@/components/ui/SelectField';
import TimeField from '@/components/ui/TimeField';
import TextField from '@/components/ui/TextField';
import { colors } from '@/constants/colors';
import { fonts } from '@/constants/fonts';
import { radius } from '@/constants/layout';
import { getRegisterFields } from '@/constants/registerFields';
import { REGISTER_ROLE_OPTIONS, ROLES } from '@/constants/roles';
import { signUp } from '@/services/authService';
import { saveUserRole } from '@/utils/storage';
import { validateRegistration } from '@/validations/registration';

const FIELD_PROPS = {
  text: { autoCapitalize: 'words' },
  phone: { keyboardType: 'number-pad', maxLength: 10, prefix: '+91' },
  email: { keyboardType: 'email-address', autoCapitalize: 'none', autoCorrect: false },
  number: { keyboardType: 'number-pad', maxLength: 6, prefix: '₹' },
};

// One Sign Up page for Imam and Masjid. The boxes at the top switch the form;
// the common fields (name, mobile, email, city, password) keep what was typed.
export default function Register() {
  const navigation = useNavigation();
  const route = useRoute();
  const focused = useIsFocused();
  const queryClient = useQueryClient();
  const { options: cityOptions } = useCities();
  const { resetToDashboard } = useDashboardNavigation();

  const [role, setRole] = useState(route.params?.role ?? ROLES.IMAM);
  const [values, setValues] = useState({});
  const [errors, setErrors] = useState({});
  const [photo, setPhoto] = useState(null); // optional: { uri, base64, mimeType }

  const fields = useMemo(() => getRegisterFields(role, cityOptions), [role, cityOptions]);

  const mutation = useMutation({
    mutationFn: signUp,
    onSuccess: async (result) => {
      if (result.needsConfirmation) return; // the screen shows the "check your email" message
      queryClient.setQueryData(['account', result.account.id], result.account);
      await saveUserRole('user'); // the role screen is done; next launch opens Home
      resetToDashboard(result.account.role);
    },
  });

  const update = (key, value) => {
    setValues((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const changeRole = (next) => {
    setRole(next);
    setErrors({});
    mutation.reset();
  };

  const onSubmit = () => {
    const found = validateRegistration(fields, values);
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    mutation.mutate({
      role,
      name: values.name,
      mobile: values.mobile,
      email: values.email,
      city: values.city,
      area: values.area ?? '',
      address: values.address ?? '',
      masjidName: values.masjid ?? '',
      experience: values.experience ?? [],
      languages: values.languages ?? [],
      fee: values.fee ?? '',
      openingTime: values.openingTime ?? '',
      closingTime: values.closingTime ?? '',
      password: values.password,
      photo: photo ?? undefined,
    });
  };

  // Fields that share a `group` (opening + closing time) are drawn side by side in one row.
  const renderFields = () =>
    fields.reduce((items, field, index) => {
      if (field.group && fields[index - 1]?.group === field.group) return items; // drawn with the previous one
      if (!field.group) return [...items, renderField(field)];
      const members = fields.filter((f) => f.group === field.group);
      return [...items, <View key={field.group} style={styles.row}>{members.map(renderField)}</View>];
    }, []);

  const renderField = (field) => {
    if (field.kind === 'select') {
      return (
        <SelectField
          key={field.key}
          variant="simple"
          label={field.label}
          placeholder={field.placeholder}
          sheetTitle={field.placeholder}
          options={field.options ?? []}
          value={values[field.key] ?? ''}
          onChange={(value) => update(field.key, value)}
          error={errors[field.key]}
        />
      );
    }

    // Opening / closing time
    if (field.kind === 'time') {
      return (
        <TimeField
          key={field.key}
          style={styles.half}
          label={field.label}
          placeholder={field.placeholder}
          value={values[field.key] ?? ''}
          onChange={(value) => update(field.key, value)}
          error={errors[field.key]}
        />
      );
    }

    // Pick one or more options (e.g. the languages an Imam speaks)
    if (field.kind === 'multi') {
      const picked = values[field.key] ?? [];
      const toggle = (option) =>
        update(field.key, picked.includes(option) ? picked.filter((item) => item !== option) : [...picked, option]);
      return (
        <FormField key={field.key} label={field.label} error={errors[field.key]}>
          <View style={styles.chips}>
            {field.options.map((option) => (
              <Chip key={option} label={option} selected={picked.includes(option)} onPress={() => toggle(option)} />
            ))}
          </View>
        </FormField>
      );
    }

    const Input = field.kind === 'password' ? PasswordField : TextField;
    return (
      <FormField key={field.key} label={field.label} error={errors[field.key]}>
        <Input
          variant="simple"
          placeholder={field.placeholder}
          value={values[field.key] ?? ''}
          onChangeText={(text) =>
            update(field.key, field.kind === 'phone' || field.kind === 'number' ? text.replace(/\D/g, '') : text)
          }
          hasError={Boolean(errors[field.key])}
          {...FIELD_PROPS[field.kind]}
        />
      </FormField>
    );
  };

  return (
    <KeyboardAwareView style={styles.container}>
      {focused ? <StatusBar style="dark" /> : null}

      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.scroll}>
        <AuthHeader title="Sign Up" subtitle="Create your account and enjoy all services" />

        <RoleTabs options={REGISTER_ROLE_OPTIONS} value={role} onChange={changeRole} />

        <PhotoPicker
          uri={photo?.uri ?? ''}
          onChange={setPhoto}
          title={role === ROLES.MASJID ? 'Add Masjid photo' : 'Add your photo'}
        />

        <View style={styles.fields}>{renderFields()}</View>

        {mutation.isError ? (
          <View style={[styles.message, styles.error]}>
            <Ionicons name="alert-circle" size={16} color={colors.danger} />
            <AppText variant="caption" color={colors.danger} style={styles.messageText}>
              {mutation.error.message}
            </AppText>
          </View>
        ) : null}

        {mutation.data?.needsConfirmation ? (
          <View style={[styles.message, styles.success]}>
            <Ionicons name="checkmark-circle" size={18} color={colors.success} />
            <AppText variant="caption" color={colors.success} style={styles.messageText}>
              Account created! Please open the confirmation email we sent you, then login.
            </AppText>
          </View>
        ) : null}

        <AppButton title="SIGN UP" size="lg" loading={mutation.isPending} onPress={onSubmit} />

        <Text style={styles.footer}>
          Already have an account?{' '}
          <Text style={styles.footerLink} onPress={() => navigation.replace('Login')}>
            Sign In
          </Text>
        </Text>
      </ScrollView>
    </KeyboardAwareView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scroll: { paddingHorizontal: 20, gap: 20, paddingBottom: 40 },
  fields: { gap: 12 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  row: { flexDirection: 'row', gap: 10 },
  half: { flex: 1 },
  message: { flexDirection: 'row', alignItems: 'center', gap: 6, padding: 10, borderRadius: radius.md },
  error: { backgroundColor: colors.dangerSoft },
  success: { backgroundColor: colors.successSoft },
  messageText: { flex: 1 },
  footer: { marginTop: 8, textAlign: 'center', fontFamily: fonts.body, fontSize: 13, color: colors.textMuted },
  footerLink: { fontFamily: fonts.bodyBold, color: colors.goldDark },
});
