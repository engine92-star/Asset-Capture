import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import Slider from '@react-native-community/slider';
import { useSettings } from '@/context/SettingsContext';
import {
  formatThresholdLabel,
  getEffectiveDeMinimis,
  IRS_DE_MINIMIS_WITH_AUDIT,
  IRS_DE_MINIMIS_WITHOUT_AUDIT,
  STANDARD_BUSINESS_THRESHOLD,
} from '@/lib/thresholds';
import { LocationType, MAX_THRESHOLD, MIN_THRESHOLD } from '@/types/registry';
import { Card, Label, Screen, Subtitle, Title } from '@/components/ui';
import { theme } from '@/constants/theme';

const LOCATION_OPTIONS: { label: string; value: LocationType }[] = [
  { label: 'Business', value: 'business' },
  { label: 'Home', value: 'home' },
  { label: 'Storage', value: 'storage' },
  { label: 'Other', value: 'other' },
];

const SENSITIVITY_OPTIONS = ['low', 'medium', 'high'] as const;

function sliderToValue(position: number): number {
  const minLog = Math.log10(MIN_THRESHOLD);
  const maxLog = Math.log10(MAX_THRESHOLD);
  const value = Math.pow(10, minLog + position * (maxLog - minLog));
  return Math.round(value);
}

function valueToSlider(value: number): number {
  const minLog = Math.log10(MIN_THRESHOLD);
  const maxLog = Math.log10(MAX_THRESHOLD);
  const clamped = Math.min(Math.max(value, MIN_THRESHOLD), MAX_THRESHOLD);
  return (Math.log10(clamped) - minLog) / (maxLog - minLog);
}

export default function SettingsScreen() {
  const { settings, updateSettings } = useSettings();
  const [sliderPosition, setSliderPosition] = useState(valueToSlider(settings.costBasisThreshold));

  const effectiveThreshold = useMemo(
    () => Math.max(settings.costBasisThreshold, getEffectiveDeMinimis(settings)),
    [settings],
  );

  const onSliderComplete = async (position: number) => {
    const nextValue = sliderToValue(position);
    setSliderPosition(position);
    await updateSettings({ costBasisThreshold: nextValue });
  };

  return (
    <Screen>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Title>Settings</Title>
        <Subtitle>
          Adjust capitalization thresholds and scanning behavior. Asset-Capture uses IRS de minimis
          safe harbor rules and standard business capitalization policies.
        </Subtitle>

        <Card>
          <Label>Cost basis threshold</Label>
          <Text style={styles.thresholdValue}>
            {formatThresholdLabel(settings.costBasisThreshold)}
          </Text>
          <Slider
            style={styles.slider}
            minimumValue={0}
            maximumValue={1}
            step={0.001}
            value={sliderPosition}
            minimumTrackTintColor={theme.colors.primary}
            maximumTrackTintColor={theme.colors.border}
            onValueChange={setSliderPosition}
            onSlidingComplete={onSliderComplete}
          />
          <Text style={styles.rangeText}>
            Range: {formatThresholdLabel(MIN_THRESHOLD)} to {formatThresholdLabel(MAX_THRESHOLD)}+
          </Text>
          <Text style={styles.helpText}>
            Effective registration threshold: {formatThresholdLabel(effectiveThreshold)}
          </Text>
        </Card>

        <Card>
          <View style={styles.switchRow}>
            <View style={styles.switchCopy}>
              <Label>Audited financial statements</Label>
              <Text style={styles.helpText}>
                Enables IRS de minimis safe harbor up to {formatThresholdLabel(IRS_DE_MINIMIS_WITH_AUDIT)}
                per item. Without audited statements the limit is {formatThresholdLabel(IRS_DE_MINIMIS_WITHOUT_AUDIT)}.
              </Text>
            </View>
            <Switch
              value={settings.hasAuditedFinancialStatements}
              onValueChange={(value) => updateSettings({ hasAuditedFinancialStatements: value })}
            />
          </View>
        </Card>

        <Card>
          <Label>Default location</Label>
          <View style={styles.chipRow}>
            {LOCATION_OPTIONS.map((option) => {
              const active = settings.defaultLocationType === option.value;
              return (
                <Text
                  key={option.value}
                  onPress={() => updateSettings({ defaultLocationType: option.value })}
                  style={[styles.chip, active && styles.chipActive]}>
                  {option.label}
                </Text>
              );
            })}
          </View>
        </Card>

        <Card>
          <Label>Scan sensitivity</Label>
          <View style={styles.chipRow}>
            {SENSITIVITY_OPTIONS.map((option) => {
              const active = settings.scanSensitivity === option;
              return (
                <Text
                  key={option}
                  onPress={() => updateSettings({ scanSensitivity: option })}
                  style={[styles.chip, active && styles.chipActive]}>
                  {option}
                </Text>
              );
            })}
          </View>
        </Card>

        <Card>
          <Label>Reference thresholds</Label>
          <Text style={styles.referenceItem}>
            Standard business capitalization: {formatThresholdLabel(STANDARD_BUSINESS_THRESHOLD)}
          </Text>
          <Text style={styles.referenceItem}>
            Useful life requirement: more than one year
          </Text>
          <Text style={styles.referenceItem}>
            Tangible and intangible assets supported
          </Text>
        </Card>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  thresholdValue: {
    fontSize: 32,
    fontWeight: '700',
    color: theme.colors.primary,
    marginBottom: theme.spacing.sm,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  rangeText: {
    fontSize: 13,
    color: theme.colors.textMuted,
    marginTop: theme.spacing.xs,
  },
  helpText: {
    fontSize: 13,
    color: theme.colors.textMuted,
    lineHeight: 20,
    marginTop: theme.spacing.xs,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  switchCopy: {
    flex: 1,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
    marginTop: theme.spacing.sm,
  },
  chip: {
    paddingHorizontal: 14,
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
  referenceItem: {
    fontSize: 14,
    color: theme.colors.text,
    marginBottom: 6,
    lineHeight: 20,
  },
});