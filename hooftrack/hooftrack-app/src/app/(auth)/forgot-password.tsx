import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
} from 'react-native';
import { useRouter } from 'expo-router';
import { getSupabase, getSupabaseInitError } from '@config/supabase';
import { Button } from '@shared/components/Button';
import { Input } from '@shared/components/Input';
import { COLORS, SPACING, TYPOGRAPHY } from '@shared/constants/theme';
import { validateEmail } from '@shared/utils/helpers';
import { log } from '@shared/utils/logging';

export default function ForgotPasswordScreen() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function handleSendReset() {
    setError(null);
    setMessage(null);

    const emailCheck = validateEmail(email);
    if (!emailCheck.isValid) {
      setError(emailCheck.error ?? 'Invalid email.');
      return;
    }

    const initError = getSupabaseInitError();
    if (initError) {
      setError(initError);
      return;
    }

    setIsSubmitting(true);
    try {
      const supabase = getSupabase();
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim());
      if (resetError) {
        setError(resetError.message);
      } else {
        setMessage('If that email exists, a reset link has been sent.');
      }
    } catch (err) {
      log.error('AUTH', 'reset_password_failed', err);
      setError('Could not send reset link. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Reset Password</Text>
        <Text style={styles.subtitle}>
          Enter your email and we&apos;ll send you a reset link.
        </Text>

        <Input
          label="Email"
          value={email}
          onChangeText={setEmail}
          placeholder="you@example.com"
          keyboardType="email-address"
        />

        {error ? <Text style={styles.error}>{error}</Text> : null}
        {message ? <Text style={styles.success}>{message}</Text> : null}

        <Button title="Send Reset Link" onPress={handleSendReset} isLoading={isSubmitting} />

        <Text style={styles.link} onPress={() => router.back()}>
          Back to sign in
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: COLORS.BACKGROUND },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: SPACING.XL,
  },
  title: {
    fontSize: TYPOGRAPHY.HEADING_1,
    fontWeight: TYPOGRAPHY.WEIGHT_BOLD,
    color: COLORS.TEXT_PRIMARY,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: TYPOGRAPHY.BODY,
    color: COLORS.TEXT_SECONDARY,
    textAlign: 'center',
    marginTop: SPACING.XS,
    marginBottom: SPACING.XXL,
  },
  error: {
    color: COLORS.DANGER,
    fontSize: TYPOGRAPHY.BODY_SMALL,
    marginBottom: SPACING.MD,
    textAlign: 'center',
  },
  success: {
    color: COLORS.SUCCESS,
    fontSize: TYPOGRAPHY.BODY_SMALL,
    marginBottom: SPACING.MD,
    textAlign: 'center',
  },
  link: {
    color: COLORS.ACCENT,
    fontSize: TYPOGRAPHY.BODY_SMALL,
    textAlign: 'center',
    marginTop: SPACING.XL,
  },
});
