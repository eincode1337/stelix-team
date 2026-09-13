import { isAuthed } from '@/server/session'
import { json, readJson, unauthorized } from '@/server/mock'
import { SiteSettings, type SiteFeatureLocksPatch } from '@/server/db/store'

export const dynamic = 'force-dynamic'


export function GET(request: Request) {
  if (!isAuthed(request)) return unauthorized()
  return json(SiteSettings.get())
}

export async function POST(request: Request) {
  if (!isAuthed(request)) return unauthorized()
  const body = await readJson(request)
  return json(SiteSettings.set(body as SiteFeatureLocksPatch))
}
