import { Chat } from '@/server/db/store'
import { json, unauthorized } from '@/server/mock'
import { getSessionUserId } from '@/server/session'

export const dynamic = 'force-dynamic'

export function GET(request: Request) {
  const userId = getSessionUserId(request)
  if (userId === null) return unauthorized()
  return json(Chat.listChats(userId))
}
