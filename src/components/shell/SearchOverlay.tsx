'use client'

import Link from 'next/link'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useT } from '@/i18n/LocaleProvider'

const nb = (...names: string[]) => names.map((n) => `Navbar-module__O8Na-a__${n}`).join(' ')
const sd = (...names: string[]) => names.map((n) => `SearchDropdown-module__Txk6tq__${n}`).join(' ')

type Resource = {
  id: string
  slug: string
  title: string
  shortDescription: string | null
  description: string | null
  price: number
  discount: number | null
  category: string
  coverImage: string | null
  listingKind: string
}

const CATEGORY_LABELS: Record<string, string> = {
  plugins: 'Плагины',
  scripts: 'Скрипты',
  modules: 'Модули',
  maps: 'Карты',
  integrations: 'Интеграции',
  models: 'Модели',
  particles: 'Партиклы',
  assemblies: 'Сборки',
  tools: 'Инструменты',
  other: 'Прочее',
}

const CATEGORY_ORDER = Object.keys(CATEGORY_LABELS)

const RECENT_KEY = 'stelix:recent-search'
const RECENT_LIMIT = 6
const RESULT_LIMIT = 24
const DEBOUNCE_MS = 200
const MIN_QUERY = 1

const priceFmt = new Intl.NumberFormat('ru-RU')

function categoryLabel(category: string): string {
  return CATEGORY_LABELS[category] ?? category
}

