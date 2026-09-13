'use client'


import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '@/components/auth/AuthProvider'
import { useT } from '@/i18n/LocaleProvider'
import { PurchasesListSkeleton } from './PurchasesListSkeleton'
import { PurchaseStackRow, type Purchase } from './PurchaseStackRow'

const pl = (...n: string[]) => n.map((x) => `PurchasesList-module__gstXbW__${x}`).join(' ')
const ph = (...n: string[]) => n.map((x) => `PageHeaderBar-module__1SDZQW__${x}`).join(' ')
const phs = (...n: string[]) => n.map((x) => `PageHeaderSearch-module__szXj0q__${x}`).join(' ')
const ces = (...n: string[]) => n.map((x) => `CenteredEmptyState-module__97Qt0G__${x}`).join(' ')

type Status = 'loading' | 'ready'


interface PurchasesResponse {
  purchases?: Purchase[]
  items?: Purchase[]
  data?: Purchase[]
  total?: number
}


function extractPurchases(payload: unknown): Purchase[] {
  if (Array.isArray(payload)) return payload as Purchase[]
  if (payload && typeof payload === 'object') {
    const p = payload as PurchasesResponse
    if (Array.isArray(p.purchases)) return p.purchases
    if (Array.isArray(p.items)) return p.items
    if (Array.isArray(p.data)) return p.data
  }
  return []
}

interface HeaderProps {
  count: number
  searchOpen: boolean
  query: string
  onToggleSearch: () => void
  onQueryChange: (value: string) => void
}


function PurchasesHeader({ count, searchOpen, query, onToggleSearch, onQueryChange }: HeaderProps) {
  const tr = useT()
  return (
    <header className={ph('headerBar')}>
      <div className={ph('headerBar__start')}>
        <h1 className={ph('headerBar__title')}>{tr('Мои покупки')}</h1>
        <span className={ph('headerBar__count')} aria-label={`${tr('Покупок:')} ${count}`}>
          {count}
        </span>
      </div>
      <div className={ph('headerBar__end')}>
        <span className={ph('headerBar__divider')} aria-hidden="true" />
        <div className={ph('headerBar__actions')}>
          <div className={phs('root')}>
            {searchOpen ? (
              <div className={phs('field')}>
                <input
                  type="search"
                  className={phs('fieldInput')}
                  value={query}
                  onChange={(e) => onQueryChange(e.target.value)}
                  placeholder={tr('Поиск по ресурсам')}
                  aria-label={tr('Поиск по ресурсам')}
                  autoFocus
                />
              </div>
            ) : null}
            <button
              type="button"
              className={phs('toggle')}
              aria-label={tr('Поиск по ресурсам')}
              aria-expanded={searchOpen || undefined}
              data-tooltip-trigger=""
              onClick={onToggleSearch}
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                className={searchOpen ? phs('toggleIcon', 'toggleIconClose') : phs('toggleIcon')}
                aria-hidden="true"
              >
                {searchOpen ? (
                  <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                ) : (
                  <>
                    <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2" />
                    <path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </>
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}


function PurchasesEmpty() {
  const tr = useT()
  return (
    <div className={pl('belowHeader', 'belowHeaderCenter')}>
      <div className={ces('root') + ' ' + pl('empty')}>
        <svg viewBox="0 0 24 24" fill="none" className={ces('icon')} aria-hidden="true">
          <path
            d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M3 6h18M16 10a4 4 0 11-8 0"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <p className={ph('headerBar__emptyCaption') + ' ' + ces('caption')}>{tr('Список покупок пуст')}</p>
      </div>
    </div>
  )
}

export function PurchasesList() {
  const { user, loading: authLoading } = useAuth()
  const [status, setStatus] = useState<Status>('loading')
  const [purchases, setPurchases] = useState<Purchase[]>([])
  const [searchOpen, setSearchOpen] = useState(false)
  const [query, setQuery] = useState('')

  useEffect(() => {

    if (authLoading) return


    if (!user) {
      setPurchases([])
      setStatus('ready')
      return
    }

    const controller = new AbortController()
    setStatus('loading')

    fetch('/api/purchases', {
      signal: controller.signal,
      credentials: 'include',
      headers: { Accept: 'application/json' },
      cache: 'no-store',
    })
      .then(async (res) => {


        if (!res.ok) return []
        const body = await res.json().catch(() => null)
        return extractPurchases(body)
      })
      .then((list) => {
        setPurchases(list)
        setStatus('ready')
      })
      .catch((err: unknown) => {
        if (err instanceof DOMException && err.name === 'AbortError') return
        setPurchases([])
        setStatus('ready')
      })

    return () => controller.abort()
  }, [authLoading, user])


  const visible = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return purchases
    return purchases.filter((p) => p.title.toLowerCase().includes(q))
  }, [purchases, query])

  if (authLoading || status === 'loading') {
    return <PurchasesListSkeleton />
  }

  const isEmpty = visible.length === 0

  return (
    <section className={pl('section', 'sectionFlex')}>
      <div className={'container ' + pl('container')}>
        <PurchasesHeader
          count={purchases.length}
          searchOpen={searchOpen}
          query={query}
          onToggleSearch={() =>
            setSearchOpen((o) => {
              const next = !o
              if (!next) setQuery('')
              return next
            })
          }
          onQueryChange={setQuery}
        />
        {isEmpty ? (
          <PurchasesEmpty />
        ) : (
          <div className={pl('belowHeader')}>
            <div className={pl('stackList', 'stackListPurchases')} role="list">
              {visible.map((p) => (
                <PurchaseStackRow key={String(p.id)} purchase={p} />
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
