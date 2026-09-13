import { json, readJson, unauthorized } from '@/server/mock'
import { getSessionUserId } from '@/server/session'
import { Orders } from '@/server/db/store'

export const dynamic = 'force-dynamic'

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const userId = getSessionUserId(request)
  if (userId == null) return unauthorized()

  const { id } = await params
  const body = await readJson(request)
  const price = Number(body.price)

  const result = Orders.addOrderResponse(id, {
    sellerId: userId,
    message: typeof body.message === 'string' ? body.message : undefined,
    price: Number.isFinite(price) ? price : undefined,
  })
  if (!result) return json({ error: 'not_found' }, 404)

  return json(result, 201)
}
