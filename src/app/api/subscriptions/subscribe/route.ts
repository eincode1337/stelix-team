import { Subscriptions } from '@/server/db/store'
import { json, readJson, unauthorized } from '@/server/mock'
import { getSessionUserId } from '@/server/session'

export async function POST(request: Request) {
  const userId = getSessionUserId(request)
  if (userId === null) return unauthorized()
  const body = await readJson(request)
  const offeringId =
    typeof body.planId === 'string' && body.planId
      ? body.planId
      : typeof body.serviceId === 'string'
        ? body.serviceId
        : ''
  const { subscription } = Subscriptions.subscribe(userId, offeringId, {
    autoRenew: Boolean(body.autoRenew),
    trial: Boolean(body.trial),
  })
  return json({ subscription })
}
