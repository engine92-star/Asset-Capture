import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { v4 as uuidv4 } from 'uuid';
import { Button, Field, Label, Screen, Subtitle, Title } from '@/components/ui';
import { useRegistry } from '@/context/RegistryContext';
import { getItem } from '@/lib/storage';
import { formatCurrency } from '@/lib/thresholds';
import { ItemCondition, RegistryItem } from '@/types/registry';
import { theme } from '@/constants/theme';

const CONDITIONS: ItemCondition[] = ['working', 'inoperative', 'being_fixed'];

export default function ItemDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { saveItem, removeItem } = useRegistry();
  const [item, setItem] = useState<RegistryItem | null>(null);

  useEffect(() => {
    if (id) {
      getItem(id).then(setItem);
    }
  }, [id]);

  if (!item) {
    return (
      <Screen>
        <Title>Loading…</Title>
      </Screen>
    );
  }

  const update = (patch: Partial<RegistryItem>) => {
    setItem((current) => (current ? { ...current, ...patch, updatedAt: new Date().toISOString() } : current));
  };

  const persist = async () => {
    if (!item) return;
    await saveItem(item);
    Alert.alert('Saved', 'Item details updated.');
  };

  const addPhoto = async () => {
    const result = await ImagePicker.launchCameraAsync({ quality: 0.8 });
    if (!result.canceled && result.assets[0]?.uri) {
      update({ photos: [...item.photos, result.assets[0].uri] });
    }
  };

  const addDocument = async () => {
    const result = await DocumentPicker.getDocumentAsync({ multiple: true });
    if (!result.canceled) {
      update({ documents: [...item.documents, ...result.assets.map((asset) => asset.uri)] });
    }
  };

  const addCustomField = () => {
    update({
      customFields: [
        ...item.customFields,
        { id: uuidv4(), label: `Custom field ${item.customFields.length + 1}`, value: '' },
      ],
    });
  };

  const deleteItem = async () => {
    await removeItem(item.id);
    router.back();
  };

  return (
    <Screen>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Title>{item.name}</Title>
        <Subtitle>
          {item.type === 'asset' ? 'Asset' : 'Liability'} ·{' '}
          {item.estimatedRetailValue ? formatCurrency(item.estimatedRetailValue) : 'Value pending'}
        </Subtitle>

        <View style={styles.photoGrid}>
          {item.photos.map((uri) => (
            <Image key={uri} source={{ uri }} style={styles.photo} />
          ))}
        </View>
        <Button label="Add another photo" onPress={addPhoto} variant="secondary" />

        <Field label="Name" value={item.name} onChangeText={(value) => update({ name: value })} />
        <Field label="Make" value={item.make ?? ''} onChangeText={(value) => update({ make: value })} />
        <Field label="Model" value={item.model ?? ''} onChangeText={(value) => update({ model: value })} />
        <Field label="Year" value={item.year ?? ''} onChangeText={(value) => update({ year: value })} />
        <Field
          label="Serial / asset tag"
          value={item.serialNumber ?? ''}
          onChangeText={(value) => update({ serialNumber: value })}
        />
        <Field
          label="Markings"
          value={item.markings ?? ''}
          onChangeText={(value) => update({ markings: value })}
          multiline
        />
        <Field
          label="Estimated retail value"
          value={item.estimatedRetailValue ? String(item.estimatedRetailValue) : ''}
          onChangeText={(value) => update({ estimatedRetailValue: Number(value) || undefined })}
          keyboardType="numeric"
        />
        <Field
          label="Purchase price"
          value={item.purchasePrice ? String(item.purchasePrice) : ''}
          onChangeText={(value) => update({ purchasePrice: Number(value) || undefined })}
          keyboardType="numeric"
        />
        {item.type === 'asset' ? (
          <Field
            label="Annual revenue generated"
            value={item.annualRevenue ? String(item.annualRevenue) : ''}
            onChangeText={(value) => update({ annualRevenue: Number(value) || undefined })}
            keyboardType="numeric"
          />
        ) : (
          <Field
            label="Annual cost to maintain"
            value={item.annualCost ? String(item.annualCost) : ''}
            onChangeText={(value) => update({ annualCost: Number(value) || undefined })}
            keyboardType="numeric"
          />
        )}

        <Label>Condition</Label>
        <View style={styles.chipRow}>
          {CONDITIONS.map((option) => (
            <Pressable key={option} onPress={() => update({ condition: option })}>
              <Text style={[styles.chip, item.condition === option && styles.chipActive]}>
                {option.replaceAll('_', ' ')}
              </Text>
            </Pressable>
          ))}
        </View>

        <Field label="Notes" value={item.notes ?? ''} onChangeText={(value) => update({ notes: value })} multiline />
        <Button label="Add custom field" onPress={addCustomField} variant="secondary" />
        {item.customFields.map((field, index) => (
          <View key={field.id}>
            <Field
              label={`Custom field ${index + 1}`}
              value={field.label}
              onChangeText={(value) =>
                update({
                  customFields: item.customFields.map((entry) =>
                    entry.id === field.id ? { ...entry, label: value } : entry,
                  ),
                })
              }
            />
            <Field
              label="Value"
              value={field.value}
              onChangeText={(value) =>
                update({
                  customFields: item.customFields.map((entry) =>
                    entry.id === field.id ? { ...entry, value } : entry,
                  ),
                })
              }
            />
          </View>
        ))}

        <Label>Documents</Label>
        {item.documents.map((uri) => (
          <Text key={uri} style={styles.documentItem}>
            {uri.split('/').pop()}
          </Text>
        ))}
        <Button label="Upload document" onPress={addDocument} variant="secondary" />

        <Button label="Save changes" onPress={persist} />
        <Button label="Delete item" onPress={deleteItem} variant="danger" />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  photoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.md,
  },
  photo: {
    width: 96,
    height: 96,
    borderRadius: theme.radius.sm,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.md,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: theme.radius.pill,
    backgroundColor: '#E8EEF5',
    color: theme.colors.textMuted,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  chipActive: {
    backgroundColor: theme.colors.primary,
    color: '#FFFFFF',
  },
  documentItem: {
    fontSize: 13,
    color: theme.colors.text,
    marginBottom: 6,
  },
});