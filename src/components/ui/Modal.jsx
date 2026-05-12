import { X } from "lucide-react";
import { Button } from "./Button";

export function Modal({ open, title, children, onClose }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 px-4 backdrop-blur-sm">
      <div className="surface w-full max-w-lg rounded-xl p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-xl text-white">{title}</h2>
          <Button
            variant="ghost"
            className="min-h-9 px-3"
            onClick={onClose}
            aria-label="Close modal"
          >
            <X size={16} />
          </Button>
        </div>
        {children}
      </div>
    </div>
  );
}
