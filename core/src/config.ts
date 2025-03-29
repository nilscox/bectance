import { assert } from './utils.js';

export const config = getConfig();

export interface Config {
  database: {
    url: string;
    debug: boolean;
  };
}

function getConfig(): Config {
  return {
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
