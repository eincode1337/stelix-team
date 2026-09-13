import { NextResponse } from 'next/server'

import { unauthorized } from '@/server/mock'
import { getSessionUserId } from '@/server/session'

export function GET(request: Request) {
  const userId = getSessionUserId(request)
  if (userId == null) return unauthorized()

  const origin = new URL(request.url).origin
  const params = new URLSearchParams({
    client_id: process.env.DISCORD_CLIENT_ID ?? 'stelix-discord-client',
    redirect_uri: `${origin}/api/profile/oauth/discord/callback`,
    response_type: 'code',
    scope: 'identify',
    state: String(userId),
  })

  return NextResponse.redirect(
    `https://discord.com/api/oauth2/authorize?${params.toString()}`,
    302,
  )
}
