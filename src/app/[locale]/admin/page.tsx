import type { Metadata } from 'next'
import { cookies } from 'next/headers'

import { AdminPanel } from '@/components/admin/AdminPanel'
import { ap } from '@/components/admin/ui/ap'
import { isLocale, type Locale } from '@/i18n/config'
import { LEGACY_SESSION_COOKIE, SESSION_COOKIE } from '@/server/session'


export const metadata: Metadata = {
  title: 'Админ-панель — Stelix Team',
  robots: { index: false, follow: false },
}

function AccessDenied() {
  return (
    <div className={ap('admin')}>
      <div className={ap('content')}>
        <section className={ap('section')}>
          <div className={ap('emptyState')}>
            <svg
              className={ap('emptyStateIcon')}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.5}
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <rect x="3" y="11" width="18" height="10" rx="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4M12 15v2" />
            </svg>
            <p className={ap('emptyStateText')}>Нет доступа</p>
            <p className={ap('emptyStateText')}>Эта страница доступна только администраторам.</p>
          </div>
        </section>
      </div>
    </div>
  )
}

export default async function AdminPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params

  const loc: Locale = isLocale(locale) ? locale : 'ru'

  const jar = await cookies()
  const isAuthed = Boolean(jar.get(SESSION_COOKIE)?.value || jar.get(LEGACY_SESSION_COOKIE)?.value)

  return <main>{isAuthed ? <AdminPanel /> : <AccessDenied />}</main>
}
