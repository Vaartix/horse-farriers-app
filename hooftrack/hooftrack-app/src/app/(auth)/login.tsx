import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@features/auth/AuthProvider';
import { Button } from '@shared/components/Button';
import { Input } from '@shared/components/Input';
import { COLORS, SPACING, TYPOGRAPHY } from '@shared/constants/theme';

export default function LoginScreen() {
  const router = useRouter();
  const { signIn } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSignIn() {
    setError(null);
    setIsSubmitting(true);
    const result = await signIn(email.trim(), password);
    setIsSubmitting(false);
    if (!result.success) {
      setError(result.error ?? 'Sign in failed.');
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>HoofTrack</Text>
        <Text style={styles.subtitle}>Sign in to your account</Text>

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
          placeholder="Your password"
          secureTextEntry
        />

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Button title="Sign In" onPress={handleSignIn} isLoading={isSubmitting} />

        <View style={styles.gap} />

        <Button
          title="Create Account"
          variant="secondary"
          onPress={() => router.push('/(auth)/register')}
        />

        <Text style={styles.link} onPress={() => router.push('/(auth)/forgot-password')}>
          Forgot password?
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
  gap: { height: SPACING.MD },
  link: {
    color: COLORS.ACCENT,
    fontSize: TYPOGRAPHY.BODY_SMALL,
    textAlign: 'center',
    marginTop: SPACING.XL,
  },
});
