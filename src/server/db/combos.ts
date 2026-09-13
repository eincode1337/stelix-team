

import combosFixture from '@/server/fixtures/combos.json'


export interface ComboItem {
  resourceId: string
  discountType: string
  discountValue: number
  discountPercent: number
  addedByUserId: number
  title: string
  slug: string
  coverUrl: string | null
  price: number
  discountedPrice: number
  authorId: number
  authorName: string
  category: string
  tags: string[]
  sales: number
  createdAt: string
  updatedAt: string
}


export interface Combo {
  id: string
  title: string
  description: string
  coverImage: string
  catalogImage: string
  thumbnailImage: string
  createdByUserId: number
  createdAt: string
  members: unknown[]
  items: ComboItem[]
  sales: number
  uniqueViews: number
  totalRevenueRubles: number
  totalPrice: number
  totalOldPrice: number
  discountPercent: number
}

interface CombosState {
  combos: Combo[]
}


function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T
}


function randomUuid(): string {
  const g = globalThis as { crypto?: { randomUUID?: () => string } }
  if (g.crypto?.randomUUID) return g.crypto.randomUUID()
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

function seed(): CombosState {
  return { combos: clone(combosFixture.combos) as unknown as Combo[] }
}

declare global {

  var __STELIX_COMBOS__: CombosState | undefined
}

const state: CombosState = globalThis.__STELIX_COMBOS__ ?? (globalThis.__STELIX_COMBOS__ = seed())

export const Combos = {

  listCombos(): { combos: Combo[] } {
    return { combos: [...state.combos] }
  },

  getCombo(id: string): Combo | null {
    return state.combos.find((c) => c.id === id) ?? null
  },


  createCombo(input: {
    title: string
    description?: string
    coverImage?: string
    catalogImage?: string
    thumbnailImage?: string
    createdByUserId: number
    members?: unknown[]
    items: ComboItem[]
  }): Combo {
    const items = input.items
    const totalOldPrice = items.reduce((s, i) => s + (Number(i.price) || 0), 0)
    const totalPrice = items.reduce((s, i) => s + (Number(i.discountedPrice) || 0), 0)
    const discountPercent =
      totalOldPrice > 0 ? Math.round((1 - totalPrice / totalOldPrice) * 100) : 0

    const combo: Combo = {
      id: randomUuid(),
      title: input.title,
      description: input.description ?? '',
      coverImage: input.coverImage ?? '',
      catalogImage: input.catalogImage ?? '',
      thumbnailImage: input.thumbnailImage ?? '',
      createdByUserId: input.createdByUserId,
      createdAt: new Date().toISOString(),
      members: input.members ?? [],
      items,
      sales: 0,
      uniqueViews: 0,
      totalRevenueRubles: 0,
      totalPrice,
      totalOldPrice,
      discountPercent,
    }
    state.combos.unshift(combo)
    return combo
  },


  __reset(): void {
    globalThis.__STELIX_COMBOS__ = seed()
  },
}
