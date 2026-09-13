import { isAuthed } from '@/server/session'
import { json, unauthorized } from '@/server/mock'
import { Admin } from '@/server/db/store'

export const dynamic = 'force-dynamic'

export function GET(request: Request) {
  if (!isAuthed(request)) return unauthorized()
  return json(Admin.adminStats())
}
