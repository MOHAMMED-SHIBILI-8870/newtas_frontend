import React from 'react'

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, info) {
    console.error('Application error boundary caught an error:', error, info)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-slate-950 px-6 text-center text-white">
          <div className="max-w-lg rounded-[32px] border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur">
            <p className="text-xs font-bold uppercase tracking-[0.4em] text-cyan-300">Something broke</p>
            <h1 className="mt-4 text-3xl font-black">We hit an unexpected error.</h1>
            <p className="mt-3 text-sm text-slate-300">
              Please refresh the page. If this keeps happening, the issue is likely in the current view or
              data payload.
            </p>
            <pre className="mt-6 overflow-auto rounded-2xl bg-black/20 p-4 text-left text-xs text-rose-200">
              {String(this.state.error?.message || this.state.error || 'Unknown error')}
            </pre>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
