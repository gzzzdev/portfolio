import { db_low } from '../../_/db_adapter'

type iDB = any
export default defineEventHandler(async (event): Promise<iDB[]> => {
  return await db_low.BulkCreate(event)
})
