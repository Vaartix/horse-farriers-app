import { StyleSheet, View } from 'react-native';
import { EmptyState } from '@shared/components/EmptyState';
import { COLORS } from '@shared/constants/theme';

export default function HorsesScreen() {
  return (
    <View style={styles.container}>
      <EmptyState
        title="No horses yet"
        message="Add a barn first, then add owners and horses."
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.BACKGROUND },
});
