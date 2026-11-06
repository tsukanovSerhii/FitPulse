import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach } from 'vitest'

if (typeof Element !== 'undefined') {
  // jsdom lacks pointer capture; sonner calls it when a toast is pressed
  Element.prototype.setPointerCapture ??= () => {}
  Element.prototype.releasePointerCapture ??= () => {}
  Element.prototype.hasPointerCapture ??= () => false
}

afterEach(() => {
  if (typeof document !== 'undefined') cleanup()
})
