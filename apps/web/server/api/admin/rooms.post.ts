import { z } from 'zod'
import { rooms } from '#server/database/schema'
import { useAppDatabase } from '#server/utils/database'
import { requireAuth } from '../../utils/auth'
import { enforceRateLimit } from '#layer/server/utils/rateLimit'

const bodySchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
})

export default defineEventHandler(async (event) => {
  await enforceRateLimit(event, 'api', 20, 60_000)
  const user = await requireAuth(event)
  const db = useAppDatabase(event)

  const body = await readBody(event).catch(() => {
    throw createError({ statusCode: 400, message: 'Invalid request body' })
  })
  const parsed = bodySchema.safeParse(body)
  if (!parsed.success) {
    throw createError({ statusCode: 400, message: parsed.error.issues[0]?.message ?? 'Invalid input' })
  }

  const id = crypto.randomUUID()
  await db.insert(rooms).values({
    id,
    title: parsed.data.title,
    description: parsed.data.description ?? null,
    creatorId: user.id,
  })

  return { id, title: parsed.data.title, description: parsed.data.description ?? null }
})
