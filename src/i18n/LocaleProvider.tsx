'use client'

import { createContext, useContext, useMemo } from 'react'
import { t } from './t'

const LocaleContext = createContext<string>('ru')

export function LocaleProvider({
  locale,
  children,
}: {
  locale: string
  children: React.ReactNode
}) {
  return <LocaleContext.Provider value={locale}>{children}</LocaleContext.Provider>
}

export function useLocale(): string {
  return useContext(LocaleContext)
}

export function useT(): (s: string) => string {
  const locale = useContext(LocaleContext)
  return useMemo(() => (s: string) => t(locale, s), [locale])
}
