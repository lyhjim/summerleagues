import { neon } from '@neondatabase/serverless'

// Lazily resolve the connection string at request time. Using the
// @neondatabase/serverless HTTP driver (instead of pg's TCP Pool) so it
// works reliably in serverless / sandbox environments.
function getSql() {
  const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL
  if (!connectionString) {
    return null
  }
  return neon(connectionString)
}

export async function query(text: string, params?: (string | number)[]) {
  const sql = getSql()
  if (!sql) {
    throw new Error('Database connection not available')
  }
  // The neon HTTP driver returns the rows array directly from .query().
  // Wrap it in { rows } to preserve the pg-compatible interface callers expect.
  const rows = await sql.query(text, params)
  return { rows: rows as any[] }
}
