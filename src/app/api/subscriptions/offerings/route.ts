import { Subscriptions } from '@/server/db/store'
import { json, readJson, unauthorized } from '@/server/mock'
import { getSessionUserId } from '@/server/session'

export function GET() {
  return json(Subscriptions.getOfferings())
}

export async function POST(request: Request) {
  const userId = getSessionUserId(request)
  if (userId === null) return unauthorized()

  const body = await readJson(request)
  const name = typeof body.name === 'string' ? body.name : ''

  const rawPlans = Array.isArray(body.plans) ? body.plans : []
  const plans = rawPlans
    .map((p) => {
      const plan = p as { periodMonths?: unknown; priceRubles?: unknown; months?: unknown; price?: unknown }
      const periodMonths = Number(plan.periodMonths ?? plan.months)
      const priceRubles = Number(plan.priceRubles ?? plan.price)
      return {
        periodMonths: Number.isFinite(periodMonths) ? periodMonths : 1,
        priceRubles: Number.isFinite(priceRubles) ? priceRubles : 0,
      }
    })
    .filter((p) => p.periodMonths >= 1)

  const webhookRaw = (body.webhook ?? {}) as {
    method?: unknown
    url?: unknown
    apiKey?: unknown
    params?: unknown
  }

  const { offering, offerings } = Subscriptions.createOffering({
    name,
    category: typeof body.category === 'string' ? body.category : undefined,
    shortDescription: typeof body.shortDescription === 'string' ? body.shortDescription : undefined,
    description: typeof body.description === 'string' ? body.description : undefined,
    cardColor: typeof body.cardColor === 'string' ? body.cardColor : null,
    trialDays: typeof body.trialDays === 'number' ? body.trialDays : undefined,
    plans,
    webhook: {
      method: typeof webhookRaw.method === 'string' ? webhookRaw.method : undefined,
      url: typeof webhookRaw.url === 'string' ? webhookRaw.url : undefined,
      apiKey: typeof webhookRaw.apiKey === 'string' ? webhookRaw.apiKey : undefined,
      params: Array.isArray(webhookRaw.params) ? webhookRaw.params.map(String) : undefined,
    },
  })

  return json({ offering, offerings })
}
