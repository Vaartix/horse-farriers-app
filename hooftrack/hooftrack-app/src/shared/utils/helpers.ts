// src/shared/utils/helpers.ts
// Validation, formatting, and unit conversion utilities.

import * as Crypto from 'expo-crypto';
import { mmToInches, inchesToMm } from '@shared/constants/theme';
import type { HoofPosition, SyncStatus } from '@shared/types/database';

// --- Validation ---

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateEmail(email: string): ValidationResult {
  if (!email.trim()) {
    return { isValid: false, error: 'Email is required.' };
  }
  if (!EMAIL_REGEX.test(email)) {
    return { isValid: false, error: 'Invalid email format.' };
  }
  return { isValid: true };
}

export function validatePhone(phone: string): ValidationResult {
  const digitsOnly = phone.replace(/\D/g, '');
  if (digitsOnly.length < 7) {
    return { isValid: false, error: 'Phone number must have at least 7 digits.' };
  }
  return { isValid: true };
}

export function validateRequired(value: string, fieldName: string): ValidationResult {
  if (!value.trim()) {
    return { isValid: false, error: `${fieldName} is required.` };
  }
  return { isValid: true };
}

export function validateNumberRange(
  value: number,
  min: number,
  max: number,
  fieldName: string
): ValidationResult {
  if (Number.isNaN(value)) {
    return { isValid: false, error: `${fieldName} must be a number.` };
  }
  if (value < min || value > max) {
    return { isValid: false, error: `${fieldName} must be between ${min} and ${max}.` };
  }
  return { isValid: true };
}

export function validateHoofMeasurement(
  displayValue: number,
  fieldName: 'toeLength' | 'heelAngle' | 'soleDepth',
  unit: 'imperial' | 'metric'
): ValidationResult {
  const valueInMm = fieldName === 'heelAngle' ? displayValue : toStorageUnit(displayValue, unit);
  const ranges: Record<string, [number, number]> = {
    toeLength: [40, 160],
    heelAngle: [30, 80],
    soleDepth: [5, 30],
  };
  const range = ranges[fieldName];
  if (!range) {
    return { isValid: false, error: `Unknown measurement field: ${fieldName}.` };
  }
  const unitLabel = fieldName === 'heelAngle' ? '°' : 'mm';
  return validateNumberRange(valueInMm, range[0], range[1], `${fieldName} (${unitLabel})`);
}

// --- Formatting ---

const MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

export function formatDate(isoString: string): string {
  const date = new Date(isoString);
  const month = MONTHS[date.getMonth()];
  const day = date.getDate();
  const year = date.getFullYear();
  return `${month} ${day}, ${year}`;
}

export function formatOwnerName(firstName: string, lastName: string): string {
  return `${lastName}, ${firstName}`;
}

const POSITION_LABELS: Record<HoofPosition, string> = {
  LF: 'Left Fore',
  RF: 'Right Fore',
  LH: 'Left Hind',
  RH: 'Right Hind',
};

export function formatHoofPosition(position: HoofPosition): string {
  return POSITION_LABELS[position];
}

export function formatMeasurement(
  valueInMm: number,
  unit: 'imperial' | 'metric'
): string {
  if (unit === 'imperial') {
    return `${mmToInches(valueInMm)} in`;
  }
  return `${Math.round(valueInMm)} mm`;
}

export function formatAngle(degrees: number): string {
  return `${degrees}°`;
}

const SYNC_LABELS: Record<SyncStatus, string> = {
  synced: 'Synced',
  pending: 'Sync Pending',
  conflict: 'Sync Conflict',
};

export function formatSyncStatus(status: SyncStatus): string {
  return SYNC_LABELS[status];
}

// --- Unit Conversion ---

export function toDisplayUnit(
  valueInMm: number,
  unit: 'imperial' | 'metric'
): number {
  if (unit === 'imperial') {
    return mmToInches(valueInMm);
  }
  return Math.round(valueInMm);
}

export function toStorageUnit(
  displayValue: number,
  unit: 'imperial' | 'metric'
): number {
  if (unit === 'imperial') {
    return inchesToMm(displayValue);
  }
  return Math.round(displayValue);
}

// --- ID Generation ---

export function generateId(): string {
  return Crypto.randomUUID();
}

// --- Timestamp ---

export function nowISO(): string {
  return new Date().toISOString();
}
