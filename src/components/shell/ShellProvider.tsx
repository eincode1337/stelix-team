'use client'

import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'
import { SignInDrawerProvider } from '@/components/auth/SignInDrawer'
import { SearchOverlay } from '@/components/shell/SearchOverlay'
import { ContactsModal } from '@/components/shell/ContactsModal'

type ShellApi = {
  openSearch: () => void
  closeSearch: () => void
  openContacts: () => void
  closeContacts: () => void
}

const ShellContext = createContext<ShellApi | null>(null)

export function ShellProvider({ children }: { children: ReactNode }) {
  const [searchOpen, setSearchOpen] = useState(false)
  const [contactsOpen, setContactsOpen] = useState(false)

  const api = useMemo<ShellApi>(
    () => ({
      openSearch: () => setSearchOpen(true),
      closeSearch: () => setSearchOpen(false),
      openContacts: () => setContactsOpen(true),
      closeContacts: () => setContactsOpen(false),
    }),
    [],
  )

  return (
    <SignInDrawerProvider>
      <ShellContext.Provider value={api}>
        {children}
        <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
        <ContactsModal open={contactsOpen} onClose={() => setContactsOpen(false)} />
      </ShellContext.Provider>
    </SignInDrawerProvider>
  )
}

export function useShell(): ShellApi {
  const ctx = useContext(ShellContext)
  if (!ctx) throw new Error('useShell must be used within ShellProvider')
  return ctx
}
