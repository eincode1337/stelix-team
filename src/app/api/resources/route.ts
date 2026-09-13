import { json, readJson, searchParams, unauthorized } from '@/server/mock'
import { getSessionUserId } from '@/server/session'
import { Resources, type ListResourcesParams } from '@/server/db/store'

export const dynamic = 'force-dynamic'

export function GET(request: Request) {
  const sp = searchParams(request)
  const params: ListResourcesParams = {}

  const listingKind = sp.get('listingKind')
  if (listingKind) params.listingKind = listingKind
  const category = sp.get('category')
  if (category) params.category = category
  const authorId = sp.get('authorId')
  if (authorId != null && authorId !== '') params.authorId = authorId
  const search = sp.get('search') ?? sp.get('q')
  if (search) params.search = search
  const sort = sp.get('sort')
  if (sort) params.sort = sort
  const page = sp.get('page')
  if (page != null && page !== '') params.page = page

  return json(Resources.listResources(params))
}

export async function POST(request: Request) {
  const userId = getSessionUserId(request)
  if (userId == null) return unauthorized()

  const body = await readJson(request)
  const title = typeof body.title === 'string' ? body.title.trim() : ''
  const category = typeof body.category === 'string' ? body.category.trim() : ''
  if (!title || !category) return json({ error: 'invalid' }, 400)

  const price = Number(body.price)
  const discount = Number(body.discount)
  const resource = Resources.createResource({
    title,
    category,
    price: Number.isFinite(price) ? price : 0,
    discount: Number.isFinite(discount) ? discount : undefined,
    description: typeof body.description === 'string' ? body.description : undefined,
    shortDescription:
      typeof body.shortDescription === 'string' ? body.shortDescription : undefined,
    tags: Array.isArray(body.tags) ? body.tags.filter((t): t is string => typeof t === 'string') : undefined,
    images: Array.isArray(body.images)
      ? body.images.filter((i): i is string => typeof i === 'string')
      : undefined,
    coverImage: typeof body.coverImage === 'string' ? body.coverImage : undefined,
    listingKind: typeof body.listingKind === 'string' ? body.listingKind : undefined,
    deliverySource: typeof body.deliverySource === 'string' ? body.deliverySource : undefined,
    createdWithAiTools:
      typeof body.createdWithAiTools === 'boolean' ? body.createdWithAiTools : undefined,
    authorId: userId,
  })

  return json(resource, 201)
}
