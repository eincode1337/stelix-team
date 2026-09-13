import { runAdminAction, runAdminDelete } from '@/server/adminActions'

export const dynamic = 'force-dynamic'


const ALLOWED = new Set(['edit', 'update'])

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return runAdminAction(request, 'blacklist', id, ALLOWED)
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return runAdminDelete(request, 'blacklist', id)
}
