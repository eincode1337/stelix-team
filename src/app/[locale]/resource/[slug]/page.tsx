import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { ResourceDetailView, type AuthorMeta } from '@/components/resources/ResourceDetailView'
import { Resources, Users, type Resource } from '@/server/db/store'
import { isLocale, localeMeta, type Locale } from '@/i18n/config'
import { t } from '@/i18n/t'

const SITE_ORIGIN = 'https://stelix.team'
const DESCRIPTION_FALLBACK =
  'Каталог цифровых ресурсов: плагины, скрипты, модули, шаблоны, карты и интеграции.'

export const dynamic = 'force-dynamic'

function resolveResource(slug: string) {
  return Resources.getResourceBySlug(slug) ?? Resources.getResourceById(slug)
}

function profileSlug(name: string, id: number): string {
  const base = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
  return `${base || 'user'}-${id}`
}

function resolveAuthor(resource: Resource): AuthorMeta {
  const user = Users.getUser(resource.authorId)
  const authored = Resources.listResources({ authorId: resource.authorId }).resources
  const totalSales = authored.reduce((sum, r) => sum + (r.sales ?? 0), 0)
  return {
    name: user?.name ?? resource.author,
    profileSlug: profileSlug(user?.name ?? resource.author, resource.authorId),
    image: user?.image ?? null,
    role: user?.role ?? resource.authorRole,
    resourcesCount: user?.resourcesCount ?? authored.length,
    totalSales,
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}): Promise<Metadata> {
  const { locale, slug } = await params
  const loc: Locale = isLocale(locale) ? locale : 'ru'
  const resource = resolveResource(slug)

  if (!resource) {
    return {
      title: t(loc, 'Ресурс не найден — Stelix Team'),
      robots: { index: false, follow: false },
    }
  }

  const title = `${resource.title} — Stelix Team`
  const description =
    resource.shortDescription ||
    (resource.description ? resource.description.slice(0, 160) : t(loc, DESCRIPTION_FALLBACK))
  const image = resource.coverImage
    ? resource.coverImage.startsWith('http')
      ? resource.coverImage
      : `https://cdn.stelix.team${resource.coverImage.startsWith('/') ? '' : '/'}${resource.coverImage}`
    : '/img/og-image.png'

  return {
    title,
    description,
    alternates: {
      canonical: `/${loc}/resource/${resource.slug}`,
      languages: {
        ru: `/ru/resource/${resource.slug}`,
        uk: `/uk/resource/${resource.slug}`,
        en: `/en/resource/${resource.slug}`,
        'x-default': `${SITE_ORIGIN}/resource/${resource.slug}`,
      },
    },
    openGraph: {
      type: 'website',
      title,
      description,
      url: `${SITE_ORIGIN}/resource/${resource.slug}`,
      siteName: 'Stelix Team',
      locale: localeMeta[loc].ogLocale,
      alternateLocale: ['uk_UA', 'en_GB'],
      images: [{ url: image, width: 1200, height: 630, alt: resource.title }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image],
    },
  }
}

export default async function ResourceDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}) {
  const { slug } = await params
  const resource = resolveResource(slug)
  if (!resource) notFound()

  const author = resolveAuthor(resource)
  const otherResources = Resources.listResources({ authorId: resource.authorId }).resources.filter(
    (r) => r.id !== resource.id,
  )

  return (
    <main>
      <ResourceDetailView
        resource={resource}
        author={author}
        otherResources={otherResources}
        otherResourcesCount={otherResources.length}
        now={Date.now()}
      />
    </main>
  )
}
