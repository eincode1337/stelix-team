import { Payments } from '@/server/db/store'
import { json, readJson, unauthorized } from '@/server/mock'
import { getSessionUserId } from '@/server/session'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  const userId = getSessionUserId(request)
  if (userId === null) return unauthorized()

  const body = await readJson(request)
  const paymentId = typeof body.paymentId === 'string' ? body.paymentId.trim() : ''
  const purchaseId = typeof body.purchaseId === 'string' ? body.purchaseId.trim() : ''
  const provider = typeof body.provider === 'string' && body.provider.trim() ? body.provider.trim() : undefined

  const payment = paymentId ? Payments.getPayment(paymentId) : null
  if (payment) {
    if (payment.userId !== userId) return json({ error: 'forbidden' }, 403)
    const result = Payments.confirmPayment(paymentId, provider)
    if (!result) return json({ error: 'unknown_payment' }, 404)
    return json({
      ok: true,
      balance: result.balance,
      payable: result.payable,
      payment: {
        id: result.payment.id,
        status: result.payment.status,
        kind: result.payment.kind,
        amount: result.payment.amount,
        currency: result.payment.currency,
      },
    })
  }

  if (purchaseId) {
    const settled = Payments.settlePurchaseForUser(userId, purchaseId)
    if (!settled.ok) return json({ error: 'unknown_purchase' }, 404)
    return json({ ok: true, balance: settled.balance, payable: settled.payable })
  }

  if (paymentId) return json({ error: 'unknown_payment' }, 404)
  return json({ error: 'missing_paymentId' }, 400)
}
