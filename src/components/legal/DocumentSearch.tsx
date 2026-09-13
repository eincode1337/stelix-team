'use client'

import { useEffect, useRef, useState } from 'react'
import { t } from '@/i18n/t'
import type { Locale } from '@/i18n/config'

const hs = (...n: string[]) => n.map((x) => `PageHeaderSearch-module__szXj0q__${x}`).join(' ')
const inp = (...n: string[]) => n.map((x) => `Input-module__b41z_W__${x}`).join(' ')

const ARTICLE_SEL = '.LegalDocumentContent-module__rYWUeW__articleSurface'
const FOOTER_SEL = '.PageHeaderBar-module__1SDZQW__headerBar_reverse'
const HIT_ATTR = 'data-doc-search-hit'

function removeHits() {
  const article = document.querySelector<HTMLElement>(ARTICLE_SEL)
  if (!article) return
  const hits = article.querySelectorAll<HTMLElement>(`mark[${HIT_ATTR}]`)
  const parents = new Set<Node>()
  hits.forEach((mark) => {
    const parent = mark.parentNode
    if (!parent) return
    parent.replaceChild(document.createTextNode(mark.textContent ?? ''), mark)
    parents.add(parent)
  })
  parents.forEach((parent) => parent.normalize())
}

function highlightTextNode(textNode: Text, needle: string, out: HTMLElement[]) {
  const text = textNode.nodeValue ?? ''
  const lower = text.toLowerCase()
  let idx = lower.indexOf(needle)
  if (idx === -1) return
  const frag = document.createDocumentFragment()
  let last = 0
  while (idx !== -1) {
    if (idx > last) frag.appendChild(document.createTextNode(text.slice(last, idx)))
    const mark = document.createElement('mark')
    mark.setAttribute(HIT_ATTR, '')
    mark.textContent = text.slice(idx, idx + needle.length)
    mark.style.backgroundColor = '#ffd84d'
    mark.style.color = '#1b1b1f'
    frag.appendChild(mark)
    out.push(mark)
    last = idx + needle.length
    idx = lower.indexOf(needle, last)
  }
  if (last < text.length) frag.appendChild(document.createTextNode(text.slice(last)))
  textNode.parentNode?.replaceChild(frag, textNode)
}

function collectHits(needle: string): HTMLElement[] {
  const article = document.querySelector<HTMLElement>(ARTICLE_SEL)
  if (!article) return []
  const walker = document.createTreeWalker(article, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      const value = node.nodeValue
      if (!value || !value.trim()) return NodeFilter.FILTER_REJECT
      const parent = (node as Text).parentElement
      if (!parent) return NodeFilter.FILTER_REJECT
      if (parent.closest('script,style')) return NodeFilter.FILTER_REJECT
      if (parent.closest(FOOTER_SEL)) return NodeFilter.FILTER_REJECT
      return value.toLowerCase().includes(needle) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP
    },
  })
  const targets: Text[] = []
  let node = walker.nextNode()
  while (node) {
    targets.push(node as Text)
    node = walker.nextNode()
  }
  const marks: HTMLElement[] = []
  targets.forEach((textNode) => highlightTextNode(textNode, needle, marks))
  return marks
}

function focusHit(marks: HTMLElement[], index: number) {
  marks.forEach((mark, i) => {
    if (i === index) {
      mark.style.boxShadow = '0 0 0 2px var(--fg-default)'
      mark.style.borderRadius = '2px'
    } else {
      mark.style.boxShadow = ''
      mark.style.borderRadius = ''
    }
  })
  marks[index]?.scrollIntoView({ block: 'center', behavior: 'smooth' })
}

export function DocumentSearch({ locale = 'ru' }: { locale?: Locale }) {
  const [expanded, setExpanded] = useState(false)
  const [query, setQuery] = useState('')
  const [count, setCount] = useState(0)
  const [current, setCurrent] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const marksRef = useRef<HTMLElement[]>([])
  const currentRef = useRef(0)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const label = t(locale, 'Поиск по тексту документа')

  function runSearch(raw: string) {
    removeHits()
    marksRef.current = []
    currentRef.current = 0
    setCurrent(0)
    const needle = raw.trim().toLowerCase()
    if (!needle) {
      setCount(0)
      return
    }
    const marks = collectHits(needle)
    marksRef.current = marks
    setCount(marks.length)
    if (marks.length) focusHit(marks, 0)
  }

  function step(delta: number) {
    const marks = marksRef.current
    if (!marks.length) return
    const next = (currentRef.current + delta + marks.length) % marks.length
    currentRef.current = next
    setCurrent(next)
    focusHit(marks, next)
  }

  function close() {
    if (timerRef.current) clearTimeout(timerRef.current)
    removeHits()
    marksRef.current = []
    currentRef.current = 0
    setCurrent(0)
    setCount(0)
    setQuery('')
    setExpanded(false)
  }

  useEffect(() => {
    if (expanded) inputRef.current?.focus()
  }, [expanded])

  useEffect(() => () => removeHits(), [])

  if (!expanded) {
    return (
      <div className={hs('root')}>
        <button
          type="button"
          className={hs('toggle')}
          aria-label={label}
          data-tooltip-trigger=""
          onClick={() => setExpanded(true)}
        >
          <svg viewBox="0 0 24 24" fill="none" className={hs('toggleIcon')} aria-hidden="true">
            <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2" />
            <path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>
      </div>
    )
  }

  const trimmed = query.trim()
  return (
    <div className={hs('root') + ' ' + hs('rootExpanded')}>
      <div className={inp('wrap') + ' ' + hs('field')}>
        <input
          ref={inputRef}
          type="text"
          className={inp('input') + ' ' + hs('fieldInput')}
          value={query}
          placeholder={label}
          aria-label={label}
          onChange={(e) => {
            const value = e.target.value
            setQuery(value)
            if (timerRef.current) clearTimeout(timerRef.current)
            timerRef.current = setTimeout(() => runSearch(value), 100)
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              step(e.shiftKey ? -1 : 1)
            } else if (e.key === 'Escape') {
              e.preventDefault()
              close()
            }
          }}
        />
      </div>
      {trimmed ? (
        <span
          aria-live="polite"
          style={{ fontSize: '0.8125rem', color: 'var(--fg-muted)', whiteSpace: 'nowrap', flexShrink: 0 }}
        >
          {count ? `${current + 1}/${count}` : t(locale, 'Ничего не найдено')}
        </span>
      ) : null}
      <button
        type="button"
        className={hs('toggle')}
        aria-label={t(locale, 'Закрыть поиск')}
        data-tooltip-trigger=""
        onClick={close}
      >
        <svg viewBox="0 0 24 24" fill="none" className={hs('toggleIconClose')} aria-hidden="true">
          <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </button>
    </div>
  )
}
