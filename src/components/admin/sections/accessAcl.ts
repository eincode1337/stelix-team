

import {
  STELIX_ROLES,
  ROLE_LABELS,
  roleLevel,
  type RoleKey,
  type RoleLang,
} from '@/components/admin/ui'


export const STELIX_ROLE_LABEL_GRADIENT: Record<RoleKey, string> = {
  NEWBIE: 'linear-gradient(135deg, #28a8d4 0%, #34bbe6 50%, #5cc9ed 100%)',
  VERIFIED: 'linear-gradient(135deg, #3bc489 0%, #49da9a 50%, #6de4b0 100%)',
  TRUSTED: 'linear-gradient(135deg, #3648b0 0%, #4355db 50%, #5a6fe8 100%)',
  SELLER: 'linear-gradient(135deg, #8957e5 0%, #a371f7 40%, #d2a8ff 100%)',
  SELLER_PLUS: 'linear-gradient(135deg, #6e40c9 0%, #8250df 45%, #a371f7 100%)',
  ACCOUNTANT: 'linear-gradient(135deg, #6e7681 0%, #8b949e 50%, #b1bac4 100%)',
  MODERATOR: 'linear-gradient(135deg, #b882f0 0%, #ce97ff 50%, #ddb5ff 100%)',
  SECURITY: 'linear-gradient(135deg, #8ccf44 0%, #b4f753 50%, #d4ff8a 100%)',
  DEVELOPER: 'linear-gradient(135deg, #e55a2e 0%, #fd6f41 50%, #ff9169 100%)',
  AGENT: 'linear-gradient(135deg, #e0ac00 0%, #ffc000 50%, #ffd34d 100%)',
}


export const ROLE_DESCRIPTIONS: Record<RoleKey, string> = {
  NEWBIE: 'Базовый уровень нового пользователя.',
  VERIFIED: 'Пользователь с подтверждённой почтой.',
  TRUSTED: 'Проверенный аккаунт с повышенным доверием.',
  SELLER: 'Продажа ресурсов и ответы на заказы.',
  SELLER_PLUS: 'Расширенные возможности продавца.',
  ACCOUNTANT: 'Доступ к финансам, выплатам и чёрному списку.',
  MODERATOR: 'Модерация, блокировка и редактирование пользователей.',
  SECURITY: 'Управление ролями и служба безопасности.',
  DEVELOPER: 'OAuth-привязки, обход блокировок функций.',
  AGENT: 'Полный доступ: баланс, удаление, все разделы.',
}


export interface RoleOverview {
  key: RoleKey
  name: string
  color: string
  level: number
  gradient: string
  description: string
}

export function getRoleOverview(lang: RoleLang = 'ru'): RoleOverview[] {
  return (Object.keys(STELIX_ROLES) as RoleKey[])
    .sort((a, b) => STELIX_ROLES[a].level - STELIX_ROLES[b].level)
    .map((key) => ({
      key,
      name: ROLE_LABELS[lang][key],
      color: STELIX_ROLES[key].color,
      level: STELIX_ROLES[key].level,
      gradient: STELIX_ROLE_LABEL_GRADIENT[key],
      description: ROLE_DESCRIPTIONS[key],
    }))
}


export interface AccessRow {

  predicate: string

  label: string

  minRole: RoleKey

  note?: string
}

export const ACCESS_MATRIX: AccessRow[] = [

  { predicate: 'canRespondToOrders', label: 'Ответы на заказы', minRole: 'SELLER', note: 'кроме модераторов и выше' },
  { predicate: 'canCreateCatalogResource', label: 'Создание ресурсов каталога', minRole: 'SELLER' },
  { predicate: 'canAccessSellerChatSide', label: 'Доступ к чату продавца', minRole: 'SELLER' },

  { predicate: 'canAccessAdminFinanceSections', label: 'Доступ к финансам', minRole: 'ACCOUNTANT', note: 'бухгалтер, разработчик, агент' },
  { predicate: 'canManageAdminWithdrawals', label: 'Управление выплатами', minRole: 'ACCOUNTANT', note: 'бухгалтер, разработчик, агент' },
  { predicate: 'canAccessAdminBlacklist', label: 'Чёрный список', minRole: 'ACCOUNTANT' },
  { predicate: 'canAccessAdminStelix', label: 'Раздел «Доступы»', minRole: 'ACCOUNTANT' },

  { predicate: 'canModerate', label: 'Модерация', minRole: 'MODERATOR' },
  { predicate: 'canBlockUsers', label: 'Блокировка пользователей', minRole: 'MODERATOR' },
  { predicate: 'canEditAdminUserNickname', label: 'Изменение никнейма', minRole: 'MODERATOR' },

  { predicate: 'canManageRoles', label: 'Управление ролями', minRole: 'SECURITY' },

  { predicate: 'bypassesSiteWideFeatureLocks', label: 'Обход блокировок функций', minRole: 'DEVELOPER' },
  { predicate: 'canManageAdminUserOAuthBindings', label: 'OAuth-привязки', minRole: 'DEVELOPER' },
  { predicate: 'canEditAdminUserLoginEmail', label: 'Изменение email входа', minRole: 'DEVELOPER' },

  { predicate: 'canAdjustUserBalanceInAdmin', label: 'Изменение баланса', minRole: 'AGENT' },
  { predicate: 'canDeleteUsersInAdmin', label: 'Удаление пользователей', minRole: 'AGENT' },
]


