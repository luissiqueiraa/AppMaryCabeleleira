import { createPortal } from "react-dom";
import { MdCheckCircle, MdError, MdClose } from "react-icons/md";

// Estilo inspirado no Alert do Material UI: fundo tingido na cor da
// severidade (não branco), sem borda, ícone preenchido — não um card neutro
// com só o ícone colorido.
const STYLES = {
  success: { icon: MdCheckCircle, bg: "bg-emerald-50", text: "text-emerald-900", icon_: "text-emerald-600" },
  error: { icon: MdError, bg: "bg-red-50", text: "text-red-900", icon_: "text-red-600" },
};

export default function ToastContainer({ toasts, onDismiss }) {
  if (toasts.length === 0) return null;

  return createPortal(
    <div className="fixed inset-x-0 top-4 z-[100] flex flex-col items-center gap-2 px-4 lg:inset-x-auto lg:top-auto lg:right-4 lg:bottom-4 lg:items-end">
      {toasts.map((toast) => {
        const config = STYLES[toast.type] ?? STYLES.success;
        const Icon = config.icon;
        return (
          <div
            key={toast.id}
            role={toast.type === "error" ? "alert" : "status"}
            className={`animate-toast-in flex w-full max-w-sm items-start gap-2 rounded-md px-4 py-3 text-sm shadow-md ${config.bg} ${config.text}`}
          >
            <Icon size={20} className={`mt-0.5 shrink-0 ${config.icon_}`} aria-hidden="true" />
            <p className="min-w-0 flex-1 pt-0.5">{toast.message}</p>
            <button
              type="button"
              onClick={() => onDismiss(toast.id)}
              aria-label="Fechar notificação"
              className={`shrink-0 rounded p-0.5 opacity-70 hover:opacity-100 ${config.icon_}`}
            >
              <MdClose size={18} aria-hidden="true" />
            </button>
          </div>
        );
      })}
    </div>,
    document.body
  );
}
