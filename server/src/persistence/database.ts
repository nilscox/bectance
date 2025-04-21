import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';

import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';

import { config } from '../config.js';
import * as schema from './schema.js';

const client = new pg.Pool({ connectionString: config.database.url });
export const db = drizzle(client, { schema, casing: 'snake_case', logger: config.database.debug });

export type Database = typeof db;

export async function closeDatabaseConnection() {
  await db.$client.end();
}

export async function migrate(client: pg.Pool) {
  const entries = await readdir('drizzle');

  for (const entry of entries) {
    if (entry.endsWith('.sql')) {
      const sql = (await readFile(path.join('drizzle', entry))).toString('utf-8');

      await client.query(sql);
    }
  }
}
