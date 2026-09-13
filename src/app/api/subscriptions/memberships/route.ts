import { Subscriptions } from '@/server/db/store'
import { json, readJson, unauthorized } from '@/server/mock'
import { getSessionUserId } from '@/server/session'

export function GET(request: Request) {
  const userId = getSessionUserId(request)
  if (userId === null) return unauthorized()
  return json(Subscriptions.getMemberships(userId))
}

export async function PATCH(request: Request) {
  const userId = getSessionUserId(request)
  if (userId === null) return unauthorized()
  const body = await readJson(request)
  const subscriptionId = typeof body.subscriptionId === 'string' ? body.subscriptionId : ''
  const autoRenew = Boolean(body.autoRenew)
  const updated = Subscriptions.setAutoRenew(userId, subscriptionId, autoRenew)
  if (updated) return json({ subscription: updated })
  return json({
    subscription: {
      id: subscriptionId || 'mock-subscription',
      offeringId: '',
      status: 'active',
      startedAt: '1970-01-01T00:00:00.000Z',
      expiresAt: '1970-01-01T00:00:00.000Z',
      remainDays: 0,
      autoRenew,
      periodMonths: 1,
      priceRubles: 0,
    },
  })
}
