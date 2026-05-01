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
        <div className="flex min-h-[200px] items-center justify-center">
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center dark:border-red-800 dark:bg-red-900/20">
            <div className="mb-2 text-2xl">⚠</div>
            <h3 className="mb-1 text-sm font-black text-red-700 dark:text-red-300">页面出错了</h3>
            <p className="text-xs text-red-500 dark:text-red-400">{this.state.error?.message || '未知错误'}</p>
            <button
              onClick={() => { this.setState({ hasError: false }); window.location.reload() }}
              className="mt-3 rounded-xl bg-red-500 px-4 py-2 text-xs font-bold text-white hover:bg-red-600">
              重新加载
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
