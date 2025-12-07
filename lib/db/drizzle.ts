import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';
import dotenv from 'dotenv';

dotenv.config();

if (!process.env.POSTGRES_URL) {
  throw new Error('POSTGRES_URL environment variable is not set');
}

// Create postgres client with connection timeout
export const client = postgres(process.env.POSTGRES_URL, {
  connect_timeout: 30,
  max: 10,
  idle_timeout: 30,
  max_lifetime: 60 * 30, // 30 minutes
});

export const db = drizzle(client, { schema });
