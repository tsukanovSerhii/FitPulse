import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import { store } from './store/store'
import '@fontsource-variable/manrope/wght.css'
import '@fontsource-variable/oswald/wght.css'
import '@fontsource-variable/jetbrains-mono/wght.css'
import './styles/index.css'
import { App } from './App'
import { registerServiceWorker } from './pwa/registerServiceWorker'
import { installErrorReporting } from '@/shared/lib/errorReporter'
import { restoreSession } from '@/features/auth/model'
import { startSync, startSyncTimers } from './store/syncListeners'

installErrorReporting()

// The cached user shows at once; the server confirms the session in the background
store.dispatch(restoreSession()).then((action) => {
  if (action.payload !== 'offline') return
  window.addEventListener('online', () => void store.dispatch(restoreSession()), { once: true })
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </StrictMode>,
)

registerServiceWorker()
startSync()
startSyncTimers(store)
