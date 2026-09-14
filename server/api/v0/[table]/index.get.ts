import { db_low } from '../../_/db_adapter'

export default defineEventHandler(async (event) => {
  return await db_low.Reads(event)
})
