import { drizzle } from 'drizzle-orm/node-postgres';

import pg from 'pg';
import { config } from '../config';
import * as schema from './schema';

const client = new pg.Pool({ connectionString: config.database.url });
export const db = drizzle(client, { schema, logger: config.database.debug });
