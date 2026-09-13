

import type { ReactNode } from 'react'
import { ap } from '../ui/ap'

function ActionIcon({ children }: { children: ReactNode }) {
  return (
    <svg
      className={ap('tableIconButtonIcon')}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  )
}


export function EditActionIcon() {
  return (
    <ActionIcon>
      <line x1="14" y1="5" x2="19" y2="10" />
      <path d="m9,20l-6,1,1-6L15.464,3.536c1.381-1.381,3.619-1.381,5,0h0c1.381,1.381,1.381,3.619,0,5l-11.464,11.464Z" />
      <line x1="16.5" y1="7.5" x2="8" y2="16" />
    </ActionIcon>
  )
}


export function DeleteActionIcon() {
  return (
    <ActionIcon>
      <path d="m18.833,8l-.503,12.083c-.045,1.071-.926,1.917-1.998,1.917H7.668c-1.072,0-1.954-.845-1.998-1.917l-.503-12.083" />
      <path d="m10,4v-1c0-.552.448-1,1-1h2c.552,0,1,.448,1,1v1" />
      <line x1="10" y1="18" x2="10" y2="12" />
      <line x1="14" y1="18" x2="14" y2="12" />
      <path d="m5,4h14c1.104,0,2,.896,2,2v2H3v-2c0-1.104.896-2,2-2Z" />
    </ActionIcon>
  )
}


export function ViewActionIcon() {
  return (
    <ActionIcon>
      <circle cx="12" cy="10" r="5" />
      <path d="m1.141,12s3.859-7,10.859-7,10.859,7,10.859,7c0,0-3.859,7-10.859,7S1.141,12,1.141,12Z" />
    </ActionIcon>
  )
}


export function ImpersonateActionIcon() {
  return (
    <ActionIcon>
      <path d="m12,10c2.209,0,4-1.791,4-4s-1.791-4-4-4-4,1.791-4,4,1.791,4,4,4Z" />
      <path d="m18.5,21.5l-4-4,4-4" />
      <path d="m13,13h-1c-4.418,0-8,3.582-8,8,2.939.735,6.183,1,9,1" />
      <path d="m15.5,17.499h-1s8.5,0,8.5,0" />
    </ActionIcon>
  )
}


export function DownloadActionIcon() {
  return (
    <ActionIcon>
      <path d="M12 3V16.5V16" />
      <path d="M8.5 13L12 16.5L15.5 13" />
      <path d="M7 10H4L2 20H22L20 10H17" />
    </ActionIcon>
  )
}


export function BlockActionIcon() {
  return (
    <ActionIcon>
      <line x1="19.091" y1="4.909" x2="4.909" y2="19.091" />
      <circle cx="12" cy="12" r="10" />
    </ActionIcon>
  )
}


export function HideActionIcon() {
  return (
    <ActionIcon>
      <path d="m9.608,14.392c-1.554-.848-2.608-2.497-2.608-4.392,0-2.761,2.239-5,5-5,1.895,0,3.544,1.054,4.392,2.608" />
      <path d="m6.521,17.479c-3.567-2.059-5.38-5.479-5.38-5.479,0,0,3.859-7,10.859-7,2.107,0,3.943.634,5.479,1.521" />
      <path d="m20.647,9.009c1.538,1.565,2.212,2.991,2.212,2.991,0,0-3.859,7-10.859,7-.433,0-.855-.027-1.265-.077" />
      <line x1="22" y1="2" x2="2" y2="22" />
    </ActionIcon>
  )
}


export function ExternalLinkActionIcon() {
  return (
    <ActionIcon>
      <path d="M4.49998 21.5L14.9999 11L14.5 11.5" />
      <path d="M9 11L15 11L15 17" />
      <path d="M11 22L18 22C19.1046 22 20 21.1046 20 20L20 4C20 2.89543 19.1046 2 18 2L6 2C4.89543 2 4 2.89543 4 4L4 15" />
    </ActionIcon>
  )
}


export function RefundActionIcon() {
  return (
    <ActionIcon>
      <path d="M6 21.5C7.65685 21.5 9 20.1569 9 18.5C9 16.8431 7.65685 15.5 6 15.5C4.34315 15.5 3 16.8431 3 18.5C3 20.1569 4.34315 21.5 6 21.5Z" />
      <path d="M3.5 2.5V7.5H8.5" />
      <path d="M12 21.5C17.2467 21.5 21.5 17.2467 21.5 12C21.5 6.75329 17.2467 2.5 12 2.5C8.38143 2.5 5.23538 4.52315 3.63131 7.5L3.73595 7.311" />
    </ActionIcon>
  )
}
