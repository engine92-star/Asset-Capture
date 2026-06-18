import { Platform } from 'react-native';
import type { RNMLKitObjectDetector } from '@infinitered/react-native-mlkit-object-detection';
import { AppSettings, DetectionCandidate } from '@/types/registry';
import { mapMlLabel } from '@/lib/label-map';
import { shouldRegisterItem } from '@/lib/thresholds';
import { scanForCandidates } from '@/lib/detection';

const MIN_CONFIDENCE = 0.55;

function valueWithVariance(baseValue: number, settings: AppSettings): number {
  const sensitivityMultiplier =
    settings.scanSensitivity === 'high'
      ? 0.85
      : settings.scanSensitivity === 'low'
        ? 1.15
        : 1;
  const variance = 0.9 + Math.random() * 0.2;
  return Math.round(baseValue * variance * sensitivityMultiplier);
}

function candidateFromLabel(
  rawLabel: string,
  confidence: number,
  settings: AppSettings,
): DetectionCandidate | null {
  const mapped = mapMlLabel(rawLabel);
  if (!mapped) return null;

  const estimatedValue = valueWithVariance(mapped.baseValue, settings);
  const meetsThreshold = shouldRegisterItem(estimatedValue, settings);

  return {
    id: `${mapped.label}-${Date.now()}`,
    label: mapped.label,
    category: mapped.category,
    estimatedValue,
    confidence,
    meetsThreshold,
    mlLabel: rawLabel,
  };
}

export function isMlKitAvailable(): boolean {
  return Platform.OS === 'android' || Platform.OS === 'ios';
}

export async function analyzeImageForCandidates(
  imageUri: string,
  settings: AppSettings,
  detector?: RNMLKitObjectDetector,
): Promise<DetectionCandidate[]> {
  if (!detector?.isLoaded?.()) {
    return scanForCandidates(settings);
  }

  try {
    const objects = await detector.detectObjects(imageUri);
    const candidates: DetectionCandidate[] = [];

    for (const object of objects) {
      for (const label of object.labels) {
        if (label.confidence < MIN_CONFIDENCE) continue;
        const candidate = candidateFromLabel(label.text, label.confidence, settings);
        if (candidate) {
          candidates.push(candidate);
        }
      }
    }

    candidates.sort((a, b) => b.confidence - a.confidence);

    const qualifying = candidates.filter(
      (candidate) => candidate.meetsThreshold || candidate.confidence >= 0.8,
    );

    return qualifying.slice(0, 1);
  } catch (error) {
    console.warn('ML Kit detection failed, using fallback scanner.', error);
    return scanForCandidates(settings);
  }
}