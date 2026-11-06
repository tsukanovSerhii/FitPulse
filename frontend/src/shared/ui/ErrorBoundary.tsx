import { reportError } from '@/shared/lib/errorReporter'
import { Component, type ErrorInfo, type ReactNode } from 'react'

export interface ErrorBoundaryProps {
  children: ReactNode
  /** Rendered instead of the children after a render error */
  fallback: (props: { error: Error; reset: () => void }) => ReactNode
  /** Changing this value clears the error, e.g. the current route */
  resetKey?: unknown
}

interface State {
  error: Error | null
  resetKey: unknown
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, State> {
  state: State = { error: null, resetKey: this.props.resetKey }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { error }
  }

  static getDerivedStateFromProps(props: ErrorBoundaryProps, state: State): Partial<State> | null {
    return props.resetKey !== state.resetKey ? { error: null, resetKey: props.resetKey } : null
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[ErrorBoundary]', error, info.componentStack)
    reportError(error, 'render')
  }

  reset = () => this.setState({ error: null })

  render() {
    return this.state.error ? this.props.fallback({ error: this.state.error, reset: this.reset }) : this.props.children
  }
}
