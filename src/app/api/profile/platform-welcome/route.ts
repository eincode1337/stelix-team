import { json, readJson, unauthorized } from '@/server/mock'
import { getSessionUserId } from '@/server/session'
import { Users } from '@/server/db/store'

export async function POST(request: Request) {
  const userId = getSessionUserId(request)
  if (userId == null) return unauthorized()

  const body = await readJson(request)
  const action = typeof body.action === 'string' ? body.action : ''

  if (action === 'acceptLegal') {
    Users.updateUser(userId, { legalAcceptedAt: new Date().toISOString() })
  }

  return json({ ok: true })
}
