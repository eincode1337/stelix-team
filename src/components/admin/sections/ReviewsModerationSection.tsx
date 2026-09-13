'use client'


import { useCallback, useEffect, useMemo, useState } from 'react'

import {
  ap,
  AdminTable,
  AdminIconButton,
  AdminBadge,
  AdminPagination,
  AdminSearchInput,
  AdminSectionHeader,
  AdminFilterBar,
  roleLabel,
  type AdminColumn,
  type SortDirection,
} from '@/components/admin/ui'
import { ExternalLinkActionIcon, DeleteActionIcon, HideActionIcon, ViewActionIcon } from './AdminActionIcons'


const REVIEWS_ENDPOINT = '/api/admin/reviews'

const HIDDEN_STORAGE_KEY = 'stelix.admin.reviews.hidden'


function loadHiddenIds(): Set<number> {
  if (typeof window === 'undefined') return new Set()
  try {
    const raw = window.localStorage.getItem(HIDDEN_STORAGE_KEY)
    if (!raw) return new Set()
    const arr = JSON.parse(raw) as unknown
    return new Set(Array.isArray(arr) ? arr.filter((n): n is number => typeof n === 'number') : [])
  } catch {
    return new Set()
  }
}

function persistHiddenIds(ids: Set<number>): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(HIDDEN_STORAGE_KEY, JSON.stringify([...ids]))
  } catch {

  }
}


interface AdminReviewReviewer {
  name: string
  role?: string | null
  id?: number
}

interface AdminReviewContext {
  resourceId: string
  resourceSlug: string
  resourceTitle: string
  sellerLogin: string
  sellerRole?: string | null
}

interface AdminReview {
  id: number
  reviewer: AdminReviewReviewer
  context: AdminReviewContext
  comment: string
  rating: number
  reply?: string | null
  createdAt: string
  updatedAt?: string | null
}

interface ReviewsResponse {
  items: AdminReview[]
  total: number
  page: number
  pageSize: number
}


const REVIEWS_MODULE_PREFIX = 'Reviews-module__znp1RG__' as const
function rv(...names: (string | false | null | undefined)[]): string {
  return names.filter(Boolean).map((n) => `${REVIEWS_MODULE_PREFIX}${n as string}`).join(' ')
}


const DATE_FMT = new Intl.DateTimeFormat('ru-RU', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
})
function formatSiteDateDmyCommaHm(iso: string | null | undefined): string {
  if (!iso) return '—'
  const t = Date.parse(iso)
  if (Number.isNaN(t)) return '—'

  return DATE_FMT.format(new Date(t))
}


const DISPLAY_PAGE_SIZE = 20

const COMMENT_TOGGLE_THRESHOLD = 90

const RATING_FILTERS: (number | null)[] = [null, 5, 4, 3, 2, 1]

type SortKey = 'rating' | 'createdAt' | 'updatedAt'


function ReviewStars({ value }: { value: number }) {
  const full = Math.max(0, Math.min(5, Math.round(value)))
  return (
    <span className={rv('reviewRating')} aria-label={`Оценка ${value} из 5`} title={`${value} / 5`}>
      {Array.from({ length: 5 }, (_, i) => (
        <svg
          key={i}
          className={rv('reviewStarIcon', i < full && 'reviewStarFilled')}
          viewBox="0 0 24 24"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M12 2.6l2.9 5.87 6.48.94-4.69 4.57 1.11 6.45L12 17.9l-5.8 3.05 1.1-6.45L2.62 9.4l6.48-.94z" />
        </svg>
      ))}
    </span>
  )
}


