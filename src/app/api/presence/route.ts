import { Chat } from '@/server/db/store'
import { json } from '@/server/mock'
import { isAuthed } from '@/server/session'

export const dynamic = 'force-dynamic'

export function GET(request: Request) {
  if (!isAuthed(request)) return json({ users: [] })
  return json(Chat.presence())
}
