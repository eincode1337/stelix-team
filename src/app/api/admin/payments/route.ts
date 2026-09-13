import { isAuthed } from '@/server/session'
import { json, readJson, unauthorized } from '@/server/mock'
import { Kassas } from '@/server/db/store'

export const dynamic = 'force-dynamic'


export function GET(request: Request) {
  if (!isAuthed(request)) return unauthorized()
  return json({ methods: Kassas.listMethods(), payouts: Kassas.listPayouts() })
}

export async function POST(request: Request) {
  if (!isAuthed(request)) return unauthorized()
  const body = await readJson(request)

  const kind = String(body.kind ?? body.target ?? (body.provider ? 'payout' : 'method')).toLowerCase()

  if (kind === 'payout') {
    const provider = String(body.provider ?? body.id ?? '')
    const enabled = body.enabled == null ? undefined : Boolean(body.enabled)
    const payout = Kassas.setPayoutEnabled(provider, enabled)
    if (!payout) return json({ ok: false, error: 'not_found' }, 404)
    return json({ ok: true, payout })
  }

  const id = String(body.id ?? body.method ?? '')
  const available = body.available == null ? undefined : Boolean(body.available)
  const method = Kassas.setMethodAvailable(id, available)
  if (!method) return json({ ok: false, error: 'not_found' }, 404)
  return json({ ok: true, method })
}
