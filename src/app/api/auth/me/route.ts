import { serializeAuthMeUser, Users } from '@/server/db/store'
import { json } from '@/server/mock'
import { getSessionUserId } from '@/server/session'

export function GET(request: Request) {
  const userId = getSessionUserId(request)
  const user = userId == null ? null : Users.getUser(userId)
  return json({ user: user ? serializeAuthMeUser(user) : null })
}
