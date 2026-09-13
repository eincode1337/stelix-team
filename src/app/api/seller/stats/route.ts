import sellerStats from '@/server/fixtures/auth/seller-stats.json'
import { json } from '@/server/mock'

export function GET() {
  return json(sellerStats)
}
