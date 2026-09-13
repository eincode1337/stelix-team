import kassa from '@/server/fixtures/auth/kassa.json'
import { Balance, Cart, Kassas, Payments, Purchases } from '@/server/db/store'
import { json, readJson, unauthorized } from '@/server/mock'
import { getSessionUserId } from '@/server/session'

export const dynamic = 'force-dynamic'

interface KassaMethod {
  id: string
  name: string
  kassaName: string
  currency: string
  minAmount: number
  maxAmount: number
  available: boolean
}

const CATALOG = kassa as unknown as { methods: KassaMethod[] }

export function GET(request: Request) {
  if (getSessionUserId(request) === null) return unauthorized()
  const availableIds = new Set(
    Kassas.listMethods()
      .filter((m) => m.available)
      .map((m) => m.id),
  )
  const methods = kassa.methods.filter((m) => availableIds.has(m.id))
  return json({ ...kassa, methods })
}

export async function POST(request: Request) {
  const userId = getSessionUserId(request)
  if (userId === null) return unauthorized()

  const body = await readJson(request)
  const methodId = typeof body.method === 'string' ? body.method : ''
  const currency = (typeof body.currency === 'string' && body.currency ? body.currency : 'RUB').toUpperCase()

  if (methodId === 'balance') {
    const summary = Cart.cartSummary(userId)
    const total = summary.lines
      .filter((l) => !l.deferred)
      .reduce((sum, l) => sum + l.price * l.quantity, 0)
    if (total <= 0) return json({ error: 'empty_cart' }, 400)
    if (Balance.getBalance(userId).balance < total) {
      return json({ error: 'insufficient_balance' }, 400)
    }
    Balance.adjustBalance(userId, -total)
    Purchases.checkout(userId)
    return json({ url: '/purchases', ok: true })
  }

  const method = CATALOG.methods.find((m) => m.id === methodId)
  if (!method) return json({ error: 'unknown_method' }, 400)
  const registered = Kassas.getMethod(methodId)
  if (!registered || !registered.available) return json({ error: 'method_unavailable' }, 400)

  const amount = Number(body.amount)
  if (!Number.isFinite(amount) || amount <= 0) return json({ error: 'invalid_amount' }, 400)

  if (currency === method.currency && (amount < method.minAmount || amount > method.maxAmount)) {
    return json({ error: 'amount_out_of_range' }, 400)
  }

  const provider = methodId.split(':')[0].toLowerCase()
  const paymentId = `pay_${cryptoId()}`

  Payments.createPayment({
    id: paymentId,
    userId,
    provider,
    kind: 'deposit',
    amount,
    currency,
  })

  const url =
    `/pay/${provider}?paymentId=${encodeURIComponent(paymentId)}` +
    `&amount=${encodeURIComponent(String(amount))}` +
    `&currency=${encodeURIComponent(currency)}`

  return json({ url, paymentId })
}

function cryptoId(): string {
  const g = globalThis as { crypto?: { randomUUID?: () => string } }
  if (g.crypto?.randomUUID) return g.crypto.randomUUID().replace(/-/g, '').slice(0, 20)
  return Math.random().toString(36).slice(2) + Date.now().toString(36)
}
