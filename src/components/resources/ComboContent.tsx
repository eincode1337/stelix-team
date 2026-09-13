'use client'


import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type FormEvent,
} from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/auth/AuthProvider'
import { useSignInDrawer } from '@/components/auth/SignInDrawer'
import { useT } from '@/i18n/LocaleProvider'

const CDN = 'https://cdn.stelix.team'
const RESOURCE_SLOTS = 8

const arc = (...n: string[]) => n.map((x) => `AddResourceContent-module__UdTvSa__${x}`).join(' ')
const rd = (...n: string[]) => n.map((x) => `ResourceDetail-module__XriO0W__${x}`).join(' ')
const phb = (...n: string[]) => n.map((x) => `PageHeaderBar-module__1SDZQW__${x}`).join(' ')
const cc = (...n: string[]) => n.map((x) => `CreateComboContent-module__6v6JBW__${x}`).join(' ')
const chk = (...n: string[]) => n.map((x) => `CheckoutContent-module__miPPgG__${x}`).join(' ')
const adm = (...n: string[]) => n.map((x) => `AdminPanel-module__8pW_9a__${x}`).join(' ')
const inp = (...n: string[]) => n.map((x) => `Input-module__rdnxQa__${x}`).join(' ')
const dd = (...n: string[]) => n.map((x) => `Dropdown-module__DasDQW__${x}`).join(' ')
const sup = (...n: string[]) => n.map((x) => `SellerUserPicker-module__CMjdEG__${x}`).join(' ')

interface PickerUser {
  id: number
  label: string
  sub: string
  role: string
  sellerRating: { count: number; avg: number }
  avatarUrl: string | null
}

interface MyResource {
  id: string
  slug: string
  title: string
  price: number
  discount: number
  coverImage: string
  category: string
  tags: string[]
}

function formatAmount(n: number): string {
  return String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
}

