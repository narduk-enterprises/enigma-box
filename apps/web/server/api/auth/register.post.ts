import { z } from 'zod'
import { users } from '#server/database/schema'
import { useAppDatabase } from '#server/utils/database'
import { hashPassword, createSession } from '#server/utils/auth'
import { enforceRateLimit } from '#layer/server/utils/rateLimit'
import { eq } from 'drizzle-orm'

const bodySchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(1).optional(),
})

export default defineEventHandler(async (event) => {
  try {
    await enforceRateLimit(event, 'auth', 10, 60_000)

    const body = await readBody(event).catch(() => ({}))
    const parsed = bodySchema.safeParse(body)
    if (!parsed.success) {
      throw createError({ statusCode: 400, message: parsed.error?.message ?? 'Invalid input' })
    }

    const { email, password, name } = parsed.data
    const db = useAppDatabase(event)

    const [existing] = await db.select().from(users).where(eq(users.email, email)).limit(1)
    if (existing) {
      throw createError({ statusCode: 409, message: 'Email already registered' })
    }

    const id = crypto.randomUUID()
    const passwordHash = await hashPassword(password)
    const now = new Date().toISOString()
    await db.insert(users).values({
      id,
      email,
      passwordHash,
      name: name ?? null,
      createdAt: now,
      updatedAt: now,
    })

    try {
      await createSession(event, id)
    } catch {
      // User created; session/cookie may fail in some edge runtimes
      return { ok: true, userId: id }
    }

    return { ok: true, userId: id }
  } catch (err: unknown) {
    if (err && typeof err === 'object' && 'statusCode' in err && typeof (err as { statusCode: number }).statusCode === 'number') {
      throw err
    }
    throw createError({ statusCode: 500, message: 'Registration failed' })
  }
})
