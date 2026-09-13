import { json } from '@/server/mock'
import { createSession, setSessionCookie } from '@/server/session'

export function POST() {
  const sid = createSession(2107)
  return setSessionCookie(json({ ok: true }), sid)
}
