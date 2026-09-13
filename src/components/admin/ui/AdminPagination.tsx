import type { ReactNode } from 'react'
import { ap, cx } from './ap'

export interface AdminPaginationProps {
  page: number
  pageCount: number
  onPageChange?: (page: number) => void
  total?: number
  pageSize?: number
  summary?: ReactNode
  siblingCount?: number
  className?: string
}

type PageToken = number | 'ellipsis'

function buildPages(page: number, pageCount: number, siblingCount: number): PageToken[] {
  const totalNumbers = siblingCount * 2 + 5
  if (pageCount <= totalNumbers) {
    return Array.from({ length: pageCount }, (_, i) => i + 1)
  }
  const left = Math.max(page - siblingCount, 2)
  const right = Math.min(page + siblingCount, pageCount - 1)
  const tokens: PageToken[] = [1]
  if (left > 2) tokens.push('ellipsis')
  for (let p = left; p <= right; p++) tokens.push(p)
  if (right < pageCount - 1) tokens.push('ellipsis')
  tokens.push(pageCount)
  return tokens
}

function ChevronIcon({ dir }: { dir: 'prev' | 'next' }) {
  return (
    <svg className={ap('usersPaginationIcon')} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={dir === 'prev' ? 'm15 18-6-6 6-6' : 'm9 18 6-6-6-6'} />
    </svg>
  )
}

export function AdminPagination({
  page,
  pageCount,
  onPageChange,
  total,
  pageSize,
  summary,
  siblingCount = 1,
  className,
}: AdminPaginationProps) {
  const go = (p: number) => {
    if (onPageChange && p >= 1 && p <= pageCount && p !== page) onPageChange(p)
  }

  let summaryNode: ReactNode = summary
  if (summaryNode == null && total != null && pageSize != null && total > 0) {
    const from = (page - 1) * pageSize + 1
    const to = Math.min(page * pageSize, total)
    summaryNode = `Показано ${from}–${to} из ${total}`
  }

  const tokens = buildPages(page, Math.max(pageCount, 1), siblingCount)

  return (
    <div className={cx(ap('usersPagination'), className)}>
      {summaryNode != null ? <span className={ap('usersPaginationSummary')}>{summaryNode}</span> : <span />}

      <div className={ap('usersPaginationControls')}>
        <button
          type="button"
          className={ap('usersPaginationPage', 'usersPaginationArrowBtn')}
          onClick={() => go(page - 1)}
          disabled={page <= 1}
          aria-label="Предыдущая страница"
        >
          <ChevronIcon dir="prev" />
        </button>

        <span className={ap('usersPaginationPages')}>
          {tokens.map((t, i) =>
            t === 'ellipsis' ? (
              <span key={`e${i}`} className={ap('usersPaginationEllipsis')} aria-hidden="true">
                …
              </span>
            ) : (
              <button
                key={t}
                type="button"
                className={ap('usersPaginationPage', t === page && 'usersPaginationPageCurrent')}
                onClick={() => go(t)}
                aria-label={`Страница ${t}`}
                aria-current={t === page ? 'page' : undefined}
              >
                {t}
              </button>
            ),
          )}
        </span>

        <button
          type="button"
          className={ap('usersPaginationPage', 'usersPaginationArrowBtn')}
          onClick={() => go(page + 1)}
          disabled={page >= pageCount}
          aria-label="Следующая страница"
        >
          <ChevronIcon dir="next" />
        </button>
      </div>
    </div>
  )
}
