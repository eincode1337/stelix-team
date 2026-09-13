import { AuthCodes } from '@/server/db/store'
import { json, readJson } from '@/server/mock'

export async function POST(request: Request) {
  const body = await readJson(request)
  const email = typeof body.email === 'string' ? body.email.trim() : ''
  if (email) AuthCodes.setLoginCode(email)
  return json({ ok: true, devHint: 'Демо-режим: введите любой код из 6 символов' })
}
