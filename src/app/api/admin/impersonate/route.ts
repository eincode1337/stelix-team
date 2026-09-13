import { createSession, isAuthed, setSessionCookie } from '@/server/session'
import { json, readJson, unauthorized } from '@/server/mock'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  if (!isAuthed(request)) return unauthorized()
  const body = await readJson(request)
  const userId = Number(body.userId)
  if (!Number.isFinite(userId)) return json({ ok: false, error: 'bad_request' }, 400)
  const sid = createSession(userId)
  return setSessionCookie(json({ ok: true }), sid)
}

export function DELETE(request: Request) {
  if (!isAuthed(request)) return unauthorized()
  return json({ ok: true })
}
