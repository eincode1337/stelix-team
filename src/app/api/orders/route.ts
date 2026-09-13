import { json, readJson, searchParams, unauthorized } from '@/server/mock'
import { getSessionUserId } from '@/server/session'
import { Orders, type ListOrdersParams } from '@/server/db/store'

export const dynamic = 'force-dynamic'

export function GET(request: Request) {
  const sp = searchParams(request)
  const params: ListOrdersParams = {}

  const status = sp.get('status')
  if (status) params.status = status
  const category = sp.get('category')
  if (category) params.category = category
  const search = sp.get('search') ?? sp.get('q')
  if (search) params.search = search

  const clientId = sp.get('clientId')
  if (clientId != null && clientId !== '' && !Number.isNaN(Number(clientId))) {
    params.clientId = Number(clientId)
  }
  const sellerId = sp.get('sellerId')
  if (sellerId != null && sellerId !== '' && !Number.isNaN(Number(sellerId))) {
    params.sellerId = Number(sellerId)
  }

  return json(Orders.listOrders(params))
}

export async function POST(request: Request) {
  const userId = getSessionUserId(request)
  if (userId == null) return unauthorized()

  const body = await readJson(request)
  const title = typeof body.title === 'string' ? body.title.trim() : ''
  if (!title) return json({ error: 'invalid' }, 400)

  const budget = Number(body.budget)
  const order = Orders.createOrder({
    title,
    description: typeof body.description === 'string' ? body.description : undefined,
    budget: Number.isFinite(budget) ? budget : 0,
    deadline: typeof body.deadline === 'string' ? body.deadline : undefined,
    category: typeof body.category === 'string' ? body.category : undefined,
    clientId: userId,
  })

  return json(order, 201)
}
