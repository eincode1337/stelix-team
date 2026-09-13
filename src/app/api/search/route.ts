import { json, searchParams } from '@/server/mock'
import resourcesFixture from '@/server/fixtures/resources.json'

export const dynamic = 'force-dynamic'

type Resource = (typeof resourcesFixture.resources)[number]

export function GET(request: Request) {
  const q = (searchParams(request).get('q') ?? '').trim().toLowerCase()
  if (!q) return json({ results: [] })

  const results: Resource[] = resourcesFixture.resources.filter((r) =>
    [r.title, r.description, r.shortDescription]
      .filter(Boolean)
      .some((v) => String(v).toLowerCase().includes(q)),
  )

  return json({ results })
}
