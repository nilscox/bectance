import 'dotenv/config';
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  dialect: 'postgresql',
  schema: './src/server/persistence/schema.ts',
  dbCredentials: {
    url: process.env.DATABASE_URL as string,
  },
});
