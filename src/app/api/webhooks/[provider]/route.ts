import { Balance, Resources, getState } from '@/server/db/store'
import { json, readJson, webhookAck } from '@/server/mock'

export const dynamic = 'force-dynamic'


const INCOMING_PROVIDERS = new Set([
  'yoomoney',
  'yookassa',
  'heleket',
  'freekassa',
  'betatransfer',
  'skinpay',
  'skinsback',
  'robokassa',
  'paypalych',
  'tbank',
  'anypay',
  'tome',
  'platega',
  'cardlink',
  'paymaster',
  'tochka',
])

const SLUG_ALIASES: Record<string, string> = {
  't-bank': 'tbank',
  't_bank': 'tbank',
  'any-pay': 'anypay',
  'any_pay': 'anypay',
}

function isKnownProvider(raw: string): boolean {
  const slug = raw.toLowerCase()
  return INCOMING_PROVIDERS.has(SLUG_ALIASES[slug] ?? slug)
}


const SUCCESS_VALUES = new Set([
  'success', 'succeeded', 'paid', 'completed', 'complete', 'confirmed',
  'captured', 'settled', 'done', 'ok', '1', 'true',
])

function sources(body: Record<string, unknown>): Record<string, unknown>[] {
  const meta = body.metadata
  return meta && typeof meta === 'object' ? [body, meta as Record<string, unknown>] : [body]
}

function isSuccessful(body: Record<string, unknown>): boolean {
  for (const src of sources(body)) {
    if (src.success === true || src.paid === true) return true
    for (const key of ['status', 'payment_status', 'state', 'event', 'type', 'result', 'code']) {
      const v = src[key]
      if (v != null && SUCCESS_VALUES.has(String(v).trim().toLowerCase())) return true
    }
  }
  return false
}

function pickNumber(body: Record<string, unknown>, keys: string[]): number | null {
  for (const src of sources(body)) {
    for (const k of keys) {
      const v = src[k]
      if (v == null) continue
      const n = typeof v === 'number' ? v : Number(String(v))
      if (Number.isFinite(n)) return n
    }
  }
  return null
}

function pickString(body: Record<string, unknown>, keys: string[]): string | null {
  for (const src of sources(body)) {
    for (const k of keys) {
      const v = src[k]
      if (typeof v === 'string' && v.trim()) return v.trim()
      if (typeof v === 'number') return String(v)
    }
  }
  return null
}

function markPurchasePaid(purchaseId: string): void {
  const state = getState()
  for (const list of state.purchases.values()) {
    const purchase = list.find((p) => p.id === purchaseId)
    if (!purchase) continue
    if (purchase.status !== 'PAID') {
      purchase.status = 'PAID'
      const res = Resources.getResourceById(purchase.resourceId)
      if (res) Balance.adjustBalance(res.authorId, 0, purchase.price)
    }
    return
  }
}

async function settleIncoming(request: Request): Promise<void> {
  const body = await readJson(request)
  if (!isSuccessful(body)) return

  const purchaseId = pickString(body, ['purchaseId', 'purchase_id'])
  if (purchaseId) {
    markPurchasePaid(purchaseId)
    return
  }

  const userId = pickNumber(body, ['userId', 'user_id', 'clientId', 'client_id'])
  const amount = pickNumber(body, ['amount', 'sum', 'OutSum', 'value', 'total'])
  if (userId != null && amount != null && amount > 0 && getState().users.has(userId)) {
    Balance.adjustBalance(userId, amount)
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ provider: string }> },
) {
  const { provider } = await params
  if (!isKnownProvider(provider)) {
    return json({ error: 'unknown_provider' }, 404)
  }
  await settleIncoming(request)
  return webhookAck()
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ provider: string }> },
) {
  const { provider } = await params
  if (!isKnownProvider(provider)) {
    return json({ error: 'unknown_provider' }, 404)
  }
  return webhookAck()
}
