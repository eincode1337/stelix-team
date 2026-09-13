export type RoleKey =
  | 'NEWBIE'
  | 'VERIFIED'
  | 'TRUSTED'
  | 'SELLER'
  | 'SELLER_PLUS'
  | 'ACCOUNTANT'
  | 'MODERATOR'
  | 'SECURITY'
  | 'DEVELOPER'
  | 'AGENT'

export type RoleLang = 'ru' | 'uk' | 'en'

export interface RoleMeta {
  name: string
  color: string
  level: number
}

export const STELIX_ROLES: Record<RoleKey, RoleMeta> = {
  NEWBIE: { name: 'Новенький', color: '#34bbe6', level: 1 },
  VERIFIED: { name: 'Проверенный', color: '#49da9a', level: 2 },
  TRUSTED: { name: 'Доверенный', color: '#4355db', level: 3 },
  SELLER: { name: 'Продавец', color: '#a371f7', level: 4 },
  SELLER_PLUS: { name: 'Продавец+', color: '#8250df', level: 5 },
  ACCOUNTANT: { name: 'Бухгалтер', color: '#7d8590', level: 6 },
  MODERATOR: { name: 'Модератор', color: '#ce97ff', level: 7 },
  SECURITY: { name: 'Служба безопасности', color: '#b4f753', level: 8 },
  DEVELOPER: { name: 'Разработчик', color: '#fd6f41', level: 9 },
  AGENT: { name: 'Агент', color: '#ffc000', level: 10 },
}

export const ROLE_DISPLAY_ORDER: RoleKey[] = [
  'AGENT',
  'DEVELOPER',
  'SECURITY',
  'MODERATOR',
  'ACCOUNTANT',
  'SELLER_PLUS',
  'SELLER',
  'TRUSTED',
  'VERIFIED',
  'NEWBIE',
]

export const ROLE_LABELS: Record<RoleLang, Record<RoleKey, string>> = {
  ru: {
    NEWBIE: 'Новенький',
    VERIFIED: 'Проверенный',
    TRUSTED: 'Доверенный',
    SELLER: 'Продавец',
    SELLER_PLUS: 'Продавец+',
    ACCOUNTANT: 'Бухгалтер',
    MODERATOR: 'Модератор',
    SECURITY: 'Служба безопасности',
    DEVELOPER: 'Разработчик',
    AGENT: 'Агент',
  },
  uk: {
    NEWBIE: 'Новачок',
    VERIFIED: 'Перевірений',
    TRUSTED: 'Довірений',
    SELLER: 'Продавец',
    SELLER_PLUS: 'Продавец+',
    ACCOUNTANT: 'Бухгалтер',
    MODERATOR: 'Модератор',
    SECURITY: 'Служба безпеки',
    DEVELOPER: 'Розробник',
    AGENT: 'Агент',
  },
  en: {
    NEWBIE: 'Newcomer',
    VERIFIED: 'Verified',
    TRUSTED: 'Trusted',
    SELLER: 'Seller',
    SELLER_PLUS: 'Seller+',
    ACCOUNTANT: 'Accountant',
    MODERATOR: 'Moderator',
    SECURITY: 'Security',
    DEVELOPER: 'Developer',
    AGENT: 'Agent',
  },
}

function isRoleKey(v: string): v is RoleKey {
  return Object.prototype.hasOwnProperty.call(STELIX_ROLES, v)
}

export function roleLevel(role: string | null | undefined): number {
  return role && isRoleKey(role) ? STELIX_ROLES[role].level : 0
}

export function roleColor(role: string | null | undefined): string {
  return role && isRoleKey(role) ? STELIX_ROLES[role].color : '#7d8590'
}

export function roleLabel(role: string | null | undefined, lang: RoleLang = 'ru'): string {
  if (role && isRoleKey(role)) return ROLE_LABELS[lang][role]
  return role ?? ''
}

export const isModeratorOrAbove = (role?: string | null) => roleLevel(role) >= STELIX_ROLES.MODERATOR.level
export const isStaffRole = (role?: string | null) => roleLevel(role) >= STELIX_ROLES.ACCOUNTANT.level
export const isSellerTierOrAbove = (role?: string | null) => roleLevel(role) >= STELIX_ROLES.SELLER.level
export const isSellerPlusTierOrHigher = (role?: string | null) => roleLevel(role) >= STELIX_ROLES.SELLER_PLUS.level
export const isAgentOrDeveloper = (role?: string | null) =>
  role === 'AGENT' || role === 'DEVELOPER'
