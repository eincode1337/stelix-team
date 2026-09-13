import { messages } from './messages'

export function t(locale: string, s: string): string {
  if (locale !== 'uk' && locale !== 'en') return s
  return messages[locale]?.[s] ?? s
}
