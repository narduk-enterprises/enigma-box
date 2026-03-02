import { z } from 'zod'
import { rooms, puzzles, gameSessions } from '#server/database/schema'
import { useAppDatabase } from '#server/utils/database'
import { enforceRateLimit } from '#layer/server/utils/rateLimit'
import { eq, asc } from 'drizzle-orm'

const bodySchema = z.object({
  playerName: z.string().min(1).max(200),
})

function generateId(): string {
  return crypto.getRandomValues(new Uint8Array(24)).reduce((acc, b) => acc + b.toString(16).padStart(2, '0'), '')
}

export default defineEventHandler(async (event) => {
  await enforceRateLimit(event, 'api', 30, 60_000)

  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ statusCode: 400, message: 'Room id required' })
  }

  const body = await readBody(event).catch(() => ({}))
  const parsed = bodySchema.safeParse(body)
  if (!parsed.success) {
    throw createError({ statusCode: 400, message: parsed.error.message })
  }

  const db = useAppDatabase(event)

  const [room] = await db.select().from(rooms).where(eq(rooms.id, id)).limit(1)
  if (!room) {
    throw createError({ statusCode: 404, message: 'Room not found' })
  }

  const puzzleList = await db.select().from(puzzles).where(eq(puzzles.roomId, id)).orderBy(asc(puzzles.sequenceOrder))
  if (puzzleList.length === 0) {
    throw createError({ statusCode: 400, message: 'Room has no puzzles' })
  }

  const firstPuzzle = puzzleList[0]!
  const sessionId = generateId()
  const startTime = new Date().toISOString()
  await db.insert(gameSessions).values({
    id: sessionId,
    roomId: id,
    playerName: parsed.data.playerName,
    currentPuzzleId: firstPuzzle.id,
    startTime,
  })

  return {
    sessionId,
    startTime,
    room: { id: room.id, title: room.title, description: room.description },
    puzzle: {
      id: firstPuzzle.id,
      sequenceOrder: firstPuzzle.sequenceOrder,
      puzzleType: firstPuzzle.puzzleType,
      content: firstPuzzle.content,
      hints: firstPuzzle.hints ? (JSON.parse(firstPuzzle.hints) as string[]) : null,
    },
  }
})
