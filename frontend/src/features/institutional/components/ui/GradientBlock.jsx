import { FiImage } from "react-icons/fi";

export default function GradientBlock({ label, className = "", children }) {
  return (
    <div
      role="img"
      aria-label={label || "Imagem em breve"}
      className={`relative flex items-center justify-center overflow-hidden rounded-lg border border-border bg-surface ${className}`}
    >
      <FiImage className="text-text-muted/40" size={28} aria-hidden="true" />
      {children}
      {label && (
        <span className="absolute bottom-3 left-3 rounded-md bg-bg/60 px-3 py-1 text-xs font-medium text-text backdrop-blur-sm">
          {label}
        </span>
      )}
    </div>
  );
}
