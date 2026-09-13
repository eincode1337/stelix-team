import { isAuthed } from '@/server/session'
import { json, searchParams, unauthorized } from '@/server/mock'
import { parseListParams } from '@/server/adminData'
import { Admin } from '@/server/db/store'

export const dynamic = 'force-dynamic'

export function GET(request: Request) {
  if (!isAuthed(request)) return unauthorized()
  const params = parseListParams(searchParams(request))
  return json(Admin.adminList('purchases', params))
}
