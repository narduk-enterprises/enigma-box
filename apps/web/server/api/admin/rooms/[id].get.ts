import { rooms, puzzles, type Puzzle } from '#server/database/schema'
import { useAppDatabase } from '#server/utils/database'
import { requireAuth } from '#server/utils/auth'
import { eq, asc } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ statusCode: 400, message: 'Room id required' })
  }

  const db = useAppDatabase(event)
  const [room] = await db.select().from(rooms).where(eq(rooms.id, id)).limit(1)
  if (!room || room.creatorId !== user.id) {
    throw createError({ statusCode: 404, message: 'Room not found' })
  }

  const puzzleList = await db.select().from(puzzles).where(eq(puzzles.roomId, id)).orderBy(asc(puzzles.sequenceOrder))
  const puzzlesSafe = puzzleList.map((p: Puzzle) => ({
    id: p.id,
    sequenceOrder: p.sequenceOrder,
    puzzleType: p.puzzleType,
    content: p.content,
    hints: p.hints ? (JSON.parse(p.hints) as string[]) : null,
  }))

  return {
    id: room.id,
    title: room.title,
    description: room.description,
    createdAt: room.createdAt,
    puzzles: puzzlesSafe,
  }
})
