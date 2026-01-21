import React, { ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-red-900/50 p-6 rounded-xl max-w-md w-full text-center">
            <h2 className="text-xl font-bold text-red-500 mb-2">System Failure</h2>
            <p className="text-zinc-400 mb-4 text-sm">The client encountered a critical error.</p>
            <div className="bg-black/50 p-3 rounded text-xs text-red-300 overflow-auto mb-4 text-left max-h-32 font-mono">
              {this.state.error?.message}
            </div>
            <button
              onClick={() => window.location.reload()}
              className="bg-amber-500 hover:bg-amber-400 text-black px-6 py-2 rounded font-bold transition-colors uppercase tracking-wider"
            >
              Reconnect
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}