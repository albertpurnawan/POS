import { Pool } from 'pg';

const connectionString = process.env.DATABASE_URL || '';

export const pool = new Pool({
  connectionString,
  // Optional: tune pool size
  max: 10,
});

export async function query<T = any>(text: string, params?: any[]): Promise<{ rows: T[] }>{
  return pool.query(text, params);
}

