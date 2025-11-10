import { Pool } from 'pg';
import type { QueryResult, QueryResultRow } from 'pg';

const connectionString = process.env.DATABASE_URL || '';

export const pool = new Pool({
  connectionString,
  // Optional: tune pool size
  max: 10,
});

export async function query<T extends QueryResultRow = QueryResultRow>(
  text: string,
  params?: ReadonlyArray<unknown>
): Promise<QueryResult<T>> {
  if (params && params.length > 0) {
    return pool.query<T>(text, params as unknown as never[]);
  }
  return pool.query<T>(text);
}
