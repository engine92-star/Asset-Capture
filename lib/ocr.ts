import { Platform } from 'react-native';

export interface ParsedIdTag {
  serialNumber?: string;
  model?: string;
  make?: string;
  year?: string;
  markings?: string;
}

const SERIAL_PATTERNS = [
  /(?:serial(?:\s*(?:no|number|#))?|s\/n|sn)\s*[:#-]?\s*([A-Z0-9][A-Z0-9-]{3,})/i,
  /(?:asset(?:\s*tag)?|tag)\s*[:#-]?\s*([A-Z0-9][A-Z0-9-]{3,})/i,
];
const MODEL_PATTERNS = [
  /(?:model(?:\s*(?:no|number|#))?|m\/n)\s*[:#-]?\s*([A-Z0-9][A-Z0-9./-]{2,})/i,
];
const MAKE_PATTERNS = [
  /(?:make|brand|manufacturer)\s*[:#-]?\s*([A-Za-z][A-Za-z0-9 .&-]{1,})/i,
];
const YEAR_PATTERN = /(?:year|yr|©|copyright)\s*[:#-]?\s*((?:19|20)\d{2})/i;

function firstMatch(text: string, patterns: RegExp[]): string | undefined {
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match?.[1]) {
      return match[1].trim();
    }
  }
  return undefined;
}

export function parseIdTagText(text: string): ParsedIdTag {
  const cleaned = text.replace(/\s+/g, ' ').trim();
  if (!cleaned) return {};

  return {
    serialNumber: firstMatch(cleaned, SERIAL_PATTERNS),
    model: firstMatch(cleaned, MODEL_PATTERNS),
    make: firstMatch(cleaned, MAKE_PATTERNS),
    year: cleaned.match(YEAR_PATTERN)?.[1],
    markings: cleaned.length > 0 ? cleaned.slice(0, 500) : undefined,
  };
}

export async function recognizeIdTagFromImage(imageUri: string): Promise<ParsedIdTag> {
  if (Platform.OS === 'web') {
    return {};
  }

  try {
    const { recognizeText } = await import('@infinitered/react-native-mlkit-text-recognition');
    const result = await recognizeText(imageUri);
    return parseIdTagText(result.text ?? '');
  } catch (error) {
    console.warn('OCR unavailable, skipping ID tag recognition.', error);
    return {};
  }
}

export function isOcrAvailable(): boolean {
  return Platform.OS === 'android' || Platform.OS === 'ios';
}