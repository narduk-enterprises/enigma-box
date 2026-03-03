import { describe, it, expect } from 'vitest'
import { safeParseHints } from '../../server/utils/parse'

describe('safeParseHints', () => {
  it('returns null for null input', () => {
    expect(safeParseHints(null)).toBeNull()
  })

  it('returns null for empty string', () => {
    expect(safeParseHints('')).toBeNull()
  })

  it('parses valid JSON array of strings', () => {
    expect(safeParseHints('["hint1","hint2"]')).toEqual(['hint1', 'hint2'])
  })

  it('parses empty JSON array', () => {
    expect(safeParseHints('[]')).toEqual([])
  })

  it('returns null for malformed JSON', () => {
    expect(safeParseHints('{corrupted')).toBeNull()
  })

  it('returns null for non-array JSON', () => {
    expect(safeParseHints('"just a string"')).toBeNull()
  })

  it('returns null for JSON object', () => {
    expect(safeParseHints('{"key":"value"}')).toBeNull()
  })
})
