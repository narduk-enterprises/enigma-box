import { z } from 'zod'
import { puzzles, gameSessions } from '#server/database/schema'
import { useAppDatabase } from '#server/utils/database'
import { verifyAnswer } from '#server/utils/auth'
import { enforceRateLimit } from '#layer/server/utils/rateLimit'
import { eq, asc } from 'drizzle-orm'

const bodySchema = z.object({
  answer: z.string(),
  sessionId: z.string().min(1),
})

export default defineEventHandler(async (event) => {
  await enforceRateLimit(event, 'api', 30, 60_000)

  const id = getRouterParam(event, 'id')
  const body = await readBody(event).catch(() => ({}))
  const parsed = bodySchema.safeParse(body)
  if (!id || !parsed.success) {
    throw createError({ statusCode: 400, message: parsed.error?.message ?? 'Room id and sessionId required' })
  }

  const { answer, sessionId } = parsed.data
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
    return { correct: false, completed: true, message: 'Room already completed' }
  }

  const currentPuzzleId = session.currentPuzzleId
  if (!currentPuzzleId) {
    return { correct: false, completed: true }
  }

  const [puzzle] = await db.select().from(puzzles).where(eq(puzzles.id, currentPuzzleId)).limit(1)
  if (!puzzle) {
    throw createError({ statusCode: 500, message: 'Puzzle not found' })
  }

  const correct = await verifyAnswer(answer, puzzle.secretAnswerHash)
  if (!correct) {
    return { correct: false, completed: false }
  }

  const roomPuzzles = await db.select().from(puzzles).where(eq(puzzles.roomId, id)).orderBy(asc(puzzles.sequenceOrder))
  const currentIndex = roomPuzzles.findIndex((p: { id: string }) => p.id === currentPuzzleId)
  const nextPuzzle = currentIndex >= 0 && currentIndex < roomPuzzles.length - 1 ? roomPuzzles[currentIndex + 1]! : null

  if (nextPuzzle) {
    await db
      .update(gameSessions)
      .set({ currentPuzzleId: nextPuzzle.id })
      .where(eq(gameSessions.id, sessionId))
    return {
      correct: true,
      completed: false,
      nextPuzzle: {
        id: nextPuzzle.id,
        sequenceOrder: nextPuzzle.sequenceOrder,
        puzzleType: nextPuzzle.puzzleType,
        content: nextPuzzle.content,
        hints: nextPuzzle.hints ? (JSON.parse(nextPuzzle.hints) as string[]) : null,
      },
    }
  }

  const endTime = new Date().toISOString()
  await db
    .update(gameSessions)
    .set({ currentPuzzleId: null, endTime })
    .where(eq(gameSessions.id, sessionId))

  return { correct: true, completed: true, endTime }
})
