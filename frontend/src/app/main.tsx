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

installErrorReporting()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </StrictMode>,
)

registerServiceWorker()
