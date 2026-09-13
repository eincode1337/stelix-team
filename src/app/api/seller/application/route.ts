import { json, readJson } from '@/server/mock'
import { getSessionUserId } from '@/server/session'
import { Admin, getState, type AdminApplication } from '@/server/db/store'

export const dynamic = 'force-dynamic'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function ensureApplications(): AdminApplication[] {
  Admin.adminList('applications', { page: 1, pageSize: 1, q: '', status: '', role: '' })
  const admin = getState().admin
  return admin ? admin.applications : []
}

export function GET(request: Request) {
  const userId = getSessionUserId(request)
  if (userId === null) return json({ application: null })
  const apps = ensureApplications()
  const mine = apps.find((a) => a.userId === userId) ?? null
  return json({ application: mine })
}

export async function POST(request: Request) {
  const userId = getSessionUserId(request)
  const body = await readJson(request)

  const identity = typeof body.identity === 'string' ? body.identity.trim() : ''
  const email = typeof body.email === 'string' ? body.email.trim() : ''
  const contact = typeof body.contact === 'string' ? body.contact.trim() : ''
  const experience = typeof body.experience === 'string' ? body.experience.trim() : ''
  const description = typeof body.description === 'string' ? body.description.trim() : ''
  const portfolio = Array.isArray(body.portfolio)
    ? body.portfolio
        .filter((p: unknown): p is string => typeof p === 'string' && p.trim() !== '')
        .map((p) => p.trim())
    : []
  const agree = body.agree === true

  if (
    !identity ||
    !EMAIL_RE.test(email) ||
    !contact ||
    !experience ||
    !description ||
    portfolio.length < 3 ||
    !agree
  ) {
    return json({ error: 'invalid_request' }, 400)
  }

  const apps = ensureApplications()
  const now = new Date().toISOString()
  const application: AdminApplication = {
    id: `app_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`,
    userId: userId ?? 0,
    identity,
    email,
    role: 'SELLER',
    status: 'PENDING',
    createdAt: now,
    updatedAt: now,
  }
  apps.unshift(application)

  return json({ ok: true, application: { ...application, contact, experience, portfolio, description } })
}
