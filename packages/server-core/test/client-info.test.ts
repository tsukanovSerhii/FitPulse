import { describe, expect, it } from 'vitest'
import { describeDevice, openGeoLookup, truncateIp } from '../src/index.js'

describe('describeDevice', () => {
  it('reads phones, tablets, desktops and their system and browser', () => {
    expect(describeDevice('Mozilla/5.0 (iPhone; CPU iPhone OS 18_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.1 Mobile/15E148 Safari/604.1')).toEqual({
      deviceType: 'mobile',
      os: 'iOS',
      browser: 'Safari',
    })
    expect(describeDevice('Mozilla/5.0 (Linux; Android 15; Pixel 9) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Mobile Safari/537.36')).toMatchObject({ deviceType: 'mobile', os: 'Android', browser: 'Chrome' })
    expect(describeDevice('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36 Edg/130.0.0.0')).toMatchObject({ deviceType: 'desktop', os: 'Windows', browser: 'Microsoft Edge' })
    expect(describeDevice('Mozilla/5.0 (iPad; CPU OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1')).toMatchObject({ deviceType: 'tablet', os: 'iOS' })
  })

  it('a missing or unknown agent gives nulls, not a crash', () => {
    expect(describeDevice(undefined)).toEqual({ deviceType: null, os: null, browser: null })
    expect(describeDevice('curl/8.4.0').deviceType).toBeNull()
  })
})

describe('truncateIp', () => {
  it('keeps only the network part of the address', () => {
    expect(truncateIp('93.75.12.201')).toBe('93.75.12.x')
    expect(truncateIp('2a02:2378:1234:5678:9abc:def0:1:2')).toBe('2a02:2378:1234::')
    expect(truncateIp('::ffff:93.75.12.201')).toBe('93.75.12.x')
    expect(truncateIp('not-an-ip')).toBeNull()
  })
})

describe('openGeoLookup', () => {
  it('without the database file every lookup is empty instead of failing', async () => {
    const warnings: unknown[] = []
    const lookup = await openGeoLookup('does-not-exist.mmdb', { warn: (w) => warnings.push(w) })
    expect(lookup('93.75.12.201')).toEqual({ country: null, city: null })
    expect(warnings).toHaveLength(1)
    expect((await openGeoLookup(undefined, { warn: () => {} }))('8.8.8.8')).toEqual({ country: null, city: null })
  })
})
