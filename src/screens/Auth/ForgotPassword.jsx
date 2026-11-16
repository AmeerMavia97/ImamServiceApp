import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import { useMutation } from '@tanstack/react-query';

import AuthHeader from '@/components/Sections/AuthHeader';
import AppButton from '@/components/ui/AppButton';
import AppText from '@/components/ui/AppText';
import FormField from '@/components/ui/FormField';
import KeyboardAwareView from '@/components/ui/KeyboardAwareView';
import TextField from '@/components/ui/TextField';
import { colors } from '@/constants/colors';
import { radius } from '@/constants/layout';
import { sendPasswordReset } from '@/services/authService';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Works for every role (Imam, Masjid, Admin): Supabase emails a reset link.
export default function ForgotPassword() {
  const navigation = useNavigation();
  const focused = useIsFocused();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  const mutation = useMutation({ mutationFn: sendPasswordReset });

  const onSubmit = () => {
    if (!EMAIL_REGEX.test(email.trim())) {
      setError('Please enter a valid email address');
      return;
    }
    setError('');
    mutation.mutate(email);
  };

  return (
    <KeyboardAwareView style={styles.container}>
      {focused ? <StatusBar style="dark" /> : null}

      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.scroll}>
        <AuthHeader title="Forgot Password" subtitle="Enter your email and we will send you a reset link" />

        {mutation.isSuccess ? (
          <>
            <View style={styles.success}>
              <Ionicons name="checkmark-circle" size={20} color={colors.success} />
              <AppText variant="body" style={styles.successText}>
                If this email has an account, a password reset link has been sent. Please check your inbox.
              </AppText>
            </View>
            <AppButton title="BACK TO LOGIN" size="lg" onPress={() => navigation.goBack()} />
          </>
        ) : (
          <>
            <FormField label="Email" error={error || (mutation.isError ? mutation.error.message : '')}>
              <TextField
                variant="simple"
                placeholder="Enter your email"
                value={email}
                onChangeText={(value) => {
                  setEmail(value);
                  setError('');
                }}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                hasError={Boolean(error)}
              />
            </FormField>
            <AppButton title="SEND RESET LINK" size="lg" loading={mutation.isPending} onPress={onSubmit} />
          </>
        )}
      </ScrollView>
    </KeyboardAwareView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scroll: { paddingHorizontal: 20, gap: 20, paddingBottom: 40 },
  success: {
    flexDirection: 'row',
    gap: 10,
    padding: 12,
    borderRadius: radius.md,
    backgroundColor: colors.successSoft,
  },
  successText: { flex: 1 },
});
