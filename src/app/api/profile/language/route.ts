import { json, readJson } from '@/server/mock'
import { getSessionUserId } from '@/server/session'
import { Users } from '@/server/db/store'

export async function PATCH(request: Request) {
  const body = await readJson(request)
  const language = typeof body.language === 'string' ? body.language.trim() : ''
  const ensureOnly = body.ensureOnly === true
  const userId = getSessionUserId(request)

  if (userId != null && language && !ensureOnly) {
    Users.updateUser(userId, { language })
  }

  return json({ ok: true })
}
