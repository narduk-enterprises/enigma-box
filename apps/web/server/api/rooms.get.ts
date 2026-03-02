import { rooms, puzzles } from '#server/database/schema'
import { useAppDatabase } from '#server/utils/database'
import { enforceRateLimit } from '#layer/server/utils/rateLimit'
import { inArray, sql } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  await enforceRateLimit(event, 'api', 60, 60_000)

  const db = useAppDatabase(event)

  const counts = await db
    .select({
      roomId: puzzles.roomId,
      puzzleCount: sql<number>`count(*)`.as('puzzle_count'),
    })
    .from(puzzles)
    .groupBy(puzzles.roomId)

  if (counts.length === 0) {
    return []
  }

  const roomIds = counts.map((c) => c.roomId)
  const countByRoom = Object.fromEntries(counts.map((c) => [c.roomId, Number(c.puzzleCount)]))

  const list = await db
    .select({
      id: rooms.id,
      title: rooms.title,
      description: rooms.description,
      createdAt: rooms.createdAt,
    })
    .from(rooms)
    .where(inArray(rooms.id, roomIds))
    .orderBy(rooms.createdAt)

  return list.map((r) => ({
    id: r.id,
    title: r.title,
    description: r.description ?? null,
    createdAt: r.createdAt,
    puzzleCount: countByRoom[r.id] ?? 0,
  }))
})
