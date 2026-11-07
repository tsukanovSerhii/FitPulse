// Apply the theme before first paint to avoid a flash; a file, not an inline script, so the
// Content-Security-Policy can forbid inline scripts entirely
try {
  var mode = JSON.parse(localStorage.getItem('fitpulse_theme_v1') || '"system"')
  var dark = mode === 'dark' || (mode !== 'light' && matchMedia('(prefers-color-scheme: dark)').matches)
  document.documentElement.classList.add(dark ? 'dark' : 'light')
  document.querySelector('meta[name="theme-color"]').setAttribute('content', dark ? '#0e0e10' : '#f4f4f2')
} catch (e) {
  document.documentElement.classList.add('dark')
}
