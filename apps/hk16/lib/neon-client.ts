'use server'

import { neon } from '@neondatabase/serverless'

const databaseUrl = process.env.DATABASE_URL
if (!databaseUrl) {
  throw new Error('DATABASE_URL environment variable is not set')
}

const sql = neon(databaseUrl)

export const HK16 = {
  LEAGUE_ID: 'hk16',
  CURRENT_SEASON: '2026-spring',
} as const

// Helper to query HK16-specific data
export async function queryHK16(query: string, params: any[] = []) {
  try {
    const result = await sql(query, params)
    return { rows: result }
  } catch (error) {
    console.error('[v0] HK16 query error:', error)
    throw error
  }
}
