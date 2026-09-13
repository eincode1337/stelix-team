import { getSessionUserId, isAuthed } from '@/server/session'
import { json, searchParams, unauthorized } from '@/server/mock'
import { parseListParams } from '@/server/adminData'
import { Admin, Users } from '@/server/db/store'

export const dynamic = 'force-dynamic'

export function GET(request: Request) {
  if (!isAuthed(request)) return unauthorized()
  const params = parseListParams(searchParams(request))
  const paged = Admin.adminList('users', params)
  const uid = getSessionUserId(request)
  const role = (uid != null ? Users.getUser(uid)?.role : null) ?? 'AGENT'
  return json({ ...paged, viewer: { role } })
}
