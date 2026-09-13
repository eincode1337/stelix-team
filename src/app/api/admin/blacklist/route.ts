import { isAuthed } from '@/server/session'
import { json, readJson, searchParams, unauthorized } from '@/server/mock'
import { guardAdmin } from '@/server/adminActions'
import { parseListParams } from '@/server/adminData'
import { Admin } from '@/server/db/store'

export const dynamic = 'force-dynamic'

export function GET(request: Request) {
  if (!isAuthed(request)) return unauthorized()
  const params = parseListParams(searchParams(request))
  return json(Admin.adminList('blacklist', params))
}

export async function POST(request: Request) {
  const denied = guardAdmin(request)
  if (denied) return denied

  const body = await readJson(request)
  const action = typeof body.action === 'string' ? body.action : 'add'
  if (action !== 'add' && action !== 'create') {
    return json({ ok: false, error: 'unknown_action' }, 400)
  }

  const data: Record<string, unknown> = { ...body }
  delete data.action
  const result = Admin.adminMutate('blacklist', 'new', action, data)
  if (!result.ok) return json({ ok: false, error: 'bad_request' }, 400)
  return json({ ok: true, item: result.item })
}
