export const AP_PREFIX = 'AdminPanel-module__8pW_9a__' as const

type ClassArg = string | false | null | undefined

export function ap(...names: ClassArg[]): string {
  return names.filter(Boolean).map((n) => `${AP_PREFIX}${n as string}`).join(' ')
}

export function cx(...names: ClassArg[]): string {
  return names.filter(Boolean).join(' ')
}
