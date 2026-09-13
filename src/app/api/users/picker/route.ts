import { Users } from '@/server/db/store'
import { json, searchParams, unauthorized } from '@/server/mock'
import { getSessionUserId } from '@/server/session'

export const dynamic = 'force-dynamic'

export function GET(request: Request) {
  if (getSessionUserId(request) === null) return unauthorized()

  const params = searchParams(request)
  const isTruthy = (v: string | null): boolean => v === '1' || v === 'true'

  const limitRaw = params.get('limit')
  const limit =
    limitRaw != null && Number.isFinite(Number(limitRaw)) ? Number(limitRaw) : undefined

  const users = Users.listUsers({
    picker: true,
    q: params.get('q') ?? undefined,
    staff: isTruthy(params.get('staff')),
    sellers: isTruthy(params.get('sellers')),
    sellerTier: isTruthy(params.get('sellerTier')),
    role: params.get('role') || undefined,
    limit,
  }).map(Users.serializePickerRow)

  return json({ users })
}
