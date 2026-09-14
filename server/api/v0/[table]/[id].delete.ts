import { db_low } from '../../_/db_adapter'

export default defineEventHandler(async (event): Promise<{ success: boolean }> => {
  return await db_low.Delete(event)
})
