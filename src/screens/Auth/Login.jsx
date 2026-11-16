import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { useDashboardNavigation } from '@/components/hooks/useDashboardNavigation';
import AuthHeader from '@/components/Sections/AuthHeader';
import AppButton from '@/components/ui/AppButton';
import AppText from '@/components/ui/AppText';
import FormField from '@/components/ui/FormField';
import KeyboardAwareView from '@/components/ui/KeyboardAwareView';
import PasswordField from '@/components/ui/PasswordField';
import TextField from '@/components/ui/TextField';
import { colors } from '@/constants/colors';
import { fonts } from '@/constants/fonts';
import { radius } from '@/constants/layout';
import { login } from '@/services/authService';
import { useAuth } from '@/store/AuthContext';
import { saveUserRole } from '@/utils/storage';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// One Login page for Imam, Masjid and Admin. After login the role is read from the database
// and decides which dashboard opens.
export default function Login() {
  const navigation = useNavigation();
  const focused = useIsFocused();
  const queryClient = useQueryClient();
  const { role: currentRole, ready } = useAuth();
  const { resetToDashboard } = useDashboardNavigation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});

  const mutation = useMutation({
    mutationFn: ({ email: address, password: secret }) => login(address, secret),
    onSuccess: async (account) => {
      queryClient.setQueryData(['account', account.id], account);
      await saveUserRole('user'); // the role screen is done; next launch opens Home
      resetToDashboard(account.role);
    },
  });

  // Someone who is already logged in and lands here goes straight to their dashboard.
  useEffect(() => {
    if (ready && currentRole && mutation.isIdle) resetToDashboard(currentRole);
  }, [ready, currentRole, mutation.isIdle, resetToDashboard]);

  const onSubmit = () => {
    const found = {};
    if (!email.trim()) found.email = 'Please enter your email';
    else if (!EMAIL_REGEX.test(email.trim())) found.email = 'Enter a valid email address';
    if (!password) found.password = 'Please enter your password';
    setErrors(found);
    if (Object.keys(found).length > 0) return;
    mutation.mutate({ email, password });
  };

  return (
    <KeyboardAwareView style={styles.container}>
      {focused ? <StatusBar style="dark" /> : null}

      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.scroll}>
        <AuthHeader title="Login" subtitle="Welcome back! Login to continue" />

        <View style={styles.fields}>
          <FormField label="Email" error={errors.email}>
            <TextField
              variant="simple"
              placeholder="Enter your email"
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                setErrors((prev) => ({ ...prev, email: undefined }));
              }}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              hasError={Boolean(errors.email)}
            />
          </FormField>

          <FormField label="Password" error={errors.password}>
            <PasswordField
              placeholder="Enter your password"
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                setErrors((prev) => ({ ...prev, password: undefined }));
              }}
              hasError={Boolean(errors.password)}
            />
          </FormField>

          <Pressable onPress={() => navigation.navigate('ForgotPassword')} hitSlop={8} style={styles.forgot}>
            <AppText variant="label" color={colors.primary}>
              Forgot password?
            </AppText>
          </Pressable>
        </View>

        {mutation.isError ? (
          <View style={styles.error}>
            <Ionicons name="alert-circle" size={16} color={colors.danger} />
            <AppText variant="caption" color={colors.danger} style={styles.messageText}>
              {mutation.error.message}
            </AppText>
          </View>
        ) : null}

        <AppButton title="LOGIN" size="lg" loading={mutation.isPending} onPress={onSubmit} />

        <Text style={styles.footer}>
          Don&apos;t have an account?{' '}
          <Text style={styles.footerLink} onPress={() => navigation.replace('Register')}>
            Sign Up
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
  forgot: { alignSelf: 'flex-end' },
  error: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    padding: 10,
    borderRadius: radius.md,
    backgroundColor: colors.dangerSoft,
  },
  messageText: { flex: 1 },
  footer: { marginTop: 8, textAlign: 'center', fontFamily: fonts.body, fontSize: 13, color: colors.textMuted },
  footerLink: { fontFamily: fonts.bodyBold, color: colors.goldDark },
});
