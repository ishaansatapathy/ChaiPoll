import React from "react";

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("React Error Boundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-black p-10 text-center text-white">
          <h2 className="mb-4 text-3xl font-bold text-red-500">Something went wrong</h2>
          <p className="mb-8 text-white/50">{this.state.error?.message}</p>
          <button
            onClick={() => window.location.reload()}
            className="rounded-full bg-white px-8 py-3 text-sm font-bold text-black"
          >
            Reload Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
