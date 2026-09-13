import { json, readJson, unauthorized } from '@/server/mock'
import { getSessionUserId } from '@/server/session'
import { Resources } from '@/server/db/store'
import { Combos, type ComboItem } from '@/server/db/combos'

export const dynamic = 'force-dynamic'

export function GET() {
  return json(Combos.listCombos())
}

export async function POST(request: Request) {
  const userId = getSessionUserId(request)
  if (userId == null) return unauthorized()

  const body = await readJson(request)
  const title = typeof body.title === 'string' ? body.title.trim() : ''
  const resourceIds = Array.isArray(body.resourceIds)
    ? body.resourceIds.filter((id): id is string => typeof id === 'string')
    : []

  if (!title || resourceIds.length < 2) return json({ error: 'invalid' }, 400)

  const seen = new Set<string>()
  const items: ComboItem[] = []
  for (const idOrSlug of resourceIds) {
    if (seen.has(idOrSlug)) continue
    seen.add(idOrSlug)
    const r = Resources.getResourceById(idOrSlug) ?? Resources.getResourceBySlug(idOrSlug)
    if (!r) continue
    const price = Number(r.price) || 0
    const discountedPrice = Number(r.discount ?? r.price) || 0
    const discountPercent = price > 0 ? Math.round((1 - discountedPrice / price) * 100) : 0
    items.push({
      resourceId: r.id,
      discountType: 'percent',
      discountValue: discountPercent,
      discountPercent,
      addedByUserId: userId,
      title: r.title,
      slug: r.slug,
      coverUrl: r.coverImage || null,
      price,
      discountedPrice,
      authorId: r.authorId,
      authorName: r.author,
      category: r.category,
      tags: Array.isArray(r.tags) ? r.tags : [],
      sales: r.sales,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt ?? r.createdAt,
    })
  }

  if (items.length < 2) return json({ error: 'invalid' }, 400)

  const coOwnerId = Number(body.coOwnerId)
  const members = Number.isFinite(coOwnerId) && coOwnerId > 0 ? [{ userId: coOwnerId }] : []

  const combo = Combos.createCombo({
    title,
    description: typeof body.description === 'string' ? body.description : undefined,
    coverImage: typeof body.coverImage === 'string' ? body.coverImage : undefined,
    catalogImage: typeof body.catalogImage === 'string' ? body.catalogImage : undefined,
    thumbnailImage: typeof body.thumbnailImage === 'string' ? body.thumbnailImage : undefined,
    createdByUserId: userId,
    members,
    items,
  })

  return json(combo, 201)
}
