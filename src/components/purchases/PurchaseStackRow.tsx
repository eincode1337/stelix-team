

import Link from 'next/link'
import { useT } from '@/i18n/LocaleProvider'

const pl = (...n: string[]) => n.map((x) => `PurchasesList-module__gstXbW__${x}`).join(' ')
const plsr = (...n: string[]) => n.map((x) => `PurchasesListStackRow-module__TmWrnq__${x}`).join(' ')


const CDN = 'https://cdn.stelix.team'

export type PurchaseStatus =
  | 'PAID'
  | 'COMPLETED'
  | 'PENDING'
  | 'PROCESSING'
  | 'CANCELLED'
  | 'REFUND_REQUESTED'
  | 'REFUNDED'

export interface Purchase {
  id: string | number

  resourceId?: string | number | null
  slug?: string | null
  title: string

  kind?: string | null
  description?: string | null
  coverImage?: string | null
  price: number
  status: PurchaseStatus
  createdAt: string
}


const STATUS_META: Record<PurchaseStatus, { label: string; badge: string; tone: string }> = {
  PAID: { label: 'Оплачен', badge: 'statusCompleted', tone: 'success' },
  COMPLETED: { label: 'Выполнен', badge: 'statusCompleted', tone: 'success' },
  PENDING: { label: 'Ожидает оплаты', badge: 'statusPending', tone: 'attention' },
  PROCESSING: { label: 'В обработке', badge: 'statusPending', tone: 'attention' },
  CANCELLED: { label: 'Отменён', badge: 'statusCancelled', tone: 'neutral' },
  REFUND_REQUESTED: { label: 'Запрошен возврат', badge: 'statusRefundRequested', tone: 'danger' },
  REFUNDED: { label: 'Возврат', badge: 'statusRefunded', tone: 'info' },
}


function formatAmount(n: number): string {
  return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
}


function formatDate(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  const dd = String(d.getDate()).padStart(2, '0')
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  return `${dd}.${mm}.${d.getFullYear()}`
}

function RubleIcon() {
  return (
    <svg viewBox="0 0 384 512" fill="currentColor" aria-hidden="true" width="12" height="12">
      <path d="M96 32C78.3 32 64 46.3 64 64V256H32c-17.7 0-32 14.3-32 32s14.3 32 32 32H64v32H32c-17.7 0-32 14.3-32 32s14.3 32 32 32H64v48c0 17.7 14.3 32 32 32s32-14.3 32-32V416H240c17.7 0 32-14.3 32-32s-14.3-32-32-32H128V320h96c88.4 0 160-71.6 160-160S312.4 0 224 0H96zM224 256H128V64h96c53 0 96 43 96 96s-43 96-96 96z" />
    </svg>
  )
}

export function PurchaseStackRow({ purchase }: { purchase: Purchase }) {
  const tr = useT()
  const meta = STATUS_META[purchase.status] ?? STATUS_META.PENDING
  const target = purchase.resourceId ?? purchase.id
  const cover = purchase.coverImage
    ? purchase.coverImage.startsWith('http')
      ? purchase.coverImage
      : `${CDN}/${purchase.coverImage.replace(/^\/+/, '')}`
    : null
  const date = formatDate(purchase.createdAt)


  return (
    <Link href={`/resources/${target}`} className={plsr('stackRow')} data-stack-list-row="true">
      <span className={plsr('stackRail')} data-rail-tone={meta.tone} aria-hidden="true" />
      <div className={plsr('stackMain')}>
        <div className={plsr('stackThumb')}>
          {cover ? (

            <img src={cover} alt="" loading="lazy" decoding="async" width={68} height={68} />
          ) : (
            <span className="appSkeletonBlock" aria-hidden="true" />
          )}
        </div>
        <div className={plsr('stackCenter')}>
          <p className={plsr('stackTitle')}>{purchase.title}</p>
          {purchase.kind ? <span className={plsr('stackKind')}>{purchase.kind}</span> : null}
          {purchase.description ? <p className={plsr('stackDesc')}>{purchase.description}</p> : null}
        </div>
        <div className={plsr('stackRight')}>
          <div className={plsr('stackMeta')}>
            <span className={pl('statusBadge', meta.badge) + ' ' + plsr('stackStatusBadge')}>
              {tr(meta.label)}
            </span>
            {date ? <span className={plsr('stackDateBadge')}>{date}</span> : null}
          </div>
          <span className={plsr('stackPrice')}>
            {formatAmount(purchase.price)}
            <RubleIcon />
          </span>
        </div>
        <svg viewBox="0 0 24 24" fill="none" className={plsr('stackChevron')} aria-hidden="true">
          <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    </Link>
  )
}
