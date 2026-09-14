import { db_supabase } from '../../_/db_adapter'

type iDB = any
export default defineEventHandler(async (event): Promise<iDB> => {
  return await db_supabase.Create(event)
})