export const accessCanManageRoles = (role?: string | null) =>
  roleLevel(role) >= STELIX_ROLES.SECURITY.level


export const accessCanManageOAuthBindings = (role?: string | null) =>
  roleLevel(role) >= STELIX_ROLES.DEVELOPER.level


export const accessCanModerate = (role?: string | null) =>
  roleLevel(role) >= STELIX_ROLES.MODERATOR.level


export const accessCanManageTargetUser = (actorRole?: string | null, targetRole?: string | null) =>
  roleLevel(targetRole) <= roleLevel(actorRole)


export function accessCanAssignRole(actorRole?: string | null, targetRole?: string | null): boolean {
  const n = roleLevel(actorRole)
  const t = roleLevel(targetRole)
  return n >= STELIX_ROLES.MODERATOR.level ? t < n : t <= n
}


export interface RoleOption {
  value: RoleKey
  label: string
  color: string
}

export function getAdminRoleDropdownOptionsForAssigner(
  assignerRole: string | null | undefined,
  locale: RoleLang = 'ru',
): RoleOption[] {
  const opts: RoleOption[] = (Object.keys(STELIX_ROLES) as RoleKey[])
    .sort((a, b) => STELIX_ROLES[a].level - STELIX_ROLES[b].level)
    .map((key) => ({ value: key, label: ROLE_LABELS[locale][key], color: STELIX_ROLES[key].color }))
  return roleLevel(assignerRole) < STELIX_ROLES.MODERATOR.level
    ? opts
    : opts.filter((o) => roleLevel(o.value) < roleLevel(assignerRole))
}


export type OAuthProvider = 'discord' | 'steam' | 'google' | 'github' | 'telegram'

export const OAUTH_PROVIDERS: { key: OAuthProvider; label: string }[] = [
  { key: 'discord', label: 'Discord' },
  { key: 'steam', label: 'Steam' },
  { key: 'google', label: 'Google' },
  { key: 'github', label: 'GitHub' },
  { key: 'telegram', label: 'Telegram' },
]

export interface OAuthBinding {
  id: string | null
  displayName: string | null
}

export interface TargetUser {
  id: number
  name: string
  email: string | null
  role: RoleKey | string
  avatarUrl: string | null
  bindings: Record<OAuthProvider, OAuthBinding>
}

type RawUser = Record<string, unknown>

function str(v: unknown): string | null {
  return typeof v === 'string' && v.length > 0 ? v : null
}

export function normalizeTargetUser(raw: RawUser): TargetUser {
  const id = Number(raw.id)
  const bindings = OAUTH_PROVIDERS.reduce((acc, { key }) => {
    acc[key] = {
      id: str(raw[`${key}Id`]),
      displayName:
        str(raw[`${key}DisplayName`]) ??
        str(raw[`${key}Login`]) ??
        str(raw[`${key}Username`]),
    }
    return acc
  }, {} as Record<OAuthProvider, OAuthBinding>)

  return {
    id: Number.isFinite(id) ? id : 0,
    name: str(raw.name) ?? str(raw.label) ?? `#${raw.id ?? ''}`,
    email: str(raw.email) ?? str(raw.sub),
    role: (str(raw.role) as RoleKey | null) ?? 'NEWBIE',
    avatarUrl: str(raw.avatarUrl) ?? str(raw.image),
    bindings,
  }
}
