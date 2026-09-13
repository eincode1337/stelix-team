import { Notifications } from '@/server/db/store'
import { json, searchParams, unauthorized } from '@/server/mock'
import { getSessionUserId } from '@/server/session'

export const dynamic = 'force-dynamic'

export function GET(request: Request) {
  const userId = getSessionUserId(request)
  if (userId === null) return unauthorized()

  const unread = searchParams(request).get('unread') === '1'
  return json(Notifications.listNotifications({ userId, unread }))
}
