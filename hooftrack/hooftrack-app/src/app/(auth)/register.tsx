import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@features/auth/AuthProvider';
import { Button } from '@shared/components/Button';
import { Input } from '@shared/components/Input';
import { COLORS, SPACING, TYPOGRAPHY } from '@shared/constants/theme';
import { validateEmail, validateRequired } from '@shared/utils/helpers';

export default function RegisterScreen() {
  const router = useRouter();
  const { signUp } = useAuth();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function validate(): string | null {
    const nameCheck = validateRequired(fullName, 'Full name');
    if (!nameCheck.isValid) return nameCheck.error ?? 'Invalid name.';

    const emailCheck = validateEmail(email);
    if (!emailCheck.isValid) return emailCheck.error ?? 'Invalid email.';

    if (password.length < 6) return 'Password must be at least 6 characters.';
    if (password !== confirmPassword) return 'Passwords do not match.';
    return null;
  }

  async function handleRegister() {
    setError(null);
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsSubmitting(true);
    const result = await signUp(email.trim(), password, fullName.trim());
    setIsSubmitting(false);

    if (!result.success) {
      setError(result.error ?? 'Sign up failed.');
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Create Account</Text>

        <Input
          label="Full Name"
          value={fullName}
          onChangeText={setFullName}
          placeholder="Jane Farrier"
          autoCapitalize="words"
        />
        <Input
          label="Email"
          value={email}
          onChangeText={setEmail}
          placeholder="you@example.com"
          keyboardType="email-address"
        />
        <Input
          label="Password"
          value={password}
          onChangeText={setPassword}
          placeholder="At least 6 characters"
          secureTextEntry
        />
        <Input
          label="Confirm Password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          placeholder="Re-enter password"
          secureTextEntry
        />

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Button title="Create Account" onPress={handleRegister} isLoading={isSubmitting} />

        <Text style={styles.link} onPress={() => router.back()}>
          Already have an account? Sign in
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
    marginBottom: SPACING.XXL,
  },
  error: {
    color: COLORS.DANGER,
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
