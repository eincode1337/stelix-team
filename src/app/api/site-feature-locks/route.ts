import { json } from '@/server/mock'
import siteFeatureLocks from '@/server/fixtures/site-feature-locks.json'

export function GET() {
  return json(siteFeatureLocks)
}
