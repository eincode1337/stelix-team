import { hasMockSession, json, unauthorized } from '@/server/mock'

export function POST(request: Request) {
  if (!hasMockSession(request)) return unauthorized()
  return json({ ok: true })
}
