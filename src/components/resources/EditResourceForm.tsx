'use client'

import { useCallback, useEffect, useState, type FormEvent } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/auth/AuthProvider'
import { useSignInDrawer } from '@/components/auth/SignInDrawer'
import { useT } from '@/i18n/LocaleProvider'


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

interface FetchedResource {
  slug?: string
  title?: string
  shortDescription?: string | null
  description?: string | null
  category?: string
  listingKind?: string
  price?: number
  discount?: number | null
  tags?: string[]
  coverImage?: string | null
  images?: string[]
}

type LoadState = 'loading' | 'ready' | 'notfound' | 'error'

export function EditResourceForm({ slug }: { slug: string }) {
  const tr = useT()
  const router = useRouter()
  const { user, loading } = useAuth()
  const signIn = useSignInDrawer()

  const [loadState, setLoadState] = useState<LoadState>('loading')
  const [resourceSlug, setResourceSlug] = useState(slug)

  const [title, setTitle] = useState('')
  const [shortDescription, setShortDescription] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('plugins')
  const [listingKind, setListingKind] = useState<'PAID' | 'FREE'>('PAID')
  const [price, setPrice] = useState('')
  const [discount, setDiscount] = useState('')
  const [tags, setTags] = useState('')
  const [coverImage, setCoverImage] = useState('')
  const [images, setImages] = useState('')

  const [pending, setPending] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (loading || !user) return
    let cancelled = false
    setLoadState('loading')
    fetch(`/api/resources/${encodeURIComponent(slug)}`, {
      credentials: 'include',
      headers: { Accept: 'application/json' },
    })
      .then(async (res) => {
        if (res.status === 404) {
          if (!cancelled) setLoadState('notfound')
          return
        }
        if (!res.ok) {
          if (!cancelled) setLoadState('error')
          return
        }
        const data = (await res.json().catch(() => null)) as FetchedResource | null
        if (cancelled) return
        if (!data || !data.title) {
          setLoadState('error')
          return
        }
        setResourceSlug(data.slug ?? slug)
        setTitle(data.title ?? '')
        setShortDescription(data.shortDescription ?? '')
        setDescription(data.description ?? '')
        setCategory(data.category ?? 'plugins')
        setListingKind(String(data.listingKind).toUpperCase() === 'FREE' ? 'FREE' : 'PAID')
        setPrice(data.price != null ? String(data.price) : '')
        setDiscount(data.discount ? String(data.discount) : '')
        setTags(Array.isArray(data.tags) ? data.tags.join(', ') : '')
        setCoverImage(data.coverImage ?? '')
        setImages(Array.isArray(data.images) ? data.images.join('\n') : '')
        setLoadState('ready')
      })
      .catch(() => {
        if (!cancelled) setLoadState('error')
      })
    return () => {
      cancelled = true
    }
  }, [slug, loading, user])

  const submit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault()
      if (pending) return
      if (!title.trim() || !category) {
        setError(tr('Заполните название и категорию.'))
        return
      }
      setPending(true)
      setError('')
      const payload = {
        title: title.trim(),
        shortDescription: shortDescription.trim(),
        description: description.trim(),
        category,
        listingKind,
        price: listingKind === 'FREE' ? 0 : Number(price) || 0,
        discount: discount ? Number(discount) : undefined,
        tags: tags.split(',').map((t) => t.trim()).filter(Boolean),
        coverImage: coverImage.trim(),
        images: images.split(/[\n,]/).map((s) => s.trim()).filter(Boolean),
      }
      try {
        const res = await fetch(`/api/resources/${encodeURIComponent(resourceSlug)}`, {
          method: 'PATCH',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify(payload),
        })
        if (res.status === 401) {
          signIn.open()
          setPending(false)
          return
        }
        if (res.status === 403) {
          setError(tr('У вас нет прав на редактирование этого ресурса.'))
          setPending(false)
          return
        }
        const data = (await res.json().catch(() => null)) as { slug?: string; error?: string } | null
        if (!res.ok || !data || data.error) {
          setError((data && data.error) || tr('Не удалось сохранить изменения. Попробуйте ещё раз.'))
          setPending(false)
          return
        }
        router.push(`/resources/${data.slug ?? resourceSlug}`)
      } catch {
        setError(tr('Не удалось сохранить изменения. Проверьте соединение.'))
        setPending(false)
      }
    },
    [category, coverImage, description, discount, images, listingKind, pending, price, resourceSlug, router, shortDescription, signIn, tags, title, tr],
  )

  if (!loading && !user) {
    return (
      <main className="container" style={{ paddingBlock: '3rem', maxWidth: 720 }}>
        <h1 style={{ marginBottom: '1rem' }}>{tr('Редактирование ресурса')}</h1>
        <p className="form-hint" style={{ marginBottom: '1rem' }}>{tr('Войдите, чтобы редактировать ресурс.')}</p>
        <button type="button" className="add-button" onClick={signIn.open}>{tr('Войти')}</button>
      </main>
    )
  }

  if (loadState === 'loading') {
    return (
      <main className="container" style={{ paddingBlock: '2.5rem', maxWidth: 760 }}>
        <h1 style={{ marginBottom: '0.5rem' }}>{tr('Редактирование ресурса')}</h1>
        <p className="form-hint">{tr('Загрузка…')}</p>
      </main>
    )
  }

  if (loadState === 'notfound') {
    return (
      <main className="container" style={{ paddingBlock: '2.5rem', maxWidth: 760 }}>
        <h1 style={{ marginBottom: '0.5rem' }}>{tr('Редактирование ресурса')}</h1>
        <p className="form-hint" style={{ marginBottom: '1rem' }}>{tr('Ресурс не найден.')}</p>
        <Link className="add-button" href="/seller">{tr('Вернуться в панель продавца')}</Link>
      </main>
    )
  }

  if (loadState === 'error') {
    return (
      <main className="container" style={{ paddingBlock: '2.5rem', maxWidth: 760 }}>
        <h1 style={{ marginBottom: '0.5rem' }}>{tr('Редактирование ресурса')}</h1>
        <p className="form-hint" style={{ marginBottom: '1rem' }}>{tr('Не удалось загрузить ресурс. Попробуйте позже.')}</p>
        <Link className="add-button" href="/seller">{tr('Вернуться в панель продавца')}</Link>
      </main>
    )
  }

  return (
    <main className="container" style={{ paddingBlock: '2.5rem', maxWidth: 760 }}>
      <h1 style={{ marginBottom: '0.5rem' }}>{tr('Редактирование ресурса')}</h1>
      <p className="form-hint" style={{ marginBottom: '1.5rem' }}>
        {tr('Измените карточку ресурса. После сохранения изменения могут пройти повторную модерацию.')}
      </p>

      <form onSubmit={submit} style={{ display: 'grid', gap: '1.15rem' }}>
        <label style={{ display: 'grid', gap: '.35rem' }}>
          <span className="form-label">{tr('Название')} *</span>
          <input value={title} onChange={(e) => setTitle(e.target.value)} required maxLength={120} />
        </label>

        <label style={{ display: 'grid', gap: '.35rem' }}>
          <span className="form-label">{tr('Краткое описание')}</span>
          <input value={shortDescription} onChange={(e) => setShortDescription(e.target.value)} maxLength={160} />
        </label>

        <label style={{ display: 'grid', gap: '.35rem' }}>
          <span className="form-label">{tr('Описание')}</span>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={6} />
        </label>

        <div style={{ display: 'grid', gap: '1.15rem', gridTemplateColumns: 'repeat(auto-fit, minmax(min(12rem, 100%), 1fr))' }}>
          <label style={{ display: 'grid', gap: '.35rem' }}>
            <span className="form-label">{tr('Категория')} *</span>
            <select value={category} onChange={(e) => setCategory(e.target.value)} required>
              {CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>{tr(c.label)}</option>
              ))}
            </select>
          </label>
          <label style={{ display: 'grid', gap: '.35rem' }}>
            <span className="form-label">{tr('Тип')}</span>
            <select value={listingKind} onChange={(e) => setListingKind(e.target.value as 'PAID' | 'FREE')}>
              <option value="PAID">{tr('Платный')}</option>
              <option value="FREE">{tr('Бесплатный')}</option>
            </select>
          </label>
        </div>

        {listingKind === 'PAID' && (
          <div style={{ display: 'grid', gap: '1.15rem', gridTemplateColumns: 'repeat(auto-fit, minmax(min(12rem, 100%), 1fr))' }}>
            <label style={{ display: 'grid', gap: '.35rem' }}>
              <span className="form-label">{tr('Цена, ₽')}</span>
              <input type="number" min={0} value={price} onChange={(e) => setPrice(e.target.value)} />
            </label>
            <label style={{ display: 'grid', gap: '.35rem' }}>
              <span className="form-label">{tr('Цена со скидкой, ₽')}</span>
              <input type="number" min={0} value={discount} onChange={(e) => setDiscount(e.target.value)} />
            </label>
          </div>
        )}

        <label style={{ display: 'grid', gap: '.35rem' }}>
          <span className="form-label">{tr('Теги (через запятую)')}</span>
          <input value={tags} onChange={(e) => setTags(e.target.value)} placeholder="lua, api, integration" />
        </label>

        <label style={{ display: 'grid', gap: '.35rem' }}>
          <span className="form-label">{tr('Обложка (URL)')}</span>
          <input value={coverImage} onChange={(e) => setCoverImage(e.target.value)} placeholder="/resource-images/…webp" />
        </label>

        <label style={{ display: 'grid', gap: '.35rem' }}>
          <span className="form-label">{tr('Изображения (URL, по одному в строке)')}</span>
          <textarea value={images} onChange={(e) => setImages(e.target.value)} rows={3} />
        </label>

        {error && (
          <p role="alert" style={{ color: 'var(--danger-fg)' }}>{error}</p>
        )}

        <div style={{ display: 'flex', gap: '.75rem', marginTop: '.5rem', alignItems: 'center' }}>
          <button type="submit" className="add-button" disabled={pending}>
            {pending ? tr('Сохранение…') : tr('Сохранить изменения')}
          </button>
          <Link className="form-hint" href={`/resources/${resourceSlug}`} style={{ textDecoration: 'none' }}>
            {tr('Отмена')}
          </Link>
        </div>
      </form>
    </main>
  )
}
