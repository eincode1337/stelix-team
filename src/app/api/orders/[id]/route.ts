import { json } from '@/server/mock'
import { Orders } from '@/server/db/store'

export const dynamic = 'force-dynamic'

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const order = Orders.getOrder(id)
  if (!order) return json({ error: 'not_found' }, 404)
  return json(order)
}
