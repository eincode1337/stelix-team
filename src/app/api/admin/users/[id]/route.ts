import { runAdminAction, runAdminDelete } from '@/server/adminActions'

export const dynamic = 'force-dynamic'


const ALLOWED = new Set(['role', 'balance', 'adjust', 'block', 'unblock', 'freeze', 'update', 'edit', 'delete'])

function normalize(action: string): string {
  switch (action) {
    case 'role-change':
    case 'roleChange':
    case 'setRole':
      return 'role'
    case 'setBalance':
      return 'balance'
    default:
      return action
  }
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return runAdminAction(request, 'users', Number(id), ALLOWED, normalize)
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return runAdminDelete(request, 'users', Number(id))
}
