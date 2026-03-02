export function useAddPuzzle(roomId: string) {
  const { $csrfFetch } = useNuxtApp()

  return {
    async addPuzzle(payload: {
      sequenceOrder: number
      puzzleType: 'text' | 'code' | 'image'
      content: string
      answer: string
      hints?: string[]
    }) {
      return $csrfFetch<{ id: string; sequenceOrder: number; puzzleType: string; content: string }>(
        `/api/admin/rooms/${roomId}/puzzles`,
        { method: 'POST', body: payload },
      )
    },
  }
}
