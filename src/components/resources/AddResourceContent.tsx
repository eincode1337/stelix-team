'use client'

import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type ComponentType,
  type CSSProperties,
  type FormEvent,
} from 'react'
import { useRouter } from 'next/navigation'
import { useSignInDrawer } from '@/components/auth/SignInDrawer'
import { useT } from '@/i18n/LocaleProvider'


const ar = (...n: string[]) => n.map((x) => `AddResourceContent-module__UdTvSa__${x}`).join(' ')
const rd = (...n: string[]) => n.map((x) => `ResourceDetail-module__XriO0W__${x}`).join(' ')
const rs = (...n: string[]) => n.map((x) => `Resources-module__Zk5JmW__${x}`).join(' ')
const inp = (...n: string[]) => n.map((x) => `Input-module__rdnxQa__${x}`).join(' ')
const dd = (...n: string[]) => n.map((x) => `Dropdown-module__DasDQW__${x}`).join(' ')
const tg = (...n: string[]) => n.map((x) => `Toggle-module__ntMQ3a__${x}`).join(' ')
const ci = (...n: string[]) => n.map((x) => `CategoryIcon-module__kwjccG__${x}`).join(' ')
const ap = (...n: string[]) => n.map((x) => `AdminPanel-module__8pW_9a__${x}`).join(' ')
const ph = (...n: string[]) => n.map((x) => `PageHeaderBar-module__1SDZQW__${x}`).join(' ')


const CATEGORIES: Array<{ value: string; label: string }> = [
  { value: 'plugins', label: 'Плагины' },
  { value: 'modules', label: 'Модули' },
  { value: 'scripts', label: 'Скрипты' },
  { value: 'maps', label: 'Карты' },
  { value: 'integrations', label: 'Интеграции' },
  { value: 'models', label: 'Модели' },
  { value: 'particles', label: 'Партиклы' },
  { value: 'assemblies', label: 'Сборки' },
  { value: 'tools', label: 'Инструменты' },
  { value: 'other', label: 'Другое' },
]

const GAME_TAGS: Array<{ id: string; label: string }> = [
  { id: 'cs2', label: 'CS2' },
  { id: 'lrweb', label: 'LR Web' },
  { id: 'csgo', label: 'CS:GO' },
  { id: 'css', label: 'CSS' },
  { id: 'cs16', label: 'CS 1.6' },
  { id: 'mc', label: 'Minecraft' },
  { id: 'discord', label: 'Discord' },
  { id: 'gamecms', label: 'GameCMS' },
  { id: 'xenforo', label: 'XenForo' },
  { id: 'ips', label: 'IPS' },
  { id: 'phpbb', label: 'phpBB' },
  { id: 'minecraft', label: 'Java Edition' },
  { id: 'tf2', label: 'TF2' },
  { id: 'telegram', label: 'Telegram' },
  { id: 'ark', label: 'ARK' },
  { id: 'altv', label: 'alt:V' },
  { id: 'ats', label: 'ATS' },
  { id: 'beamng', label: 'BeamNG' },
  { id: 'ets2', label: 'ETS 2' },
  { id: 'fivem', label: 'FiveM' },
  { id: 'gmod', label: 'GMod' },
  { id: 'hl', label: 'Half-Life' },
  { id: 'hl2', label: 'Half-Life 2' },
  { id: 'hosting', label: 'Хостинг' },
  { id: 'l4d', label: 'L4D' },
  { id: 'l4d2', label: 'L4D2' },
  { id: 'flute', label: 'Flute CMS' },
  { id: 'figma', label: 'Figma' },
  { id: 'dle', label: 'DLE' },
  { id: 'minecraftbedrock', label: 'Bedrock Edition' },
  { id: 'mta', label: 'MTA' },
  { id: 'projectz', label: 'Project Z' },
  { id: 'ragemp', label: 'RAGE MP' },
  { id: 'redm', label: 'RedM' },
  { id: 'rust', label: 'Rust' },
  { id: 'tf', label: 'TF' },
  { id: 'unturned', label: 'Unturned' },
]

const MAX_TAGS = 10
const HOLIDAY_MIN = 10
const HOLIDAY_MAX = 99
const CDN = 'https://cdn.stelix.team'


function PlusIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function MinusIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path d="M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function PlusStepIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function ImageChapterIcon({ className }: { className: string }) {
  return (
    <svg viewBox="0 0 576 512" fill="currentColor" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" className={className}>
      <path d="M512 112c8.8 0 16 7.2 16 16l0 256c0 8.8-7.2 16-16 16L64 400c-8.8 0-16-7.2-16-16l0-256c0-8.8 7.2-16 16-16l448 0zM64 64C28.7 64 0 92.7 0 128L0 384c0 35.3 28.7 64 64 64l448 0c35.3 0 64-28.7 64-64l0-256c0-35.3-28.7-64-64-64L64 64zM358.3 171.2c-4.5-6.4-11.8-10.2-19.6-10.2s-15.1 3.8-19.6 10.2l-64.5 91.3-28.8-34.4c-4.6-5.5-11.3-8.6-18.4-8.6s-13.9 3.2-18.4 8.6l-70.7 84.5c-6 7.1-7.3 17.1-3.3 25.6S127.5 352 136.8 352l302.8 0c9 0 17.2-5 21.3-13s3.5-17.6-1.7-24.9l-100.9-143zM128 224a32 32 0 1 0 0-64 32 32 0 1 0 0 64z" />
    </svg>
  )
}

