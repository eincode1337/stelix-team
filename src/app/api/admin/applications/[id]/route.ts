import { runAdminAction, runAdminDelete } from '@/server/adminActions'

export const dynamic = 'force-dynamic'


const ALLOWED = new Set(['approve', 'reject', 'delete'])

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return runAdminAction(request, 'applications', id, ALLOWED)
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return runAdminDelete(request, 'applications', id)
}
