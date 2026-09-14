import { db_supabase } from '../../_/db_adapter'

export default defineEventHandler(async (event) => {
  return await db_supabase.Reads(event)
})
