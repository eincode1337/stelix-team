import { getSessionUserId, isAuthed } from '@/server/session'
import { json, unauthorized } from '@/server/mock'
import { Users } from '@/server/db/store'

export const dynamic = 'force-dynamic'

export function POST(request: Request) {
  if (!isAuthed(request)) return unauthorized()
  return json({ ok: true })
}

export function DELETE(request: Request) {
  const userId = getSessionUserId(request)
  if (userId === null) return unauthorized()
  const role = Users.getUser(userId)?.role ?? 'MODERATOR'
  return json({ role })
}
