import { Chat } from '@/server/db/store'
import { json, unauthorizedCapitalized } from '@/server/mock'
import { getSessionUserId } from '@/server/session'

export const dynamic = 'force-dynamic'

export function GET(request: Request) {
  const userId = getSessionUserId(request)
  if (userId === null) return unauthorizedCapitalized()
  return json(Chat.getChatSettings(userId))
}
