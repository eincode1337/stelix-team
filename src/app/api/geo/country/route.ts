import { json } from '@/server/mock'
import geoCountry from '@/server/fixtures/geo-country.json'

export const dynamic = 'force-dynamic'

const GEO_HEADERS = [
  'x-vercel-ip-country',
  'cf-ipcountry',
  'x-country-code',
  'x-geo-country',
] as const

export function GET(request: Request) {
  let countryCode = geoCountry.countryCode
  for (const name of GEO_HEADERS) {
    const value = request.headers.get(name)
    if (value && value.trim()) {
      countryCode = value.trim().toUpperCase()
      break
    }
  }
  const isRussia = countryCode === 'RU'
  return json({ countryCode, isRussia })
}
