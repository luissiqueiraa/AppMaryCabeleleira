import { useCallback, useMemo, useRef, useState } from "react";
import { ToastContext } from "./ToastContext";
import ToastContainer from "../components/ToastContainer";

const DURATIONS = { success: 4000, error: 6000 };

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const idRef = useRef(0);

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const show = useCallback(
    (type, message) => {
      const id = ++idRef.current;
      setToasts((prev) => [...prev, { id, type, message }]);
      setTimeout(() => dismiss(id), DURATIONS[type] ?? 4000);
      return id;
    },
    [dismiss]
  );

  const value = useMemo(
    () => ({
      success: (message) => show("success", message),
      error: (message) => show("error", message),
      dismiss,
    }),
    [show, dismiss]
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  );
}
