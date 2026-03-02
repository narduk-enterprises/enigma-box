export type PublicRoom = {
  id: string
  title: string
  description: string | null
  createdAt: string
  puzzleCount: number
}

export function usePublicRooms() {
  return useFetch<PublicRoom[]>('/api/rooms', {
    key: 'public-rooms',
  })
}
