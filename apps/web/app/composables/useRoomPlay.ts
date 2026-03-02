export function useRoomPlay(roomId: string) {
  const { $csrfFetch } = useNuxtApp()

  return {
    async start(payload: { playerName: string }) {
      return $csrfFetch<{
        sessionId: string
        room: { id: string; title: string; description: string | null }
        puzzle: {
          id: string
          sequenceOrder: number
          puzzleType: string
          content: string
          hints: string[] | null
        }
      }>(`/api/rooms/${roomId}/start`, {
        method: 'POST',
        body: payload,
      })
    },
    async verify(payload: { answer: string; sessionId: string }) {
      return $csrfFetch<{
        correct: boolean
        completed?: boolean
        nextPuzzle?: {
          id: string
          sequenceOrder: number
          puzzleType: string
          content: string
          hints: string[] | null
        }
      }>(`/api/rooms/${roomId}/verify`, {
        method: 'POST',
        body: payload,
      })
    },
  }
}
