import { AuthCodes } from '@/server/db/store'
import { json, readJson } from '@/server/mock'
import { createSession, setSessionCookie } from '@/server/session'

export async function POST(request: Request) {
  const body = await readJson(request)
  const email = typeof body.email === 'string' ? body.email.trim() : ''
  const code = typeof body.code === 'string' ? body.code : ''

  if (!email || !AuthCodes.consumeLoginCode(email, code)) {
    return json({ error: 'Неверный или просроченный код.' }, 400)
  }

  const user = AuthCodes.findOrCreateUserByEmail(email)
  const sid = createSession(user.id)
  return setSessionCookie(json({ ok: true }), sid)
}
