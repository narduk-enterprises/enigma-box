/**
 * Puzzle answer hashing for EnigmaBox (SHA-256 of normalized answer).
 * Used for puzzle secret_answer_hash storage and verification.
 */

function bufferToHex(buf: ArrayBuffer | Uint8Array): string {
  const bytes = buf instanceof Uint8Array ? buf : new Uint8Array(buf)
  return [...bytes].map((b) => b.toString(16).padStart(2, '0')).join('')
}

/**
 * Hash an answer for storage or comparison (SHA-256 of normalized answer).
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
