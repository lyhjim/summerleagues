'use server'

import { neon } from '@neondatabase/serverless'

const LEAGUE_ID = 'sanma'
const CURRENT_SEASON = '2026-summer'

function getSql() {
  const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL
  if (!connectionString) {
    return null
  }
  return neon(connectionString)
}

/**
 * Execute a query for 3ma league with automatic league_id and season filtering
 */
export async function querySanma(text: string, params?: (string | number | boolean)[]) {
  const sql = getSql()
  if (!sql) {
    throw new Error('Database connection not available')
  }
  
  const rows = await sql.query(text, params)
  return { rows: rows as any[] }
}

export const SANMA = {
  LEAGUE_ID,
  CURRENT_SEASON,
}
