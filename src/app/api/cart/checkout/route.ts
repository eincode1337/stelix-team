import { Balance, Purchases } from '@/server/db/store'
import { json, readJson, unauthorized } from '@/server/mock'
import { getSessionUserId } from '@/server/session'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  const userId = getSessionUserId(request)
  if (userId === null) return unauthorized()

  const body = await readJson(request)
  const rawIds = body.resourceIds
  const resourceIds = Array.isArray(rawIds)
    ? rawIds.map(String).filter((s) => s.length > 0)
    : undefined

  const result = Purchases.checkout(userId, resourceIds ? { resourceIds } : {})

  const balance = Balance.getBalance(userId)
  return json({ ...result, balance })
}
