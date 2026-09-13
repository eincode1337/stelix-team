'use client'

import { useCallback, useEffect, useMemo, useState, type CSSProperties, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/auth/AuthProvider'
import { useSignInDrawer } from '@/components/auth/SignInDrawer'
import { useT } from '@/i18n/LocaleProvider'


const ar = (...n: string[]) => n.map((x) => `AddResourceContent-module__UdTvSa__${x}`).join(' ')
const rd = (...n: string[]) => n.map((x) => `ResourceDetail-module__XriO0W__${x}`).join(' ')
const rs = (...n: string[]) => n.map((x) => `Resources-module__Zk5JmW__${x}`).join(' ')
const dd = (...n: string[]) => n.map((x) => `Dropdown-module__DasDQW__${x}`).join(' ')
const inp = (...n: string[]) => n.map((x) => `Input-module__rdnxQa__${x}`).join(' ')
const ph = (...n: string[]) => n.map((x) => `PageHeaderBar-module__1SDZQW__${x}`).join(' ')
const ap = (...n: string[]) => n.map((x) => `AdminPanel-module__8pW_9a__${x}`).join(' ')
const ci = (...n: string[]) => n.map((x) => `CategoryIcon-module__kwjccG__${x}`).join(' ')

const dockLift = (v: string): CSSProperties => ({ ['--product-manage-dock-lift']: v }) as CSSProperties

const ADD_ICON = 'M12 5v14M5 12h14'
const DOWNLOAD_ICON = 'M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3'
const UPLOADS_BASE = 'https://cdn.stelix.team'

const MAX_TAGS = 10

const GAME_TAGS: ReadonlyArray<{ slug: string; label: string }> = [
  { slug: 'cs2', label: 'CS2' },
  { slug: 'lrweb', label: 'LR Web' },
  { slug: 'csgo', label: 'CS:GO' },
  { slug: 'css', label: 'CSS' },
  { slug: 'cs16', label: 'CS 1.6' },
  { slug: 'mc', label: 'Minecraft' },
  { slug: 'discord', label: 'Discord' },
  { slug: 'gamecms', label: 'GameCMS' },
  { slug: 'xenforo', label: 'XenForo' },
  { slug: 'ips', label: 'IPS' },
  { slug: 'phpbb', label: 'phpBB' },
  { slug: 'minecraft', label: 'Java Edition' },
  { slug: 'tf2', label: 'TF2' },
  { slug: 'telegram', label: 'Telegram' },
  { slug: 'ark', label: 'ARK' },
  { slug: 'altv', label: 'alt:V' },
  { slug: 'ats', label: 'ATS' },
  { slug: 'beamng', label: 'BeamNG' },
  { slug: 'ets2', label: 'ETS 2' },
  { slug: 'fivem', label: 'FiveM' },
  { slug: 'gmod', label: 'GMod' },
  { slug: 'hl', label: 'Half-Life' },
  { slug: 'hl2', label: 'Half-Life 2' },
  { slug: 'hosting', label: 'Хостинг' },
  { slug: 'l4d', label: 'L4D' },
  { slug: 'l4d2', label: 'L4D2' },
  { slug: 'flute', label: 'Flute CMS' },
  { slug: 'figma', label: 'Figma' },
  { slug: 'dle', label: 'DLE' },
  { slug: 'minecraftbedrock', label: 'Bedrock Edition' },
  { slug: 'mta', label: 'MTA' },
  { slug: 'projectz', label: 'Project Z' },
  { slug: 'ragemp', label: 'RAGE MP' },
  { slug: 'redm', label: 'RedM' },
  { slug: 'rust', label: 'Rust' },
  { slug: 'tf', label: 'TF' },
  { slug: 'unturned', label: 'Unturned' },
]

const CATEGORIES: ReadonlyArray<{ value: string; label: string; viewBox: string; d: string }> = [
  { value: 'plugins', label: 'Плагины', viewBox: '0 0 512 512', d: 'M320 0L448 0c35.3 0 64 28.7 64 64l0 128c0 8.8-7.2 16-16 16l-52 0c-6.6 0-12 5.4-12 12l0 4c0 17.7-14.3 32-32 32s-32-14.3-32-32l0-4c0-6.6-5.4-12-12-12l-36 0c-8.8 0-16-7.2-16-16l0-32c0-8.8 7.2-16 16-16l16 0c17.7 0 32-14.3 32-32s-14.3-32-32-32l-16 0c-8.8 0-16-7.2-16-16l0-48c0-8.8 7.2-16 16-16zM0 256L0 128C0 92.7 28.7 64 64 64l128 0c8.8 0 16 7.2 16 16l0 36c0 6.6 5.4 12 12 12l4 0c17.7 0 32 14.3 32 32s-14.3 32-32 32l-4 0c-6.6 0-12 5.4-12 12l0 52c0 8.8-7.2 16-16 16l-32 0c-8.8 0-16-7.2-16-16l0-16c0-17.7-14.3-32-32-32s-32 14.3-32 32l0 16c0 8.8-7.2 16-16 16l-48 0c-8.8 0-16-7.2-16-16zM0 448L0 320c0-8.8 7.2-16 16-16l176 0c8.8 0 16 7.2 16 16l0 32c0 8.8-7.2 16-16 16l-16 0c-17.7 0-32 14.3-32 32s14.3 32 32 32l16 0c8.8 0 16 7.2 16 16l0 48c0 8.8-7.2 16-16 16L64 512c-35.3 0-64-28.7-64-64zM240 320c0-8.8 7.2-16 16-16l32 0c8.8 0 16 7.2 16 16l0 16c0 17.7 14.3 32 32 32s32-14.3 32-32l0-16c0-8.8 7.2-16 16-16l48 0c8.8 0 16 7.2 16 16l0 128c0 35.3-28.7 64-64 64l-128 0c-8.8 0-16-7.2-16-16l0-176z' },
  { value: 'modules', label: 'Модули', viewBox: '0 0 640 512', d: 'M544 32c35.3 0 64 28.7 64 64l0 320c0 35.3-28.7 64-64 64l-384 0c-33.1 0-60.4-25.2-63.7-57.5l-.3-6.5 0-128 288 0 0-256 160 0zM135.6 64c-9.1 9.1-30.4 30.5-64 64 33.5 33.5 54.8 54.9 64 64l-39.6 39.6-19.8-19.8-64-64c-10.9-10.9-10.9-28.7 0-39.6l64-64 19.8-19.8 39.6 39.6zM243.8 44.2l64 64c10.9 10.9 10.9 28.7 0 39.6l-64 64-19.8 19.8-39.6-39.6c9.1-9.1 30.4-30.5 64-64-33.5-33.5-54.8-54.9-64-64L224 24.4 243.8 44.2z' },
  { value: 'scripts', label: 'Скрипты', viewBox: '0 0 576 512', d: 'M360.8 1.2c-17-4.9-34.7 5-39.6 22l-128 448c-4.9 17 5 34.7 22 39.6s34.7-5 39.6-22l128-448c4.9-17-5-34.7-22-39.6zm64.6 136.1c-12.5 12.5-12.5 32.8 0 45.3l73.4 73.4-73.4 73.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0l96-96c12.5-12.5 12.5-32.8 0-45.3l-96-96c-12.5-12.5-32.8-12.5-45.3 0zm-274.7 0c-12.5-12.5-32.8-12.5-45.3 0l-96 96c-12.5 12.5-12.5 32.8 0 45.3l96 96c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L77.3 256 150.6 182.6c12.5-12.5 12.5-32.8 0-45.3z' },
  { value: 'maps', label: 'Карты', viewBox: '0 0 512 512', d: 'M512 48c0-11.1-5.7-21.4-15.2-27.2s-21.2-6.4-31.1-1.4L349.5 77.5 170.1 17.6c-8.1-2.7-16.8-2.1-24.4 1.7l-128 64C6.8 88.8 0 99.9 0 112L0 464c0 11.1 5.7 21.4 15.2 27.2s21.2 6.4 31.1 1.4l116.1-58.1 179.4 59.8c8.1 2.7 16.8 2.1 24.4-1.7l128-64c10.8-5.4 17.7-16.5 17.7-28.6l0-352zM192 376.9l0-284.5 128 42.7 0 284.5-128-42.7z' },
  { value: 'integrations', label: 'Интеграции', viewBox: '0 0 576 512', d: 'M344 380c24.3 0 44 19.7 44 44l0 104c0 11-9 20-20 20s-20-9-20-20l0-28-24 0 0 28c0 11-9 20-20 20s-20-9-20-20l0-104c0-24.3 19.7-44 44-44l16 0zm120 0c33.1 0 60 26.9 60 60s-26.9 60-60 60l-12 0 0 28c0 11-9 20-20 20s-20-9-20-20l0-128c0-11 9-20 20-20l32 0zm96 0c11 0 20 9 20 20l0 128c0 11-9 20-20 20s-20-9-20-20l0-128c0-11 9-20 20-20zM328 420c-2.2 0-4 1.8-4 4l0 36 24 0 0-36c0-2.2-1.8-4-4-4l-16 0zm124 40l12 0c11 0 20-9 20-20s-9-20-20-20l-12 0 0 40zM317.9-16c15.2 0 28.3 10.7 31.3 25.6l14.4 69.9c14.1 6 27.3 13.7 39.3 22.7l67.8-22.5c14.4-4.8 30.2 1.2 37.8 14.4l29.9 51.8c7.6 13.1 4.9 29.8-6.4 39.9l-53.5 47.5c.9 7.4 1.4 15 1.4 22.7 0 7.7-.5 15.2-1.4 22.7l53.5 47.5c3.2 2.8 5.6 6.2 7.4 9.8L304 336c-35.3 0-64 28.7-64 64l0 41.9c-24.6-6.3-47.3-17.4-67-32.2l-67.8 22.5c-14.4 4.8-30.2-1.2-37.8-14.4L37.5 366.1c-7.6-13.1-4.9-29.8 6.5-39.9l53.4-47.5c-.9-7.4-1.3-15-1.3-22.7s.5-15.2 1.3-22.7L44 185.8c-11.3-10.1-14.1-26.8-6.5-39.9L67.4 94.1C75 80.9 90.8 74.9 105.2 79.7L173 102.2c12.1-9 25.3-16.7 39.3-22.7L226.7 9.6C229.8-5.3 242.9-16 258.1-16l59.8 0zM288 172c-46.4 0-84 37.6-84 84 0 23.7 9.8 45 25.6 60.3 19.8-17.6 45.9-28.3 74.4-28.3l61.6 0c4.1-9.9 6.4-20.7 6.4-32 0-46.4-37.6-84-84-84z' },
  { value: 'models', label: 'Модели', viewBox: '0 0 384 512', d: 'M40.1 467.1l-11.2 9C25.7 478.6 21.8 480 17.8 480 8 480 0 472 0 462.2L0 192C0 86 86 0 192 0S384 86 384 192l0 270.2c0 9.8-8 17.8-17.8 17.8-4 0-7.9-1.4-11.1-3.9l-11.2-9c-13.4-10.7-32.8-9-44.1 3.9L269.3 506c-3.3 3.8-8.2 6-13.3 6s-9.9-2.2-13.3-6l-26.6-30.5c-12.7-14.6-35.4-14.6-48.2 0L141.3 506c-3.3 3.8-8.2 6-13.3 6s-9.9-2.2-13.3-6L84.2 471c-11.3-12.9-30.7-14.6-44.1-3.9zM160 192a32 32 0 1 0 -64 0 32 32 0 1 0 64 0zm96 32a32 32 0 1 0 0-64 32 32 0 1 0 0 64z' },
  { value: 'particles', label: 'Партиклы', viewBox: '0 0 560 560', d: 'M250.1 32.4C256.1 13.1 273.8 0 294 0s37.9 13.1 43.9 32.4L369.4 135c8.2 26.6 29 47.4 55.6 55.6l102.6 31.6c19.3 5.9 32.4 23.7 32.4 43.9s-13.1 37.9-32.4 43.9L425 341.4c-26.6 8.2-47.4 29-55.6 55.6L337.9 499.6C331.9 518.9 314.1 532 294 532s-37.9-13.1-43.9-32.4L218.6 397c-8.2-26.6-29-47.4-55.6-55.6L60.4 309.9C41.1 303.9 28 286.2 28 266s13.1-37.9 32.4-43.9L163 190.6c26.6-8.2 47.4-29 55.6-55.6L250.1 32.4zM84 392c-23.1 0-44.7 7.5-60.6 23.4S0 452.9 0 476 7.5 520.7 23.4 536.6 60.9 560 84 560 128.7 552.5 144.6 536.6 168 499.1 168 476 160.5 431.3 144.6 415.4 107.1 392 84 392zM462 84a42 42 0 1 0 0-84 42 42 0 1 0 0 84zM56 112a28 28 0 1 1 56 0 28 28 0 1 1 -56 0zM476 448a28 28 0 1 0 0-56 28 28 0 1 0 0 56z' },
  { value: 'assemblies', label: 'Сборки', viewBox: '0 0 640 512', d: 'M64 48l0 160c0 26.5 21.5 48 48 48l160 0c26.5 0 48-21.5 48-48l0-160c0-26.5-21.5-48-48-48L112 0C85.5 0 64 21.5 64 48zM96 320c-53 0-96 43-96 96s43 96 96 96l448 0c53 0 96-43 96-96s-43-96-96-96L96 320zm32 64a32 32 0 1 1 0 64 32 32 0 1 1 0-64zm160 32a32 32 0 1 1 64 0 32 32 0 1 1 -64 0zm224-32a32 32 0 1 1 0 64 32 32 0 1 1 0-64zM432 64c-26.5 0-48 21.5-48 48l0 96c0 26.5 21.5 48 48 48l96 0c26.5 0 48-21.5 48-48l0-96c0-26.5-21.5-48-48-48l-96 0z' },
  { value: 'tools', label: 'Инструменты', viewBox: '0 0 576 512', d: 'M70.8-6.7c5.4-5.4 13.8-6.2 20.2-2L209.9 70.5c8.9 5.9 14.2 15.9 14.2 26.6l0 49.6 90.8 90.8c33.3-15 73.9-8.9 101.2 18.5L542.2 382.1c18.7 18.7 18.7 49.1 0 67.9l-60.1 60.1c-18.7 18.7-49.1 18.7-67.9 0L288.1 384c-27.4-27.4-33.5-67.9-18.5-101.2l-90.8-90.8-49.6 0c-10.7 0-20.7-5.3-26.6-14.2L23.4 58.9c-4.2-6.3-3.4-14.8 2-20.2L70.8-6.7zm145 303.5c-6.3 36.9 2.3 75.9 26.2 107.2l-94.9 95c-28.1 28.1-73.7 28.1-101.8 0s-28.1-73.7 0-101.8l135.4-135.5 35.2 35.1zM384.1 0c20.1 0 39.4 3.7 57.1 10.5 10 3.8 11.8 16.5 4.3 24.1L388.8 91.3c-3 3-4.7 7.1-4.7 11.3l0 41.4c0 8.8 7.2 16 16 16l41.4 0c4.2 0 8.3-1.7 11.3-4.7l56.7-56.7c7.6-7.5 20.3-5.7 24.1 4.3 6.8 17.7 10.5 37 10.5 57.1 0 43.2-17.2 82.3-45 111.1l-49.1-49.1c-33.1-33-78.5-45.7-121.1-38.4l-56.8-56.8 0-29.7-.2-5c-.8-12.4-4.4-24.3-10.5-34.9 29.4-35 73.4-57.2 122.7-57.3z' },
  { value: 'other', label: 'Другое', viewBox: '0 0 512 512', d: 'M232.5 5.2c14.9-6.9 32.1-6.9 47 0l218.6 101c8.5 3.9 13.9 12.4 13.9 21.8s-5.4 17.9-13.9 21.8l-218.6 101c-14.9 6.9-32.1 6.9-47 0L13.9 149.8C5.4 145.8 0 137.3 0 128s5.4-17.9 13.9-21.8L232.5 5.2zM48.1 218.4l164.3 75.9c27.7 12.8 59.6 12.8 87.3 0l164.3-75.9 34.1 15.8c8.5 3.9 13.9 12.4 13.9 21.8s-5.4 17.9-13.9 21.8l-218.6 101c-14.9 6.9-32.1 6.9-47 0L13.9 277.8C5.4 273.8 0 265.3 0 256s5.4-17.9 13.9-21.8l34.1-15.8zM13.9 362.2l34.1-15.8 164.3 75.9c27.7 12.8 59.6 12.8 87.3 0l164.3-75.9 34.1 15.8c8.5 3.9 13.9 12.4 13.9 21.8s-5.4 17.9-13.9 21.8l-218.6 101c-14.9 6.9-32.1 6.9-47 0L13.9 405.8C5.4 401.8 0 393.3 0 384s5.4-17.9 13.9-21.8z' },
]

const DEFAULT_CATEGORY = 'other'
const DEFAULT_SPEC_HEADING = 'Характеристика'

export function CreateFreeResourceContent() {
  const tr = useT()
  const router = useRouter()
  const { user } = useAuth()
  const signIn = useSignInDrawer()

  const [title, setTitle] = useState('')
  const [shortDescription, setShortDescription] = useState('')
  const [category, setCategory] = useState(DEFAULT_CATEGORY)
  const [categoryOpen, setCategoryOpen] = useState(false)
  const [specHeading, setSpecHeading] = useState(DEFAULT_SPEC_HEADING)
  const [specName, setSpecName] = useState('')
  const [specValue, setSpecValue] = useState('')
  const [selectedTags, setSelectedTags] = useState<ReadonlySet<string>>(() => new Set())
  const [pending, setPending] = useState(false)
  const [error, setError] = useState('')

  const selectedCategory = useMemo(
    () => CATEGORIES.find((c) => c.value === category) ?? CATEGORIES[CATEGORIES.length - 1],
    [category],
  )

  useEffect(() => {
    const root = document.documentElement
    root.classList.add('resource-form-dock')
    return () => root.classList.remove('resource-form-dock')
  }, [])

  const toggleTag = useCallback((slug: string) => {
    setSelectedTags((prev) => {
      const next = new Set(prev)
      if (next.has(slug)) {
        next.delete(slug)
      } else if (next.size < MAX_TAGS) {
        next.add(slug)
      }
      return next
    })
  }, [])

  const resetForm = useCallback(() => {
    setTitle('')
    setShortDescription('')
    setCategory(DEFAULT_CATEGORY)
    setCategoryOpen(false)
    setSpecHeading(DEFAULT_SPEC_HEADING)
    setSpecName('')
    setSpecValue('')
    setSelectedTags(new Set())
    setError('')
  }, [])

  const submit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault()
      if (pending) return
      if (!user) {
        signIn.open()
        return
      }
      if (!title.trim()) {
        setError(tr('Укажите название ресурса.'))
        return
      }
      setPending(true)
      setError('')
      const payload = {
        title: title.trim(),
        shortDescription: shortDescription.trim() || undefined,
        category,
        listingKind: 'FREE',
        price: 0,
        tags: [...selectedTags],
      }
      try {
        const res = await fetch('/api/resources', {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify(payload),
        })
        if (res.status === 401) {
          signIn.open()
          setPending(false)
          return
        }
        const data = (await res.json().catch(() => null)) as { slug?: string; error?: string } | null
        if (!res.ok || !data?.slug) {
          setError((data && data.error) || tr('Не удалось опубликовать ресурс. Попробуйте ещё раз.'))
          setPending(false)
          return
        }
        router.push(`/resources/${data.slug}`)
      } catch {
        setError(tr('Не удалось опубликовать ресурс. Проверьте соединение.'))
        setPending(false)
      }
    },
    [category, pending, router, selectedTags, shortDescription, signIn, title, tr, user],
  )

  return (
    <section className={rd('resourceDetailPage')}>
      <div className={`container ${rd('resourceDetailPageInner')}`}>
        <form className={ar('form')} onSubmit={submit}>
          <header className={ph('headerBar')}>
            <div className={ph('headerBar__start')}>
              <h1 className={ph('headerBar__title')}>{tr('Новый ресурс')}</h1>
            </div>
            <div className={ph('headerBar__end')}>
              <span className={ph('headerBar__divider')} aria-hidden="true"></span>
              <div className={ph('headerBar__actions')}>
                <span className={ar('formHeaderTooltipAnchor')} data-tooltip-trigger="">
                  <button
                    type="button"
                    className={`${ap('tableIconButton')} ${ar('formHeaderTableIconButton')} ${ar('formHeaderDefaultNavIconButton')}`}
                    aria-label={tr('К панели продавца')}
                    onClick={() => router.push('/seller')}
                  >
                    <svg viewBox="0 0 24 24" fill="none" className={ap('tableIconButtonIcon')} aria-hidden="true">
                      <path d="M19 12H5M12 19l-7-7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path>
                    </svg>
                  </button>
                </span>
                <span className={ar('formHeaderTooltipAnchor')} data-tooltip-trigger="">
                  <a
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`${ap('tableIconButton')} ${ar('formHeaderTableIconButton')} ${ar('formHeaderDefaultNavIconButton')}`}
                    aria-label={tr('API документация')}
                    href="/seller/api-docs"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512" fill="currentColor" aria-hidden="true" className={ap('tableIconButtonIcon')}>
                      <path d="M344 380c24.3 0 44 19.7 44 44l0 104c0 11-9 20-20 20s-20-9-20-20l0-28-24 0 0 28c0 11-9 20-20 20s-20-9-20-20l0-104c0-24.3 19.7-44 44-44l16 0zm120 0c33.1 0 60 26.9 60 60s-26.9 60-60 60l-12 0 0 28c0 11-9 20-20 20s-20-9-20-20l0-128c0-11 9-20 20-20l32 0zm96 0c11 0 20 9 20 20l0 128c0 11-9 20-20 20s-20-9-20-20l0-128c0-11 9-20 20-20zM328 420c-2.2 0-4 1.8-4 4l0 36 24 0 0-36c0-2.2-1.8-4-4-4l-16 0zm124 40l12 0c11 0 20-9 20-20s-9-20-20-20l-12 0 0 40zM331.2-16c18.7 0 34.9 13 39 31.2l12.6 55.6C389 74 395.1 77.5 401 81.3l54.5-16.9c17.8-5.5 37.2 2 46.5 18.2l43.2 74.8c9.3 16.2 6.2 36.7-7.5 49.4l-41.9 38.7c.3 6.9 .3 14 0 20.9l41.9 38.7c8.8 8.1 13.2 19.5 12.8 30.8l-50.2 0-45.6-42.2c-5.6-5.2-8.4-12.7-7.6-20.2 1.3-11.5 1.3-23.6 0-35.2-.8-7.6 2-15.1 7.6-20.3l45.7-42.3-36.8-63.7-59.5 18.5c-7.3 2.3-15.2 .9-21.3-3.6-9.4-6.9-19.6-12.8-30.4-17.6-7-3.1-12.1-9.3-13.8-16.7l-13.7-60.8-73.6 0-13.7 60.8c-1.7 7.4-6.8 13.6-13.8 16.7-10.8 4.7-21 10.7-30.4 17.6-6.1 4.5-14.1 5.9-21.4 3.6l-59.5-18.5-36.8 63.7 45.8 42.3c5.6 5.2 8.4 12.7 7.6 20.3-1.3 11.5-1.3 23.6 0 35.2 .8 7.6-2 15.1-7.6 20.2l-45.8 42.3 36.8 63.8 59.5-18.5c7.3-2.3 15.2-.9 21.4 3.6 8.9 6.6 18.6 12.2 28.8 16.8 5.8 2.6 11.8 4.8 17.9 6.8l0 49.8c-16.4-3.9-32.1-9.7-46.8-17.2-6.2-3.2-12.4-6.7-18.2-10.5l-54.5 16.9c-17.9 5.5-37.2-2-46.5-18.2L30.8 354.6c-9.3-16.2-6.2-36.7 7.5-49.4l41.9-38.7c-.3-6.9-.3-14 0-20.9L38.3 206.8c-13.7-12.7-16.8-33.2-7.5-49.4L74 82.6c9.3-16.2 28.7-23.8 46.5-18.2L175 81.3c5.9-3.8 11.9-7.3 18.2-10.5l12.6-55.6C209.9-3 226.1-16 244.8-16l86.4 0zM288 352a96 96 0 1 1 0-192 96 96 0 1 1 0 192zm0-144a48 48 0 1 0 0 96 48 48 0 1 0 0-96z"></path>
                    </svg>
                  </a>
                </span>
                <span className={ar('formHeaderTooltipAnchor')} data-tooltip-trigger="">
                  <button
                    type="button"
                    className={`${ap('tableIconButton')} ${ap('tableIconButtonDanger')} ${ar('formHeaderTableIconButton')} ${ar('formHeaderSemanticIconDanger')}`}
                    aria-label={tr('Очистить всё')}
                    onClick={resetForm}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512" fill="currentColor" className={ap('tableIconButtonIcon')} aria-hidden="true">
                      <path d="M569 9c9.4-9.4 9.4-24.6 0-33.9s-24.6-9.4-33.9 0l-200 200-12.9-12.9c-20.2-20.2-51.4-24.6-76.3-10.7L16.4 278.9C6.3 284.5 0 295.2 0 306.8 0 315.2 3.4 323.4 9.3 329.3L214.7 534.7c6 6 14.1 9.3 22.6 9.3 11.6 0 22.3-6.3 27.9-16.4L392.6 298.2c13.9-25 9.5-56.1-10.7-76.3L369 209 569 9zM288.2 196.1l59.7 59.7c5.1 5.1 6.1 12.8 2.7 19.1l-14.9 26.8-93.4-93.4 26.8-14.9c6.2-3.5 14-2.4 19.1 2.7zm-89.6 36.5l112.8 112.8-77.9 140.3-96.5-96.5 18-53.9c2.1-6.3-3.9-12.2-10.1-10.1l-53.9 18-32.5-32.5 140.3-77.9z"></path>
                    </svg>
                  </button>
                </span>
                <span className={ar('formHeaderTooltipAnchor')} data-tooltip-trigger="">
                  <button
                    type="button"
                    className={`${ap('tableIconButton')} ${ap('tableIconButtonDanger')} ${ar('formHeaderTableIconButton')} ${ar('formHeaderSemanticIconDanger')}`}
                    aria-label={tr('Сбросить')}
                    onClick={resetForm}
                  >
                    <svg viewBox="0 0 24 24" fill="none" className={ap('tableIconButtonIcon')} aria-hidden="true">
                      <path d="M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path>
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
                  className={`${ap('tableIconButton')} ${ar('formHeaderTableIconButton')} ${ar('createWizardSideNavBtn')} ${ar('createWizardSideNavBtnMuted')}`}
                  disabled
                  aria-label={tr('Назад')}
                >
                  <svg viewBox="0 0 24 24" fill="none" className={ap('tableIconButtonIcon')} aria-hidden="true">
                    <path d="M15 6l-6 6 6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path>
                  </svg>
                </button>
                <div className={ar('createWizardChapterTrack')}>
                  <div className={ar('createWizardChapterRow')}>
                    <div className={`${ar('createWizardChapter')} ${ar('createWizardChapterActive')}`}>
                      <span className={ar('createWizardChapterLabel')} aria-current="true">
                        <svg viewBox="0 0 576 512" fill="currentColor" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" className={ar('createWizardChapterIcon')}>
                          <path d="M512 112c8.8 0 16 7.2 16 16l0 256c0 8.8-7.2 16-16 16L64 400c-8.8 0-16-7.2-16-16l0-256c0-8.8 7.2-16 16-16l448 0zM64 64C28.7 64 0 92.7 0 128L0 384c0 35.3 28.7 64 64 64l448 0c35.3 0 64-28.7 64-64l0-256c0-35.3-28.7-64-64-64L64 64zM358.3 171.2c-4.5-6.4-11.8-10.2-19.6-10.2s-15.1 3.8-19.6 10.2l-64.5 91.3-28.8-34.4c-4.6-5.5-11.3-8.6-18.4-8.6s-13.9 3.2-18.4 8.6l-70.7 84.5c-6 7.1-7.3 17.1-3.3 25.6S127.5 352 136.8 352l302.8 0c9 0 17.2-5 21.3-13s3.5-17.6-1.7-24.9l-100.9-143zM128 224a32 32 0 1 0 0-64 32 32 0 1 0 0 64z"></path>
                        </svg>
                        {tr('Основное')}
                      </span>
                      <span className={ar('createWizardChapterDots')}>
                        <span className={ar('createWizardChapterDotWrap')}>
                          <button type="button" className={`${ar('createWizardChapterDot')} ${ar('createWizardChapterDotActive')}`} aria-current="step" aria-label={tr('1. Медиа и основное')} data-tooltip-trigger=""></button>
                        </span>
                        <span className={ar('createWizardChapterDotWrap')}>
                          <button type="button" className={ar('createWizardChapterDot')} disabled aria-label={tr('2. Подробное описание')}></button>
                        </span>
                      </span>
                    </div>
                    <div className={`${ar('createWizardChapter')} ${ar('createWizardChapterLocked')}`}>
                      <span className={ar('createWizardChapterLabel')}>
                        <svg viewBox="0 0 24 24" fill="none" className={ar('createWizardChapterIcon')} aria-hidden="true">
                          <path d={DOWNLOAD_ICON} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path>
                        </svg>
                        {tr('Выдача')}
                      </span>
                      <span className={ar('createWizardChapterDots')}>
                        <span className={ar('createWizardChapterDotWrap')}>
                          <button type="button" className={ar('createWizardChapterDot')} disabled aria-label={tr('3. Выдача покупателю')}></button>
                        </span>
                        <span className={ar('createWizardChapterDotWrap')}>
                          <button type="button" className={ar('createWizardChapterDot')} disabled aria-label={tr('4. API Webhook')}></button>
                        </span>
                      </span>
                    </div>
                    <div className={`${ar('createWizardChapter')} ${ar('createWizardChapterLocked')}`}>
                      <span className={ar('createWizardChapterLabel')}>
                        <svg viewBox="0 0 24 24" fill="none" className={ar('createWizardChapterIcon')} aria-hidden="true">
                          <path d={DOWNLOAD_ICON} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path>
                        </svg>
                        {tr('Скачивание')}
                      </span>
                      <span className={ar('createWizardChapterDots')}>
                        <span className={ar('createWizardChapterDotWrap')}>
                          <button type="button" className={ar('createWizardChapterDot')} disabled aria-label={tr('5. Требования для скачивания')}></button>
                        </span>
                      </span>
                    </div>
                    <div className={`${ar('createWizardChapter')} ${ar('createWizardChapterLocked')}`}>
                      <span className={ar('createWizardChapterLabel')}>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512" fill="currentColor" className={ar('createWizardChapterIcon')} aria-hidden="true">
                          <path d="M598.1 75.4c10.7-7.8 13.1-22.8 5.3-33.5s-22.8-13.1-33.5-5.3l-74.5 54.2-9.9-6.6C465.8 71 442.6 64 418.9 64l-59.2 0-.4 0-143.6 0c-26.7 0-52.5 8.9-73.4 25.1L70.1 36.6c-10.7-7.8-25.7-5.4-33.5 5.3s-5.4 25.7 5.3 33.5l88 64c9.6 6.9 22.7 5.9 31.1-2.4l3.9-3.9c13.5-13.5 31.8-21.1 50.9-21.1l46.3 0-91.7 91.7c-15.6 15.6-15.6 40.9 0 56.6l.8 .8C218 308 294 308 340.9 261.1l27.1-27.1 97.8 97.8c15.6 15.6 15.6 40.9 0 56.6l-9.8 9.8-31-31c-9.4-9.4-24.6-9.4-33.9 0s-9.4 24.6 0 33.9l28 28c-17.5 10.4-37.2 16.7-57.6 18.5L313 399c-9.4-9.4-24.6-9.4-33.9 0s-9.4 24.6 0 33.9l15 15-3.8 0c-36.1 0-70.7-14.3-96.2-39.8L65 279c-9.4-9.4-24.6-9.4-33.9 0s-9.4 24.6 0 33.9L160.2 442.1c34.5 34.5 81.3 53.9 130.1 53.9l51.8 0 1 1 1-1 5.7 0c48.8 0 95.6-19.4 130.1-53.9l19.9-19.9c1.2-1.2 2.3-2.3 3.4-3.5 .7-.5 1.3-1.1 1.9-1.7L609 313c9.4-9.4 9.4-24.6 0-33.9s-24.6-9.4-33.9 0l-53.8 53.8c-4.2-12.8-11.3-24.9-21.5-35.1L385 183c-9.4-9.4-24.6-9.4-33.9 0l-44.1 44.1c-26.5 26.5-68.5 28-96.7 4.6l98.7-98.7c13.4-13.4 31.6-21 50.6-21.1l8.5 0 .2 0 50.8 0c14.2 0 28.1 4.2 39.9 12.1L482.7 140c8.4 5.6 19.3 5.3 27.4-.6l88-64z"></path>
                        </svg>
                        {tr('Совладельцы')}
                      </span>
                      <span className={ar('createWizardChapterDots')}>
                        <span className={ar('createWizardChapterDotWrap')}>
                          <button type="button" className={ar('createWizardChapterDot')} disabled aria-label={tr('6. Совладельцы')}></button>
                        </span>
                      </span>
                    </div>
                    <span className={ar('createWizardChapterIndicator')} aria-hidden="true" style={{ width: '325.906px', transform: 'translateX(7.6875px)' }}></span>
                  </div>
                </div>
                <button
                  type="button"
                  className={`${ap('tableIconButton')} ${ar('formHeaderTableIconButton')} ${ar('createWizardSideNavBtn')}`}
                  aria-label={tr('Вперёд')}
                >
                  <svg viewBox="0 0 24 24" fill="none" className={ap('tableIconButtonIcon')} aria-hidden="true">
                    <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path>
                  </svg>
                </button>
              </div>
            </nav>
          </div>

          <div className={ar('createWizardPanel')}>
            <div className={ar('content')}>
              <div className={ar('gallery')}>
                <input accept="image/jpeg,image/png,image/webp,image/gif" className={ar('hiddenFileInput')} tabIndex={-1} type="file" />
                <input multiple accept="image/jpeg,image/png,image/webp,image/gif" className={ar('hiddenFileInput')} tabIndex={-1} type="file" />
                <input accept="image/jpeg,image/png,image/webp,image/gif" className={ar('hiddenFileInput')} tabIndex={-1} type="file" />
                <input accept="image/jpeg,image/png,image/webp,image/gif" className={ar('hiddenFileInput')} tabIndex={-1} type="file" />
                <div className={ar('mediaVariantSlotFull')}>
                  <div className={ar('mediaVariantHeader')}>
                    <span className={ar('mediaVariantLabel')}>{tr('Обложка')}</span>
                    <span className={ar('mediaVariantHint')}>16:9 (1920×1080px)</span>
                  </div>
                  <div className={`${rd('mainImage')} ${ar('uploadMainImage')} `}>
                    <button type="button" className={ar('uploadMainHit')} aria-label={tr('Загрузить обложку, формат 16:9, 1920×1080 px')}>
                      <svg viewBox="0 0 24 24" fill="none" className={ar('addIcon')}>
                        <path d={ADD_ICON} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path>
                      </svg>
                    </button>
                  </div>
                </div>
                <div className={ar('mediaVariantSlotFull')}>
                  <div className={`${ar('mediaVariantHeader')} ${ar('mediaVariantHeaderWithAside')}`}>
                    <span className={ar('mediaVariantLabel')}>{tr('Галерея')}</span>
                    <span className={ar('mediaVariantHint')}>{tr('(исходный размер)')}</span>
                    <span className={`${ar('mediaVariantHint')} ${ar('mediaVariantHeaderAside')}`}>{tr('Удерживайте и перетащите для сортировки')}</span>
                  </div>
                  <div className={ar('thumbnails')}>
                    {Array.from({ length: 8 }, (_, i) => (
                      <div key={i} data-thumb-index={i} className={`${rd('thumbnail')} ${ar('thumbnailSlot')}   `}>
                        <button className={ar('galleryThumbPick')} type="button" aria-label={tr(`Выбрать фото ${i + 1}`)}>
                          <svg viewBox="0 0 24 24" fill="none" className={ar('addIcon')}>
                            <path d={ADD_ICON} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path>
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
                <div className={ar('mediaVariantRow')}>
                  <div className={`${ar('mediaVariantSlot')} ${ar('extraImageSlotCatalog')}`}>
                    <div className={ar('mediaVariantHeader')}>
                      <span className={ar('mediaVariantLabel')}>{tr('Каталог')}</span>
                      <span className={ar('mediaVariantHint')}>16:10 (1920×1200px)</span>
                    </div>
                    <button className={`${ar('mediaVariantUploadHit')} ${ar('extraImageSlotCatalogBox')}`} type="button" aria-label={tr('Загрузить изображение каталога')}>
                      <svg viewBox="0 0 24 24" fill="none" className={ar('addIcon')}>
                        <path d={ADD_ICON} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path>
                      </svg>
                    </button>
                  </div>
                  <div className={`${ar('mediaVariantSlot')} ${ar('extraImageSlotThumbnail')}`}>
                    <div className={ar('mediaVariantHeader')}>
                      <span className={ar('mediaVariantLabel')}>{tr('Миниатюра')}</span>
                      <span className={ar('mediaVariantHint')}>1:1 (400×400px)</span>
                    </div>
                    <button className={`${ar('mediaVariantUploadHit')} ${ar('extraImageSlotThumbnailBox')}`} type="button" aria-label={tr('Загрузить миниатюру')}>
                      <svg viewBox="0 0 24 24" fill="none" className={ar('addIcon')}>
                        <path d={ADD_ICON} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path>
                      </svg>
                    </button>
                  </div>
                  <div className={ar('mediaVariantTipSlot')}>
                    <div className={ar('mediaVariantTipHeader')}>
                      <span className={ar('mediaVariantLabel')}>{tr('Подсказки для управления')}</span>
                      <span className={ar('mediaVariantHint')}>{tr('Зажав ')}<span className={ar('mediaKeyTag')}>Shift</span>{tr(' быстрое удаление картинки')}</span>
                      <span className={ar('mediaVariantHint')}>{tr('Перетащите из папки в любую ячейку загрузки')}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className={`${rd('info')} ${ar('contentInfoCol')}`}>
                <div className={ar('editorMain')}>
                  <div className={ar('editorLead')}>
                    <div className={`${rd('detailLead')} ${ar('editorDetailLead')}`}>
                      <div className={rd('detailLeadText')}>
                        <input
                          className={`${inp('input')} ${inp('inputDarkDefault')} ${ar('resourceTitleInput')}`}
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
                              className={`${dd('trigger')} ${dd('triggerHasOptionIcon')} ${ar('editorLeadControlTrigger')}`}
                              aria-expanded={categoryOpen}
                              aria-haspopup="listbox"
                              onClick={() => setCategoryOpen((v) => !v)}
                            >
                              <span className={`${dd('triggerContent')} ${dd('triggerContentWithOptionIcon')}`}>
                                <span className={dd('triggerOptionIconWrap')} aria-hidden="true">
                                  <span className={`${ci('icon')} ${dd('optionIcon')}`} aria-hidden="true">
                                    <svg viewBox={selectedCategory.viewBox} overflow="visible" focusable="false">
                                      <path d={selectedCategory.d} fill="currentColor"></path>
                                    </svg>
                                  </span>
                                </span>
                                <span className={dd('triggerLabelWithOptionIcon')}>{tr(selectedCategory.label)}</span>
                              </span>
                              <svg viewBox="0 0 24 24" fill="none" className={`${dd('icon')}  `} aria-hidden="true">
                                <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path>
                              </svg>
                            </button>
                            {categoryOpen ? (
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
                                      <span className={`${ci('icon')} ${dd('optionIcon')}`} aria-hidden="true">
                                        <svg viewBox={c.viewBox} overflow="visible" focusable="false">
                                          <path d={c.d} fill="currentColor"></path>
                                        </svg>
                                      </span>
                                    </span>
                                    <span>{tr(c.label)}</span>
                                  </button>
                                ))}
                              </div>
                            ) : null}
                          </div>
                        </div>
                        <div className={ar('formGroup')}>
                          <label className="form-label" htmlFor="resource-short-description">{tr('Краткое описание')}</label>
                          <input
                            className={`${inp('input')} ${ar('titleInputBare')}`}
                            id="resource-short-description"
                            placeholder={tr('Кратко для карточки ресурса и поиска')}
                            aria-label={tr('Краткое описание для карточки')}
                            type="text"
                            value={shortDescription}
                            onChange={(e) => setShortDescription(e.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className={ar('formGroup')}>
                    <span id="editor-game-tags-label" className="form-label">{tr('Теги (игры/платформы)')}</span>
                    <div className={rs('gameTags')} role="group" aria-labelledby="editor-game-tags-label">
                      {GAME_TAGS.map((g) => {
                        const pressed = selectedTags.has(g.slug)
                        return (
                          <button
                            key={g.slug}
                            type="button"
                            data-game-tag={g.slug}
                            className={`${rs('gameTag')} ${pressed ? rs('gameTagActive') : ''}  `}
                            aria-pressed={pressed}
                            onClick={() => toggleTag(g.slug)}
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
                              src={`${UPLOADS_BASE}/img/games/${g.slug}.webp`}
                              style={{ color: 'transparent' }}
                            />
                            <span className={rs('gameTagLabel')}>{tr(g.label)}</span>
                          </button>
                        )
                      })}
                      <div className={ar('gameTagsAddBlock')} data-game-tags-add-block="true">
                        <span className={ar('gameTagsAddCustomTooltipAnchor')} data-tooltip-trigger="">
                          <button type="button" data-add-custom-tag="true" className={ar('gameTagsAddCustom')} aria-label={tr('Добавить тег')}>
                            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                              <path d={ADD_ICON} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path>
                            </svg>
                          </button>
                        </span>
                        <span className={ar('gameTagsCount')} role="status" aria-live="polite" aria-atomic="true">{selectedTags.size}/{MAX_TAGS}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <fieldset className={ar('settingsFieldset')}>
                  <legend className={`${ar('settingsLegend')} ${ar('settingsLegendEditable')}`}>
                    <input
                      className={`${inp('input')} ${ar('settingsLegendInput')}`}
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
                    <div className={ar('linkDeliveryUrlLine')}>
                      <div className={ar('specFieldsRow')}>
                        <input
                          className={`${inp('input')} ${inp('inputDarkDefault')} ${ar('settingsPanelField')} ${ar('linkDeliveryUrlInput')} ${ar('specFieldsRowNameInput')}`}
                          placeholder={tr('Наименование')}
                          aria-label={tr('Строка 1: наименование')}
                          type="text"
                          value={specName}
                          onChange={(e) => setSpecName(e.target.value)}
                        />
                        <div className={ar('specFieldsRowValueGroup')}>
                          <input
                            className={`${inp('input')} ${inp('inputDarkDefault')} ${ar('settingsPanelField')} ${ar('linkDeliveryUrlInput')}`}
                            placeholder={tr('Текст')}
                            aria-label={tr('Строка 1: текст')}
                            type="text"
                            value={specValue}
                            onChange={(e) => setSpecValue(e.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </fieldset>
              </div>
            </div>
          </div>

          <div className={ar('productManageCreateDock')} role="region" aria-label={tr('Управление и модерация')} style={dockLift('0px')}>
            <div className={ar('productManageDockActions')}>
              <div className={ar('productManageSaveRow')} role="group" aria-label={tr('Действия в конце формы')}>
                {error ? (
                  <p role="alert" className={ar('productManageSaveError')} style={{ color: 'var(--danger-fg)' }}>{error}</p>
                ) : null}
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

export default CreateFreeResourceContent
