export default function GradientBlock({ from, to, label, className = "", children }) {
  return (
    <div
      role="img"
      aria-label={label || "Imagem decorativa"}
      className={`relative overflow-hidden rounded-lg ${className}`}
      style={{ background: `linear-gradient(160deg, ${from}, ${to})` }}
    >
      {children}
      {label && (
        <span className="absolute bottom-3 left-3 rounded-md bg-bg/60 px-3 py-1 text-xs font-medium text-text backdrop-blur-sm">
          {label}
        </span>
      )}
    </div>
  );
}
