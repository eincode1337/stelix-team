import { json, readJson, unauthorized } from '@/server/mock'
import { getSessionUserId } from '@/server/session'
import { Resources, Users, type Resource, type RoleCode } from '@/server/db/store'

export const dynamic = 'force-dynamic'

const ADMIN_ROLES: ReadonlySet<RoleCode> = new Set<RoleCode>([
  'ACCOUNTANT',
  'MODERATOR',
  'SECURITY',
  'DEVELOPER',
  'AGENT',
])

function isAdminRole(role: RoleCode | undefined): boolean {
  return role != null && ADMIN_ROLES.has(role)
}

export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const resource = Resources.getResourceBySlug(slug) ?? Resources.getResourceById(slug)
  if (!resource) return json({ error: 'not_found' }, 404)
  return json(resource)
}

export async function PATCH(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const userId = getSessionUserId(request)
  if (userId == null) return unauthorized()

  const { slug } = await params
  const resource = Resources.getResourceBySlug(slug) ?? Resources.getResourceById(slug)
  if (!resource) return json({ error: 'not_found' }, 404)

  const isOwner = resource.authorId === userId
  if (!isOwner && !isAdminRole(Users.getUser(userId)?.role)) {
    return json({ error: 'forbidden' }, 403)
  }

  const body = await readJson(request)
  const patch: Partial<
    Pick<
      Resource,
      | 'title'
      | 'description'
      | 'shortDescription'
      | 'price'
      | 'discount'
      | 'category'
      | 'tags'
      | 'images'
      | 'coverImage'
      | 'listingKind'
      | 'status'
    >
  > = {}
  if (typeof body.title === 'string') patch.title = body.title
  if (typeof body.description === 'string') patch.description = body.description
  if (typeof body.shortDescription === 'string') patch.shortDescription = body.shortDescription
  if (body.price != null && Number.isFinite(Number(body.price))) patch.price = Number(body.price)
  if (body.discount != null && Number.isFinite(Number(body.discount))) patch.discount = Number(body.discount)
  if (typeof body.category === 'string') patch.category = body.category
  if (Array.isArray(body.tags)) patch.tags = body.tags.filter((t): t is string => typeof t === 'string')
  if (Array.isArray(body.images)) patch.images = body.images.filter((i): i is string => typeof i === 'string')
  if (typeof body.coverImage === 'string') patch.coverImage = body.coverImage
  if (typeof body.listingKind === 'string') patch.listingKind = body.listingKind
  if (typeof body.status === 'string' && !isOwner) patch.status = body.status

  const updated = Resources.updateResource(resource.id, patch)
  if (!updated) return json({ error: 'not_found' }, 404)
  return json(updated)
}

export async function DELETE(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const userId = getSessionUserId(request)
  if (userId == null) return unauthorized()

  const { slug } = await params
  const resource = Resources.getResourceBySlug(slug) ?? Resources.getResourceById(slug)
  if (!resource) return json({ error: 'not_found' }, 404)

  const isOwner = resource.authorId === userId
  if (!isOwner && !isAdminRole(Users.getUser(userId)?.role)) {
    return json({ error: 'forbidden' }, 403)
  }

  const removed = Resources.deleteResource(resource.id)
  if (!removed) return json({ error: 'not_found' }, 404)
  return json({ ok: true, id: resource.id })
}
