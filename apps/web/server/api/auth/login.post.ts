import { z } from 'zod'
import { users } from '#server/database/schema'
import { useAppDatabase } from '#server/utils/database'
import { verifyPassword, createSession } from '#server/utils/auth'
import { enforceRateLimit } from '#layer/server/utils/rateLimit'
import { eq } from 'drizzle-orm'

const bodySchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

export default defineEventHandler(async (event) => {
  await enforceRateLimit(event, 'auth', 10, 60_000)

  const body = await readBody(event).catch(() => ({}))
  const parsed = bodySchema.safeParse(body)
  if (!parsed.success) {
    throw createError({ statusCode: 400, message: parsed.error.message })
  }

  const { email, password } = parsed.data
  const db = useAppDatabase(event)

  const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1)
  if (!user?.passwordHash || !(await verifyPassword(password, user.passwordHash))) {
    throw createError({ statusCode: 401, message: 'Invalid email or password' })
  }

  await createSession(event, user.id)
  return { ok: true, userId: user.id }
})
