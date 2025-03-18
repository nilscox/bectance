import { assert } from '../utils';

export const config = getConfig();

export interface Config {
  server: {
    host: string;
    port: number;
  };
  database: {
    url: string;
    debug: boolean;
  };
}

function getConfig(): Config {
  return {
    server: {
      host: getEnv('HOST'),
      port: Number(getEnv('PORT')),
    },
    database: {
      url: getEnv('DATABASE_URL'),
      debug: getEnv('DATABASE_DEBUG') === 'true',
    },
  };
}

function getEnv(name: string): string {
  const value = process.env[name];

  assert(value !== undefined, Error(`Missing environment variable "${name}"`));

  return value;
}
