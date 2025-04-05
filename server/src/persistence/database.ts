import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';

import { config } from '../config.js';
import * as schema from './schema.js';

const client = new pg.Pool({ connectionString: config.database.url });
export const db = drizzle(client, { schema, casing: 'snake_case', logger: config.database.debug });

export function closeDatabaseConnection() {
  return db.$client.end();
}
