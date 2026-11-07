import { isIPv4, isIPv6 } from 'node:net'
import Bowser from 'bowser'
import maxmind, { type CityResponse, type Reader } from 'maxmind'

export interface DeviceInfo {
  deviceType: 'mobile' | 'tablet' | 'desktop' | null
  os: string | null
  browser: string | null
}

const PLATFORMS = { mobile: 'mobile', tablet: 'tablet', desktop: 'desktop' } as const

/** Device type, system and browser from a User-Agent; unknown agents give nulls. */
export function describeDevice(userAgent: string | undefined): DeviceInfo {
  if (!userAgent) return { deviceType: null, os: null, browser: null }
  const parsed = Bowser.parse(userAgent)
  const type = parsed.platform.type as keyof typeof PLATFORMS | undefined
  return {
    deviceType: (type && PLATFORMS[type]) ?? null,
    os: parsed.os.name ?? null,
    browser: parsed.browser.name ?? null,
  }
}

/** The network part only: 93.75.12.x for IPv4, the first 48 bits for IPv6. A full address is never stored. */
export function truncateIp(ip: string): string | null {
  const v4 = ip.startsWith('::ffff:') ? ip.slice(7) : ip
  if (isIPv4(v4)) return `${v4.split('.').slice(0, 3).join('.')}.x`
  if (isIPv6(ip)) {
    const [head = ''] = ip.split('::')
    const groups = head.split(':').filter(Boolean)
    return `${groups.slice(0, 3).join(':')}::`
  }
  return null
}

export interface GeoInfo {
  country: string | null
  city: string | null
}

export type GeoLookup = (ip: string) => GeoInfo

const NO_GEO: GeoInfo = { country: null, city: null }

/** Country and city from the DB-IP City Lite database (CC BY 4.0); without the file every lookup is empty. */
export async function openGeoLookup(path: string | undefined, log: { warn(obj: unknown, msg?: string): void }): Promise<GeoLookup> {
  if (!path) return () => NO_GEO
  let reader: Reader<CityResponse>
  try {
    reader = await maxmind.open<CityResponse>(path)
  } catch (err) {
    log.warn({ err }, 'Geolocation database not available; countries stay empty')
    return () => NO_GEO
  }
  return (ip) => {
    try {
      const found = reader.get(ip.startsWith('::ffff:') ? ip.slice(7) : ip)
      return { country: found?.country?.iso_code ?? null, city: found?.city?.names?.en ?? null }
    } catch {
      return NO_GEO
    }
  }
}
