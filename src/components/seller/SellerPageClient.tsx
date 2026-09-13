'use client'


import { useEffect, useState } from 'react'
import { SellerHubSkeleton } from './SellerHubSkeleton'
import { SellerHubDashboard, type SellerSummary } from './SellerHubDashboard'
import type { Resource } from '@/components/resources/ResourcesCatalog'

const EMPTY_SUMMARY: SellerSummary = {
  revenue: 0,
  sales: 0,
  refunds: 0,
  fulfillment: 0,
  activeResources: 0,
  avgCheck: 0,
}

export function SellerPageClient() {
  const [ready, setReady] = useState(false)
  const [summary, setSummary] = useState<SellerSummary>(EMPTY_SUMMARY)
  const [resources, setResources] = useState<Resource[]>([])

  useEffect(() => {
    let cancelled = false
    const opts: RequestInit = { credentials: 'same-origin', headers: { accept: 'application/json' } }

    async function load() {
      try {
        const meRes = await fetch('/api/auth/me', opts)
        const me = meRes.ok ? await meRes.json() : { user: null }
        if (!me || !me.user) return

        const id = Number(me.user.id) || 0
        const resourcesCount = Number(me.user.resourcesCount ?? 0)
        const [statsRes, resRes] = await Promise.all([
          fetch('/api/seller/stats', opts),
          fetch(`/api/resources?authorId=${id}`, opts),
        ])

        if (cancelled) return

        if (statsRes.ok) {
          const s = (await statsRes.json()) as Record<string, unknown>
          const num = (v: unknown, fallback = 0) => {
            const n = Number(v)
            return Number.isFinite(n) ? n : fallback
          }
          setSummary({
            revenue: num(s.revenue),
            sales: num(s.sales),
            refunds: num(s.refunds),
            fulfillment: num(s.fulfillment),
            activeResources: num(s.activeResources, resourcesCount),
            avgCheck: num(s.avgCheck),
          })
        } else {
          setSummary({ ...EMPTY_SUMMARY, activeResources: resourcesCount })
        }
        if (resRes.ok) {
          const data = await resRes.json()
          setResources(Array.isArray(data?.resources) ? data.resources : [])
        }
        setReady(true)
      } catch {
      }
    }

    void load()
    return () => {
      cancelled = true
    }
  }, [])

  if (!ready) return <SellerHubSkeleton />

  return <SellerHubDashboard summary={summary} resources={resources} />
}
