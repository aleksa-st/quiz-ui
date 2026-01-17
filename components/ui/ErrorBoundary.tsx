import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from './Button';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  private resetError = () => {
    this.setState({ hasError: false, error: null });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex flex-col items-center justify-center min-h-[50vh] p-6 text-center">
          <div className="bg-red-50 p-4 rounded-full mb-6 animate-bounce">
            <AlertTriangle className="h-10 w-10 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2 font-poppins">Something went wrong</h2>
          <p className="text-slate-500 mb-8 max-w-md">
            We encountered an unexpected error while loading this page.
          </p>
          
          <div className="bg-white border border-slate-200 rounded-xl p-4 mb-8 text-left max-w-lg w-full overflow-hidden shadow-sm">
             <p className="text-xs font-mono text-red-600 break-words whitespace-pre-wrap">
               {this.state.error?.message || "Unknown error occurred"}
             </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <Button onClick={this.resetError} variant="primary">
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
            <Button onClick={() => {
              window.location.hash = '';
              window.location.reload();
            }} variant="outline">
              <Home className="h-4 w-4 mr-2" />
              Go to Home
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}