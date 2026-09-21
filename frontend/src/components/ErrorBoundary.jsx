import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-900 text-slate-100 flex items-center justify-center p-6">
          <div className="bg-slate-800 border border-slate-700 p-8 rounded-2xl max-w-md text-center space-y-4 shadow-2xl">
            <div className="w-12 h-12 rounded-full bg-rose-500/20 text-rose-400 font-bold flex items-center justify-center mx-auto text-xl">
              !
            </div>
            <h2 className="text-xl font-bold text-white">Application Notice</h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              An unexpected display issue occurred. Clicking reload will restore your session.
            </p>
            {this.state.error && (
              <div className="bg-slate-950 p-4 rounded-xl text-left border border-rose-500/30 overflow-auto max-h-60 text-xs font-mono text-rose-300">
                <div className="font-bold text-rose-400 mb-1">{this.state.error.toString()}</div>
                <pre className="text-[10px] text-slate-400 whitespace-pre-wrap">{this.state.error.stack}</pre>
              </div>
            )}
            <div className="pt-2 flex gap-3 justify-center">
              <button
                onClick={() => {
                  localStorage.removeItem('ccm_token');
                  window.location.href = '/roles';
                }}
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-xl text-xs font-semibold"
              >
                Reset Session
              </button>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-xs"
              >
                Reload App
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
