import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';
import dotenv from 'dotenv';

dotenv.config();

const postgresUrl = process.env.POSTGRES_URL ?? process.env.DATABASE_URL;
if (!postgresUrl) {
  throw new Error('POSTGRES_URL (or DATABASE_URL) environment variable is not set');
}

// Auto-enable TLS for hosted Postgres providers (Supabase, Render, etc)
const postgresSslEnv = process.env.POSTGRES_SSL?.toLowerCase();
const ssl =
  postgresSslEnv === 'require'
    ? 'require'
    : postgresSslEnv === 'disable'
      ? false
      : /supabase\.com|pooler/i.test(postgresUrl)
        ? 'require'
        : undefined;

// Create postgres client with connection timeout
export const client = postgres(postgresUrl, {
  connect_timeout: 30,
  max: 10,
  idle_timeout: 30,
  max_lifetime: 60 * 30, // 30 minutes
  ...(ssl === undefined ? {} : { ssl }),
});

export const db = drizzle(client, { schema });
