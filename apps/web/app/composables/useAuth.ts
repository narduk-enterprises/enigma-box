/**
 * Reactive auth state. Uses useState for SSR safety and useFetch for /api/auth/me.
 */
export function useAuth() {
  const user = useState<{ id: string; email: string; name: string | null } | null>('auth:user', () => null)

  const { data: me, pending, refresh } = useFetch<{ id: string; email: string; name: string | null } | null>('/api/auth/me', {
    key: 'auth:me',
    immediate: true,
  })

  watch(me, (v) => {
    user.value = v ?? null
  }, { immediate: true })

  const isAuthenticated = computed(() => !!user.value)

  async function logout() {
    const { $csrfFetch } = useNuxtApp()
    await $csrfFetch('/api/auth/logout', { method: 'POST' })
    user.value = null
    await refreshNuxtData()
  }

  return { user, isAuthenticated, pending, logout, refresh }
}
