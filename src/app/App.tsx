import { BrowserRouter } from 'react-router-dom'
import { DataInitializer } from './providers/DataInitializer'
import { ThemedToaster } from './providers/ThemedToaster'
import { AppRoutes } from './router/AppRoutes'

export function App() {
  return (
    <BrowserRouter>
      <DataInitializer>
        <AppRoutes />
        <ThemedToaster />
      </DataInitializer>
    </BrowserRouter>
  )
}
