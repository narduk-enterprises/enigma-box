import { users } from '#server/database/schema'
import { useAppDatabase } from '#server/utils/database'

export default defineEventHandler(async (event) => {
  const db = useAppDatabase(event)
  // Ensure the users table is accessible, verifying D1 and schema
  return await db.select().from(users).limit(5)
})
