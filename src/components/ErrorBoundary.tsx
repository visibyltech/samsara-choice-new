import React from 'react';

interface ErrorBoundaryState {
  hasError: boolean;
  message: string;
}

export class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, message: '' };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      message: error?.message || 'An unexpected error occurred.',
    };
  }

  render() {
    if (this.state.hasError) {
      let friendly = this.state.message;
      try {
        const parsed = JSON.parse(this.state.message) as { error?: string; operationType?: string; path?: string };
        if (parsed.error) {
          friendly = `Database access error (${parsed.operationType || 'operation'} on ${parsed.path || 'record'}): ${parsed.error}`;
        }
      } catch {
        // non-JSON error message
      }

      return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
          <div className="max-w-lg w-full bg-white border border-slate-200 rounded-xl p-8 shadow-sm">
            <p className="text-xs font-semibold tracking-wider uppercase text-[#D61A1E] mb-2">
              Samsara Choice Ltd
            </p>
            <h1 className="text-2xl font-bold text-slate-900 mb-3">
              Something interrupted your session
            </h1>
            <p className="text-sm text-slate-600 mb-6 break-words">{friendly}</p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="px-5 py-2.5 bg-[#0B2D71] text-white text-sm font-semibold rounded-lg hover:bg-[#082257] transition-colors"
            >
              Reload Storefront
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
