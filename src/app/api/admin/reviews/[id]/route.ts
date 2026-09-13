import { isAuthed } from '@/server/session'
import { json, unauthorized } from '@/server/mock'
import { Reviews } from '@/server/db/store'

export const dynamic = 'force-dynamic'

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!isAuthed(request)) return unauthorized()
  const { id } = await params
  Reviews.deleteReview(Number(id))
  return json({ ok: true, id })
}
