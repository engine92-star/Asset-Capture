export type ItemCondition = 'working' | 'inoperative' | 'being_fixed';
export type RegistryType = 'asset' | 'liability';
export type LocationType = 'business' | 'home' | 'storage' | 'other';

export interface CustomField {
  id: string;
  label: string;
  value: string;
}

export interface RegistryItem {
  id: string;
  type: RegistryType;
  name: string;
  description?: string;
  locationType: LocationType;
  locationLabel?: string;
  photos: string[];
  idTagPhotos: string[];
  documents: string[];
  make?: string;
  model?: string;
  year?: string;
  serialNumber?: string;
  markings?: string;
  condition: ItemCondition;
  estimatedRetailValue?: number;
  purchasePrice?: number;
  annualRevenue?: number;
  annualCost?: number;
  meetsThreshold: boolean;
  detectedLabel?: string;
  customFields: CustomField[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DetectionCandidate {
  id: string;
  label: string;
  category: string;
  estimatedValue: number;
  confidence: number;
  meetsThreshold: boolean;
  mlLabel?: string;
}

export interface AppSettings {
  costBasisThreshold: number;
  hasAuditedFinancialStatements: boolean;
  defaultLocationType: LocationType;
  scanSensitivity: 'low' | 'medium' | 'high';
}

export const DEFAULT_SETTINGS: AppSettings = {
  costBasisThreshold: 5000,
  hasAuditedFinancialStatements: false,
  defaultLocationType: 'business',
  scanSensitivity: 'medium',
};

export const MIN_THRESHOLD = 250;
export const MAX_THRESHOLD = 1_000_000_000;