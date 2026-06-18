import React from 'react';
import { FlatList, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { RegistryItem } from '@/types/registry';
import { formatCurrency } from '@/lib/thresholds';
import { Badge } from '@/components/ui';
import { theme } from '@/constants/theme';

export function RegistryList({
  items,
  emptyTitle,
  emptySubtitle,
}: {
  items: RegistryItem[];
  emptyTitle: string;
  emptySubtitle: string;
}) {
  const router = useRouter();

  if (items.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyTitle}>{emptyTitle}</Text>
        <Text style={styles.emptySubtitle}>{emptySubtitle}</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={items}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.list}
      renderItem={({ item }) => (
        <Pressable
          style={styles.row}
          onPress={() => router.push(`/item/${item.id}`)}>
          {item.photos[0] ? (
            <Image source={{ uri: item.photos[0] }} style={styles.thumb} />
          ) : (
            <View style={[styles.thumb, styles.thumbPlaceholder]}>
              <Text style={styles.thumbText}>{item.type === 'asset' ? 'A' : 'L'}</Text>
            </View>
          )}
          <View style={styles.rowBody}>
            <Badge
              label={item.type}
              tone={item.type === 'asset' ? 'asset' : 'liability'}
            />
            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.meta}>
              {item.make || 'Unknown make'} {item.model ? `· ${item.model}` : ''}
            </Text>
            <Text style={styles.value}>
              {item.estimatedRetailValue
                ? formatCurrency(item.estimatedRetailValue)
                : 'Value pending'}
            </Text>
          </View>
        </Pressable>
      )}
    />
  );
}

const styles = StyleSheet.create({
  list: {
    paddingBottom: theme.spacing.xl,
  },
  row: {
    flexDirection: 'row',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    gap: theme.spacing.md,
  },
  thumb: {
    width: 72,
    height: 72,
    borderRadius: theme.radius.sm,
  },
  thumbPlaceholder: {
    backgroundColor: '#E8EEF5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  thumbText: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.colors.primary,
  },
  rowBody: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.text,
  },
  meta: {
    fontSize: 13,
    color: theme.colors.textMuted,
    marginTop: 2,
  },
  value: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.primary,
    marginTop: 6,
  },
  empty: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.xl,
    paddingHorizontal: theme.spacing.lg,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    color: theme.colors.textMuted,
    textAlign: 'center',
    lineHeight: 20,
  },
});