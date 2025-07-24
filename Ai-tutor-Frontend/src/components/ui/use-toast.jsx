import { useState, useCallback } from "react";

// Simple toast state management for demonstration
let listeners = [];
let toastId = 0;
let toasts = [];

function notify() {
  listeners.forEach((listener) => listener(toasts));
}

export function toast({ title, description, action, ...props }) {
  const id = ++toastId;
  toasts = [
    ...toasts,
    { id, title, description, action, ...props },
  ];
  notify();
  // Auto-remove after 3s for demo
  setTimeout(() => {
    toasts = toasts.filter((t) => t.id !== id);
    notify();
  }, 3000);
}

export function useToast() {
  const [currentToasts, setToasts] = useState(toasts);

  const update = useCallback((newToasts) => setToasts([...newToasts]), []);

  // Subscribe on mount, unsubscribe on unmount
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useState(() => {
    listeners.push(update);
    return () => {
      listeners = listeners.filter((l) => l !== update);
    };
  }, []);

  return { toasts: currentToasts };
}
