import { Notifications } from '@/server/db/store'
import { json, readJson, unauthorized } from '@/server/mock'
import { getSessionUserId } from '@/server/session'

export async function POST(request: Request) {
  const userId = getSessionUserId(request)
  if (userId === null) return unauthorized()

  const body = await readJson(request)
  const rawIds = body.ids
  const ids =
    Array.isArray(rawIds) && rawIds.length > 0
      ? rawIds.map(Number).filter((n) => Number.isInteger(n))
      : undefined

  Notifications.markNotificationsRead(userId, ids)
  return json({ ok: true })
}
