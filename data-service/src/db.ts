import pg from 'pg';

const { Pool } = pg;

export interface DbConfig {
  host: string;
  port: number;
  database: string;
  user: string;
  password: string;
}

let pool: pg.Pool | null = null;

export function initDb(config: DbConfig): void {
  pool = new Pool(config);
}

export function getPool(): pg.Pool {
  if (!pool) {
    throw new Error('Database not initialized. Call initDb() first.');
  }
  return pool;
}

export interface QueryResult<T> {
  rows: T[];
  rowCount: number;
}

function convertNamedParams(sql: string, params: Record<string, unknown>): { text: string; values: unknown[] } {
  const values: unknown[] = [];
  let paramIndex = 1;
  const paramMap = new Map<string, number>();

  const text = sql.replace(/:(\w+)/g, (_, paramName: string) => {
    if (!paramMap.has(paramName)) {
      paramMap.set(paramName, paramIndex++);
      values.push(params[paramName]);
    }
    return `$${paramMap.get(paramName)}`;
  });

  return { text, values };
}

export async function query<T>(
  sql: string,
  params: Record<string, unknown> = {}
): Promise<QueryResult<T>> {
  const pool = getPool();
  const { text, values } = convertNamedParams(sql, params);
  const result = await pool.query(text, values);
  return {
    rows: result.rows as T[],
    rowCount: result.rowCount ?? 0,
  };
}

export async function get<T, R>(
  sql: string,
  mapper: (row: T) => R,
  params: Record<string, unknown> = {}
): Promise<R[]> {
  const result = await query<T>(sql, params);
  return result.rows.map(mapper);
}

export async function getOne<T, R>(
  sql: string,
  mapper: (row: T) => R,
  params: Record<string, unknown> = {}
): Promise<R | null> {
  const results = await get(sql, mapper, params);
  return results[0] ?? null;
}

export async function execute(
  sql: string,
  params: Record<string, unknown> = {}
): Promise<number> {
  const result = await query(sql, params);
  return result.rowCount;
}

export async function closeDb(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = null;
  }
}
