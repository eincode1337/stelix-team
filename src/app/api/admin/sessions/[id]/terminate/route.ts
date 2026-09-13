import { isAuthed } from '@/server/session'
import { json, unauthorized } from '@/server/mock'

export const dynamic = 'force-dynamic'

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!isAuthed(request)) return unauthorized()
  const { id } = await params
  return json({ ok: true, id })
}
