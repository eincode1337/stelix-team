

import type { NextResponse } from 'next/server'

import { getSessionUserId, isAdmin } from '@/server/session'
import { forbidden, json, readJson, unauthorized } from '@/server/mock'
import { Admin, type AdminMutateEntity } from '@/server/db/store'


export function guardAdmin(request: Request): NextResponse | null {
  if (getSessionUserId(request) === null) return unauthorized()
  if (!isAdmin(request)) return forbidden()
  return null
}


export async function runAdminAction(
  request: Request,
  entity: AdminMutateEntity,
  id: string | number,
  allow: ReadonlySet<string>,
  normalize: (action: string) => string = (action) => action,
): Promise<NextResponse> {
  const denied = guardAdmin(request)
  if (denied) return denied

  const body = await readJson(request)
  const requested = typeof body.action === 'string' ? body.action : ''
  const action = normalize(requested)
  if (!allow.has(action)) return json({ ok: false, error: 'unknown_action' }, 400)

  const data: Record<string, unknown> = { ...body }
  delete data.action

  const result = Admin.adminMutate(entity, id, action, data)
  if (!result.ok) return json({ ok: false, error: 'not_found' }, 404)
  return json(result.id !== undefined ? { ok: true, id: result.id } : { ok: true, item: result.item })
}


export function runAdminDelete(
  request: Request,
  entity: AdminMutateEntity,
  id: string | number,
): NextResponse {
  const denied = guardAdmin(request)
  if (denied) return denied

  const result = Admin.adminMutate(entity, id, 'delete', {})
  if (!result.ok) return json({ ok: false, error: 'not_found' }, 404)
  return json({ ok: true, id: result.id ?? id })
}
