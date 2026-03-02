import { getSessionUser } from '#server/utils/auth'

export default defineEventHandler(async (event) => {
  const user = await getSessionUser(event)
  if (!user) {
    throw createError({ statusCode: 401, message: 'Not authenticated' })
  }
  return {
    id: user.id,
    email: user.email,
    name: user.name,
  }
})
