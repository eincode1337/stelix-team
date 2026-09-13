import { Cart } from '@/server/db/store'
import { json, unauthorized } from '@/server/mock'
import { getSessionUserId } from '@/server/session'

export function GET(request: Request) {
  const userId = getSessionUserId(request)
  if (userId === null) return unauthorized()
  return json(Cart.cartSummary(userId))
}
