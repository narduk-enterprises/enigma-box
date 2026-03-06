import { z } from 'zod'
import { rooms, puzzles } from '#server/database/schema'
import { useAppDatabase } from '#server/utils/database'
import { requireAuth } from '#layer/server/utils/auth'
import { hashAnswer } from '#server/utils/puzzle'
import { enforceRateLimit } from '#layer/server/utils/rateLimit'
import { eq } from 'drizzle-orm'

const bodySchema = z.object({
  sequenceOrder: z.number().int().min(0),
  puzzleType: z.enum(['text', 'code', 'image']),
  content: z.string().min(1),
  answer: z.string().min(1),
  hints: z.array(z.string()).optional(),
})

function generateId(): string {
  return crypto.getRandomValues(new Uint8Array(24)).reduce((acc, b) => acc + b.toString(16).padStart(2, '0'), '')
}

export default defineEventHandler(async (event) => {
  await enforceRateLimit(event, 'api', 30, 60_000)
  const user = await requireAuth(event)
  const db = useAppDatabase(event)

  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ statusCode: 400, message: 'Room id required' })
  }

  const [room] = await db.select().from(rooms).where(eq(rooms.id, id)).limit(1)
  if (!room || room.creatorId !== user.id) {
    throw createError({ statusCode: 404, message: 'Room not found' })
  }

  const body = await readBody(event).catch(() => ({}))
  const parsed = bodySchema.safeParse(body)
  if (!parsed.success) {
    throw createError({ statusCode: 400, message: parsed.error.message })
  }

  const puzzleId = generateId()
  const secretAnswerHash = await hashAnswer(parsed.data.answer)
  await db.insert(puzzles).values({
    id: puzzleId,
    roomId: id,
    sequenceOrder: parsed.data.sequenceOrder,
    puzzleType: parsed.data.puzzleType,
    content: parsed.data.content,
    secretAnswerHash,
    hints: parsed.data.hints ? JSON.stringify(parsed.data.hints) : null,
  })

  return {
    id: puzzleId,
    sequenceOrder: parsed.data.sequenceOrder,
    puzzleType: parsed.data.puzzleType,
    content: parsed.data.content,
  }
})
