import { isAuthed } from '@/server/session'
import { json, readJson, unauthorized } from '@/server/mock'
import { Admin, type AdminEntity } from '@/server/db/store'

export const dynamic = 'force-dynamic'


const ENTITIES: readonly AdminEntity[] = [
  'users',
  'sellers',
  'orders',
  'resources',
  'purchases',
  'withdrawals',
  'applications',
  'blacklist',
  'deliveries',
]

function isEntity(value: string): value is AdminEntity {
  return (ENTITIES as readonly string[]).includes(value)
}

function normalizeAction(
  action: string,
  data: Record<string, unknown>,
): { action: string; data: Record<string, unknown> } {
  switch (action) {
    case 'refund':
      return { action: 'setStatus', data: { status: 'REFUNDED' } }
    case 'role-change':
    case 'roleChange':
      return { action: 'setRole', data }
    case 'edit':
      return { action: 'update', data }
    default:
      return { action, data }
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ entity: string; id: string }> },
) {
  if (!isAuthed(request)) return unauthorized()
  const { entity, id } = await params
  if (!isEntity(entity)) return json({ ok: false, error: 'unknown_entity' }, 404)

  const body = await readJson(request)
  const rawAction = typeof body.action === 'string' ? body.action : 'update'
  const data: Record<string, unknown> = { ...body }
  delete data.action

  const mapped = normalizeAction(rawAction, data)
  const result = Admin.adminMutate(entity, id, mapped.action, mapped.data)
  if (!result.ok) return json({ ok: false, error: 'not_found' }, 404)
  return json(result.id !== undefined ? { ok: true, id: result.id } : { ok: true, item: result.item })
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ entity: string; id: string }> },
) {
  if (!isAuthed(request)) return unauthorized()
  const { entity, id } = await params
  if (!isEntity(entity)) return json({ ok: false, error: 'unknown_entity' }, 404)

  const result = Admin.adminMutate(entity, id, 'delete', {})
  if (!result.ok) return json({ ok: false, error: 'not_found' }, 404)
  return json({ ok: true, id: result.id ?? id })
}
