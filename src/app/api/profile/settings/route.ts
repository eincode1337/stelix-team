import { json, readJson, unauthorized } from '@/server/mock'
import { getSessionUserId } from '@/server/session'
import { Users } from '@/server/db/store'

export function GET(request: Request) {
  const userId = getSessionUserId(request)
  if (userId == null) return unauthorized()
  const user = Users.getUser(userId)
  if (!user) return unauthorized()

  return json({
    settings: {
      hidePersonalData: false,
      legalAcceptedAt: user.legalAcceptedAt,
      tourDoneAt: user.tourDoneAt,
      resourceTourDoneAt: user.resourceTourDoneAt,
      twoFactorEnabled: false,
      reviewsDisabled: false,
      purchasesDisabled: false,
      ordersDisabled: false,
      withdrawalsDisabled: false,
      resourceCreationDisabled: false,
      paymentsDisabled: false,
      chatDisabled: false,
    },
  })
}

export async function PATCH(request: Request) {
  const userId = getSessionUserId(request)
  if (userId == null) return unauthorized()
  await readJson(request)
  return json({ ok: true })
}
