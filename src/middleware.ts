import { NextRequest, NextResponse } from 'next/server'
import { locales, defaultLocale, isLocale } from '@/i18n/config'

const PUBLIC_FILE = /\.[^/]+$/

const GATED = new Set(['profile', 'withdrawals', 'purchases', 'cart', 'chat', 'seller', 'resource', 'admin'])

function stripLocale(pathname: string): string {
  const parts = pathname.split('/')
  if (isLocale(parts[1])) return '/' + parts.slice(2).join('/')
  return pathname
}

function isGated(pathname: string): boolean {
  const p = stripLocale(pathname)
  const segs = p.split('/')
  const seg = segs[1] || ''
  if (seg === 'subscriptions') return segs[2] === 'create'
  if (seg === 'resource') return segs[2] === 'create' || segs[2] === 'create-free' || segs[2] === 'combo'
  if (!GATED.has(seg)) return false
  if (seg === 'seller' && segs[2] === 'application') return false
  return true
}

function hasSession(request: NextRequest): boolean {
  return Boolean(
    request.cookies.get('mock_session')?.value || request.cookies.get('stelix_mock_session')?.value,
  )
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (pathname.startsWith('/_next') || pathname.startsWith('/api') || PUBLIC_FILE.test(pathname)) {
    return NextResponse.next()
  }

  if (isGated(pathname) && !hasSession(request)) {
    const url = request.nextUrl.clone()
    url.pathname = '/'
    url.search = ''
    url.searchParams.set('login', '1')
    return NextResponse.redirect(url, 307)
  }

  const first = pathname.split('/')[1]
  if (isLocale(first)) {
    return NextResponse.next()
  }

  const locale = resolveLocale(request)
  const url = request.nextUrl.clone()
  url.pathname = `/${locale}${pathname === '/' ? '' : pathname}`
  return NextResponse.rewrite(url)
}

function resolveLocale(request: NextRequest): string {
  const cookie = request.cookies.get('NEXT_LOCALE')?.value
  if (cookie && isLocale(cookie)) return cookie

  const header = request.headers.get('accept-language')
  if (header) {
    for (const part of header.split(',')) {
      const code = part.split(';')[0].trim().slice(0, 2).toLowerCase()
      if (isLocale(code)) return code
    }
  }
  return defaultLocale
}

export const config = {
  matcher: ['/((?!_next|api|.*\\..*).*)'],
}
