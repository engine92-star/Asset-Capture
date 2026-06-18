import { AppSettings, DetectionCandidate } from '@/types/registry';
import { shouldRegisterItem } from '@/lib/thresholds';

const ASSET_CATALOG = [
  { label: 'Commercial HVAC Unit', category: 'Equipment', baseValue: 12500 },
  { label: 'Industrial Refrigerator', category: 'Equipment', baseValue: 8200 },
  { label: 'POS Terminal System', category: 'Technology', baseValue: 6400 },
  { label: 'Commercial Generator', category: 'Equipment', baseValue: 18500 },
  { label: 'Server Rack', category: 'Technology', baseValue: 14200 },
  { label: 'CNC Machine', category: 'Machinery', baseValue: 78000 },
  { label: 'Delivery Vehicle', category: 'Vehicles', baseValue: 42000 },
  { label: 'Forklift', category: 'Machinery', baseValue: 35000 },
  { label: 'Office Furniture Set', category: 'Furniture', baseValue: 6800 },
  { label: 'Security Camera System', category: 'Technology', baseValue: 9200 },
  { label: 'Commercial Printer', category: 'Equipment', baseValue: 7100 },
  { label: 'Solar Panel Array', category: 'Infrastructure', baseValue: 28000 },
  { label: 'Water Heater (Commercial)', category: 'Equipment', baseValue: 5600 },
  { label: 'Laptop Workstation', category: 'Technology', baseValue: 3200 },
  { label: 'Power Tool Collection', category: 'Equipment', baseValue: 4100 },
  { label: 'Antique Furniture', category: 'Furniture', baseValue: 15000 },
  { label: 'Jewelry Safe', category: 'Security', baseValue: 8900 },
  { label: 'Boat / Watercraft', category: 'Vehicles', baseValue: 55000 },
  { label: 'Tractor', category: 'Machinery', baseValue: 48000 },
  { label: 'Medical Imaging Device', category: 'Medical', baseValue: 95000 },
];

const LIABILITY_CATALOG = [
  { label: 'Commercial Lease Obligation', category: 'Lease', baseValue: 24000 },
  { label: 'Equipment Financing Loan', category: 'Debt', baseValue: 18000 },
  { label: 'Vehicle Loan', category: 'Debt', baseValue: 32000 },
  { label: 'Outstanding Vendor Contract', category: 'Contract', baseValue: 12000 },
  { label: 'Warranty Liability', category: 'Obligation', baseValue: 7500 },
];

function randomInRange(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pickRandom<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

export function scanForCandidates(settings: AppSettings): DetectionCandidate[] {
  const sensitivityMultiplier =
    settings.scanSensitivity === 'high'
      ? 0.75
      : settings.scanSensitivity === 'low'
        ? 1.25
        : 1;

  const pool = Math.random() > 0.82 ? LIABILITY_CATALOG : ASSET_CATALOG;
  const entry = pickRandom(pool);
  const variance = randomInRange(-15, 25) / 100;
  const estimatedValue = Math.round(entry.baseValue * (1 + variance) * sensitivityMultiplier);
  const confidence = randomInRange(62, 96) / 100;
  const meetsThreshold = shouldRegisterItem(estimatedValue, settings);

  if (!meetsThreshold && Math.random() > 0.35) {
    return [];
  }

  return [
    {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      label: entry.label,
      category: entry.category,
      estimatedValue,
      confidence,
      meetsThreshold,
    },
  ];
}

export function getScanIntervalMs(settings: AppSettings): number {
  switch (settings.scanSensitivity) {
    case 'high':
      return 3500;
    case 'low':
      return 9000;
    default:
      return 5500;
  }
}