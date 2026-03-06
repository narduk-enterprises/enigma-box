import { rooms, type Room } from '#server/database/schema'
import { useAppDatabase } from '#server/utils/database'
import { requireAuth } from '#layer/server/utils/auth'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const db = useAppDatabase(event)

  const list = await db.select().from(rooms).where(eq(rooms.creatorId, user.id))
  return list.map((r: Room) => ({ id: r.id, title: r.title, description: r.description, createdAt: r.createdAt }))
})
