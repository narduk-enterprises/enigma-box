export function useAuthApi() {
  const { $csrfFetch } = useNuxtApp()

  return {
    async login(payload: { email: string; password: string }) {
      return $csrfFetch<{ ok: boolean; userId: string }>('/api/auth/login', {
        method: 'POST',
        body: payload,
      })
    },
    async register(payload: { email: string; password: string; name?: string }) {
      return $csrfFetch<{ ok: boolean; userId: string }>('/api/auth/register', {
        method: 'POST',
        body: payload,
      })
    },
    async logout() {
      return $csrfFetch<{ ok: boolean }>('/api/auth/logout', { method: 'POST' })
    },
  }
}
