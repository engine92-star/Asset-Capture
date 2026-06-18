import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
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
import { useSettings } from '@/context/SettingsContext';
import { shouldRegisterItem } from '@/lib/thresholds';
import { ItemCondition, RegistryItem, RegistryType } from '@/types/registry';
import { theme } from '@/constants/theme';

type Step = 'primary_photo' | 'id_tags' | 'details' | 'documents' | 'review';

const STEPS: Step[] = ['primary_photo', 'id_tags', 'details', 'documents', 'review'];
const CONDITIONS: ItemCondition[] = ['working', 'inoperative', 'being_fixed'];

export default function CaptureWorkflowScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    label?: string;
    category?: string;
    estimatedValue?: string;
    meetsThreshold?: string;
  }>();
  const { settings } = useSettings();
  const { saveItem } = useRegistry();

  const estimatedValue = Number(params.estimatedValue ?? 0);
  const isLiability =
    params.category === 'Lease' ||
    params.category === 'Debt' ||
    params.category === 'Contract' ||
    params.category === 'Obligation';

  const [stepIndex, setStepIndex] = useState(0);
  const [photos, setPhotos] = useState<string[]>([]);
  const [idTagPhotos, setIdTagPhotos] = useState<string[]>([]);
  const [documents, setDocuments] = useState<string[]>([]);
  const [name, setName] = useState(params.label ?? '');
  const [make, setMake] = useState('');
  const [model, setModel] = useState('');
  const [year, setYear] = useState('');
  const [serialNumber, setSerialNumber] = useState('');
  const [markings, setMarkings] = useState('');
  const [condition, setCondition] = useState<ItemCondition>('working');
  const [retailValue, setRetailValue] = useState(String(estimatedValue || ''));
  const [purchasePrice, setPurchasePrice] = useState('');
  const [annualRevenue, setAnnualRevenue] = useState('');
  const [annualCost, setAnnualCost] = useState('');
  const [notes, setNotes] = useState('');
  const [customFields, setCustomFields] = useState<{ id: string; label: string; value: string }[]>([]);

  const step = STEPS[stepIndex];
  const progress = useMemo(() => ((stepIndex + 1) / STEPS.length) * 100, [stepIndex]);

  const takePhoto = async (target: 'photos' | 'idTagPhotos') => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission required', 'Camera access is needed to capture item photos.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      quality: 0.8,
      allowsEditing: false,
    });

    if (!result.canceled && result.assets[0]?.uri) {
      const uri = result.assets[0].uri;
      if (target === 'photos') {
        setPhotos((current) => [...current, uri]);
      } else {
        setIdTagPhotos((current) => [...current, uri]);
      }
    }
  };

  const pickDocument = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      multiple: true,
      copyToCacheDirectory: true,
    });

    if (!result.canceled) {
      const uris = result.assets.map((asset) => asset.uri);
      setDocuments((current) => [...current, ...uris]);
    }
  };

  const addCustomField = () => {
    setCustomFields((current) => [
      ...current,
      { id: uuidv4(), label: `Custom field ${current.length + 1}`, value: '' },
    ]);
  };

  const goNext = () => {
    if (step === 'primary_photo' && photos.length === 0) {
      Alert.alert('Photo required', 'Capture at least one photo of the item before continuing.');
      return;
    }
    if (stepIndex < STEPS.length - 1) {
      setStepIndex((value) => value + 1);
    }
  };

  const goBack = () => {
    if (stepIndex > 0) {
      setStepIndex((value) => value - 1);
    } else {
      router.back();
    }
  };

  const finish = async () => {
    const parsedRetail = Number(retailValue || estimatedValue || 0);
    const now = new Date().toISOString();
    const item: RegistryItem = {
      id: uuidv4(),
      type: (isLiability ? 'liability' : 'asset') as RegistryType,
      name: name || params.label || 'Untitled item',
      locationType: settings.defaultLocationType,
      photos,
      idTagPhotos,
      documents,
      make: make || undefined,
      model: model || undefined,
      year: year || undefined,
      serialNumber: serialNumber || undefined,
      markings: markings || undefined,
      condition,
      estimatedRetailValue: parsedRetail || undefined,
      purchasePrice: purchasePrice ? Number(purchasePrice) : undefined,
      annualRevenue: annualRevenue ? Number(annualRevenue) : undefined,
      annualCost: annualCost ? Number(annualCost) : undefined,
      meetsThreshold: shouldRegisterItem(parsedRetail, settings),
      detectedLabel: params.label,
      customFields,
      notes: notes || undefined,
      createdAt: now,
      updatedAt: now,
    };

    await saveItem(item);
    Alert.alert(
      'Saved to registry',
      `${item.name} has been added to your ${item.type} list.`,
      [{ text: 'OK', onPress: () => router.replace(item.type === 'asset' ? '/assets' : '/liabilities') }],
    );
  };

  return (
    <Screen>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Title>Capture workflow</Title>
        <Subtitle>
          Step {stepIndex + 1} of {STEPS.length}: {step.replaceAll('_', ' ')}
        </Subtitle>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${progress}%` }]} />
        </View>

        {step === 'primary_photo' && (
          <View>
            <Label>Primary item photos</Label>
            <Text style={styles.help}>Take clear photos from multiple angles.</Text>
            <Button label="Take photo" onPress={() => takePhoto('photos')} />
            <PhotoGrid uris={photos} />
          </View>
        )}

        {step === 'id_tags' && (
          <View>
            <Label>ID tags and markings</Label>
            <Text style={styles.help}>
              Capture serial plates, asset tags, manufacturer labels, and any identifying markings.
            </Text>
            <Button label="Capture ID tag photo" onPress={() => takePhoto('idTagPhotos')} />
            <PhotoGrid uris={idTagPhotos} />
            <Field label="Serial / asset tag number" value={serialNumber} onChangeText={setSerialNumber} />
            <Field label="Markings or engravings" value={markings} onChangeText={setMarkings} multiline />
          </View>
        )}

        {step === 'details' && (
          <View>
            <Field label="Item name" value={name} onChangeText={setName} />
            <Field label="Make" value={make} onChangeText={setMake} />
            <Field label="Model" value={model} onChangeText={setModel} />
            <Field label="Year" value={year} onChangeText={setYear} keyboardType="numeric" />
            <Field
              label="Estimated retail value"
              value={retailValue}
              onChangeText={setRetailValue}
              keyboardType="numeric"
            />
            <Field
              label="Purchase price"
              value={purchasePrice}
              onChangeText={setPurchasePrice}
              keyboardType="numeric"
            />
            {isLiability ? (
              <Field
                label="Annual cost to maintain liability"
                value={annualCost}
                onChangeText={setAnnualCost}
                keyboardType="numeric"
              />
            ) : (
              <Field
                label="Annual revenue generated by asset"
                value={annualRevenue}
                onChangeText={setAnnualRevenue}
                keyboardType="numeric"
              />
            )}
            <Label>Condition</Label>
            <View style={styles.chipRow}>
              {CONDITIONS.map((option) => (
                <Pressable key={option} onPress={() => setCondition(option)}>
                  <Text style={[styles.chip, condition === option && styles.chipActive]}>
                    {option.replaceAll('_', ' ')}
                  </Text>
                </Pressable>
              ))}
            </View>
            <Field label="Notes" value={notes} onChangeText={setNotes} multiline />
            <Button label="Add custom documentation field" onPress={addCustomField} variant="secondary" />
            {customFields.map((field, index) => (
              <View key={field.id}>
                <Field
                  label={`Custom field label ${index + 1}`}
                  value={field.label}
                  onChangeText={(value) =>
                    setCustomFields((current) =>
                      current.map((entry) =>
                        entry.id === field.id ? { ...entry, label: value } : entry,
                      ),
                    )
                  }
                />
                <Field
                  label="Value"
                  value={field.value}
                  onChangeText={(value) =>
                    setCustomFields((current) =>
                      current.map((entry) =>
                        entry.id === field.id ? { ...entry, value } : entry,
                      ),
                    )
                  }
                />
              </View>
            ))}
          </View>
        )}

        {step === 'documents' && (
          <View>
            <Label>Supporting documents</Label>
            <Text style={styles.help}>
              Upload invoices, warranties, appraisals, loan agreements, or maintenance records.
            </Text>
            <Button label="Upload document" onPress={pickDocument} />
            {documents.map((uri) => (
              <Text key={uri} style={styles.documentItem}>
                {uri.split('/').pop()}
              </Text>
            ))}
          </View>
        )}

        {step === 'review' && (
          <View>
            <Text style={styles.reviewLine}>Name: {name || params.label}</Text>
            <Text style={styles.reviewLine}>Type: {isLiability ? 'Liability' : 'Asset'}</Text>
            <Text style={styles.reviewLine}>Photos: {photos.length}</Text>
            <Text style={styles.reviewLine}>ID tag photos: {idTagPhotos.length}</Text>
            <Text style={styles.reviewLine}>Documents: {documents.length}</Text>
            <Text style={styles.reviewLine}>Make / Model: {make} {model}</Text>
            <Text style={styles.reviewLine}>Condition: {condition}</Text>
            <Text style={styles.reviewLine}>Retail value: {retailValue || estimatedValue}</Text>
          </View>
        )}

        <View style={styles.actions}>
          <Button label="Back" onPress={goBack} variant="secondary" />
          {step === 'review' ? (
            <Button label="Save to registry" onPress={finish} />
          ) : (
            <Button label="Continue" onPress={goNext} />
          )}
        </View>
      </ScrollView>
    </Screen>
  );
}

function PhotoGrid({ uris }: { uris: string[] }) {
  if (uris.length === 0) return null;
  return (
    <View style={styles.photoGrid}>
      {uris.map((uri) => (
        <Image key={uri} source={{ uri }} style={styles.photo} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  progressTrack: {
    height: 8,
    backgroundColor: theme.colors.border,
    borderRadius: theme.radius.pill,
    overflow: 'hidden',
    marginBottom: theme.spacing.lg,
  },
  progressFill: {
    height: '100%',
    backgroundColor: theme.colors.primary,
  },
  help: {
    fontSize: 14,
    color: theme.colors.textMuted,
    marginBottom: theme.spacing.md,
    lineHeight: 20,
  },
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
  reviewLine: {
    fontSize: 15,
    color: theme.colors.text,
    marginBottom: 8,
  },
  actions: {
    marginTop: theme.spacing.md,
  },
});