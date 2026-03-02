import type { H3Event } from 'h3'
import { getCookie, setCookie, deleteCookie, getRequestURL } from 'h3'
import { users, sessions } from '#server/database/schema'
import { useAppDatabase } from './database'
import { eq, and, gt } from 'drizzle-orm'

const SESSION_COOKIE = 'enigma_session'
const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000 // 7 days

const PBKDF2_ITERATIONS = 100_000
const SALT_LEN = 16
const KEY_LEN = 32

function bufferToHex(buf: ArrayBuffer | Uint8Array): string {
  const bytes = buf instanceof Uint8Array ? buf : new Uint8Array(buf)
  return [...bytes].map((b) => b.toString(16).padStart(2, '0')).join('')
}

function hexToBuffer(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2)
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = Number.parseInt(hex.slice(i * 2, i * 2 + 2), 16)
  }
  return bytes
}

/**
 * Hash a password with PBKDF2-SHA256 (Web Crypto). Returns "saltHex:hashHex".
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(SALT_LEN))
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(password),
    'PBKDF2',
    false,
    ['deriveBits'],
  )
  const bits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: salt as BufferSource,
      iterations: PBKDF2_ITERATIONS,
      hash: 'SHA-256',
    },
    key,
    KEY_LEN * 8,
  )
  return `${bufferToHex(salt)}:${bufferToHex(bits)}`
}

/**
 * Verify a password against a stored "saltHex:hashHex" value.
 */
export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [saltHex, hashHex] = stored.split(':')
  if (!saltHex || !hashHex) return false
  const salt = hexToBuffer(saltHex)
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(password),
    'PBKDF2',
    false,
    ['deriveBits'],
  )
  const bits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: salt as BufferSource,
      iterations: PBKDF2_ITERATIONS,
      hash: 'SHA-256',
    },
    key,
    KEY_LEN * 8,
  )
  const hash = bufferToHex(bits)
  return hash === hashHex
}

/**
 * Hash an answer for storage or comparison (SHA-256 of normalized answer).
 * Used for puzzle secret_answer_hash.
 */
export async function hashAnswer(answer: string): Promise<string> {
  const normalized = answer.trim().toLowerCase()
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(normalized))
  return bufferToHex(buf)
}

/**
 * Verify a submitted answer against a stored secret_answer_hash.
 */
export async function verifyAnswer(submitted: string, storedHash: string): Promise<boolean> {
  const hash = await hashAnswer(submitted)
  return hash === storedHash
}

function generateId(): string {
  return crypto.getRandomValues(new Uint8Array(24)).reduce((acc, b) => acc + b.toString(16).padStart(2, '0'), '')
}

/**
 * Create a session for the user and set cookie. Returns session id.
 */
export async function createSession(event: H3Event, userId: string): Promise<string> {
  const db = useAppDatabase(event)
  const id = generateId()
  const expiresAt = Math.floor((Date.now() + SESSION_TTL_MS) / 1000)
  await db.insert(sessions).values({ id, userId, expiresAt })
  const url = getRequestURL(event)
  setCookie(event, SESSION_COOKIE, id, {
    httpOnly: true,
    secure: url.protocol === 'https:',
    sameSite: 'lax',
    maxAge: Math.floor(SESSION_TTL_MS / 1000),
    path: '/',
  })
  return id
}

/**
 * Remove session and clear cookie.
 */
export async function destroySession(event: H3Event): Promise<void> {
  const db = useAppDatabase(event)
  const id = getCookie(event, SESSION_COOKIE)
  if (id) {
    await db.delete(sessions).where(eq(sessions.id, id))
  }
  deleteCookie(event, SESSION_COOKIE, { path: '/' })
}

/**
 * Get current user from session cookie. Returns null if not authenticated or expired.
 */
export async function getSessionUser(event: H3Event): Promise<typeof users.$inferSelect | null> {
  const id = getCookie(event, SESSION_COOKIE)
  if (!id) return null
  const db = useAppDatabase(event)
  const [session] = await db
    .select()
    .from(sessions)
    .where(and(eq(sessions.id, id), gt(sessions.expiresAt, Math.floor(Date.now() / 1000))))
    .limit(1)
  if (!session) return null
  const [user] = await db.select().from(users).where(eq(users.id, session.userId)).limit(1)
  return user ?? null
}

/**
 * Require authenticated user. Throws 401 if not logged in.
 */
export async function requireAuth(event: H3Event): Promise<typeof users.$inferSelect> {
  const user = await getSessionUser(event)
  if (!user) {
    throw createError({ statusCode: 401, message: 'Unauthorized' })
  }
  return user
}
