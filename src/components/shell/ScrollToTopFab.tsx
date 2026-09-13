'use client'

import { useEffect, useState } from 'react'
import { useT } from '@/i18n/LocaleProvider'

const fab = (...n: string[]) => n.map((x) => `ScrollToTopFab-module__sjPEcW__${x}`).join(' ')

export function ScrollToTopFab() {
  const tr = useT()
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 400)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div className={fab('root') + (visible ? ' ' + fab('rootVisible') : ' ')}>
      <button
        type="button"
        className={fab('fab')}
        aria-label={tr('Наверх')}
        data-tooltip-trigger=""
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      >
        <svg viewBox="0 0 24 24" fill="none" className={fab('fabIcon')} aria-hidden="true">
          <path d="M18 15l-6-6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
    </div>
  )
}
