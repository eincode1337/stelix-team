'use client'


import { useCallback, useEffect, useMemo, useState } from 'react'

import { ap, AdminSectionHeader } from '@/components/admin/ui'


const SETTINGS_ENDPOINT = '/api/admin/settings'


interface SiteUserLocks {
  reviewsDisabled: boolean
  purchasesDisabled: boolean
  ordersDisabled: boolean
  withdrawalsDisabled: boolean
  resourceCreationDisabled: boolean
  paymentsDisabled: boolean
  chatDisabled: boolean
}

interface SiteFeatureLocks {
  purchasesDisabled: boolean
  paymentsDisabled: boolean
  withdrawalsDisabled: boolean
  resourceCreationDisabled: boolean
  ordersDisabled: boolean
  legalRequisitesHidden: boolean
  userLocks: SiteUserLocks
}

type GlobalKey = Exclude<keyof SiteFeatureLocks, 'userLocks'>
type UserLockKey = keyof SiteUserLocks

interface ToggleMeta<K extends string> {
  key: K
  label: string
  description: string
}


const GLOBAL_LOCKS: readonly ToggleMeta<GlobalKey>[] = [
  {
    key: 'purchasesDisabled',
    label: 'Покупки отключены',
    description: 'Полностью останавливает покупку ресурсов на маркетплейсе.',
  },
  {
    key: 'paymentsDisabled',
    label: 'Платежи отключены',
    description: 'Отключает пополнение баланса и оплату через кассы (Robokassa, T-Bank, AnyPay, FreeKassa, ЮMoney, Heleket).',
  },
  {
    key: 'withdrawalsDisabled',
    label: 'Выплаты отключены',
    description: 'Блокирует заявки на вывод средств и выплаты продавцам.',
  },
  {
    key: 'resourceCreationDisabled',
    label: 'Создание ресурсов отключено',
    description: 'Запрещает создание и публикацию новых ресурсов.',
  },
  {
    key: 'ordersDisabled',
    label: 'Заказы отключены',
    description: 'Останавливает создание заказов и отклики на них.',
  },
  {
    key: 'legalRequisitesHidden',
    label: 'Юридические реквизиты скрыты',
    description: 'Скрывает публичные юридические реквизиты площадки в футере и офертах.',
  },
]


const USER_LOCKS: readonly ToggleMeta<UserLockKey>[] = [
  { key: 'reviewsDisabled', label: 'Отзывы отключены', description: 'Пользователи не могут оставлять отзывы.' },
  { key: 'purchasesDisabled', label: 'Покупки отключены', description: 'Пользователи не могут совершать покупки.' },
  { key: 'ordersDisabled', label: 'Заказы отключены', description: 'Пользователи не могут создавать заказы.' },
  { key: 'withdrawalsDisabled', label: 'Выплаты отключены', description: 'Пользователи не могут запрашивать вывод средств.' },
  {
    key: 'resourceCreationDisabled',
    label: 'Создание ресурсов отключено',
    description: 'Пользователи не могут публиковать ресурсы.',
  },
  { key: 'paymentsDisabled', label: 'Платежи отключены', description: 'Пользователи не могут пополнять баланс.' },
  { key: 'chatDisabled', label: 'Чат отключён', description: 'Пользователи не могут пользоваться личными сообщениями.' },
]


function cloneLocks(s: SiteFeatureLocks): SiteFeatureLocks {
  return { ...s, userLocks: { ...s.userLocks } }
}


function ToggleRow({
  label,
  description,
  checked,
  onToggle,
  disabled,
}: {
  label: string
  description: string
  checked: boolean
  onToggle: (next: boolean) => void
  disabled: boolean
}) {
  return (
    <div className={ap('settingsToggleRow')}>
      <span className={ap('settingsToggleLabel')}>
        {label}
        <span className={ap('settingDescription')} style={{ display: 'block', marginTop: '.15rem', fontWeight: 400 }}>
          {description}
        </span>
      </span>
      <span className={ap('settingsToggleOnly')}>
        <label className={ap('switch')}>
          <input
            type="checkbox"
            checked={checked}
            disabled={disabled}
            onChange={(e) => onToggle(e.target.checked)}
            aria-label={label}
          />
          <span className={ap('slider')} />
        </label>
      </span>
    </div>
  )
}

