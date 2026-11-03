/** All build-time environment variables, read in one place. */
export const env = {
  siteUrl: (import.meta.env.VITE_SITE_URL || 'https://fit-pulse-beta-opal.vercel.app').replace(/\/$/, ''),
  adsEnabled: import.meta.env.VITE_ADS_ENABLED === 'true',
}