function DownloadChapterIcon({ className }: { className: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function CartChapterIcon({ className }: { className: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <circle cx="9" cy="21" r="1" stroke="currentColor" strokeWidth="2" />
      <circle cx="20" cy="21" r="1" stroke="currentColor" strokeWidth="2" />
      <path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function CoOwnersChapterIcon({ className }: { className: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512" fill="currentColor" className={className} aria-hidden="true">
      <path d="M598.1 75.4c10.7-7.8 13.1-22.8 5.3-33.5s-22.8-13.1-33.5-5.3l-74.5 54.2-9.9-6.6C465.8 71 442.6 64 418.9 64l-59.2 0-.4 0-143.6 0c-26.7 0-52.5 8.9-73.4 25.1L70.1 36.6c-10.7-7.8-25.7-5.4-33.5 5.3s-5.4 25.7 5.3 33.5l88 64c9.6 6.9 22.7 5.9 31.1-2.4l3.9-3.9c13.5-13.5 31.8-21.1 50.9-21.1l46.3 0-91.7 91.7c-15.6 15.6-15.6 40.9 0 56.6l.8 .8C218 308 294 308 340.9 261.1l27.1-27.1 97.8 97.8c15.6 15.6 15.6 40.9 0 56.6l-9.8 9.8-31-31c-9.4-9.4-24.6-9.4-33.9 0s-9.4 24.6 0 33.9l28 28c-17.5 10.4-37.2 16.7-57.6 18.5L313 399c-9.4-9.4-24.6-9.4-33.9 0s-9.4 24.6 0 33.9l15 15-3.8 0c-36.1 0-70.7-14.3-96.2-39.8L65 279c-9.4-9.4-24.6-9.4-33.9 0s-9.4 24.6 0 33.9L160.2 442.1c34.5 34.5 81.3 53.9 130.1 53.9l51.8 0 1 1 1-1 5.7 0c48.8 0 95.6-19.4 130.1-53.9l19.9-19.9c1.2-1.2 2.3-2.3 3.4-3.5 .7-.5 1.3-1.1 1.9-1.7L609 313c9.4-9.4 9.4-24.6 0-33.9s-24.6-9.4-33.9 0l-53.8 53.8c-4.2-12.8-11.3-24.9-21.5-35.1L385 183c-9.4-9.4-24.6-9.4-33.9 0l-44.1 44.1c-26.5 26.5-68.5 28-96.7 4.6l98.7-98.7c13.4-13.4 31.6-21 50.6-21.1l8.5 0 .2 0 50.8 0c14.2 0 28.1 4.2 39.9 12.1L482.7 140c8.4 5.6 19.3 5.3 27.4-.6l88-64z" />
    </svg>
  )
}

function LayersCategoryIcon() {
  return (
    <svg viewBox="0 0 512 512" overflow="visible" focusable="false">
      <path d="M232.5 5.2c14.9-6.9 32.1-6.9 47 0l218.6 101c8.5 3.9 13.9 12.4 13.9 21.8s-5.4 17.9-13.9 21.8l-218.6 101c-14.9 6.9-32.1 6.9-47 0L13.9 149.8C5.4 145.8 0 137.3 0 128s5.4-17.9 13.9-21.8L232.5 5.2zM48.1 218.4l164.3 75.9c27.7 12.8 59.6 12.8 87.3 0l164.3-75.9 34.1 15.8c8.5 3.9 13.9 12.4 13.9 21.8s-5.4 17.9-13.9 21.8l-218.6 101c-14.9 6.9-32.1 6.9-47 0L13.9 277.8C5.4 273.8 0 265.3 0 256s5.4-17.9 13.9-21.8l34.1-15.8zM13.9 362.2l34.1-15.8 164.3 75.9c27.7 12.8 59.6 12.8 87.3 0l164.3-75.9 34.1 15.8c8.5 3.9 13.9 12.4 13.9 21.8s-5.4 17.9-13.9 21.8l-218.6 101c-14.9 6.9-32.1 6.9-47 0L13.9 405.8C5.4 401.8 0 393.3 0 384s5.4-17.9 13.9-21.8z" fill="currentColor" />
    </svg>
  )
}


type ChapterKey = 'basic' | 'delivery' | 'purchase' | 'coowners'

interface StepDef {
  n: number
  label: string
}

interface ChapterDef {
  key: ChapterKey
  label: string
  Icon: ComponentType<{ className: string }>
  steps: StepDef[]
}

const CHAPTERS: ChapterDef[] = [
  {
    key: 'basic',
    label: 'Основное',
    Icon: ImageChapterIcon,
    steps: [
      { n: 1, label: 'Медиа и основное' },
      { n: 2, label: 'Подробное описание' },
    ],
  },
  {
    key: 'delivery',
    label: 'Выдача',
    Icon: DownloadChapterIcon,
    steps: [
      { n: 3, label: 'Выдача покупателю' },
      { n: 4, label: 'API Webhook' },
    ],
  },
  {
    key: 'purchase',
    label: 'Покупка',
    Icon: CartChapterIcon,
    steps: [
      { n: 5, label: 'Требования для покупки' },
      { n: 6, label: 'Промокоды' },
      { n: 7, label: 'Персональные скидки' },
    ],
  },
  {
    key: 'coowners',
    label: 'Совладельцы',
    Icon: CoOwnersChapterIcon,
    steps: [{ n: 8, label: 'Совладельцы' }],
  },
]

interface SpecRow {
  name: string
  value: string
}

export function AddResourceContent({ skipSellerHub = false }: { skipSellerHub?: boolean } = {}) {
  void skipSellerHub
  const tr = useT()
  const router = useRouter()
  const signIn = useSignInDrawer()
  const holidayToggleId = useId()

  const [step, setStep] = useState(1)

  const [title, setTitle] = useState('')
  const [shortDescription, setShortDescription] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('other')
  const [categoryOpen, setCategoryOpen] = useState(false)
  const [price, setPrice] = useState('')
  const [oldPrice, setOldPrice] = useState('')
  const [purchaseLimit, setPurchaseLimit] = useState('0')
  const [holidayOn, setHolidayOn] = useState(true)
  const [holidayPercent, setHolidayPercent] = useState(HOLIDAY_MIN)
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [specHeading, setSpecHeading] = useState('Характеристика')
  const [specRows, setSpecRows] = useState<SpecRow[]>([{ name: '', value: '' }])

  const [cover, setCover] = useState<string | null>(null)
  const [gallery, setGallery] = useState<Array<string | null>>(() => Array<string | null>(8).fill(null))
  const [catalog, setCatalog] = useState<string | null>(null)
  const [thumbnail, setThumbnail] = useState<string | null>(null)
  const objectUrlsRef = useRef<string[]>([])

  const coverInputRef = useRef<HTMLInputElement>(null)
  const galleryInputRef = useRef<HTMLInputElement>(null)
  const catalogInputRef = useRef<HTMLInputElement>(null)
  const thumbnailInputRef = useRef<HTMLInputElement>(null)

  const [pending, setPending] = useState(false)
  const [, setError] = useState('')

  const trackRef = useRef<HTMLDivElement>(null)
  const chapterRefs = useRef<Array<HTMLDivElement | null>>([])
  const [indicator, setIndicator] = useState<{ width: number; x: number }>({ width: 0, x: 0 })

  const activeChapterIndex = useMemo(
    () => CHAPTERS.findIndex((c) => c.steps.some((s) => s.n === step)),
    [step],
  )

  const step1Valid = title.trim().length > 0 && Number(price) >= 1

  const canAccess = useCallback(
    (n: number) => {
      if (n === 1) return true
      if (n === 2) return step1Valid
      return false
    },
    [step1Valid],
  )

  useEffect(() => {
    const root = document.documentElement
    root.classList.add('resource-form-dock')
    return () => {
      root.classList.remove('resource-form-dock')
    }
  }, [])

  useEffect(() => {
    const urls = objectUrlsRef.current
    return () => {
      for (const u of urls) URL.revokeObjectURL(u)
    }
  }, [])

  useLayoutEffect(() => {
    const measure = () => {
      const track = trackRef.current
      const el = chapterRefs.current[activeChapterIndex]
      if (!track || !el) return
      setIndicator({ width: el.offsetWidth, x: el.offsetLeft })
    }
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [activeChapterIndex])

  const registerObjectUrl = useCallback((url: string) => {
    objectUrlsRef.current.push(url)
  }, [])

  const clampInt = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v))

  const stepPrice = useCallback(
    (setter: (v: string) => void, current: string, delta: number, min: number) => {
      const next = clampInt((Number(current) || 0) + delta, min, 99999)
      setter(String(next))
    },
    [],
  )

  const toggleTag = useCallback((id: string) => {
    setSelectedTags((prev) => {
      if (prev.includes(id)) return prev.filter((t) => t !== id)
      if (prev.length >= MAX_TAGS) return prev
      return [...prev, id]
    })
  }, [])

  const updateSpecRow = useCallback((index: number, patch: Partial<SpecRow>) => {
    setSpecRows((prev) => {
      const next = prev.map((row, i) => (i === index ? { ...row, ...patch } : row))
      const last = next[next.length - 1]
      if (last && last.name.trim() !== '') next.push({ name: '', value: '' })
      return next
    })
  }, [])

  const onPickFiles = useCallback(
    (kind: 'cover' | 'gallery' | 'catalog' | 'thumbnail') =>
      (e: ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files
        if (!files || files.length === 0) return
        if (kind === 'gallery') {
          const urls = Array.from(files).map((f) => {
            const u = URL.createObjectURL(f)
            registerObjectUrl(u)
            return u
          })
          setGallery((prev) => {
            const next = [...prev]
            let ptr = 0
            for (let i = 0; i < next.length && ptr < urls.length; i += 1) {
              if (next[i] == null) {
                next[i] = urls[ptr]
                ptr += 1
              }
            }
            return next
          })
        } else {
          const u = URL.createObjectURL(files[0])
          registerObjectUrl(u)
          if (kind === 'cover') setCover(u)
          else if (kind === 'catalog') setCatalog(u)
          else setThumbnail(u)
        }
        e.target.value = ''
      },
    [registerObjectUrl],
  )

  const goPrev = useCallback(() => {
    setStep((s) => (s > 1 ? s - 1 : s))
  }, [])

  const goNext = useCallback(() => {
    setStep((s) => {
      const next = s + 1
      if (next > 8) return s
      return canAccess(next) ? next : s
    })
  }, [canAccess])

  const selectStep = useCallback(
    (n: number) => {
      if (canAccess(n)) setStep(n)
    },
    [canAccess],
  )

  const selectedCategory = CATEGORIES.find((c) => c.value === category) ?? CATEGORIES[CATEGORIES.length - 1]

  const buildPayload = useCallback(() => {
    const priceNum = Number(price) || 0
    const oldNum = Number(oldPrice)
    const hasSale = oldPrice.trim() !== '' && Number.isFinite(oldNum) && oldNum > priceNum
    const images = [
      ...gallery.filter((g): g is string => Boolean(g)),
      ...(catalog ? [catalog] : []),
      ...(thumbnail ? [thumbnail] : []),
    ]
    return {
      title: title.trim(),
      category,
      price: hasSale ? oldNum : priceNum,
      discount: hasSale ? priceNum : undefined,
      shortDescription: shortDescription.trim() || undefined,
      description: description.trim() || undefined,
      tags: selectedTags,
      images: images.length > 0 ? images : undefined,
      coverImage: cover ?? undefined,
      listingKind: 'PAID',
      createdWithAiTools: false,
    }
  }, [
    price,
    oldPrice,
    gallery,
    catalog,
    thumbnail,
    title,
    category,
    shortDescription,
    description,
    selectedTags,
    cover,
  ])

  const submit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault()
      if (pending) return
      if (!title.trim()) {
        setError(tr('Введите название ресурса.'))
        setStep(1)
        return
      }
      if (Number(price) < 1) {
        setError(tr('Укажите цену покупки.'))
        setStep(1)
        return
      }
      setPending(true)
      setError('')
      try {
        const res = await fetch('/api/resources', {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify(buildPayload()),
        })
        if (res.status === 401) {
          signIn.open()
          setPending(false)
          return
        }
        const data = (await res.json().catch(() => null)) as { slug?: string; error?: string } | null
        if (!res.ok || !data || !data.slug) {
          setError((data && data.error) || tr('Не удалось создать ресурс. Попробуйте ещё раз.'))
          setPending(false)
          return
        }
        router.push(`/resources/${data.slug}`)
      } catch {
        setError(tr('Не удалось создать ресурс. Проверьте соединение.'))
        setPending(false)
      }
    },
    [pending, title, price, buildPayload, signIn, router, tr],
  )

  const resetForm = useCallback(() => {
    setTitle('')
    setShortDescription('')
    setDescription('')
    setCategory('other')
    setPrice('')
    setOldPrice('')
    setPurchaseLimit('0')
    setHolidayOn(true)
    setHolidayPercent(HOLIDAY_MIN)
    setSelectedTags([])
    setSpecHeading('Характеристика')
    setSpecRows([{ name: '', value: '' }])
    for (const u of objectUrlsRef.current) URL.revokeObjectURL(u)
    objectUrlsRef.current = []
    setCover(null)
    setGallery(Array<string | null>(8).fill(null))
    setCatalog(null)
    setThumbnail(null)
    setStep(1)
  }, [])

  const holidayPct = (holidayPercent - HOLIDAY_MIN) / (HOLIDAY_MAX - HOLIDAY_MIN)
  const tagCountLabel = `${selectedTags.length}/${MAX_TAGS}`

  return (
    <section className={rd('resourceDetailPage')}>
      <div className={`container ${rd('resourceDetailPageInner')}`}>
        <form className={ar('form')} onSubmit={submit}>
          <header className={ph('headerBar')}>
            <div className={ph('headerBar__start')}>
              <h1 className={ph('headerBar__title')}>{tr('Новый ресурс')}</h1>
            </div>
            <div className={ph('headerBar__end')}>
              <span className={ph('headerBar__divider')} aria-hidden="true" />
              <div className={ph('headerBar__actions')}>
                <span className={ar('formHeaderTooltipAnchor')} data-tooltip-trigger="">
                  <button
                    type="button"
                    className={ap('tableIconButton') + ' ' + ar('formHeaderTableIconButton', 'formHeaderDefaultNavIconButton')}
                    aria-label={tr('К панели продавца')}
                    onClick={() => router.push('/seller')}
                  >
                    <svg viewBox="0 0 24 24" fill="none" className={ap('tableIconButtonIcon')} aria-hidden="true">
                      <path d="M19 12H5M12 19l-7-7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                </span>
                <span className={ar('formHeaderTooltipAnchor')} data-tooltip-trigger="">
                  <a
                    target="_blank"
                    rel="noopener noreferrer"
                    className={ap('tableIconButton') + ' ' + ar('formHeaderTableIconButton', 'formHeaderDefaultNavIconButton')}
                    aria-label={tr('API документация')}
                    href="/seller/api-docs"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512" fill="currentColor" aria-hidden="true" className={ap('tableIconButtonIcon')}>
                      <path d="M344 380c24.3 0 44 19.7 44 44l0 104c0 11-9 20-20 20s-20-9-20-20l0-28-24 0 0 28c0 11-9 20-20 20s-20-9-20-20l0-104c0-24.3 19.7-44 44-44l16 0zm120 0c33.1 0 60 26.9 60 60s-26.9 60-60 60l-12 0 0 28c0 11-9 20-20 20s-20-9-20-20l0-128c0-11 9-20 20-20l32 0zm96 0c11 0 20 9 20 20l0 128c0 11-9 20-20 20s-20-9-20-20l0-128c0-11 9-20 20-20zM328 420c-2.2 0-4 1.8-4 4l0 36 24 0 0-36c0-2.2-1.8-4-4-4l-16 0zm124 40l12 0c11 0 20-9 20-20s-9-20-20-20l-12 0 0 40zM331.2-16c18.7 0 34.9 13 39 31.2l12.6 55.6C389 74 395.1 77.5 401 81.3l54.5-16.9c17.8-5.5 37.2 2 46.5 18.2l43.2 74.8c9.3 16.2 6.2 36.7-7.5 49.4l-41.9 38.7c.3 6.9 .3 14 0 20.9l41.9 38.7c8.8 8.1 13.2 19.5 12.8 30.8l-50.2 0-45.6-42.2c-5.6-5.2-8.4-12.7-7.6-20.2 1.3-11.5 1.3-23.6 0-35.2-.8-7.6 2-15.1 7.6-20.3l45.7-42.3-36.8-63.7-59.5 18.5c-7.3 2.3-15.2 .9-21.3-3.6-9.4-6.9-19.6-12.8-30.4-17.6-7-3.1-12.1-9.3-13.8-16.7l-13.7-60.8-73.6 0-13.7 60.8c-1.7 7.4-6.8 13.6-13.8 16.7-10.8 4.7-21 10.7-30.4 17.6-6.1 4.5-14.1 5.9-21.4 3.6l-59.5-18.5-36.8 63.7 45.8 42.3c5.6 5.2 8.4 12.7 7.6 20.3-1.3 11.5-1.3 23.6 0 35.2 .8 7.6-2 15.1-7.6 20.2l-45.8 42.3 36.8 63.8 59.5-18.5c7.3-2.3 15.2-.9 21.4 3.6 8.9 6.6 18.6 12.2 28.8 16.8 5.8 2.6 11.8 4.8 17.9 6.8l0 49.8c-16.4-3.9-32.1-9.7-46.8-17.2-6.2-3.2-12.4-6.7-18.2-10.5l-54.5 16.9c-17.9 5.5-37.2-2-46.5-18.2L30.8 354.6c-9.3-16.2-6.2-36.7 7.5-49.4l41.9-38.7c-.3-6.9-.3-14 0-20.9L38.3 206.8c-13.7-12.7-16.8-33.2-7.5-49.4L74 82.6c9.3-16.2 28.7-23.8 46.5-18.2L175 81.3c5.9-3.8 11.9-7.3 18.2-10.5l12.6-55.6C209.9-3 226.1-16 244.8-16l86.4 0zM288 352a96 96 0 1 1 0-192 96 96 0 1 1 0 192zm0-144a48 48 0 1 0 0 96 48 48 0 1 0 0-96z" />
                    </svg>
                  </a>
                </span>
                <span className={ar('formHeaderTooltipAnchor')} data-tooltip-trigger="">
                  <button
                    type="button"
                    className={ap('tableIconButton', 'tableIconButtonDanger') + ' ' + ar('formHeaderTableIconButton', 'formHeaderSemanticIconDanger')}
                    aria-label={tr('Очистить всё')}
                    onClick={resetForm}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512" fill="currentColor" className={ap('tableIconButtonIcon')} aria-hidden="true">
                      <path d="M569 9c9.4-9.4 9.4-24.6 0-33.9s-24.6-9.4-33.9 0l-200 200-12.9-12.9c-20.2-20.2-51.4-24.6-76.3-10.7L16.4 278.9C6.3 284.5 0 295.2 0 306.8 0 315.2 3.4 323.4 9.3 329.3L214.7 534.7c6 6 14.1 9.3 22.6 9.3 11.6 0 22.3-6.3 27.9-16.4L392.6 298.2c13.9-25 9.5-56.1-10.7-76.3L369 209 569 9zM288.2 196.1l59.7 59.7c5.1 5.1 6.1 12.8 2.7 19.1l-14.9 26.8-93.4-93.4 26.8-14.9c6.2-3.5 14-2.4 19.1 2.7zm-89.6 36.5l112.8 112.8-77.9 140.3-96.5-96.5 18-53.9c2.1-6.3-3.9-12.2-10.1-10.1l-53.9 18-32.5-32.5 140.3-77.9z" />
                    </svg>
                  </button>
                </span>
                <span className={ar('formHeaderTooltipAnchor')} data-tooltip-trigger="">
                  <button
                    type="button"
                    className={ap('tableIconButton', 'tableIconButtonDanger') + ' ' + ar('formHeaderTableIconButton', 'formHeaderSemanticIconDanger')}
                    aria-label={tr('Сбросить')}
                    onClick={resetForm}
                  >
                    <svg viewBox="0 0 24 24" fill="none" className={ap('tableIconButtonIcon')} aria-hidden="true">
                      <path d="M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                </span>
              </div>
            </div>
          </header>

          <div className={ar('createWizardScrollAnchor')}>
            <nav className={ar('createWizardChapters')} aria-label={tr('Разделы создания ресурса')}>
              <div className={ar('createWizardStepper')}>
                <button
                  type="button"
                  className={
                    ap('tableIconButton') +
                    ' ' +
                    ar('formHeaderTableIconButton', 'createWizardSideNavBtn') +
                    (step === 1 ? ' ' + ar('createWizardSideNavBtnMuted') : '')
                  }
                  disabled={step === 1}
                  aria-label={tr('Назад')}
                  onClick={goPrev}
                >
                  <svg viewBox="0 0 24 24" fill="none" className={ap('tableIconButtonIcon')} aria-hidden="true">
                    <path d="M15 6l-6 6 6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>

                <div className={ar('createWizardChapterTrack')} ref={trackRef}>
                  <div className={ar('createWizardChapterRow')}>
                    {CHAPTERS.map((chapter, ci2) => {
                      const isActive = ci2 === activeChapterIndex
                      const isLocked = !isActive && chapter.steps.every((s) => !canAccess(s.n))
                      const Icon = chapter.Icon
                      return (
                        <div
                          key={chapter.key}
                          ref={(el) => {
                            chapterRefs.current[ci2] = el
                          }}
                          className={
                            ar('createWizardChapter') +
                            (isActive ? ' ' + ar('createWizardChapterActive') : '') +
                            (isLocked ? ' ' + ar('createWizardChapterLocked') : '')
                          }
                        >
                          <span
                            className={ar('createWizardChapterLabel')}
                            {...(isActive ? { 'aria-current': 'true' as const } : {})}
                          >
                            <Icon className={ar('createWizardChapterIcon')} />
                            {tr(chapter.label)}
                          </span>
                          <span className={ar('createWizardChapterDots')}>
                            {chapter.steps.map((s) => {
                              const active = s.n === step
                              const accessible = canAccess(s.n)
                              return (
                                <span key={s.n} className={ar('createWizardChapterDotWrap')}>
                                  <button
                                    type="button"
                                    className={
                                      ar('createWizardChapterDot') +
                                      (active ? ' ' + ar('createWizardChapterDotActive') : '')
                                    }
                                    disabled={!accessible}
                                    aria-label={`${s.n}. ${tr(s.label)}`}
                                    {...(active ? { 'aria-current': 'step' as const } : {})}
                                    {...(accessible ? { 'data-tooltip-trigger': '' } : {})}
                                    onClick={() => selectStep(s.n)}
                                  />
                                </span>
                              )
                            })}
                          </span>
                        </div>
                      )
                    })}
                    <span
                      className={ar('createWizardChapterIndicator')}
                      aria-hidden="true"
                      style={{ width: `${indicator.width}px`, transform: `translateX(${indicator.x}px)` }}
                    />
                  </div>
                </div>

                <button
                  type="button"
                  className={ap('tableIconButton') + ' ' + ar('formHeaderTableIconButton', 'createWizardSideNavBtn')}
                  disabled={step === 8}
                  aria-label={tr('Вперёд')}
                  onClick={goNext}
                >
                  <svg viewBox="0 0 24 24" fill="none" className={ap('tableIconButtonIcon')} aria-hidden="true">
                    <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </div>
            </nav>
          </div>

          <div className={ar('createWizardPanel')}>
            {step === 1 ? (
              <div className={ar('content')}>
                <div className={ar('gallery')}>
                  <input
                    ref={coverInputRef}
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    className={ar('hiddenFileInput')}
                    tabIndex={-1}
                    type="file"
                    onChange={onPickFiles('cover')}
                  />
                  <input
                    ref={galleryInputRef}
                    multiple
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    className={ar('hiddenFileInput')}
                    tabIndex={-1}
                    type="file"
                    onChange={onPickFiles('gallery')}
                  />
                  <input
                    ref={catalogInputRef}
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    className={ar('hiddenFileInput')}
                    tabIndex={-1}
                    type="file"
                    onChange={onPickFiles('catalog')}
                  />
                  <input
                    ref={thumbnailInputRef}
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    className={ar('hiddenFileInput')}
                    tabIndex={-1}
                    type="file"
                    onChange={onPickFiles('thumbnail')}
                  />

                  <div className={ar('mediaVariantSlotFull')}>
                    <div className={ar('mediaVariantHeader')}>
                      <span className={ar('mediaVariantLabel')}>{tr('Обложка')}</span>
                      <span className={ar('mediaVariantHint')}>16:9 (1920×1080px)</span>
                    </div>
                    <div className={rd('mainImage') + ' ' + ar('uploadMainImage') + (cover ? ' ' + ar('uploadMainImageHasImage') : '') + ' '}>
                      <button
                        type="button"
                        className={ar('uploadMainHit')}
                        aria-label={tr('Загрузить обложку, формат 16:9, 1920×1080 px')}
                        onClick={() => coverInputRef.current?.click()}
                      >
                        {cover ? (
                          <img className={ar('mediaVariantPreview')} src={cover} alt="" />
                        ) : (
                          <PlusIcon className={ar('addIcon')} />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className={ar('mediaVariantSlotFull')}>
                    <div className={ar('mediaVariantHeader', 'mediaVariantHeaderWithAside')}>
                      <span className={ar('mediaVariantLabel')}>{tr('Галерея')}</span>
                      <span className={ar('mediaVariantHint')}>{tr('(исходный размер)')}</span>
                      <span className={ar('mediaVariantHint', 'mediaVariantHeaderAside')}>
                        {tr('Удерживайте и перетащите для сортировки')}
                      </span>
                    </div>
                    <div className={ar('thumbnails')}>
                      {gallery.map((g, i) => (
                        <div key={i} data-thumb-index={i} className={rd('thumbnail') + ' ' + ar('thumbnailSlot') + '   '}>
                          <button
                            className={ar('galleryThumbPick')}
                            type="button"
                            aria-label={`${tr('Выбрать фото')} ${i + 1}`}
                            onClick={() => galleryInputRef.current?.click()}
                          >
                            {g ? (
                              <img className={ar('mediaVariantPreview')} src={g} alt="" />
                            ) : (
                              <PlusIcon className={ar('addIcon')} />
                            )}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className={ar('mediaVariantRow')}>
                    <div className={ar('mediaVariantSlot', 'extraImageSlotCatalog')}>
                      <div className={ar('mediaVariantHeader')}>
                        <span className={ar('mediaVariantLabel')}>{tr('Каталог')}</span>
                        <span className={ar('mediaVariantHint')}>16:10 (1920×1200px)</span>
                      </div>
                      <button
                        className={ar('mediaVariantUploadHit', 'extraImageSlotCatalogBox')}
                        type="button"
                        aria-label={tr('Загрузить изображение каталога')}
                        onClick={() => catalogInputRef.current?.click()}
                      >
                        {catalog ? (
                          <img className={ar('mediaVariantPreview')} src={catalog} alt="" />
                        ) : (
                          <PlusIcon className={ar('addIcon')} />
                        )}
                      </button>
                    </div>
                    <div className={ar('mediaVariantSlot', 'extraImageSlotThumbnail')}>
                      <div className={ar('mediaVariantHeader')}>
                        <span className={ar('mediaVariantLabel')}>{tr('Миниатюра')}</span>
                        <span className={ar('mediaVariantHint')}>1:1 (400×400px)</span>
                      </div>
                      <button
                        className={ar('mediaVariantUploadHit', 'extraImageSlotThumbnailBox')}
                        type="button"
                        aria-label={tr('Загрузить миниатюру')}
                        onClick={() => thumbnailInputRef.current?.click()}
                      >
                        {thumbnail ? (
                          <img className={ar('mediaVariantPreview')} src={thumbnail} alt="" />
                        ) : (
                          <PlusIcon className={ar('addIcon')} />
                        )}
                      </button>
                    </div>
                    <div className={ar('mediaVariantTipSlot')}>
                      <div className={ar('mediaVariantTipHeader')}>
                        <span className={ar('mediaVariantLabel')}>{tr('Подсказки для управления')}</span>
                        <span className={ar('mediaVariantHint')}>
                          {tr('Зажав')} <span className={ar('mediaKeyTag')}>Shift</span> {tr('быстрое удаление картинки')}
                        </span>
                        <span className={ar('mediaVariantHint')}>{tr('Перетащите из папки в любую ячейку загрузки')}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className={rd('info') + ' ' + ar('contentInfoCol')}>
                  <div className={ar('editorMain')}>
                    <div className={ar('editorLead')}>
                      <div className={rd('detailLead') + ' ' + ar('editorDetailLead')}>
                        <div className={rd('detailLeadText')}>
                          <input
                            className={inp('input', 'inputDarkDefault') + ' ' + ar('resourceTitleInput')}
                            placeholder={tr('Название ресурса')}
                            aria-label={tr('Название ресурса')}
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                          />
                        </div>
                      </div>

                      <div className={ar('editorLeadBody')}>
                        <div className={ar('categoryGameRow')}>
                          <div className={ar('formGroup')}>
                            <label className="form-label">{tr('Категория')}</label>
                            <div className={dd('dropdown')}>
                              <button
                                type="button"
                                className={dd('trigger', 'triggerHasOptionIcon') + ' ' + ar('editorLeadControlTrigger') + (categoryOpen ? ' ' + dd('triggerOpen') : '')}
                                aria-expanded={categoryOpen}
                                aria-haspopup="listbox"
                                onClick={() => setCategoryOpen((v) => !v)}
                              >
                                <span className={dd('triggerContent', 'triggerContentWithOptionIcon')}>
                                  <span className={dd('triggerOptionIconWrap')} aria-hidden="true">
                                    <span className={ci('icon') + ' ' + dd('optionIcon')} aria-hidden="true">
                                      <LayersCategoryIcon />
                                    </span>
                                  </span>
                                  <span className={dd('triggerLabelWithOptionIcon')}>{tr(selectedCategory.label)}</span>
                                </span>
                                <svg viewBox="0 0 24 24" fill="none" className={dd('icon') + '  ' + (categoryOpen ? dd('iconOpen') : '')} aria-hidden="true">
                                  <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                              </button>
                              {categoryOpen && (
                                <div className={dd('menu')} role="listbox" aria-label={tr('Категория')}>
                                  {CATEGORIES.map((c) => (
                                    <button
                                      key={c.value}
                                      type="button"
                                      role="option"
                                      aria-selected={c.value === category}
                                      className={dd('option')}
                                      onClick={() => {
                                        setCategory(c.value)
                                        setCategoryOpen(false)
                                      }}
                                    >
                                      <span className={dd('triggerOptionIconWrap')} aria-hidden="true">
                                        <span className={ci('icon') + ' ' + dd('optionIcon')} aria-hidden="true">
                                          <LayersCategoryIcon />
                                        </span>
                                      </span>
                                      <span>{tr(c.label)}</span>
                                    </button>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>

                          <div className={ar('formGroup')}>
                            <label className="form-label" htmlFor="resource-short-description">
                              {tr('Краткое описание')}
                            </label>
                            <input
                              className={inp('input') + ' ' + ar('titleInputBare')}
                              id="resource-short-description"
                              placeholder={tr('Кратко для карточки ресурса и поиска')}
                              aria-label={tr('Краткое описание для карточки')}
                              type="text"
                              value={shortDescription}
                              onChange={(e) => setShortDescription(e.target.value)}
                            />
                          </div>
                        </div>

                        <div className={ar('editorPaidPriceBlock')}>
                          <div className={ar('editorInlinePrices')}>
                            <div className={ar('priceFormCell')}>
                              <label className={rs('filterLabel')}>{tr('Цена покупки')}</label>
                              <div className={rs('priceRangeStepper') + ' ' + ar('inlinePriceStepper')}>
                                <button
                                  type="button"
                                  className={rs('priceRangeStepBtn')}
                                  aria-label={tr('Уменьшить цену покупки на 100')}
                                  onClick={() => stepPrice(setPrice, price, -100, 1)}
                                >
                                  <MinusIcon className={rs('priceRangeStepIcon')} />
                                </button>
                                <input
                                  className={rs('priceRangeInput', 'priceRangeInputInStepper')}
                                  min={1}
                                  max={99999}
                                  step={1}
                                  placeholder="1"
                                  aria-label={tr('Цена покупки')}
                                  required
                                  type="number"
                                  value={price}
                                  onChange={(e) => setPrice(e.target.value)}
                                />
                                <button
                                  type="button"
                                  className={rs('priceRangeStepBtn')}
                                  aria-label={tr('Увеличить цену покупки на 100')}
                                  onClick={() => stepPrice(setPrice, price, 100, 1)}
                                >
                                  <PlusStepIcon className={rs('priceRangeStepIcon')} />
                                </button>
                              </div>
                            </div>
                            <div className={ar('priceFormCell')}>
                              <span className={rs('filterLabel')}>{tr('Старая цена')}</span>
                              <div className={rs('priceRangeStepper') + ' ' + ar('inlinePriceStepper')}>
                                <button
                                  type="button"
                                  className={rs('priceRangeStepBtn')}
                                  aria-label={tr('Уменьшить старую цену на 100')}
                                  onClick={() => stepPrice(setOldPrice, oldPrice, -100, 0)}
                                >
                                  <MinusIcon className={rs('priceRangeStepIcon')} />
                                </button>
                                <input
                                  className={rs('priceRangeInput', 'priceRangeInputInStepper')}
                                  min={0}
                                  max={99999}
                                  step={1}
                                  placeholder={tr('Необязательно')}
                                  aria-label={tr('Старая цена')}
                                  type="number"
                                  value={oldPrice}
                                  onChange={(e) => setOldPrice(e.target.value)}
                                />
                                <button
                                  type="button"
                                  className={rs('priceRangeStepBtn')}
                                  aria-label={tr('Увеличить старую цену на 100')}
                                  onClick={() => stepPrice(setOldPrice, oldPrice, 100, 0)}
                                >
                                  <PlusStepIcon className={rs('priceRangeStepIcon')} />
                                </button>
                              </div>
                            </div>
                            <div className={ar('priceFormCell')}>
                              <span className={rs('filterLabel')}>{tr('Лимит покупок')}</span>
                              <div className={rs('priceRangeStepper') + ' ' + ar('inlinePriceStepper')}>
                                <button
                                  type="button"
                                  className={rs('priceRangeStepBtn')}
                                  aria-label={tr('Уменьшить лимит на 1')}
                                  onClick={() => stepPrice(setPurchaseLimit, purchaseLimit, -1, 0)}
                                >
                                  <MinusIcon className={rs('priceRangeStepIcon')} />
                                </button>
                                <input
                                  className={rs('priceRangeInput', 'priceRangeInputInStepper')}
                                  min={0}
                                  max={99999}
                                  step={1}
                                  placeholder="0"
                                  aria-label={tr('Лимит покупок')}
                                  type="number"
                                  value={purchaseLimit}
                                  onChange={(e) => setPurchaseLimit(e.target.value)}
                                />
                                <button
                                  type="button"
                                  className={rs('priceRangeStepBtn')}
                                  aria-label={tr('Увеличить лимит на 1')}
                                  onClick={() => stepPrice(setPurchaseLimit, purchaseLimit, 1, 0)}
                                >
                                  <PlusStepIcon className={rs('priceRangeStepIcon')} />
                                </button>
                              </div>
                            </div>
                          </div>

                          <div className={ar('editorHolidayDiscount')}>
                            <label className={tg('row') + ' ' + ar('editorHolidayToggle')} htmlFor={holidayToggleId}>
                              <span className={tg('wrap')}>
                                <input
                                  id={holidayToggleId}
                                  className={tg('input')}
                                  type="checkbox"
                                  checked={holidayOn}
                                  onChange={(e) => setHolidayOn(e.target.checked)}
                                />
                                <span className={tg('slider')} />
                              </span>
                              <span className={tg('label')}>
                                <span className={ar('editorHolidayToggleLabel')}>
                                  {tr('Участвовать в скидке площадки на праздники')}
                                  <span
                                    className={rs('tileDiscountBadge') + ' ' + ar('editorHolidayRangeBadge')}
                                    aria-label={`${tr('Скидка площадки')} ${holidayPercent}%`}
                                  >
                                    <span className={rs('tileDiscountSign')} aria-hidden="true">−</span>
                                    <span>{holidayPercent} %</span>
                                  </span>
                                </span>
                              </span>
                            </label>
                            <div className={ar('editorHolidaySliderCluster')}>
                              <div className={rs('priceRangeSlider') + ' ' + ar('editorHolidaySlider')}>
                                <div className={rs('priceRangeSliderTrack') + ' ' + ar('editorHolidaySliderTrack')} aria-hidden="true">
                                  <div
                                    className={rs('priceRangeSliderFill')}
                                    style={{ left: 0, right: `${(1 - holidayPct) * 100}%` }}
                                  />
                                </div>
                                <input
                                  className={rs('priceRangeSliderInput') + ' ' + ar('editorHolidaySliderInput')}
                                  min={HOLIDAY_MIN}
                                  max={HOLIDAY_MAX}
                                  step={1}
                                  aria-label={tr('Процент скидки площадки на праздники')}
                                  type="range"
                                  value={holidayPercent}
                                  onChange={(e) => setHolidayPercent(clampInt(Number(e.target.value), HOLIDAY_MIN, HOLIDAY_MAX))}
                                />
                              </div>
                              <label className={ar('editorHolidayPercent')}>
                                <input
                                  className={ar('editorHolidayPercentField')}
                                  min={HOLIDAY_MIN}
                                  max={HOLIDAY_MAX}
                                  step={1}
                                  aria-label={tr('Процент скидки площадки на праздники')}
                                  type="number"
                                  value={holidayPercent}
                                  onChange={(e) => setHolidayPercent(clampInt(Number(e.target.value), HOLIDAY_MIN, HOLIDAY_MAX))}
                                />
                                <span aria-hidden="true">%</span>
                              </label>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className={ar('formGroup')}>
                      <span id="editor-game-tags-label" className="form-label">
                        {tr('Теги (игры/платформы)')}
                      </span>
                      <div className={rs('gameTags')} role="group" aria-labelledby="editor-game-tags-label">
                        {GAME_TAGS.map((tag) => {
                          const active = selectedTags.includes(tag.id)
                          return (
                            <button
                              key={tag.id}
                              type="button"
                              data-game-tag={tag.id}
                              className={rs('gameTag') + (active ? ' ' + rs('gameTagActive') : '') + '   '}
                              aria-pressed={active}
                              onClick={() => toggleTag(tag.id)}
                            >
                              <img
                                alt=""
                                draggable={false}
                                loading="eager"
                                width={20}
                                height={20}
                                decoding="async"
                                data-nimg="1"
                                className={rs('gameTagIcon')}
                                src={`${CDN}/img/games/${tag.id}.webp`}
                                style={{ color: 'transparent' }}
                              />
                              <span className={rs('gameTagLabel')}>{tr(tag.label)}</span>
                            </button>
                          )
                        })}
                        <div className={ar('gameTagsAddBlock')} data-game-tags-add-block="true">
                          <span className={ar('gameTagsAddCustomTooltipAnchor')} data-tooltip-trigger="">
                            <button
                              type="button"
                              data-add-custom-tag="true"
                              className={ar('gameTagsAddCustom')}
                              aria-label={tr('Добавить тег')}
                            >
                              <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                                <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                            </button>
                          </span>
                          <span className={ar('gameTagsCount')} role="status" aria-live="polite" aria-atomic="true">
                            {tagCountLabel}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <fieldset className={ar('settingsFieldset')}>
                    <legend className={ar('settingsLegend', 'settingsLegendEditable')}>
                      <input
                        className={inp('input') + ' ' + ar('settingsLegendInput')}
                        id="resource-specs-heading"
                        placeholder={tr('Характеристика')}
                        aria-label={tr('Характеристика')}
                        maxLength={120}
                        autoComplete="off"
                        type="text"
                        value={specHeading}
                        onChange={(e) => setSpecHeading(e.target.value)}
                      />
                    </legend>
                    <div className={ar('linkDeliveryUrlList')}>
                      {specRows.map((row, i) => (
                        <div key={i} className={ar('linkDeliveryUrlLine')}>
                          <div className={ar('specFieldsRow')}>
                            <input
                              className={inp('input', 'inputDarkDefault') + ' ' + ar('settingsPanelField', 'linkDeliveryUrlInput', 'specFieldsRowNameInput')}
                              placeholder={tr('Наименование')}
                              aria-label={`${tr('Строка')} ${i + 1}: ${tr('наименование')}`}
                              type="text"
                              value={row.name}
                              onChange={(e) => updateSpecRow(i, { name: e.target.value })}
                            />
                            <div className={ar('specFieldsRowValueGroup')}>
                              <input
                                className={inp('input', 'inputDarkDefault') + ' ' + ar('settingsPanelField', 'linkDeliveryUrlInput')}
                                placeholder={tr('Текст')}
                                aria-label={`${tr('Строка')} ${i + 1}: ${tr('текст')}`}
                                type="text"
                                value={row.value}
                                onChange={(e) => updateSpecRow(i, { value: e.target.value })}
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </fieldset>
                </div>
              </div>
            ) : (
              <div className={ar('createWizardFullDescription')}>
                <div className={ar('formGroup')}>
                  <label className="form-label" htmlFor="resource-full-description">
                    {tr('Подробное описание')}
                  </label>
                  <textarea
                    id="resource-full-description"
                    className={inp('input', 'inputDarkDefault')}
                    rows={12}
                    placeholder={tr('Расскажите подробно о ресурсе')}
                    aria-label={tr('Подробное описание')}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>
              </div>
            )}
          </div>

          <div
            className={ar('productManageCreateDock')}
            role="region"
            aria-label={tr('Управление и модерация')}
            style={{ '--product-manage-dock-lift': '0px' } as CSSProperties}
          >
            <div className={ar('productManageDockActions')}>
              <div className={ar('productManageSaveRow')} role="group" aria-label={tr('Действия в конце формы')}>
                <button type="submit" className={ar('productManageSaveBtn')} aria-busy={pending} disabled={pending}>
                  {pending ? tr('Публикация…') : tr('Опубликовать')}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </section>
  )
}

export default AddResourceContent
