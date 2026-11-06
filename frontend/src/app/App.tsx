import { BrowserRouter } from 'react-router-dom'
import { ErrorBoundary, ErrorScreen } from '@/shared/ui'
import { DataInitializer } from './providers/DataInitializer'
import { ThemedToaster } from './providers/ThemedToaster'
import { AppRoutes } from './router/AppRoutes'

export function App() {
  return (
    <ErrorBoundary fallback={({ error }) => <ErrorScreen error={error} fullScreen />}>
      <BrowserRouter>
        <DataInitializer>
          <AppRoutes />
          <ThemedToaster />
        </DataInitializer>
      </BrowserRouter>
    </ErrorBoundary>
  )
}
