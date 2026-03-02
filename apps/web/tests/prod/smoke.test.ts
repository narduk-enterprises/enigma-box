/**
 * Production smoke tests. Run against the deployed app to verify it's up and core flows work.
 *
 * Usage:
 *   pnpm run test:prod
 *   ENIGMA_BOX_BASE_URL=https://enigma-box.narduk.workers.dev pnpm run test:prod
 */

import { describe, it, expect } from 'vitest'

const BASE_URL = process.env.ENIGMA_BOX_BASE_URL ?? 'https://enigma-box.narduk.workers.dev'
const CSRF_HEADERS = { 'Content-Type': 'application/json', 'X-Requested-With': 'XMLHttpRequest' }

function parseSetCookie(header: string | null): string {
  if (!header) return ''
  const first = header.split(',')[0]?.trim() ?? ''
  return first.split(';')[0] ?? ''
}

describe('prod smoke', () => {
  it('GET / returns 200 and EnigmaBox content', async () => {
    const res = await fetch(BASE_URL)
    expect(res.status).toBe(200)
    const html = await res.text()
    expect(html).toContain('EnigmaBox')
  })

  it('GET /api/health returns ok and database ok', async () => {
    const res = await fetch(`${BASE_URL}/api/health`)
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.success).toBe(true)
    expect(data.data?.status).toBe('ok')
    expect(data.data?.database).toBe('ok')
  })

  it('GET /api/auth/me without cookie returns 401', async () => {
    const res = await fetch(`${BASE_URL}/api/auth/me`, { headers: { 'X-Requested-With': 'XMLHttpRequest' } })
    expect(res.status).toBe(401)
  })

  it('full flow: register -> me -> create room -> add puzzle -> start game -> verify', async () => {
    const email = `smoke-${Date.now()}@example.com`
    let cookie = ''

    const registerRes = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: CSRF_HEADERS,
      body: JSON.stringify({ email, password: 'testpass123', name: 'Smoke User' }),
    })
    expect(registerRes.status).toBe(200)
    const registerData = await registerRes.json()
    expect(registerData.ok).toBe(true)
    expect(registerData.userId).toBeDefined()
    cookie = parseSetCookie(registerRes.headers.get('set-cookie'))
    expect(cookie).toBeTruthy()

    const meRes = await fetch(`${BASE_URL}/api/auth/me`, {
      headers: { Cookie: cookie, 'X-Requested-With': 'XMLHttpRequest' },
    })
    expect(meRes.status).toBe(200)
    const meData = await meRes.json()
    expect(meData.email).toBe(email)

    const createRoomRes = await fetch(`${BASE_URL}/api/admin/rooms`, {
      method: 'POST',
      headers: { ...CSRF_HEADERS, Cookie: cookie },
      body: JSON.stringify({ title: 'Smoke Room', description: 'Prod smoke test' }),
    })
    expect(createRoomRes.status).toBe(200)
    const roomData = await createRoomRes.json()
    const roomId = roomData.id
    expect(roomId).toBeDefined()

    const addPuzzleRes = await fetch(`${BASE_URL}/api/admin/rooms/${roomId}/puzzles`, {
      method: 'POST',
      headers: { ...CSRF_HEADERS, Cookie: cookie },
      body: JSON.stringify({
        sequenceOrder: 0,
        puzzleType: 'text',
        content: 'What is 1+1?',
        answer: '2',
        hints: [],
      }),
    })
    expect(addPuzzleRes.status).toBe(200)
    const puzzleData = await addPuzzleRes.json()
    expect(puzzleData.id).toBeDefined()

    const startRes = await fetch(`${BASE_URL}/api/rooms/${roomId}/start`, {
      method: 'POST',
      headers: CSRF_HEADERS,
      body: JSON.stringify({ playerName: 'Smoke Player' }),
    })
    expect(startRes.status).toBe(200)
    const startData = await startRes.json()
    const sessionId = startData.sessionId
    expect(sessionId).toBeDefined()
    expect(startData.puzzle?.content).toContain('1+1')

    const verifyWrongRes = await fetch(`${BASE_URL}/api/rooms/${roomId}/verify`, {
      method: 'POST',
      headers: CSRF_HEADERS,
      body: JSON.stringify({ answer: '3', sessionId }),
    })
    expect(verifyWrongRes.status).toBe(200)
    const wrongData = await verifyWrongRes.json()
    expect(wrongData.correct).toBe(false)

    const verifyCorrectRes = await fetch(`${BASE_URL}/api/rooms/${roomId}/verify`, {
      method: 'POST',
      headers: CSRF_HEADERS,
      body: JSON.stringify({ answer: '2', sessionId }),
    })
    expect(verifyCorrectRes.status).toBe(200)
    const correctData = await verifyCorrectRes.json()
    expect(correctData.correct).toBe(true)
    expect(correctData.completed).toBe(true)
    expect(correctData.endTime).toBeDefined()
  })
})
