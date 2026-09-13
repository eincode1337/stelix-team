import { isAuthed } from '@/server/session'
import { json, searchParams, unauthorized } from '@/server/mock'
import { filterAndPaginate, parseListParams } from '@/server/adminData'
import { Admin } from '@/server/db/store'
import type { AdminDelivery, ListParams } from '@/server/db/store'

export const dynamic = 'force-dynamic'

const ALL_ROWS: ListParams = { page: 1, pageSize: Number.MAX_SAFE_INTEGER, q: '', status: '', role: '' }

export function GET(request: Request) {
  if (!isAuthed(request)) return unauthorized()
  const params = parseListParams(searchParams(request))
  const rows = Admin.adminList('deliveries', ALL_ROWS).items as unknown as AdminDelivery[]
  return json(
    filterAndPaginate(rows, params, {
      text: (d) => [d.user, d.resource, d.details],
      status: (d) => d.type,
    }),
  )
}
