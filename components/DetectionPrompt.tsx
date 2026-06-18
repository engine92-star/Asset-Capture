import React from 'react';
import { Modal, StyleSheet, Text, View } from 'react-native';
import { DetectionCandidate } from '@/types/registry';
import { formatCurrency } from '@/lib/thresholds';
import { Badge, Button } from '@/components/ui';
import { theme } from '@/constants/theme';

export function DetectionPrompt({
  candidate,
  visible,
  onAccept,
  onDismiss,
}: {
  candidate: DetectionCandidate | null;
  visible: boolean;
  onAccept: () => void;
  onDismiss: () => void;
}) {
  if (!candidate) return null;

  const isLiability = candidate.category === 'Lease' ||
    candidate.category === 'Debt' ||
    candidate.category === 'Contract' ||
    candidate.category === 'Obligation';

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <Badge
            label={candidate.meetsThreshold ? 'Meets threshold' : 'Below threshold'}
            tone={candidate.meetsThreshold ? (isLiability ? 'liability' : 'asset') : 'warning'}
          />
          <Text style={styles.heading}>Potential {isLiability ? 'liability' : 'asset'} detected</Text>
          <Text style={styles.label}>{candidate.label}</Text>
          <Text style={styles.meta}>
            Category: {candidate.category} · Est. value {formatCurrency(candidate.estimatedValue)}
          </Text>
          {candidate.mlLabel ? (
            <Text style={styles.meta}>ML Kit detected: {candidate.mlLabel}</Text>
          ) : null}
          <Text style={styles.meta}>
            Confidence {(candidate.confidence * 100).toFixed(0)}%
          </Text>
          <Text style={styles.question}>
            Would you like to log this {isLiability ? 'liability' : 'asset'} in your registry?
          </Text>
          <Button label="Yes, capture it" onPress={onAccept} />
          <Button label="Not now" onPress={onDismiss} variant="secondary" />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: theme.colors.surface,
    borderTopLeftRadius: theme.radius.lg,
    borderTopRightRadius: theme.radius.lg,
    padding: theme.spacing.lg,
  },
  heading: {
    fontSize: 22,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  label: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.primary,
    marginBottom: theme.spacing.sm,
  },
  meta: {
    fontSize: 14,
    color: theme.colors.textMuted,
    marginBottom: 4,
  },
  question: {
    fontSize: 15,
    color: theme.colors.text,
    marginVertical: theme.spacing.md,
    lineHeight: 22,
  },
});