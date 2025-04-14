import 'dotenv/config';

import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { after, before } from 'node:test';

import pg from 'pg';

import { config } from './config.js';
import { createId } from './utils.js';

async function migrate(dbName: string) {
  const client = new pg.Client({ connectionString: `postgres://postgres@localhost/${dbName}` });

  try {
    await client.connect();

    const entries = await readdir('drizzle');

    for (const entry of entries) {
      if (entry.endsWith('.sql')) {
        const sql = (await readFile(path.join('drizzle', entry))).toString('utf-8');

        await client.query(sql);
      }
    }
  } finally {
    await client.end();
  }
}

let dbName: string;
let client: pg.Client;

before(async () => {
  dbName = `test_${createId()}`;
  client = new pg.Client({ connectionString: 'postgres://postgres@localhost/postgres' });

  await client.connect();
  await client.query(`CREATE DATABASE "${dbName}"`);

  await migrate(dbName);
  config.database.url = `postgres://postgres@localhost/${dbName}`;
});

after(async () => {
  const { db } = await import('./persistence/database.js');

  await db.$client.end();

  await client.query(`DROP DATABASE "${dbName}"`);
  await client.end();
});
