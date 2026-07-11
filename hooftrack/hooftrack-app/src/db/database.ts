// src/db/database.ts
// Memoized SQLite connection. Opens the local database once, enables foreign
// keys and WAL journaling, and runs migrations on first open.

import * as SQLite from 'expo-sqlite';
import { runMigrations } from './migrations';
import { log } from '@shared/utils/logging';

const DATABASE_NAME = 'hooftrack.db';

let dbInstance: SQLite.SQLiteDatabase | null = null;
let initPromise: Promise<SQLite.SQLiteDatabase> | null = null;

async function openAndMigrate(): Promise<SQLite.SQLiteDatabase> {
  log.info('DB', 'open_database', { name: DATABASE_NAME });
  const db = await SQLite.openDatabaseAsync(DATABASE_NAME);
  await db.execAsync('PRAGMA journal_mode = WAL;');
  await db.execAsync('PRAGMA foreign_keys = ON;');
  await runMigrations(db);
  dbInstance = db;
  return db;
}

export async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (dbInstance) {
    return dbInstance;
  }
  if (!initPromise) {
    initPromise = openAndMigrate().catch((error) => {
      // Reset so a later call can retry a failed initialization.
      initPromise = null;
      log.error('DB', 'open_database_failed', error);
      throw error;
    });
  }
  return initPromise;
}
