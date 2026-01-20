import { Component } from 'react'
import PropTypes from 'prop-types'
import { STORAGE_KEY } from '../constants'

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null })
  }

  handleClearAndReload = () => {
    localStorage.removeItem(STORAGE_KEY)
    window.location.reload()
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: 'var(--dr-bg)' }}>
          <div className="text-center max-w-md">
            <h1
              className="text-2xl uppercase tracking-widest mb-4"
              style={{ color: 'var(--dr-green)', textShadow: '0 0 10px var(--dr-green-glow)' }}
            >
              [ System Error ]
            </h1>
            <p
              className="mb-6 text-sm"
              style={{ color: 'var(--dr-green-dim)' }}
            >
              Something went wrong. You can try reloading, or clear all data and start fresh.
            </p>
            <div className="flex flex-col gap-3">
              <button
                onClick={() => window.location.reload()}
                className="dr-btn w-full"
                aria-label="Reload the application"
              >
                Reload App
              </button>
              <button
                onClick={this.handleClearAndReload}
                className="dr-btn w-full text-negative border-red-400"
                aria-label="Clear all data and reload the application"
              >
                Clear Data & Reload
              </button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

ErrorBoundary.propTypes = {
  children: PropTypes.node.isRequired,
}
