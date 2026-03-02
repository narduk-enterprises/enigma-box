export default defineNuxtRouteMiddleware(async () => {
  const me = await $fetch<{ id: string; email: string; name: string | null }>('/api/auth/me').catch(() => null)
  if (!me) {
    return navigateTo('/login')
  }
})
