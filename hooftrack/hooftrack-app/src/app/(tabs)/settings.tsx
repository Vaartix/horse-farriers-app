import { useState } from 'react';
import { StyleSheet, Switch, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@features/auth/AuthProvider';
import { Button } from '@shared/components/Button';
import { BORDER_RADIUS, COLORS, SPACING, TYPOGRAPHY } from '@shared/constants/theme';

export default function SettingsScreen() {
  const { user, signOut } = useAuth();

  // Local-only for Phase 1; persisted via crmService.updateUser in a later phase.
  const [isMetric, setIsMetric] = useState(user?.preferredUnits === 'metric');
  const [isSigningOut, setIsSigningOut] = useState(false);

  async function handleSignOut() {
    setIsSigningOut(true);
    await signOut();
    setIsSigningOut(false);
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <View style={styles.content}>
        <View style={styles.card}>
          <Text style={styles.label}>Signed in as</Text>
          <Text style={styles.value}>{user?.email ?? '—'}</Text>
        </View>

        <View style={[styles.card, styles.row]}>
          <View style={styles.rowText}>
            <Text style={styles.value}>Metric units</Text>
            <Text style={styles.label}>{isMetric ? 'Millimeters' : 'Inches'}</Text>
          </View>
          <Switch
            value={isMetric}
            onValueChange={setIsMetric}
            trackColor={{ true: COLORS.PRIMARY, false: COLORS.DISABLED }}
            thumbColor={COLORS.WHITE}
          />
        </View>

        <View style={styles.spacer} />

        <Button
          title="Sign Out"
          variant="danger"
          onPress={handleSignOut}
          isLoading={isSigningOut}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.BACKGROUND },
  content: { flex: 1, padding: SPACING.SCREEN_PADDING },
  card: {
    backgroundColor: COLORS.SURFACE,
    borderRadius: BORDER_RADIUS.LG,
    padding: SPACING.CARD_PADDING,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    marginBottom: SPACING.MD,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rowText: { flex: 1 },
  label: {
    fontSize: TYPOGRAPHY.LABEL,
    color: COLORS.TEXT_SECONDARY,
  },
  value: {
    fontSize: TYPOGRAPHY.BODY,
    color: COLORS.TEXT_PRIMARY,
    fontWeight: TYPOGRAPHY.WEIGHT_MEDIUM,
  },
  spacer: { flex: 1 },
});
