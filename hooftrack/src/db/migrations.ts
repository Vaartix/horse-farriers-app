// src/db/migrations.ts
// Schema versioning and migration runner.

import type { SQLiteDatabase } from 'expo-sqlite';
import { DATABASE_SCHEMA } from './schema';
import { log } from '@shared/utils/logging';

export const CURRENT_SCHEMA_VERSION = 1;

export async function runMigrations(db: SQLiteDatabase): Promise<void> {
  log.info('DB', 'run_migrations', { targetVersion: CURRENT_SCHEMA_VERSION });

  try {
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS schema_version (
        id INTEGER PRIMARY KEY CHECK(id = 1),
        version INTEGER NOT NULL
      );
    `);

    const result = await db.getFirstAsync<{ version: number }>(
      'SELECT version FROM schema_version WHERE id = 1'
    );
    const currentVersion = result?.version ?? 0;

    if (currentVersion >= CURRENT_SCHEMA_VERSION) {
      log.info('DB', 'migrations_up_to_date', { version: currentVersion });
      return;
    }

    await db.withTransactionAsync(async () => {
      if (currentVersion < 1) {
        log.info('DB', 'applying_migration_v1');
        await db.execAsync(DATABASE_SCHEMA);
        log.info('DB', 'migration_v1_complete');
      }

      // Future migrations go here:
      // if (currentVersion < 2) { ... }

      await db.runAsync(
        `INSERT OR REPLACE INTO schema_version (id, version) VALUES (1, ?)`,
        [CURRENT_SCHEMA_VERSION]
      );
    });

    log.info('DB', 'migrations_complete', { version: CURRENT_SCHEMA_VERSION });
  } catch (error) {
    log.error('DB', 'migration_failed', error);
    throw error;
  }
}
