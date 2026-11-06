/** All build-time environment variables, read in one place. */
export const env = {
  siteUrl: (import.meta.env.VITE_SITE_URL || 'https://fit-pulse-beta-opal.vercel.app').replace(/\/$/, ''),
  adsEnabled: import.meta.env.VITE_ADS_ENABLED === 'true',
  /** Where error reports are sent; empty keeps them on the device only */
  errorEndpoint: import.meta.env.VITE_ERROR_ENDPOINT || '',
  /** Build the code comes from: the commit on Vercel, the build date elsewhere */
  appVersion: import.meta.env.VITE_APP_VERSION || 'dev',
}
