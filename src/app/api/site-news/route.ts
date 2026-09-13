import { json, searchParams, unauthorized } from '@/server/mock'
import { isAuthed } from '@/server/session'
import { SiteNews } from '@/server/db/store'

export const dynamic = 'force-dynamic'

export function GET(request: Request) {
  if (!isAuthed(request)) return unauthorized()

  const feed = SiteNews.listSiteNews()

  if (searchParams(request).get('unreadCount') === '1') {
    const unreadCount = feed.items.filter((item) => !item.isRead).length
    return json({ unreadCount })
  }

  return json(feed)
}