function assetUrl(path: string): string {
  if (!path) return ''
  if (/^https?:\/\//i.test(path) || path.startsWith('blob:') || path.startsWith('data:')) return path
  return `${CDN}${path.startsWith('/') ? '' : '/'}${path}`
}

function PlusIcon({ className }: { className: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function LightningIcon({ className }: { className: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M13 2L3 14h8l-1 8 10-12h-8l1-8z" />
    </svg>
  )
}

export function ComboContent() {
  const tr = useT()
  const router = useRouter()
  const { user, loading } = useAuth()
  const signIn = useSignInDrawer()

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [coverImage, setCoverImage] = useState('')
  const [catalogImage, setCatalogImage] = useState('')
  const [thumbnailImage, setThumbnailImage] = useState('')

  const [coOwner, setCoOwner] = useState<PickerUser | null>(null)
  const [coOwnerQuery, setCoOwnerQuery] = useState('')
  const [coOwnerOpen, setCoOwnerOpen] = useState(false)
  const [coOwnerOptions, setCoOwnerOptions] = useState<PickerUser[]>([])
  const [coOwnerLoading, setCoOwnerLoading] = useState(false)

  const [slots, setSlots] = useState<(MyResource | null)[]>(() => Array(RESOURCE_SLOTS).fill(null))
  const [pickerIndex, setPickerIndex] = useState<number | null>(null)
  const [myResources, setMyResources] = useState<MyResource[] | null>(null)
  const [resLoading, setResLoading] = useState(false)

  const [pending, setPending] = useState(false)
  const [error, setError] = useState('')

  const coverInputRef = useRef<HTMLInputElement | null>(null)
  const catalogInputRef = useRef<HTMLInputElement | null>(null)
  const thumbInputRef = useRef<HTMLInputElement | null>(null)
  const coOwnerRootRef = useRef<HTMLDivElement | null>(null)

  const picked = useMemo(() => slots.filter((s): s is MyResource => s !== null), [slots])
  const newTotal = useMemo(() => picked.reduce((s, r) => s + (r.discount ?? r.price), 0), [picked])
  const oldTotal = useMemo(() => picked.reduce((s, r) => s + r.price, 0), [picked])
  const canSubmit = title.trim().length > 0 && picked.length >= 2

  useEffect(() => {
    if (!coOwnerOpen) return
    let cancelled = false
    setCoOwnerLoading(true)
    const q = coOwnerQuery.trim()
    const url = `/api/users/picker?sellerTier=1&limit=20${q ? `&q=${encodeURIComponent(q)}` : ''}`
    fetch(url, { credentials: 'include', headers: { Accept: 'application/json' } })
      .then(async (res) => {
        if (res.status === 401) {
          if (!cancelled) {
            setCoOwnerOpen(false)
            signIn.open()
          }
          return
        }
        const data = (await res.json().catch(() => null)) as { users?: PickerUser[] } | null
        if (!cancelled) setCoOwnerOptions(Array.isArray(data?.users) ? data!.users : [])
      })
      .catch(() => {
        if (!cancelled) setCoOwnerOptions([])
      })
      .finally(() => {
        if (!cancelled) setCoOwnerLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [coOwnerOpen, coOwnerQuery, signIn])

  useEffect(() => {
    if (!coOwnerOpen) return
    const onDown = (e: MouseEvent) => {
      if (coOwnerRootRef.current && !coOwnerRootRef.current.contains(e.target as Node)) {
        setCoOwnerOpen(false)
      }
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [coOwnerOpen])

  const loadMyResources = useCallback(() => {
    if (myResources !== null || resLoading || !user) return
    setResLoading(true)
    fetch(`/api/resources?authorId=${user.id}&listingKind=PAID`, {
      credentials: 'include',
      headers: { Accept: 'application/json' },
    })
      .then(async (res) => {
        const data = (await res.json().catch(() => null)) as { resources?: MyResource[] } | null
        setMyResources(Array.isArray(data?.resources) ? data!.resources : [])
      })
      .catch(() => setMyResources([]))
      .finally(() => setResLoading(false))
  }, [myResources, resLoading, user])

  const openPicker = useCallback(
    (index: number) => {
      setPickerIndex(index)
      loadMyResources()
    },
    [loadMyResources],
  )

  const chooseResource = useCallback(
    (res: MyResource) => {
      setSlots((prev) => {
        const next = [...prev]
        const target = pickerIndex ?? next.findIndex((s) => s === null)
        if (target >= 0 && target < next.length) next[target] = res
        return next
      })
      setPickerIndex(null)
    },
    [pickerIndex],
  )

  const removeSlot = useCallback((index: number) => {
    setSlots((prev) => {
      const next = [...prev]
      next[index] = null
      return next
    })
  }, [])

  const onPickFile = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>, set: (v: string) => void) => {
      const file = e.target.files?.[0]
      if (file) set(URL.createObjectURL(file))
      e.target.value = ''
    },
    [],
  )

  const clearAll = useCallback(() => {
    setTitle('')
    setDescription('')
    setCoverImage('')
    setCatalogImage('')
    setThumbnailImage('')
    setCoOwner(null)
    setCoOwnerQuery('')
    setCoOwnerOptions([])
    setSlots(Array(RESOURCE_SLOTS).fill(null))
    setPickerIndex(null)
    setError('')
  }, [])

  const submit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault()
      if (pending || !canSubmit) return
      setPending(true)
      setError('')
      const payload = {
        title: title.trim(),
        description: description.trim() || undefined,
        coOwnerId: coOwner?.id,
        resourceIds: picked.map((r) => r.id),
        coverImage: '',
        catalogImage: '',
        thumbnailImage: '',
      }
      try {
        const res = await fetch('/api/combos', {
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
        const data = (await res.json().catch(() => null)) as { id?: string; error?: string } | null
        if (!res.ok || !data?.id) {
          setError((data && data.error) || tr('Не удалось создать комплект. Попробуйте ещё раз.'))
          setPending(false)
          return
        }
        router.push('/seller')
      } catch {
        setError(tr('Не удалось создать комплект. Проверьте соединение.'))
        setPending(false)
      }
    },
    [canSubmit, coOwner, description, pending, picked, router, signIn, title, tr],
  )

  if (!loading && !user) {
    return (
      <section className={rd('resourceDetailPage')}>
        <div className={`container ${rd('resourceDetailPageInner')}`}>
          <h1 style={{ marginBottom: '1rem' }}>{tr('Создать комплект')}</h1>
          <p className="form-hint" style={{ marginBottom: '1rem' }}>
            {tr('Войдите, чтобы создать комплект.')}
          </p>
          <button type="button" className="add-button" onClick={signIn.open}>
            {tr('Войти')}
          </button>
        </div>
      </section>
    )
  }

  const available = (myResources ?? []).filter((r) => !picked.some((p) => p.id === r.id))
  const dockStyle = { '--product-manage-dock-lift': '0px' } as CSSProperties

  return (
    <section className={rd('resourceDetailPage')}>
      <div className={`container ${rd('resourceDetailPageInner')}`}>
        <form className={arc('form')} onSubmit={submit}>
          <header className={phb('headerBar')}>
            <div className={phb('headerBar__start')}>
              <h1 className={phb('headerBar__title')}>{tr('Новый комплект')}</h1>
            </div>
            <div className={phb('headerBar__end')}>
              <span className={phb('headerBar__divider')} aria-hidden="true" />
              <div className={phb('headerBar__actions')}>
                <span className={arc('formHeaderTooltipAnchor')} data-tooltip-trigger="">
                  <button
                    type="button"
                    className={`${adm('tableIconButton')} ${arc('formHeaderTableIconButton', 'formHeaderDefaultNavIconButton')}`}
                    aria-label={tr('К панели продавца')}
                    onClick={() => router.push('/seller')}
                  >
                    <svg viewBox="0 0 24 24" fill="none" className={adm('tableIconButtonIcon')} aria-hidden="true">
                      <path d="M19 12H5M12 19l-7-7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                </span>
                <span className={arc('formHeaderTooltipAnchor')} data-tooltip-trigger="">
                  <button
                    type="button"
                    className={`${adm('tableIconButton', 'tableIconButtonDanger')} ${arc('formHeaderTableIconButton', 'formHeaderSemanticIconDanger')}`}
                    aria-label={tr('Очистить всё')}
                    onClick={clearAll}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512" fill="currentColor" className={adm('tableIconButtonIcon')} aria-hidden="true">
                      <path d="M569 9c9.4-9.4 9.4-24.6 0-33.9s-24.6-9.4-33.9 0l-200 200-12.9-12.9c-20.2-20.2-51.4-24.6-76.3-10.7L16.4 278.9C6.3 284.5 0 295.2 0 306.8 0 315.2 3.4 323.4 9.3 329.3L214.7 534.7c6 6 14.1 9.3 22.6 9.3 11.6 0 22.3-6.3 27.9-16.4L392.6 298.2c13.9-25 9.5-56.1-10.7-76.3L369 209 569 9zM288.2 196.1l59.7 59.7c5.1 5.1 6.1 12.8 2.7 19.1l-14.9 26.8-93.4-93.4 26.8-14.9c6.2-3.5 14-2.4 19.1 2.7zm-89.6 36.5l112.8 112.8-77.9 140.3-96.5-96.5 18-53.9c2.1-6.3-3.9-12.2-10.1-10.1l-53.9 18-32.5-32.5 140.3-77.9z" />
                    </svg>
                  </button>
                </span>
              </div>
            </div>
          </header>

          <div className={`${arc('content')} ${cc('contentTight')}`}>
            <div className={arc('gallery')}>
              <input
                ref={coverInputRef}
                accept="image/jpeg,image/png,image/webp,image/gif"
                className={arc('hiddenFileInput')}
                tabIndex={-1}
                type="file"
                onChange={(e) => onPickFile(e, setCoverImage)}
              />
              <div className={arc('mediaVariantSlotFull')}>
                <div className={arc('mediaVariantHeader')}>
                  <span className={arc('mediaVariantLabel')}>{tr('Обложка комплекта')}</span>
                  <span className={arc('mediaVariantHint')}>16:9 (1920×1080px)</span>
                </div>
                <div
                  className={`${rd('mainImage')} ${coverImage ? arc('uploadMainImage', 'uploadMainImageHasImage') : arc('uploadMainImage')}`}
                  style={coverImage ? { backgroundImage: `url(${coverImage})`, backgroundSize: 'cover', backgroundPosition: 'center' } : undefined}
                >
                  <button
                    type="button"
                    className={arc('uploadMainHit')}
                    aria-label={tr('Загрузить обложку, формат 16:9, 1920×1080 px')}
                    onClick={(e) => (e.shiftKey && coverImage ? setCoverImage('') : coverInputRef.current?.click())}
                  >
                    <PlusIcon className={arc('addIcon')} />
                  </button>
                </div>
              </div>
              <input
                ref={catalogInputRef}
                accept="image/jpeg,image/png,image/webp,image/gif"
                className={arc('hiddenFileInput')}
                tabIndex={-1}
                type="file"
                onChange={(e) => onPickFile(e, setCatalogImage)}
              />
              <input
                ref={thumbInputRef}
                accept="image/jpeg,image/png,image/webp,image/gif"
                className={arc('hiddenFileInput')}
                tabIndex={-1}
                type="file"
                onChange={(e) => onPickFile(e, setThumbnailImage)}
              />
              <div className={arc('mediaVariantRow')}>
                <div className={arc('mediaVariantSlot', 'extraImageSlotCatalog')}>
                  <div className={arc('mediaVariantHeader')}>
                    <span className={arc('mediaVariantLabel')}>{tr('Каталог')}</span>
                    <span className={arc('mediaVariantHint')}>16:10 (1920×1200px)</span>
                  </div>
                  <button
                    className={arc('mediaVariantUploadHit', 'extraImageSlotCatalogBox')}
                    type="button"
                    aria-label={tr('Загрузить изображение каталога')}
                    style={catalogImage ? { backgroundImage: `url(${catalogImage})`, backgroundSize: 'cover', backgroundPosition: 'center' } : undefined}
                    onClick={(e) => (e.shiftKey && catalogImage ? setCatalogImage('') : catalogInputRef.current?.click())}
                  >
                    <PlusIcon className={arc('addIcon')} />
                  </button>
                </div>
                <div className={arc('mediaVariantSlot', 'extraImageSlotThumbnail')}>
                  <div className={arc('mediaVariantHeader')}>
                    <span className={arc('mediaVariantLabel')}>{tr('Миниатюра')}</span>
                    <span className={arc('mediaVariantHint')}>1:1 (400×400px)</span>
                  </div>
                  <button
                    className={arc('mediaVariantUploadHit', 'extraImageSlotThumbnailBox')}
                    type="button"
                    aria-label={tr('Загрузить миниатюру')}
                    style={thumbnailImage ? { backgroundImage: `url(${thumbnailImage})`, backgroundSize: 'cover', backgroundPosition: 'center' } : undefined}
                    onClick={(e) => (e.shiftKey && thumbnailImage ? setThumbnailImage('') : thumbInputRef.current?.click())}
                  >
                    <PlusIcon className={arc('addIcon')} />
                  </button>
                </div>
                <div className={arc('mediaVariantTipSlot')}>
                  <div className={arc('mediaVariantTipHeader')}>
                    <span className={arc('mediaVariantLabel')}>{tr('Подсказки для управления')}</span>
                    <span className={arc('mediaVariantHint')}>
                      {tr('Зажав')} <span className={arc('mediaKeyTag')}>Shift</span> {tr('быстрое удаление картинки')}
                    </span>
                    <span className={arc('mediaVariantHint')}>{tr('Перетащите из папки в любую ячейку загрузки')}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className={`${rd('info')} ${arc('contentInfoCol')}`}>
              <div className={arc('editorMain')}>
                <div className={arc('editorLead')}>
                  <div className={`${rd('detailLead')} ${arc('editorDetailLead')}`}>
                    <div className={rd('detailLeadText')}>
                      <input
                        className={`${inp('input', 'inputDarkDefault')} ${arc('resourceTitleInput')}`}
                        placeholder={tr('Название комплекта')}
                        aria-label={tr('Название комплекта')}
                        maxLength={80}
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className={arc('editorLeadBody')}>
                    <div className={arc('formGroup')}>
                      <label className="form-label" htmlFor="combo-description">
                        {tr('Описание комплекта')}
                      </label>
                      <input
                        className={`${inp('input')} ${arc('titleInputBare')}`}
                        id="combo-description"
                        placeholder={tr('Коротко, что внутри и для кого')}
                        aria-label={tr('Описание комплекта')}
                        maxLength={280}
                        type="text"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                      />
                    </div>

                    <div className={arc('mediaVariantSlotFull')}>
                      <label className="form-label">{tr('Совместный доступ')}</label>
                      <div className={arc('sellersList')}>
                        <div className={`${arc('sellerRow')} ${cc('comboRow')}`}>
                          <div className={`${arc('sellerPickerWrap')} ${cc('comboPickerGrow')}`}>
                            <div
                              ref={coOwnerRootRef}
                              className={`${dd('dropdown')} ${sup('pickerRoot')} ${arc('sellerCombo')}`}
                              data-picker-combo=""
                            >
                              <div className={`${dd('trigger')} ${sup('triggerWithInput')} ${dd('triggerTextRegular')}`}>
                                <div className={sup('triggerField')}>
                                  <input
                                    role="combobox"
                                    className={sup('comboInput')}
                                    placeholder={tr('Имя, соцсети или выбор из списка')}
                                    autoComplete="off"
                                    aria-expanded={coOwnerOpen}
                                    aria-haspopup="listbox"
                                    aria-autocomplete="list"
                                    aria-label={tr('Совладелец')}
                                    type="text"
                                    value={coOwnerQuery}
                                    onChange={(e) => {
                                      setCoOwnerQuery(e.target.value)
                                      setCoOwner(null)
                                      setCoOwnerOpen(true)
                                    }}
                                    onFocus={() => setCoOwnerOpen(true)}
                                  />
                                </div>
                                <button
                                  type="button"
                                  className={sup('chevronBtn')}
                                  tabIndex={-1}
                                  aria-label={tr('Открыть список')}
                                  onClick={() => setCoOwnerOpen((o) => !o)}
                                >
                                  <svg viewBox="0 0 24 24" fill="none" className={`${dd('icon')} `} aria-hidden="true">
                                    <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                  </svg>
                                </button>
                              </div>
                              {coOwnerOpen && (
                                <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, marginTop: '.25rem', zIndex: 60 }}>
                                  <div
                                    className={sup('sellerPickerMenu')}
                                    role="listbox"
                                    style={{
                                      background: 'var(--bg-canvas)',
                                      border: '1px solid var(--border-default)',
                                      borderRadius: 'var(--radius)',
                                      boxShadow: '0 10px 30px rgba(0,0,0,.18)',
                                      maxHeight: '16rem',
                                      overflowY: 'auto',
                                    }}
                                  >
                                    {coOwnerLoading ? (
                                      <p className={sup('menuHint')}>{tr('Загрузка…')}</p>
                                    ) : coOwnerOptions.length === 0 ? (
                                      <p className={sup('menuHint')}>{tr('Ничего не найдено')}</p>
                                    ) : (
                                      coOwnerOptions.map((u) => (
                                        <button
                                          key={u.id}
                                          type="button"
                                          role="option"
                                          aria-selected={coOwner?.id === u.id}
                                          className={sup('sellerPickerOption')}
                                          style={{ display: 'flex', width: '100%', border: 'none', background: 'transparent', cursor: 'pointer', textAlign: 'left', color: 'inherit' }}
                                          onClick={() => {
                                            setCoOwner(u)
                                            setCoOwnerQuery(u.label)
                                            setCoOwnerOpen(false)
                                          }}
                                        >
                                          <span className={sup('optionStack')}>
                                            <span className={sup('optionMainRow')}>
                                              <span className={sup('optionMainLead')}>
                                                <span className={sup('optionMain', 'optionMainName')}>{u.label}</span>
                                              </span>
                                            </span>
                                            {u.sub ? <span className={sup('optionSub')}>{u.sub}</span> : null}
                                          </span>
                                        </button>
                                      ))
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                      <p className={arc('settingsPanelHint', 'settingsPanelHintWithIcon')}>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="currentColor" className={arc('settingsPanelHintIcon')} aria-hidden="true">
                          <path d="M256 48a208 208 0 1 1 0 416 208 208 0 1 1 0-416zm0 464a256 256 0 1 0 0-512 256 256 0 1 0 0 512zM216 336c-13.3 0-24 10.7-24 24s10.7 24 24 24l80 0c13.3 0 24-10.7 24-24s-10.7-24-24-24l-8 0 0-88c0-13.3-10.7-24-24-24l-48 0c-13.3 0-24 10.7-24 24s10.7 24 24 24l24 0 0 64-24 0zm40-144a32 32 0 1 0 0-64 32 32 0 1 0 0 64z" />
                        </svg>
                        <span className={arc('settingsPanelHintText')}>
                          {tr('Пригласите продавца — у него появится этот комплект, и он сможет добавить свои ресурсы.')}
                        </span>
                      </p>
                    </div>

                    <div className={arc('mediaVariantSlotFull')}>
                      <div className={arc('mediaVariantHeader')}>
                        <span className={arc('mediaVariantLabel')}>{tr('Ресурсы')}</span>
                        <span className={arc('mediaVariantHint')}>{tr('(нажмите +)')}</span>
                      </div>
                      <div className={arc('thumbnails')}>
                        {slots.map((res, i) =>
                          res ? (
                            <div key={i} className={`${arc('thumbnailSlot')} ${arc('thumbnailSlotSelected')}`}>
                              <button
                                type="button"
                                className={cc('thumbSlotBtn')}
                                aria-label={res.title}
                                title={res.title}
                                onClick={() => removeSlot(i)}
                              >
                                {res.coverImage ? (
                                  <img
                                    src={assetUrl(res.coverImage)}
                                    alt=""
                                    className={sup('pickerResourceThumbImg')}
                                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', borderRadius: 'inherit' }}
                                  />
                                ) : (
                                  <span className={sup('pickerResourceThumbEmpty')} style={{ display: 'block', width: '100%', height: '100%', background: 'var(--bg-subtle)', borderRadius: 'inherit' }} />
                                )}
                              </button>
                            </div>
                          ) : (
                            <div key={i} className={arc('thumbnailSlot')}>
                              <button
                                type="button"
                                className={arc('galleryThumbPick')}
                                aria-label={tr('Ваш платный ресурс для комплекта')}
                                onClick={() => openPicker(i)}
                              >
                                <PlusIcon className={arc('addIcon')} />
                              </button>
                            </div>
                          ),
                        )}
                      </div>
                    </div>

                    <div className={`${chk('summaryTotal')} ${cc('priceTotal')}`}>
                      <span className={chk('totalLabel')}>{tr('Итог')}</span>
                      <div className={`${chk('totalValueRow')} ${cc('priceValueRow')}`}>
                        <div className={`${chk('totalPart')} ${cc('priceChip')}`} style={{ width: '119px' }}>
                          <LightningIcon className={chk('totalIconPlain')} />
                          <span className={chk('totalChipAmount')}>{formatAmount(newTotal)}</span>
                        </div>
                        <div className={chk('totalArrowWrap')}>
                          <span className={`${chk('totalArrowCircle')} ${cc('priceArrow')}`} aria-hidden="true">
                            <svg viewBox="0 0 24 24" fill="none" className={chk('totalArrowSvg')}>
                              <path d="M15 6l-6 6 6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          </span>
                        </div>
                        <div className={`${chk('totalPart')} ${cc('priceChip')}`} style={{ width: '119px' }}>
                          <span className={chk('totalChipAmount')}>{formatAmount(oldTotal)}</span>
                          <LightningIcon className={`${chk('totalIconPlain')} ${cc('priceChipIconWas')}`} />
                        </div>
                      </div>
                    </div>

                    {error ? (
                      <p role="alert" style={{ color: 'var(--danger-fg, #d64545)', marginTop: '.75rem' }}>
                        {error}
                      </p>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className={arc('productManageCreateDock')} role="region" aria-label={tr('Управление и модерация')} style={dockStyle}>
            <div className={arc('productManageDockActions')}>
              <div className={arc('productManageSaveRow')} role="group" aria-label={tr('Действия в конце формы')}>
                <button type="submit" className={arc('productManageSaveBtn')} disabled={!canSubmit || pending} aria-busy={pending ? 'true' : 'false'}>
                  {pending ? tr('Сохранение…') : tr('Сохранить')}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>

      {pickerIndex !== null ? (
        <div
          style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', background: 'rgba(0,0,0,.45)' }}
          onClick={() => setPickerIndex(null)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label={tr('Добавить ресурс в комплект')}
            onClick={(e) => e.stopPropagation()}
            style={{ background: 'var(--bg-canvas)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-lg, 12px)', width: 'min(30rem, 100%)', maxHeight: '80vh', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 20px 60px rgba(0,0,0,.35)' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', padding: '1rem 1.25rem', borderBottom: '1px solid var(--border-muted)' }}>
              <strong>{tr('Добавить ресурс в комплект')}</strong>
              <button
                type="button"
                aria-label={tr('Закрыть')}
                onClick={() => setPickerIndex(null)}
                style={{ border: 'none', background: 'transparent', cursor: 'pointer', fontSize: '1.35rem', lineHeight: 1, color: 'var(--fg-muted)' }}
              >
                ×
              </button>
            </div>
            <div className={cc('pickModalBody')} style={{ padding: '1rem 1.25rem', overflowY: 'auto' }}>
              <div className={cc('pickModalPicker')}>
                <div role="listbox">
                  {resLoading ? (
                    <p className={sup('menuHint')}>{tr('Загрузка…')}</p>
                  ) : available.length === 0 ? (
                    <p className={sup('menuHint')}>{tr('Нет доступных платных ресурсов')}</p>
                  ) : (
                    available.map((res) => (
                      <button
                        key={res.id}
                        type="button"
                        role="option"
                        aria-selected={false}
                        className={sup('sellerPickerOption')}
                        style={{ display: 'flex', alignItems: 'center', gap: '.5rem', width: '100%', border: 'none', background: 'transparent', cursor: 'pointer', textAlign: 'left', color: 'inherit' }}
                        onClick={() => chooseResource(res)}
                      >
                        <span className={sup('pickerResourceThumb')}>
                          {res.coverImage ? (
                            <img src={assetUrl(res.coverImage)} alt="" className={sup('pickerResourceThumbImg')} />
                          ) : (
                            <span className={sup('pickerResourceThumbEmpty')} />
                          )}
                        </span>
                        <span className={sup('optionStack')}>
                          <span className={sup('optionMainRow')}>
                            <span className={sup('optionMainLead')}>
                              <span className={sup('optionMain', 'optionMainName')}>{res.title}</span>
                            </span>
                            <span className={sup('optionMainPriceEnd')}>
                              <span className={sup('pickerDealPriceRow')}>
                                <span className={sup('pickerDealPriceMain')}>
                                  <LightningIcon className={sup('pickerDealPriceIcon')} />
                                  <span className={sup('pickerDealPriceDigits')}>{formatAmount(res.discount ?? res.price)}</span>
                                </span>
                                {res.discount != null && res.discount < res.price ? (
                                  <span className={sup('pickerDealPriceOld')}>{formatAmount(res.price)}</span>
                                ) : null}
                              </span>
                            </span>
                          </span>
                          {res.category ? <span className={sup('optionSub')}>{res.category}</span> : null}
                        </span>
                      </button>
                    ))
                  )}
                </div>
              </div>
              <p className={cc('pickModalHint')} style={{ color: 'var(--fg-muted)', fontSize: '.82rem' }}>
                {tr('Цена в комплекте берётся из скидки ресурса.')}
              </p>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  )
}
