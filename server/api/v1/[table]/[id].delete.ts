import { db_supabase } from '../../_/db_adapter'

export default defineEventHandler(async (event): Promise<{ success: boolean }> => {
  return await db_supabase.Delete(event)
})
