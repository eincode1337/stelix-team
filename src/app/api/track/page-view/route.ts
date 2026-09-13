import { noContent, readJson } from '@/server/mock'
import { Resources } from '@/server/db/store'

export async function POST(request: Request) {
  const body = await readJson(request)

  const resourceId = typeof body.resourceId === 'string' ? body.resourceId : null
  const slug =
    typeof body.slug === 'string'
      ? body.slug
      : typeof body.resourceSlug === 'string'
        ? body.resourceSlug
        : slugFromPath(body.path ?? body.url ?? body.page)

  let resource = resourceId ? Resources.getResourceById(resourceId) : null
  if (!resource && slug) resource = Resources.getResourceBySlug(slug)
  if (resource) resource.uniqueViews += 1

  return noContent()
}

function slugFromPath(value: unknown): string | null {
  if (typeof value !== 'string' || !value) return null
  const path = value.split('?')[0].replace(/\/+$/, '')
  const last = path.slice(path.lastIndexOf('/') + 1)
  return last || null
}
