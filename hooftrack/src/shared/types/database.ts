// src/shared/types/database.ts
// All TypeScript interfaces for the Equine Farrier App data model.

export interface User {
  id: string;
  email: string | null;
  phone: string | null;
  fullName: string;
  preferredUnits: 'imperial' | 'metric';
  createdAt: string;
  updatedAt: string;
}

export interface Team {
  id: string;
  name: string;
  ownerId: string;
  createdAt: string;
}

export interface TeamMember {
  id: string;
  teamId: string;
  userId: string;
  role: 'owner' | 'employee';
  visibleBarnIds: string[] | null;
  canEditRecords: boolean;
  canViewInvoices: boolean;
  canCreateInvoices: boolean;
  createdAt: string;
}

export interface Barn {
  id: string;
  teamId: string;
  name: string;
  address: string;
  latitude: number | null;
  longitude: number | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Owner {
  id: string;
  teamId: string;
  barnId: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  email: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface BehavioralFlags {
  kicks: boolean;
  bites: boolean;
  pullsBack: boolean;
  needsSedation: boolean;
  difficultToCatch: boolean;
  customWarning: string | null;
}

export interface Horse {
  id: string;
  ownerId: string;
  barnId: string;
  name: string;
  breed: string | null;
  dateOfBirth: string | null;
  color: string | null;
  discipline: string | null;
  behavioralFlags: BehavioralFlags;
  photoUri: string | null;
  shoeingCycleWeeks: number;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export type HoofPosition = 'LF' | 'RF' | 'LH' | 'RH';

export type SyncStatus = 'synced' | 'pending' | 'conflict';

export type PhotoType = 'before' | 'after' | 'xray' | 'other';

export interface ShoeingSession {
  id: string;
  horseId: string;
  farrierId: string;
  sessionDate: string;
  generalNotes: string | null;
  vetNotes: string | null;
  createdAt: string;
  updatedAt: string;
  syncStatus: SyncStatus;
}

export interface HoofRecord {
  id: string;
  sessionId: string;
  position: HoofPosition;
  toeLength: number | null;
  heelAngle: number | null;
  soleDepth: number | null;
  shoeType: string | null;
  shoeSize: string | null;
  shoeMaterial: string | null;
  padType: string | null;
  packingType: string | null;
  nailType: string | null;
  nailSize: string | null;
  notes: string | null;
  createdAt: string;
}

export interface HoofPhoto {
  id: string;
  hoofRecordId: string;
  localUri: string;
  cloudUri: string | null;
  photoType: PhotoType;
  createdAt: string;
}

export interface ServiceResponse<T> {
  success: boolean;
  data: T;
  error?: string;
}

export type SyncOperation = 'insert' | 'update' | 'delete';

export type SyncQueueStatus = 'pending' | 'in_progress' | 'failed';

export interface SyncQueueEntry {
  id: string;
  tableName: string;
  recordId: string;
  operation: SyncOperation;
  payload: string;
  createdAt: string;
  status: SyncQueueStatus;
  retryCount: number;
  lastError: string | null;
}

// --- Input types (omit auto-generated fields) ---

export type CreateBarnInput = Omit<Barn, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateBarnInput = Partial<Omit<Barn, 'id' | 'teamId' | 'createdAt' | 'updatedAt'>>;

export type CreateOwnerInput = Omit<Owner, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateOwnerInput = Partial<Omit<Owner, 'id' | 'teamId' | 'createdAt' | 'updatedAt'>>;

export type CreateHorseInput = Omit<Horse, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateHorseInput = Partial<Omit<Horse, 'id' | 'createdAt' | 'updatedAt'>>;

export type CreateSessionInput = Omit<ShoeingSession, 'id' | 'createdAt' | 'updatedAt' | 'syncStatus'>;
export type CreateHoofRecordInput = Omit<HoofRecord, 'id' | 'createdAt'>;

export const DEFAULT_BEHAVIORAL_FLAGS: BehavioralFlags = {
  kicks: false,
  bites: false,
  pullsBack: false,
  needsSedation: false,
  difficultToCatch: false,
  customWarning: null,
};

export const DEFAULT_SHOEING_CYCLE_WEEKS = 6;
