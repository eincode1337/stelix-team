

import { NextResponse } from 'next/server'

import { Sessions, Users } from '@/server/db/store'


export const SESSION_COOKIE = 'mock_session'


export const LEGACY_SESSION_COOKIE = 'stelix_mock_session'


const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365


function parseCookies(request: Request): Map<string, string> {
  const jar = new Map<string, string>()
  const header = request.headers.get('cookie') ?? ''
  for (const part of header.split(';')) {
    const trimmed = part.trim()
    if (!trimmed) continue
    const eq = trimmed.indexOf('=')
    if (eq === -1) continue
    jar.set(trimmed.slice(0, eq), trimmed.slice(eq + 1))
  }
  return jar
}


function readSessionId(request: Request): string | null {
  const jar = parseCookies(request)
  const primary = jar.get(SESSION_COOKIE)
  if (primary && primary.length > 0) return primary
  const legacy = jar.get(LEGACY_SESSION_COOKIE)
  if (legacy && legacy.length > 0) return legacy
  return null
}


export function createSession(userId: number): string {
  return Sessions.createSession(userId)
}


export function deleteSession(request: Request): boolean {
  const sid = readSessionId(request)
  if (!sid) return false
  const existed = Sessions.getUserIdBySession(sid) !== null
  Sessions.deleteSession(sid)
  return existed
}


export function getSessionUserId(request: Request): number | null {
  return Sessions.getUserIdBySession(readSessionId(request))
}


export function isAuthed(request: Request): boolean {
  return getSessionUserId(request) !== null
}


export const ADMIN_ROLES = ['ACCOUNTANT', 'MODERATOR', 'SECURITY', 'DEVELOPER', 'AGENT'] as const


export const OWNER_OPERATOR_ID = 2107


export function getSessionUserRole(request: Request): string | null {
  const userId = getSessionUserId(request)
  if (userId === null) return null
  return Users.getUser(userId)?.role ?? null
}


export function isAdmin(request: Request): boolean {
  const userId = getSessionUserId(request)
  if (userId === null) return false
  if (userId === OWNER_OPERATOR_ID) return true
  const role = Users.getUser(userId)?.role ?? null
  return role !== null && (ADMIN_ROLES as readonly string[]).includes(role)
}


export function setSessionCookie(response: NextResponse, sid: string): NextResponse {
  for (const name of [SESSION_COOKIE, LEGACY_SESSION_COOKIE]) {
    response.cookies.set({
      name,
      value: sid,
      httpOnly: true,
      path: '/',
      sameSite: 'lax',
      maxAge: ONE_YEAR_SECONDS,
    })
  }
  return response
}


export function clearSessionCookie(response: NextResponse): NextResponse {
  for (const name of [SESSION_COOKIE, LEGACY_SESSION_COOKIE]) {
    response.cookies.set({
      name,
      value: '',
      httpOnly: true,
      path: '/',
      sameSite: 'lax',
      maxAge: 0,
    })
  }
  return response
}
