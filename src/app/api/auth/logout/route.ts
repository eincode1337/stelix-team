import { json } from '@/server/mock'
import { clearSessionCookie, deleteSession } from '@/server/session'

export function POST(request: Request) {
  deleteSession(request)
  return clearSessionCookie(json({ ok: true }))
}
