import { json, unauthorizedCapitalized } from '@/server/mock'
import { getSessionUserId } from '@/server/session'
import { getState, Orders, Purchases, Users, Withdrawals } from '@/server/db/store'
import type { User } from '@/server/db/store'


function serializeBundleUser(u: User) {
  return {
    id: u.id,
    name: u.name,
    email: u.email,
    site: u.site,
    verifiedSites: u.verifiedSites,
    pendingSiteSlotIndex: null,
    pendingSite: u.pendingSite,
    siteVerifyToken: null,
    siteVerifyFileName: null,
    discordId: u.discordId,
    discordDisplayName: u.discordDisplayName,
    steamId: u.steamId,
    steamDisplayName: u.steamDisplayName,
    googleId: u.googleId,
    googleDisplayName: u.googleDisplayName,
    githubId: u.githubId,
    githubLogin: u.githubLogin,
    githubDisplayName: u.githubDisplayName,
    telegramId: u.telegramId,
    telegramUsername: u.telegramUsername,
    telegramDisplayName: u.telegramDisplayName,
    telegramOauthId: null,
    notificationSoundEnabled: u.notificationSoundEnabled,
    purchaseSoundEnabled: u.purchaseSoundEnabled,
    messagesSoundEnabled: u.messagesSoundEnabled,
    purchaseNotificationsEnabled: u.purchaseNotificationsEnabled,
    saleNotificationsEnabled: u.saleNotificationsEnabled,
    messageNotificationsEnabled: u.messageNotificationsEnabled,
    purchaseNotificationsChannel: u.purchaseNotificationsChannel,
    purchaseNotificationsChannels: u.purchaseNotificationsChannels,
    messageNotificationsChannel: u.messageNotificationsChannel,
    messageNotificationsChannels: u.messageNotificationsChannels,
    balance: u.balance,
    role: u.role,
    status: u.status,
    language: u.language,
    createdAt: u.createdAt,
    image: u.image,
  }
}

export function GET(request: Request) {
  const userId = getSessionUserId(request)
  if (userId == null) return unauthorizedCapitalized()
  const user = Users.getUser(userId)
  if (!user) return unauthorizedCapitalized()

  const purchases = Purchases.listPurchases(userId).purchases.length
  const orders = Orders.listOrders({ clientId: userId }).orders.length
  const withdrawals = Withdrawals.listWithdrawals(userId).withdrawals.length

  let sessions = 0
  for (const s of getState().sessions.values()) {
    if (s.userId === userId) sessions++
  }

  return json({
    settings: {
      hidePersonalData: false,
    },
    security: {
      hasPinSet: user.hasPinSet,
      twoFactorEnabled: false,
    },
    user: serializeBundleUser(user),
    stats: {
      purchases,
      orders,
      transactions: purchases + withdrawals,
      deposits: 0,
      sessions,
      sellerRating: { avg: user.sellerRating.avg, count: user.sellerRating.count },
    },
  })
}