export function SettingsSection() {

  const [baseline, setBaseline] = useState<SiteFeatureLocks | null>(null)
  const [draft, setDraft] = useState<SiteFeatureLocks | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'ok' | 'error'>('idle')


  useEffect(() => {
    const ctrl = new AbortController()
    setLoading(true)
    setError(null)
    fetch(SETTINGS_ENDPOINT, {
      credentials: 'same-origin',
      cache: 'no-store',
      headers: { accept: 'application/json' },
      signal: ctrl.signal,
    })
      .then(async (res) => {
        if (!res.ok) {
          throw new Error(res.status === 401 ? 'Требуется вход в систему' : `Ошибка загрузки (${res.status})`)
        }
        return (await res.json()) as SiteFeatureLocks
      })
      .then((data) => {
        setBaseline(cloneLocks(data))
        setDraft(cloneLocks(data))
        setLoading(false)
      })
      .catch((err: unknown) => {
        if (err instanceof DOMException && err.name === 'AbortError') return
        setError((err as Error).message || 'Не удалось загрузить настройки')
        setLoading(false)
      })
    return () => ctrl.abort()
  }, [])

  const setGlobal = useCallback((key: GlobalKey, next: boolean) => {
    setSaveState('idle')
    setDraft((prev) => (prev ? { ...prev, [key]: next } : prev))
  }, [])

  const setUserLock = useCallback((key: UserLockKey, next: boolean) => {
    setSaveState('idle')
    setDraft((prev) => (prev ? { ...prev, userLocks: { ...prev.userLocks, [key]: next } } : prev))
  }, [])

  const dirty = useMemo(
    () => Boolean(baseline && draft) && JSON.stringify(baseline) !== JSON.stringify(draft),
    [baseline, draft],
  )

  const reset = useCallback(() => {
    if (baseline) setDraft(cloneLocks(baseline))
    setSaveState('idle')
  }, [baseline])


  const save = useCallback(async () => {
    if (!draft || !dirty) return
    setSaveState('saving')
    try {
      const res = await fetch(SETTINGS_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify(draft),
      })
      if (!res.ok) throw new Error(String(res.status))
      const updated = (await res.json()) as SiteFeatureLocks
      setBaseline(cloneLocks(updated))
      setDraft(cloneLocks(updated))
      setSaveState('ok')
    } catch {
      setSaveState('error')
    }
  }, [draft, dirty])

  return (
    <section className={ap('section')} id="admin-settings">
      <AdminSectionHeader title="Настройки" />

      {loading ? (
        <div className={ap('sectionSpinnerHost')}>
          <span className={ap('sectionSpinner')} aria-label="Загрузка" />
        </div>
      ) : error ? (
        <div className={ap('emptyState')}>
          <p className={ap('emptyStateText')}>{error}</p>
        </div>
      ) : draft ? (
        <>

          <div className={ap('settingsGroup')}>
            <h3 className={ap('settingsTitle')}>Блокировки функций площадки</h3>
            <p className={ap('formHint')}>
              Глобальные переключатели. Включённый переключатель отключает функцию для всех пользователей.
            </p>
            <div className={ap('settingsList')}>
              {GLOBAL_LOCKS.map((row) => (
                <ToggleRow
                  key={row.key}
                  label={row.label}
                  description={row.description}
                  checked={draft[row.key]}
                  disabled={saveState === 'saving'}
                  onToggle={(next) => setGlobal(row.key, next)}
                />
              ))}
            </div>
          </div>


          <div className={ap('settingsGroup')}>
            <h3 className={ap('settingsTitle')}>Ограничения для пользователей</h3>
            <p className={ap('formHint')}>
              Ограничения по умолчанию для аккаунтов. Включённый переключатель запрещает соответствующее действие.
            </p>
            <div className={ap('settingsList')}>
              {USER_LOCKS.map((row) => (
                <ToggleRow
                  key={row.key}
                  label={row.label}
                  description={row.description}
                  checked={draft.userLocks[row.key]}
                  disabled={saveState === 'saving'}
                  onToggle={(next) => setUserLock(row.key, next)}
                />
              ))}
            </div>
          </div>


          <div className={ap('settingsGroup')}>
            {saveState === 'error' ? (
              <p className={ap('formHint')} style={{ color: 'var(--danger-fg)' }}>
                Не удалось сохранить настройки
              </p>
            ) : saveState === 'ok' ? (
              <p className={ap('formHint')} style={{ color: 'var(--success-fg)' }}>
                Настройки сохранены
              </p>
            ) : dirty ? (
              <p className={ap('formHint')}>Есть несохранённые изменения</p>
            ) : (
              <p className={ap('formHint')}>Все изменения сохранены</p>
            )}
            <div className={ap('formActionsRow', 'settingsFeatureLocksFooter')}>
              <button
                type="button"
                className={ap('formBtnSecondary')}
                onClick={reset}
                disabled={!dirty || saveState === 'saving'}
              >
                Сбросить
              </button>
              <button
                type="button"
                className={ap('formBtnPrimary')}
                onClick={save}
                disabled={!dirty || saveState === 'saving'}
              >
                {saveState === 'saving' ? 'Сохранение…' : 'Сохранить'}
              </button>
            </div>
          </div>
        </>
      ) : null}
    </section>
  )
}

export default SettingsSection
