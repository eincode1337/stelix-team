import { Cart, Resources } from '@/server/db/store'
import { json, readJson, unauthorized } from '@/server/mock'
import { getSessionUserId } from '@/server/session'


export function GET(request: Request) {
  const userId = getSessionUserId(request)
  if (userId === null) return unauthorized()
  return json(Cart.getCart(userId))
}

export async function POST(request: Request) {
  const userId = getSessionUserId(request)
  if (userId === null) return unauthorized()
  const body = await readJson(request)

  const ids: string[] = []
  if (Array.isArray(body.resourceIds)) {
    for (const raw of body.resourceIds) {
      if (typeof raw === 'string' && raw) ids.push(raw)
    }
  } else if (typeof body.resourceId === 'string' && body.resourceId) {
    ids.push(body.resourceId)
  }

  const deferred = body.deferred === true

  let added = 0
  for (const resourceId of ids) {
    if (!Resources.getResourceById(resourceId)) continue
    added += Cart.addToCart(userId, resourceId, { deferred }).added
  }

  return json({ added })
}

export async function PATCH(request: Request) {
  const userId = getSessionUserId(request)
  if (userId === null) return unauthorized()
  const body = await readJson(request)

  const resourceId = typeof body.resourceId === 'string' ? body.resourceId : ''
  if (!resourceId) return json({ ok: true })

  const existing = Cart.getCart(userId).items.find((i) => i.resourceId === resourceId)
  if (!existing) return json({ ok: true })

  const deferred = typeof body.deferred === 'boolean' ? body.deferred : existing.deferred
  const quantity =
    body.quantity != null && !Number.isNaN(Number(body.quantity))
      ? Math.trunc(Number(body.quantity))
      : existing.quantity

  Cart.removeFromCart(userId, resourceId)
  if (quantity > 0) Cart.addToCart(userId, resourceId, { quantity, deferred })

  return json({ ok: true })
}

export async function DELETE(request: Request) {
  const userId = getSessionUserId(request)
  if (userId === null) return unauthorized()
  const body = await readJson(request)

  if (body.activeOnly === true) {
    Cart.clearCart(userId, 'active')
  } else if (body.deferredOnly === true) {
    Cart.clearCart(userId, 'deferred')
  } else if (typeof body.resourceId === 'string' && body.resourceId) {
    Cart.removeFromCart(userId, body.resourceId)
  } else {
    Cart.clearCart(userId)
  }

  return json({ ok: true })
}
