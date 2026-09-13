import { json, readJson, unauthorized } from '@/server/mock'
import { getSessionUserId } from '@/server/session'
import { Withdrawals } from '@/server/db/store'

export const dynamic = 'force-dynamic'

export function GET(request: Request) {
  const userId = getSessionUserId(request)
  if (userId === null) return unauthorized()
  return json(Withdrawals.listWithdrawals(userId))
}

export async function POST(request: Request) {
  const userId = getSessionUserId(request)
  if (userId === null) return unauthorized()
  const body = await readJson(request)
  const amount = Number(body.amount)
  const method = typeof body.method === 'string' ? body.method : ''
  const methodDetails = typeof body.methodDetails === 'string' ? body.methodDetails : ''
  if (!Number.isFinite(amount) || amount <= 0 || !method) {
    return json({ error: 'invalid_request' }, 400)
  }
  const withdrawal = Withdrawals.createWithdrawal(userId, { amount, method, methodDetails })
  if (!withdrawal) return json({ error: 'insufficient_funds' }, 400)
  return json({ ok: true, withdrawal })
}
