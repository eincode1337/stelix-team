import { runAdminAction, runAdminDelete } from '@/server/adminActions'

export const dynamic = 'force-dynamic'


const ALLOWED = new Set(['approve', 'reject', 'feature', 'edit', 'update', 'setStatus', 'delete'])

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return runAdminAction(request, 'resources', id, ALLOWED)
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return runAdminDelete(request, 'resources', id)
}
