'use client'


import { useSyncExternalStore } from 'react'


export interface Order {
  id: string
  title: string
  description: string
  budget: number
  deadline: string
  category: string
  status: string
  rawStatus: string
  displayPhase: string
  disputeActive: boolean
  client: string
  clientId: number
  seller: string | null
  sellerId: number | null
  amountFromPayment: number
  amountFromBalance: number
  responsesCount: number
  createdAt: string
  updatedAt: string
  sellerDeliveredAt: string | null
  clientConfirmedAt: string | null
  clientAvatarUrl: string | null
  clientSlug: string
}

export type OrdersPhase = 'idle' | 'loading' | 'ready' | 'error'

export interface OrdersState {
  phase: OrdersPhase
  orders: Order[]
  error: string | null
}


const initialState: OrdersState = { phase: 'idle', orders: [], error: null }
let state: OrdersState = initialState

const listeners = new Set<() => void>()

function emit(): void {
  for (const listener of listeners) listener()
}

function setState(patch: Partial<OrdersState>): void {
  state = { ...state, ...patch }
  emit()
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

function getSnapshot(): OrdersState {
  return state
}


function getServerSnapshot(): OrdersState {
  return initialState
}


export function useOrdersStore(): OrdersState {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}

interface OrdersEnvelope {
  orders?: unknown
}


function extractOrders(payload: unknown): Order[] {
  if (Array.isArray(payload)) return payload as Order[]
  if (payload && typeof payload === 'object') {
    const list = (payload as OrdersEnvelope).orders
    if (Array.isArray(list)) return list as Order[]
  }
  return []
}

let inflight: AbortController | null = null


export async function loadOrders(): Promise<void> {
  inflight?.abort()
  const controller = new AbortController()
  inflight = controller

  setState({ phase: state.orders.length ? 'ready' : 'loading', error: null })

  try {
    const res = await fetch('/api/orders', {
      method: 'GET',
      signal: controller.signal,
      credentials: 'include',
      headers: { Accept: 'application/json' },
      cache: 'no-store',
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const body = await res.json().catch(() => null)
    if (controller.signal.aborted) return
    setState({ phase: 'ready', orders: extractOrders(body), error: null })
  } catch (err) {
    if (controller.signal.aborted || (err instanceof DOMException && err.name === 'AbortError')) return

    setState({ phase: 'error', error: 'Не удалось загрузить список заказов' })
  } finally {
    if (inflight === controller) inflight = null
  }
}


export interface OrderResponse {
  id: string
  orderId: string
  sellerId: number
  seller: string
  message: string
  price: number
  createdAt: string
}

export interface CreateOrderInput {
  title: string
  description?: string
  budget?: number
  deadline?: string
  category?: string
}

export type CreateOrderResult =
  | { ok: true; order: Order }
  | { ok: false; status: number; error: string }


export async function createOrder(input: CreateOrderInput): Promise<CreateOrderResult> {
  let res: Response
  try {
    res = await fetch('/api/orders', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      cache: 'no-store',
      body: JSON.stringify(input),
    })
  } catch {
    return { ok: false, status: 0, error: 'Не удалось отправить заказ. Проверьте соединение.' }
  }

  if (!res.ok) {
    const error =
      res.status === 401
        ? 'Войдите в аккаунт, чтобы создать заказ'
        : res.status === 400
          ? 'Укажите название заказа'
          : 'Не удалось создать заказ. Попробуйте ещё раз.'
    return { ok: false, status: res.status, error }
  }

  const order = (await res.json().catch(() => null)) as Order | null

  await loadOrders()
  if (!order) {
    return { ok: false, status: res.status, error: 'Не удалось создать заказ. Попробуйте ещё раз.' }
  }
  return { ok: true, order }
}


export async function fetchOrder(id: string): Promise<Order | null> {
  try {
    const res = await fetch(`/api/orders/${encodeURIComponent(id)}`, {
      method: 'GET',
      credentials: 'include',
      headers: { Accept: 'application/json' },
      cache: 'no-store',
    })
    if (!res.ok) return null
    const body = (await res.json().catch(() => null)) as (Order & { error?: string }) | null
    if (!body || body.error || typeof body.id !== 'string') return null
    return body
  } catch {
    return null
  }
}

export interface RespondInput {
  message?: string
  price?: number
}

export type RespondResult =
  | { ok: true; response: OrderResponse; order: Order }
  | { ok: false; status: number; error: string }


export async function respondToOrder(orderId: string, input: RespondInput): Promise<RespondResult> {
  let res: Response
  try {
    res = await fetch(`/api/orders/${encodeURIComponent(orderId)}/responses`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      cache: 'no-store',
      body: JSON.stringify(input),
    })
  } catch {
    return { ok: false, status: 0, error: 'Не удалось отправить отклик. Проверьте соединение.' }
  }

  if (!res.ok) {
    const error =
      res.status === 401
        ? 'Войдите в аккаунт, чтобы откликнуться'
        : res.status === 404
          ? 'Заказ не найден'
          : 'Не удалось отправить отклик. Попробуйте ещё раз.'
    return { ok: false, status: res.status, error }
  }

  const body = (await res.json().catch(() => null)) as { order?: Order; response?: OrderResponse } | null

  await loadOrders()
  if (!body || !body.response || !body.order) {
    return { ok: false, status: res.status, error: 'Не удалось отправить отклик. Попробуйте ещё раз.' }
  }
  return { ok: true, response: body.response, order: body.order }
}
