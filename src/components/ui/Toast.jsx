import { useState, useCallback } from "react";
import { AlertCircle, CheckCircle, X } from "lucide-react";

export function Toast({ type = "error", message, onClose }) {
  const isError = type === "error";
  const bgColor = isError ? "bg-red-900 border-red-700" : "bg-green-900 border-green-700";
  const textColor = isError ? "text-red-100" : "text-green-100";
  const icon = isError ? (
    <AlertCircle className="size-5 text-red-400" />
  ) : (
    <CheckCircle className="size-5 text-green-400" />
  );

  return (
    <div
      className={`fixed bottom-4 right-4 ${bgColor} border rounded-lg shadow-lg p-4 flex gap-3 items-start max-w-sm animate-in slide-in-from-right`}
    >
      {icon}
      <div className="flex-1">
        <p className={`${textColor} text-sm`}>{message}</p>
      </div>
      <button
        onClick={onClose}
        className={
          isError ? "text-red-400 hover:text-red-300" : "text-green-400 hover:text-green-300"
        }
      >
        <X className="size-4" />
      </button>
    </div>
  );
}

export function useToast() {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = "error", duration = 3000) => {
    const id = Date.now();
    setToasts((prev) => […prev, { id, message, type }]);

    if (duration > 0) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, duration);
    }

    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const ToastsComponent = () => (
    <>
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          type={toast.type}
          message={toast.message}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </>
  );

  return {
    addToast,
    removeToast,
    ToastsComponent,
    showError: (message, duration = 3000) => addToast(message, "error", duration),
    showSuccess: (message, duration = 3000) => addToast(message, "success", duration),
  };
}
