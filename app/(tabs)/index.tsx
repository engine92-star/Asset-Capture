import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRegistry } from '@/context/RegistryContext';
import { useSettings } from '@/context/SettingsContext';
import { formatCurrency, getEffectiveDeMinimis } from '@/lib/thresholds';
import { Badge, Button, Card, Screen, Subtitle, Title } from '@/components/ui';
import { theme } from '@/constants/theme';

export default function HomeScreen() {
  const router = useRouter();
  const { items } = useRegistry();
  const { settings } = useSettings();

  const assets = items.filter((item) => item.type === 'asset');
  const liabilities = items.filter((item) => item.type === 'liability');
  const assetValue = assets.reduce((sum, item) => sum + (item.estimatedRetailValue ?? 0), 0);
  const liabilityCost = liabilities.reduce((sum, item) => sum + (item.annualCost ?? 0), 0);

  return (
    <Screen>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Title>Asset-Capture</Title>
        <Subtitle>
          Walk through your business, home, or storage facility and capture high-value assets
          and liabilities that meet your capitalization threshold.
        </Subtitle>

        <Card>
          <Badge label="Active threshold" tone="warning" />
          <Text style={styles.statLabel}>Cost basis minimum</Text>
          <Text style={styles.statValue}>{formatCurrency(settings.costBasisThreshold)}</Text>
          <Text style={styles.statMeta}>
            IRS de minimis: {formatCurrency(getEffectiveDeMinimis(settings))}
          </Text>
        </Card>

        <View style={styles.grid}>
          <Card style={styles.gridCard}>
            <Text style={styles.statLabel}>Assets</Text>
            <Text style={styles.statValue}>{assets.length}</Text>
            <Text style={styles.statMeta}>{formatCurrency(assetValue)} tracked</Text>
          </Card>
          <Card style={styles.gridCard}>
            <Text style={styles.statLabel}>Liabilities</Text>
            <Text style={styles.statValue}>{liabilities.length}</Text>
            <Text style={styles.statMeta}>{formatCurrency(liabilityCost)}/yr</Text>
          </Card>
        </View>

        <Button label="Start camera scan" onPress={() => router.push('/capture')} />
        <Button
          label="View assets"
          onPress={() => router.push('/assets')}
          variant="secondary"
        />
        <Button
          label="View liabilities"
          onPress={() => router.push('/liabilities')}
          variant="secondary"
        />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  gridCard: {
    flex: 1,
  },
  statLabel: {
    fontSize: 13,
    color: theme.colors.textMuted,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 28,
    fontWeight: '700',
    color: theme.colors.text,
  },
  statMeta: {
    fontSize: 13,
    color: theme.colors.textMuted,
    marginTop: 4,
  },
});