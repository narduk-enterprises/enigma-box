/**
 * Safely parse a JSON hints string from the database.
 * Returns null if the value is falsy or not valid JSON.
 */
export function safeParseHints(raw: string | null): string[] | null {
  if (!raw) return null
  try {
    return JSON.parse(raw) as string[]
  } catch {
    return null
  }
}
