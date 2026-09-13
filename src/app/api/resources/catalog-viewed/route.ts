import { json } from '@/server/mock'

export const dynamic = 'force-dynamic'

export function POST() {
  return json({ viewed: {} })
}
