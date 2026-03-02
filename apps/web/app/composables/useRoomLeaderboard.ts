import { formatDuration } from '~/utils/formatDuration'

export type LeaderboardEntry = {
  rank: number
  playerName: string
  durationMs: number
  endTime: string
}

export function useRoomLeaderboard(roomId: string) {
  const fetchResult = useFetch<LeaderboardEntry[]>(`/api/rooms/${roomId}/leaderboard`, {
    key: `leaderboard-${roomId}`,
  })
  return { ...fetchResult, formatDuration }
}
