import React, { StrictMode, Component } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('The Fashion Hub uncaught error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReload = () => {
    window.location.reload();
  };

  handleReset = () => {
    try {
      localStorage.removeItem('tfh_wishlist');
      sessionStorage.removeItem('tfh_crm_auth');
    } catch (e) {}
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-white text-neutral-900 flex flex-col items-center justify-center p-6 text-center">
          <div className="max-w-md w-full border border-neutral-300 p-8 space-y-4">
            <div className="w-10 h-10 bg-red-600 text-white font-bold flex items-center justify-center mx-auto text-lg">
              !
            </div>
            <h1 className="text-lg font-black uppercase tracking-tight text-neutral-950">
              PP Fashion Hub
            </h1>
            <p className="text-xs text-neutral-600 leading-relaxed">
              An unexpected render issue occurred. You can reload or reset your temporary cache below.
            </p>
            {this.state.error && (
              <pre className="text-[11px] bg-neutral-100 p-3 border border-neutral-200 text-left overflow-x-auto text-red-600 font-mono">
                {String(this.state.error.message || this.state.error)}
              </pre>
            )}
            <div className="flex flex-col sm:flex-row gap-2 pt-2">
              <button
                onClick={this.handleReload}
                className="flex-1 py-2.5 bg-neutral-950 text-white font-bold text-xs uppercase tracking-wider hover:bg-neutral-800 cursor-pointer"
              >
                Reload
              </button>
              <button
                onClick={this.handleReset}
                className="flex-1 py-2.5 border border-neutral-300 text-neutral-800 font-bold text-xs uppercase tracking-wider hover:border-black cursor-pointer"
              >
                Reset Cache
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
);
