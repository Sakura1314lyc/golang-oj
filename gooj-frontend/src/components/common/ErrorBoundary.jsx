import { Component } from 'react'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-[240px] items-center justify-center">
          <div className="ark-panel max-w-md p-6 text-center">
            <div className="ark-kicker">System Alert</div>
            <h3 className="mt-2 text-lg font-black text-red-200">页面出现错误</h3>
            <p className="mt-2 text-xs text-white/55">{this.state.error?.message || '未知错误'}</p>
            <button
              onClick={() => { this.setState({ hasError: false }); window.location.reload() }}
              className="ark-button-primary mt-4 px-4 py-2 text-xs font-black"
            >
              重新加载
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