function ReviewCommentCell({
  comment,
  expanded,
  onToggle,
}: {
  comment: string
  expanded: boolean
  onToggle: () => void
}) {
  if (!comment) {
    return <span className={ap('reviewCellEmpty')}>—</span>
  }
  const showToggle = comment.length > COMMENT_TOGGLE_THRESHOLD
  return (
    <>
      <span className={ap('tableCellReviewCommentText', !expanded && 'tableCellReviewCommentTextClamped')}>
        {comment}
      </span>
      {showToggle ? (
        <button type="button" className={ap('tableCellReviewCommentToggle')} onClick={onToggle}>
          <span>{expanded ? 'Свернуть' : 'Показать полностью'}</span>
          <svg
            className={ap('tableCellReviewCommentToggleIcon')}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
            style={{ transform: expanded ? 'rotate(180deg)' : undefined, transition: 'transform .15s' }}
          >
            <path d="m6 9 6 6 6-6" />
          </svg>
        </button>
      ) : null}
    </>
  )
}


function ReviewDeleteModal({
  review,
  busy,
  error,
  onCancel,
  onConfirm,
}: {
  review: AdminReview
  busy: boolean
  error: string | null
  onCancel: () => void
  onConfirm: () => void
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !busy) onCancel()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [busy, onCancel])

  return (
    <div
      className={ap('editBackdrop')}

      style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.25rem' }}
      onClick={busy ? undefined : onCancel}
      role="presentation"
    >
      <div
        className={ap('adminReviewDeleteModal')}
        role="dialog"
        aria-modal="true"
        aria-label="Удалить отзыв"
        onClick={(e) => e.stopPropagation()}
      >
        <div className={ap('adminReviewDeleteInner')}>

          <h3
            style={{
              margin: '0 0 .75rem',
              fontSize: '1.12rem',
              fontWeight: 600,
              lineHeight: 1.3,
              color: 'var(--fg-default)',
            }}
          >
            Удалить отзыв?
          </h3>
          <p className={ap('adminReviewDeleteText')}>
            Отзыв будет удалён без возможности восстановления.
          </p>
          {error ? (

            <p className={ap('adminReviewDeleteText')} role="alert" style={{ color: 'var(--danger, #d33)' }}>
              {error}
            </p>
          ) : null}
          <div className={ap('adminReviewDeleteActions')}>
            <button type="button" className={ap('formBtnPrimary')} onClick={onCancel} disabled={busy}>
              Отмена
            </button>
            <button type="button" className={ap('formBtnDanger')} onClick={onConfirm} disabled={busy}>
              {busy ? 'Удаление…' : 'Удалить'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}


export function ReviewsModerationSection() {
  const [reviews, setReviews] = useState<AdminReview[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)


  const [search, setSearch] = useState('')
  const [query, setQuery] = useState('')
  const [rating, setRating] = useState<number | null>(null)
  const [sort, setSort] = useState<{ key: SortKey; dir: 'asc' | 'desc' }>({ key: 'createdAt', dir: 'desc' })
  const [page, setPage] = useState(1)


  const [expanded, setExpanded] = useState<Set<number>>(() => new Set())
  const [deleteTarget, setDeleteTarget] = useState<AdminReview | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)


  const [hiddenIds, setHiddenIds] = useState<Set<number>>(() => loadHiddenIds())
  const [showHidden, setShowHidden] = useState(false)
  const [hideBusy, setHideBusy] = useState<Set<number>>(() => new Set())


  useEffect(() => {
    const controller = new AbortController()
    let alive = true

    async function load() {
      setLoading(true)
      setError(null)
      try {
        const collected: AdminReview[] = []
        let pageNum = 1
        const pageSize = 100

        for (let guard = 0; guard < 50; guard++) {
          const url = `${REVIEWS_ENDPOINT}?page=${pageNum}&pageSize=${pageSize}`
          const res = await fetch(url, {
            signal: controller.signal,
            cache: 'no-store',
            credentials: 'same-origin',
            headers: { accept: 'application/json' },
          })
          if (!res.ok) {
            throw new Error(
              res.status === 401 ? 'Требуется вход в систему' : `Ошибка загрузки (${res.status})`,
            )
          }
          const json = (await res.json()) as ReviewsResponse
          const items = Array.isArray(json.items) ? json.items : []
          collected.push(...items)
          const total = typeof json.total === 'number' ? json.total : collected.length
          if (items.length < pageSize || collected.length >= total) break
          pageNum += 1
        }
        if (alive) setReviews(collected)
      } catch (err) {
        if ((err as Error).name === 'AbortError') return
        if (alive) setError((err as Error).message || 'Не удалось загрузить данные')
      } finally {
        if (alive) setLoading(false)
      }
    }

    void load()
    return () => {
      alive = false
      controller.abort()
    }
  }, [])


  useEffect(() => {
    const t = setTimeout(() => setQuery(search), 250)
    return () => clearTimeout(t)
  }, [search])


  useEffect(() => {
    persistHiddenIds(hiddenIds)
  }, [hiddenIds])


  useEffect(() => {
    setPage(1)
  }, [query, rating, sort, showHidden])


  const filtered = useMemo(() => {
    let list = reviews

    if (rating != null) {
      list = list.filter((r) => Math.round(r.rating) === rating)
    }

    const q = query.trim().toLowerCase()
    if (q) {
      list = list.filter((r) =>
        [
          r.reviewer.name,
          r.context.resourceTitle,
          r.context.sellerLogin,
          r.context.resourceId,
          r.comment,
          r.reply,
        ]
          .filter(Boolean)
          .some((v) => String(v).toLowerCase().includes(q)),
      )
    }

    const dir = sort.dir === 'asc' ? 1 : -1
    return [...list].sort((a, b) => {
      if (sort.key === 'rating') return (a.rating - b.rating) * dir
      const av = sort.key === 'updatedAt' ? a.updatedAt : a.createdAt
      const bv = sort.key === 'updatedAt' ? b.updatedAt : b.createdAt
      const at = av ? Date.parse(av) : 0
      const bt = bv ? Date.parse(bv) : 0
      return (at - bt) * dir
    })
  }, [reviews, rating, query, sort])


  const hiddenCount = useMemo(() => filtered.reduce((n, r) => n + (hiddenIds.has(r.id) ? 1 : 0), 0), [filtered, hiddenIds])
  const visible = useMemo(
    () => (showHidden ? filtered : filtered.filter((r) => !hiddenIds.has(r.id))),
    [filtered, hiddenIds, showHidden],
  )


  const total = visible.length
  const pageCount = Math.max(1, Math.ceil(total / DISPLAY_PAGE_SIZE))
  const safePage = Math.min(page, pageCount)
  const pageRows = useMemo(
    () => visible.slice((safePage - 1) * DISPLAY_PAGE_SIZE, safePage * DISPLAY_PAGE_SIZE),
    [visible, safePage],
  )


  const onSort = useCallback((key: string) => {
    setSort((s) => (s.key === key ? { key: s.key, dir: s.dir === 'asc' ? 'desc' : 'asc' } : { key: key as SortKey, dir: 'desc' }))
  }, [])

  const toggleExpanded = useCallback((id: number) => {
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [])

  const openResource = useCallback((r: AdminReview) => {


    const slug = r.context.resourceSlug || r.context.resourceId
    if (typeof window === 'undefined') return
    let locale = 'ru'
    try {
      const seg = window.location.pathname.split('/').filter(Boolean)[0]
      if (seg === 'ru' || seg === 'uk' || seg === 'en') locale = seg
    } catch {

    }
    window.open(`/${locale}/resources/${slug}`, '_blank', 'noopener')
  }, [])


  const confirmDelete = useCallback(async () => {
    if (!deleteTarget) return
    const id = deleteTarget.id
    setDeleting(true)
    setDeleteError(null)
    try {
      const res = await fetch(`${REVIEWS_ENDPOINT}/${id}`, {
        method: 'DELETE',
        credentials: 'same-origin',
        headers: { accept: 'application/json' },
      })
      if (!res.ok) {
        throw new Error(
          res.status === 401 ? 'Требуется вход в систему' : `Не удалось удалить (${res.status})`,
        )
      }


      setReviews((prev) => prev.filter((r) => r.id !== id))
      setExpanded((prev) => {
        if (!prev.has(id)) return prev
        const next = new Set(prev)
        next.delete(id)
        return next
      })
      setDeleteTarget(null)
    } catch (err) {
      setDeleteError((err as Error).message || 'Не удалось удалить отзыв')
    } finally {
      setDeleting(false)
    }
  }, [deleteTarget])


  const setHidden = useCallback((review: AdminReview, hidden: boolean) => {
    const id = review.id


    setHiddenIds((prev) => {
      const next = new Set(prev)
      if (hidden) next.add(id)
      else next.delete(id)
      return next
    })
    setHideBusy((prev) => {
      const next = new Set(prev)
      next.add(id)
      return next
    })
    void fetch(`${REVIEWS_ENDPOINT}/${id}`, {
      method: 'POST',
      credentials: 'same-origin',
      headers: { 'content-type': 'application/json', accept: 'application/json' },
      body: JSON.stringify({ action: hidden ? 'hide' : 'unhide' }),
    })
      .catch(() => {

      })
      .finally(() => {
        setHideBusy((prev) => {
          if (!prev.has(id)) return prev
          const next = new Set(prev)
          next.delete(id)
          return next
        })
      })
  }, [])

  const sortDir = (key: SortKey): SortDirection => (sort.key === key ? sort.dir : null)


  const columns: AdminColumn<AdminReview>[] = [
    {

      key: 'author',
      header: 'Автор',
      align: 'start',
      cellClassName: ap('tableCellUserIdentity'),
      cell: (r) => (
        <>
          <span className={ap('tableCellUserName')}>{r.reviewer.name}</span>
          <span className={ap('tableCellUserEmail')}>
            {r.reviewer.role ? roleLabel(r.reviewer.role) : r.reviewer.id != null ? `#${r.reviewer.id}` : ''}
          </span>
        </>
      ),
    },
    {

      key: 'context',
      header: 'Контекст',
      align: 'start',
      cellClassName: ap('tableCellReviewContext'),
      cell: (r) => (
        <>
          <span className={ap('tableCellResourceTitle')}>{r.context.resourceTitle}</span>
          <div className={ap('reviewContextMetaList')}>
            <p className={ap('reviewContextMetaLine')}>
              <span className={ap('reviewContextMetaLabel')}>Продавец: </span>
              <span className={ap('reviewContextMetaLineBody')}>{r.context.sellerLogin}</span>
            </p>
            <p className={ap('reviewContextMetaLine')}>
              <span className={ap('reviewContextMetaLabel')}>ID: </span>
              <span className={ap('reviewContextMetaLineBody')}>{r.context.resourceId}</span>
            </p>
          </div>
        </>
      ),
    },
    {

      key: 'comment',
      header: 'Комментарий',
      align: 'start',
      cellClassName: ap('tableCellReviewComment'),
      cell: (r) => (
        <ReviewCommentCell comment={r.comment} expanded={expanded.has(r.id)} onToggle={() => toggleExpanded(r.id)} />
      ),
    },
    {

      key: 'rating',
      header: 'Оценка',
      align: 'center',
      sortable: true,
      sortDirection: sortDir('rating'),
      onSort,
      cell: (r) => <ReviewStars value={r.rating} />,
    },
    {

      key: 'reply',
      header: 'Ответ',
      align: 'start',
      cellClassName: ap('tableCellReviewReply'),
      cell: (r) =>
        r.reply ? <span>{r.reply}</span> : <span className={ap('reviewCellEmpty')}>Без ответа</span>,
    },
    {

      key: 'createdAt',
      header: 'Создан',
      align: 'end',
      sortable: true,
      sortDirection: sortDir('createdAt'),
      onSort,
      cell: (r) => <span className={ap('tableCellDateSingle')}>{formatSiteDateDmyCommaHm(r.createdAt)}</span>,
    },
    {

      key: 'updatedAt',
      header: 'Изменён',
      align: 'end',
      sortable: true,
      sortDirection: sortDir('updatedAt'),
      onSort,
      cell: (r) => <span className={ap('tableCellDateSingle')}>{formatSiteDateDmyCommaHm(r.updatedAt)}</span>,
    },
    {

      key: 'actions',
      header: 'Действия',
      align: 'actions',
      cell: (r) => (
        <>

          <AdminIconButton
            label="Открыть ресурс"
            tone="accent"
            onClick={() => openResource(r)}
          >
            <ExternalLinkActionIcon />
          </AdminIconButton>
          {hiddenIds.has(r.id) ? (
            <AdminIconButton
              label="Показать отзыв"
              tone="success"
              disabled={hideBusy.has(r.id)}
              onClick={() => setHidden(r, false)}
            >
              <ViewActionIcon />
            </AdminIconButton>
          ) : (
            <AdminIconButton
              label="Скрыть отзыв"
              tone="warning"
              disabled={hideBusy.has(r.id)}
              onClick={() => setHidden(r, true)}
            >
              <HideActionIcon />
            </AdminIconButton>
          )}
          <AdminIconButton
            label="Удалить"
            tone="danger"
            onClick={() => {
              setDeleteError(null)
              setDeleteTarget(r)
            }}
          >
            <DeleteActionIcon />
          </AdminIconButton>
        </>
      ),
    },
  ]

  const chipBtnStyle = { background: 'none', border: 'none', padding: 0, cursor: 'pointer', font: 'inherit' } as const

  return (
    <>

      <AdminSectionHeader title="Отзывы">
        <AdminSearchInput
          value={search}
          onChange={setSearch}
          onClear={() => setSearch('')}
          pending={search !== query}
          placeholder="Поиск"
          ariaLabel="Поиск отзывов"
        />
      </AdminSectionHeader>

      {error ? (

        <div className={ap('adminDataLoadingWrap')}>
          <p className={ap('emptyStateText')}>{error}</p>
        </div>
      ) : (
        <>
          {!loading ? (
            <>

              <p className={ap('reviewsCount')}>
                Всего отзывов: {total}
                {hiddenCount > 0 ? ` · скрыто: ${hiddenCount}` : ''}
              </p>


              <AdminFilterBar>
                {RATING_FILTERS.map((value) => {
                  const active = rating === value
                  return (
                    <button
                      key={value ?? 'all'}
                      type="button"
                      style={chipBtnStyle}
                      onClick={() => setRating(value)}
                      aria-pressed={active}
                    >
                      <AdminBadge tone={active ? 'info' : 'muted'}>
                        {value == null ? 'Все' : `${value} ★`}
                      </AdminBadge>
                    </button>
                  )
                })}

                {hiddenCount > 0 || showHidden ? (
                  <button
                    type="button"
                    style={chipBtnStyle}
                    onClick={() => setShowHidden((v) => !v)}
                    aria-pressed={showHidden}
                  >
                    <AdminBadge tone={showHidden ? 'warning' : 'muted'}>
                      {showHidden ? 'Скрывать скрытые' : `Показать скрытые (${hiddenCount})`}
                    </AdminBadge>
                  </button>
                ) : null}
              </AdminFilterBar>
            </>
          ) : null}

          <AdminTable
            variant="Reviews"
            columns={columns}
            rows={pageRows}
            rowKey={(r) => r.id}
            loading={loading}
            ariaLabel="Отзывы"
            emptyText="Отзывов пока нет"
          />

          {!loading && total > 0 ? (
            <AdminPagination
              page={safePage}
              pageCount={pageCount}
              onPageChange={setPage}
              total={total}
              pageSize={DISPLAY_PAGE_SIZE}
            />
          ) : null}
        </>
      )}

      {deleteTarget ? (
        <ReviewDeleteModal
          review={deleteTarget}
          busy={deleting}
          error={deleteError}
          onCancel={() => {
            setDeleteTarget(null)
            setDeleteError(null)
          }}
          onConfirm={confirmDelete}
        />
      ) : null}
    </>
  )
}

export default ReviewsModerationSection
