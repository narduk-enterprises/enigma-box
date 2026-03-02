export function useAdminRooms() {
  return useFetch<Array<{ id: string; title: string; description: string | null; createdAt: string }>>('/api/admin/rooms', {
    key: 'admin-rooms',
  })
}
