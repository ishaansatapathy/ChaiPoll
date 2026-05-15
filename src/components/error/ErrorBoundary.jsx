import React from "react";
import { AlertCircle, RefreshCw } from "lucide-react";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorCount: 0,
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState((prevState) => ({
      error,
      errorInfo,
      errorCount: prevState.errorCount + 1,
    }));

    // Log error to console in development
    if (process.env.NODE_ENV === "development") {
      console.error("Error caught by boundary:", error, errorInfo);
    }

    // Could send to error tracking service here
    // e.g., Sentry, LogRocket, etc.
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-zinc-900 p-4">
          <div className="max-w-md w-full bg-zinc-800 rounded-lg shadow-lg border border-zinc-700 p-8">
            <div className="flex justify-center mb-4">
              <AlertCircle className="size-12 text-red-500" />
            </div>

            <h2 className="text-2xl font-bold text-white text-center mb-4">
              Oops! Something went wrong
            </h2>

            <p className="text-zinc-400 text-center mb-6">
              We encountered an unexpected error. Please try again or contact support if the problem
              persists.
            </p>

            {process.env.NODE_ENV === "development" && this.state.error && (
              <details className="mb-6 bg-zinc-900 p-4 rounded border border-zinc-700">
                <summary className="text-yellow-500 cursor-pointer font-semibold">
                  Error Details (Development Only)
                </summary>
                <pre className="text-xs text-zinc-300 mt-2 overflow-auto max-h-40 whitespace-pre-wrap break-words">
                  {this.state.error.toString()}
                  {this.state.errorInfo && this.state.errorInfo.componentStack}
                </pre>
              </details>
            )}

            <div className="flex gap-3">
              <button
                onClick={this.handleReset}
                className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition"
              >
                <RefreshCw className="size-4" />
                Try Again
              </button>
              <button
                onClick={() => (window.location.href = "/")}
                className="flex-1 bg-zinc-700 hover:bg-zinc-600 text-white font-semibold py-2 px-4 rounded-lg transition"
              >
                Go Home
              </button>
            </div>

            {this.state.errorCount > 3 && (
              <div className="mt-4 p-3 bg-red-900 bg-opacity-30 border border-red-700 rounded text-red-400 text-sm">
                Multiple errors detected. Consider clearing your browser cache or reloading the
                page.
              </div>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
