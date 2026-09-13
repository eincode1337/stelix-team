

import { NextResponse } from 'next/server'


export function json<T>(data: T, init?: number | ResponseInit): NextResponse {
  const responseInit = typeof init === 'number' ? { status: init } : init
  return NextResponse.json(data, responseInit)
}


export function noContent(): Response {
  return new Response(null, { status: 204 })
}


export function searchParams(request: Request): URLSearchParams {
  return new URL(request.url).searchParams
}


export const MOCK_SESSION_COOKIE = 'stelix_mock_session'


export function hasMockSession(request: Request): boolean {
  const header = request.headers.get('cookie') ?? ''
  for (const part of header.split(';')) {
    const [name, ...rest] = part.trim().split('=')
    if (name === MOCK_SESSION_COOKIE) return rest.join('=').length > 0
  }
  return false
}


export function unauthorized(): NextResponse {
  return json({ error: 'unauthorized' }, 401)
}


export function forbidden(): NextResponse {
  return json({ error: 'forbidden' }, 403)
}


export function unauthorizedCapitalized(): NextResponse {
  return json({ error: 'Unauthorized' }, 401)
}


export async function readJson(request: Request): Promise<Record<string, unknown>> {
  try {
    const data = await request.json()
    return data && typeof data === 'object' ? (data as Record<string, unknown>) : {}
  } catch {
    return {}
  }
}


export function webhookAck(): NextResponse {
  return json({ ok: true })
}
