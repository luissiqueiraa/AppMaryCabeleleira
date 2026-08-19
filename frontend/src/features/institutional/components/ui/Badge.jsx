export default function Badge({ children, className = "" }) {
  return (
    <span
      className={`inline-flex items-center rounded-md border border-border bg-surface px-3 py-1 text-xs font-semibold tracking-wide text-text-muted uppercase ${className}`}
    >
      {children}
    </span>
  );
}
