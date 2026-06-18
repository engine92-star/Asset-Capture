import { AppSettings } from '@/types/registry';

export const IRS_DE_MINIMIS_WITHOUT_AUDIT = 2500;
export const IRS_DE_MINIMIS_WITH_AUDIT = 5000;
export const STANDARD_BUSINESS_THRESHOLD = 5000;

export function getEffectiveDeMinimis(settings: AppSettings): number {
  return settings.hasAuditedFinancialStatements
    ? IRS_DE_MINIMIS_WITH_AUDIT
    : IRS_DE_MINIMIS_WITHOUT_AUDIT;
}

export function shouldRegisterItem(
  estimatedValue: number,
  settings: AppSettings,
): boolean {
  const threshold = Math.max(settings.costBasisThreshold, getEffectiveDeMinimis(settings));
  return estimatedValue >= threshold;
}

export function formatCurrency(value: number): string {
  if (value >= 1_000_000_000) {
    return `$${(value / 1_000_000_000).toFixed(2)}B`;
  }
  if (value >= 1_000_000) {
    return `$${(value / 1_000_000).toFixed(2)}M`;
  }
  if (value >= 1_000) {
    return `$${(value / 1_000).toFixed(1)}K`;
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatThresholdLabel(value: number): string {
  return formatCurrency(value);
}