import React from "react";
import { AlertCircle } from "lucide-react";

class RouteErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error) {
    console.error("Route error:", error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-6">
          <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
          <h1 className="text-3xl font-bold mb-2">Page Error</h1>
          <p className="text-gray-400 mb-6 text-center max-w-md">
            This page encountered an error. Please try going back or returning to the home page.
          </p>
          <div className="flex gap-4">
            <button
              onClick={() => window.history.back()}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold"
            >
              Go Back
            </button>
            <a
              href="/"
              className="px-6 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg font-semibold"
            >
              Home
            </a>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default RouteErrorBoundary;
