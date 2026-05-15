import { useState, useEffect } from "react";
import { AlertCircle, X } from "lucide-react";

export function ErrorToast({ message, onClose, duration = 5000 }) {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [onClose, duration]);

  return (
    <div className="fixed bottom-4 right-4 bg-red-900 border border-red-700 rounded-lg shadow-lg p-4 flex gap-3 items-start max-w-sm animate-slide-in">
      <AlertCircle className="size-5 text-red-400 flex-shrink-0 mt-0.5" />
      <div className="flex-1">
        <p className="text-red-100 text-sm">{message}</p>
      </div>
      <button onClick={onClose} className="text-red-400 hover:text-red-300 flex-shrink-0">
        <X className="size-4" />
      </button>
    </div>
  );
}

export function SuccessToast({ message, onClose, duration = 3000 }) {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [onClose, duration]);

  return (
    <div className="fixed bottom-4 right-4 bg-green-900 border border-green-700 rounded-lg shadow-lg p-4 flex gap-3 items-start max-w-sm animate-slide-in">
      <div className="size-5 bg-green-400 rounded-full flex-shrink-0 mt-0.5" />
      <div className="flex-1">
        <p className="text-green-100 text-sm">{message}</p>
      </div>
      <button onClick={onClose} className="text-green-400 hover:text-green-300 flex-shrink-0">
        <X className="size-4" />
      </button>
    </div>
  );
}

export function useErrorToast() {
  const [error, setError] = useState(null);

  return {
    error,
    showError: (message) => setError(message),
    clearError: () => setError(null),
    ErrorComponent: error ? <ErrorToast message={error} onClose={() => setError(null)} /> : null,
  };
}

export function useSuccessToast() {
  const [success, setSuccess] = useState(null);

  return {
    success,
    showSuccess: (message) => setSuccess(message),
    clearSuccess: () => setSuccess(null),
    SuccessComponent: success ? (
      <SuccessToast message={success} onClose={() => setSuccess(null)} />
    ) : null,
  };
}
