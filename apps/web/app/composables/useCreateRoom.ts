export function useCreateRoom() {
  const { $csrfFetch } = useNuxtApp()

  return {
    async createRoom(payload: { title: string; description?: string }) {
      return $csrfFetch<{ id: string; title: string; description: string | null }>('/api/admin/rooms', {
        method: 'POST',
        body: payload,
      })
    },
  }
}
