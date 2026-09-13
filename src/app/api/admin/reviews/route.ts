import { isAuthed } from '@/server/session'
import { json, unauthorized } from '@/server/mock'
import { Reviews } from '@/server/db/store'

export const dynamic = 'force-dynamic'

export function GET(request: Request) {
  if (!isAuthed(request)) return unauthorized()
  const { items, total } = Reviews.listAllReviews()
  return json({ items, total, page: 1, pageSize: items.length })
}
