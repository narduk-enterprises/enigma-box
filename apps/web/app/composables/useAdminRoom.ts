export function useAdminRoom(roomId: string) {
  return useFetch<{
    id: string
    title: string
    description: string | null
    createdAt: string
    puzzles: Array<{
      id: string
      sequenceOrder: number
      puzzleType: string
      content: string
      hints: string[] | null
    }>
  }>(`/api/admin/rooms/${roomId}`, { key: () => `admin-room-${roomId}` })
}
