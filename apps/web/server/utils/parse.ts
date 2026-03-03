/**
 * Safely parse a JSON hints string from the database.
 * Returns null if the value is falsy, not valid JSON, or not an array.
 */
export function safeParseHints(raw: string | null): string[] | null {
  if (!raw) return null
  try {
    const parsed: unknown = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : null
  } catch {
    return null
  }
}
