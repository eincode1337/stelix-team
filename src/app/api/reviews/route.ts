import { Reviews } from '@/server/db/store'
import { json, readJson, searchParams } from '@/server/mock'
import { getSessionUserId } from '@/server/session'

export const dynamic = 'force-dynamic'


export function GET(request: Request) {
  const resourceId = searchParams(request).get('resourceId') ?? ''
  const items = resourceId ? Reviews.listReviewsByResource(resourceId) : []
  return json({ items, total: items.length, page: 1, pageSize: items.length })
}

export async function POST(request: Request) {
  const userId = getSessionUserId(request)
  if (userId === null) return json({ error: 'unauthorized' }, 401)

  const body = await readJson(request)
  const resourceId = typeof body.resourceId === 'string' ? body.resourceId : ''
  const rating = Number(body.rating)
  const comment = typeof body.comment === 'string' ? body.comment : ''

  if (!resourceId || !Number.isFinite(rating) || rating < 1 || rating > 5) {
    return json({ error: 'invalid review' }, 400)
  }

  const review = Reviews.createReview({ resourceId, reviewerId: userId, rating, comment })
  if (!review) return json({ error: 'resource not found' }, 404)

  return json({ review }, 201)
}
