import { Balance, getState } from '@/server/db/store'
import { json, readJson, webhookAck } from '@/server/mock'

export const dynamic = 'force-dynamic'


const PAYOUT_PROVIDERS = new Set([
  'yookassa',
  'heleket',
  'tbank',
  'yoomoney',
  'paypalych',
  'robokassa',
  'anypay',
  'tome',
  'platega',
])

const SLUG_ALIASES: Record<string, string> = {
  't-bank': 'tbank',
  't_bank': 'tbank',
  'any-pay': 'anypay',
  'any_pay': 'anypay',
}

function isKnownProvider(raw: string): boolean {
  const slug = raw.toLowerCase()
  return PAYOUT_PROVIDERS.has(SLUG_ALIASES[slug] ?? slug)
}


const SUCCESS_VALUES = new Set([
  'success', 'succeeded', 'paid', 'completed', 'complete', 'confirmed',
  'captured', 'settled', 'done', 'ok', '1', 'true',
])
const FAILURE_VALUES = new Set([
  'failed', 'fail', 'error', 'declined', 'canceled', 'cancelled',
  'rejected', 'reversed', 'refunded', '0', 'false',
])

function sources(body: Record<string, unknown>): Record<string, unknown>[] {
  const meta = body.metadata
  return meta && typeof meta === 'object' ? [body, meta as Record<string, unknown>] : [body]
}

function matches(body: Record<string, unknown>, set: Set<string>): boolean {
  for (const src of sources(body)) {
    if (set === SUCCESS_VALUES && (src.success === true || src.paid === true)) return true
    if (set === FAILURE_VALUES && src.success === false) return true
    for (const key of ['status', 'payment_status', 'state', 'event', 'type', 'result']) {
      const v = src[key]
      if (v != null && set.has(String(v).trim().toLowerCase())) return true
    }
  }
  return false
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

function settleWithdrawal(withdrawalId: string, paid: boolean): void {
  const state = getState()
  for (const [userId, list] of state.withdrawals) {
    const wd = list.find((w) => w.id === withdrawalId)
    if (!wd) continue
    if (wd.status !== 'PENDING' && wd.status !== 'PROCESSING') return
    if (paid) {
      wd.status = 'PAID'
    } else {
      wd.status = 'FAILED'
      Balance.adjustBalance(userId, 0, wd.amount)
    }
    return
  }
}

async function settlePayout(request: Request): Promise<void> {
  const body = await readJson(request)
  const withdrawalId = pickString(body, ['withdrawalId', 'withdrawal_id', 'payoutId', 'payout_id'])
  if (!withdrawalId) return

  if (matches(body, SUCCESS_VALUES)) settleWithdrawal(withdrawalId, true)
  else if (matches(body, FAILURE_VALUES)) settleWithdrawal(withdrawalId, false)
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ provider: string }> },
) {
  const { provider } = await params
  if (!isKnownProvider(provider)) {
    return json({ error: 'unknown_provider' }, 404)
  }
  await settlePayout(request)
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
