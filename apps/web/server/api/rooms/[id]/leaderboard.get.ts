import { gameSessions } from '#server/database/schema'
import { useAppDatabase } from '#server/utils/database'
import { enforceRateLimit } from '#layer/server/utils/rateLimit'
import { eq, isNotNull, and } from 'drizzle-orm'

const LIMIT = 50

export default defineEventHandler(async (event) => {
  await enforceRateLimit(event, 'api', 60, 60_000)

  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ statusCode: 400, message: 'Room id required' })
  }

  const db = useAppDatabase(event)

  const sessions = await db
    .select({
      playerName: gameSessions.playerName,
      startTime: gameSessions.startTime,
      endTime: gameSessions.endTime,
    })
    .from(gameSessions)
    .where(and(eq(gameSessions.roomId, id), isNotNull(gameSessions.endTime)))

  const withDuration = sessions
    .filter((s): s is typeof s & { endTime: string } => s.endTime != null)
    .map((s) => {
      const start = new Date(s.startTime).getTime()
      const end = new Date(s.endTime).getTime()
      return { playerName: s.playerName, endTime: s.endTime, durationMs: end - start }
    })
    .sort((a, b) => a.durationMs - b.durationMs)
    .slice(0, LIMIT)

  return withDuration.map((row, index) => ({
    rank: index + 1,
    playerName: row.playerName,
    durationMs: row.durationMs,
    endTime: row.endTime,
  }))
})
