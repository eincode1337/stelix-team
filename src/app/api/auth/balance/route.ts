import { Balance } from '@/server/db/store'
import { json, unauthorizedCapitalized } from '@/server/mock'
import { getSessionUserId } from '@/server/session'

export function GET(request: Request) {
  const userId = getSessionUserId(request)
  if (userId == null) return unauthorizedCapitalized()
  return json(Balance.getBalance(userId))
}