function SearchGlassIcon({ className }: { className: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2" />
      <path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

function CloseIcon({ className }: { className: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function CategoryIcon({ className }: { className: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

function ClockIcon({ className }: { className: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
      <path d="M12 7v5l3 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function RubleIcon({ className }: { className: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512" fill="currentColor" className={className} aria-hidden="true">
      <path d="M64 32C46.3 32 32 46.3 32 64l0 192 0 32 0 64-32 0c-17.7 0-32 14.3-32 32s14.3 32 32 32l32 0 0 32c0 17.7 14.3 32 32 32s32-14.3 32-32l0-32 96 0c17.7 0 32-14.3 32-32s-14.3-32-32-32l-96 0 0-32 112 0c88.4 0 160-71.6 160-160S312.4 32 224 32L64 32zM224 256l-96 0 0-160 96 0c53 0 96 43 96 96s-43 64-96 64z" />
    </svg>
  )
}

function ResourceResult({ resource, onSelect }: { resource: Resource; onSelect: () => void }) {
  const tr = useT()
  const hasSale = typeof resource.discount === 'number' && resource.discount > resource.price
  return (
    <Link className={sd('result')} href={`/resources/${resource.slug}`} onClick={onSelect}>
      <div className={sd('resultResourceLayout')}>
        {resource.coverImage ? (
          <img className={sd('resultCover')} src={resource.coverImage} alt="" width={38} height={38} loading="lazy" decoding="async" />
        ) : (
          <span className={sd('resultCover')} aria-hidden="true" />
        )}
        <div className={sd('resultResourceMain')}>
          <span className={sd('resultTitle')}>{resource.title}</span>
          <div className={sd('resultResourceMetaLeft')}>
            <span className={sd('resultResourceKind')}>{tr(categoryLabel(resource.category))}</span>
          </div>
        </div>
      </div>
      <div className={sd('resultResourcePriceAside')}>
        <div className={sd('searchResourcePriceRow')}>
          {hasSale ? (
            <span className={sd('searchResourcePriceOld')}>{priceFmt.format(resource.discount as number)}</span>
          ) : null}
          <span className={sd('searchResourcePriceMain')}>
            <span className={sd('searchResourcePriceDigits')}>{priceFmt.format(resource.price)}</span>
            <RubleIcon className={sd('searchResourcePriceIcon')} />
          </span>
        </div>
      </div>
    </Link>
  )
}

export interface SearchOverlayProps {
  open: boolean
  onClose: () => void
}

export function SearchOverlay({ open, onClose }: SearchOverlayProps) {
  const tr = useT()
  const [mounted, setMounted] = useState(false)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Resource[]>([])
  const [loading, setLoading] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)
  const [recent, setRecent] = useState<string[]>([])

  const inputRef = useRef<HTMLInputElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const abortRef = useRef<AbortController | null>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    try {
      const raw = localStorage.getItem(RECENT_KEY)
      if (raw) {
        const parsed = JSON.parse(raw)
        if (Array.isArray(parsed)) setRecent(parsed.filter((v) => typeof v === 'string').slice(0, RECENT_LIMIT))
      }
    } catch {
    }
  }, [])

  const persistRecent = useCallback((next: string[]) => {
    setRecent(next)
    try {
      localStorage.setItem(RECENT_KEY, JSON.stringify(next))
    } catch {
    }
  }, [])

  const pushRecent = useCallback(
    (term: string) => {
      const t = term.trim()
      if (!t) return
      persistRecent([t, ...recent.filter((r) => r.toLowerCase() !== t.toLowerCase())].slice(0, RECENT_LIMIT))
    },
    [persistRecent, recent],
  )

  const removeRecent = useCallback(
    (term: string) => {
      persistRecent(recent.filter((r) => r !== term))
    },
    [persistRecent, recent],
  )

  useEffect(() => {
    if (!open) return
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const focusTimer = setTimeout(() => inputRef.current?.focus(), 0)
    return () => {
      document.body.style.overflow = previousOverflow
      clearTimeout(focusTimer)
    }
  }, [open])

  useEffect(() => {
    if (open) return
    setQuery('')
    setResults([])
    setHasSearched(false)
    setLoading(false)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    abortRef.current?.abort()
  }, [open])

  useEffect(() => {
    if (!open) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        onClose()
      }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [open, onClose])

  useEffect(() => {
    if (!open) return
    const q = query.trim()
    if (debounceRef.current) clearTimeout(debounceRef.current)
    abortRef.current?.abort()

    if (q.length < MIN_QUERY) {
      setResults([])
      setLoading(false)
      setHasSearched(false)
      return
    }

    setLoading(true)
    debounceRef.current = setTimeout(async () => {
      const controller = new AbortController()
      abortRef.current = controller
      try {
        const res = await fetch(`/api/resources?search=${encodeURIComponent(q)}`, { signal: controller.signal })
        const data = await res.json()
        const list: Resource[] = Array.isArray(data?.resources) ? data.resources.slice(0, RESULT_LIMIT) : []
        setResults(list)
        setHasSearched(true)
      } catch (err) {
        if ((err as { name?: string })?.name !== 'AbortError') {
          setResults([])
          setHasSearched(true)
        }
      } finally {
        setLoading(false)
      }
    }, DEBOUNCE_MS)

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [query, open])

  const groups = useMemo(() => {
    const byCategory = new Map<string, Resource[]>()
    for (const r of results) {
      const bucket = byCategory.get(r.category)
      if (bucket) bucket.push(r)
      else byCategory.set(r.category, [r])
    }
    const keys = Array.from(byCategory.keys()).sort((a, b) => {
      const ia = CATEGORY_ORDER.indexOf(a)
      const ib = CATEGORY_ORDER.indexOf(b)
      return (ia === -1 ? Number.MAX_SAFE_INTEGER : ia) - (ib === -1 ? Number.MAX_SAFE_INTEGER : ib)
    })
    return keys.map((category) => ({ category, items: byCategory.get(category)! }))
  }, [results])

  const handleSelect = useCallback(() => {
    pushRecent(query)
    onClose()
  }, [pushRecent, query, onClose])

  const onInputKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        pushRecent(query)
      }
    },
    [pushRecent, query],
  )

  if (!mounted || !open) return null

  const trimmed = query.trim()

  let body: React.ReactNode
  if (loading) {
    body = (
      <div className={sd('empty')}>
        <div className={sd('loadingSpinner')}>
          <div className={sd('loadingSpinnerCircle')} />
        </div>
        <p className={sd('emptyText')}>{tr('Идёт поиск…')}</p>
      </div>
    )
  } else if (trimmed.length < MIN_QUERY) {
    if (recent.length > 0) {
      body = (
        <div className={sd('category')}>
          <div className={sd('categoryHeader')}>
            <div className={sd('categoryHeaderLeft')}>
              <ClockIcon className={sd('categoryIcon')} />
              <span className={sd('categoryLabel')}>{tr('Недавние запросы')}</span>
            </div>
            <span className={sd('categoryHeaderDivider')} aria-hidden="true" />
          </div>
          <div className={sd('results')}>
            {recent.map((term) => (
              <div className={sd('recentRow')} key={term}>
                <button type="button" className={sd('recentItem')} onClick={() => setQuery(term)}>
                  <span className={sd('recentText')}>{term}</span>
                </button>
                <button
                  type="button"
                  className={sd('recentRemove')}
                  aria-label={tr('Удалить из истории')}
                  onClick={() => removeRecent(term)}
                >
                  <CloseIcon className={sd('recentRemoveIcon')} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )
    } else {
      body = (
        <div className={sd('empty')}>
          <SearchGlassIcon className={sd('emptyIcon')} />
          <p className={sd('emptyText')}>{tr('Начните вводить запрос')}</p>
          <p className={sd('emptyHint')}>{tr('Ищите плагины, скрипты, модули, карты и интеграции по названию.')}</p>
        </div>
      )
    }
  } else if (hasSearched && results.length === 0) {
    body = (
      <div className={sd('empty')}>
        <SearchGlassIcon className={sd('emptyIcon')} />
        <p className={sd('emptyText')}>{tr('Ничего не найдено')}</p>
        <p className={sd('emptyHint')}>{tr('Попробуйте изменить запрос или проверьте написание.')}</p>
      </div>
    )
  } else {
    body = groups.map((group) => (
      <div className={sd('category')} key={group.category}>
        <div className={sd('categoryHeader')}>
          <div className={sd('categoryHeaderLeft')}>
            <CategoryIcon className={sd('categoryIcon')} />
            <span className={sd('categoryLabel')}>{tr(categoryLabel(group.category))}</span>
          </div>
          <span className={sd('categoryHeaderDivider')} aria-hidden="true" />
        </div>
        <div className={sd('results')}>
          {group.items.map((resource) => (
            <ResourceResult key={resource.id} resource={resource} onSelect={handleSelect} />
          ))}
        </div>
      </div>
    ))
  }

  return createPortal(
    <div className={nb('searchLayer')}>
      <div className={nb('searchBackdrop', 'searchBackdropEnter')} aria-hidden="true" onClick={onClose} />
      <div className={nb('searchShell', 'searchShellEnter')} role="dialog" aria-modal="true" aria-label={tr('Поиск')}>
        <div className={nb('searchOverlayBar')}>
          <div className={nb('searchOverlayInner')}>
            <SearchGlassIcon className={nb('searchIcon')} />
            <input
              ref={inputRef}
              type="search"
              className={nb('searchInput')}
              placeholder={tr('Поиск ресурсов…')}
              aria-label={tr('Поиск')}
              autoComplete="off"
              autoCorrect="off"
              spellCheck={false}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={onInputKeyDown}
            />
            <kbd className={nb('searchShortcutKbd')}>Esc</kbd>
            <button type="button" className={nb('searchClose')} aria-label={tr('Закрыть поиск')} onClick={onClose}>
              <CloseIcon className={nb('searchCloseIcon')} />
            </button>
          </div>
        </div>
        <div className={nb('searchOverlayBody')}>
          <div className={nb('searchOverlayInner')}>
            <div className={sd('dropdown', 'dropdownAttached')}>{body}</div>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  )
}

export default SearchOverlay
