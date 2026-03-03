import { rooms, puzzles, gameSessions } from '#server/database/schema'
import { useAppDatabase } from '#server/utils/database'
import { safeParseHints } from '#server/utils/parse'
import { enforceRateLimit } from '#layer/server/utils/rateLimit'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  await enforceRateLimit(event, 'api', 60, 60_000)

  const id = getRouterParam(event, 'id')
  const sessionId = getHeader(event, 'x-game-session')
  if (!id || !sessionId) {
    throw createError({ statusCode: 400, message: 'Room id and X-Game-Session header required' })
  }

  const db = useAppDatabase(event)

  const [session] = await db
    .select()
    .from(gameSessions)
    .where(eq(gameSessions.id, sessionId))
    .limit(1)
  if (!session || session.roomId !== id) {
    throw createError({ statusCode: 404, message: 'Session not found' })
  }
  if (session.endTime) {
    return { completed: true, message: 'Room already completed' }
  }

  const currentPuzzleId = session.currentPuzzleId
  if (!currentPuzzleId) {
    return { completed: true, message: 'Room completed' }
  }

  const [puzzle] = await db.select().from(puzzles).where(eq(puzzles.id, currentPuzzleId)).limit(1)
  if (!puzzle) {
    throw createError({ statusCode: 500, message: 'Current puzzle not found' })
  }

  const [room] = await db.select().from(rooms).where(eq(rooms.id, id)).limit(1)

  return {
    completed: false,
    room: room ? { id: room.id, title: room.title } : null,
    puzzle: {
      id: puzzle.id,
      sequenceOrder: puzzle.sequenceOrder,
      puzzleType: puzzle.puzzleType,
      content: puzzle.content,
      hints: safeParseHints(puzzle.hints),
    },
  }
})
