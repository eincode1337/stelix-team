export const locales = ['ru', 'uk', 'en'] as const
export type Locale = (typeof locales)[number]

export const defaultLocale: Locale = 'ru'

export const localeMeta: Record<Locale, { htmlLang: string; ogLocale: string; label: string; flag: string }> = {
  ru: { htmlLang: 'ru', ogLocale: 'ru_RU', label: 'Русский', flag: '/icons/flags/ru.svg' },
  uk: { htmlLang: 'uk', ogLocale: 'uk_UA', label: 'Українська', flag: '/icons/flags/ua.svg' },
  en: { htmlLang: 'en', ogLocale: 'en_GB', label: 'English', flag: '/icons/flags/en.svg' },
}

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value)
}
