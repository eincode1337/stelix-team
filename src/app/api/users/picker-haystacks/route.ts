import { Users } from '@/server/db/store'
import { json, readJson, unauthorized } from '@/server/mock'
import { getSessionUserId } from '@/server/session'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  if (getSessionUserId(request) === null) return unauthorized()

  const body = await readJson(request)
  const rawIds = Array.isArray(body.ids) ? body.ids : []

  const blobs: Record<string, string> = {}
  const avatars: Record<string, string> = {}

  for (const raw of rawIds) {
    const id = Number(raw)
    if (!Number.isFinite(id)) continue
    const user = Users.getUser(id)
    if (!user) continue
    blobs[String(id)] = [user.name, user.sub, user.email, String(user.id)]
      .filter(Boolean)
      .join(' ')
      .toLowerCase()
    if (user.image) avatars[String(id)] = user.image
  }

  return json({ blobs, avatars })
}
