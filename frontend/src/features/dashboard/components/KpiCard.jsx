const HINT_TONES = {
  neutral: "text-gray-400",
  positive: "text-emerald-600",
  warning: "text-amber-600",
};

export default function KpiCard({ label, value, hint, hintTone = "neutral", uppercaseLabel = false }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
      <p
        className={
          uppercaseLabel
            ? "text-xs font-semibold tracking-wide text-gray-400 uppercase"
            : "text-sm text-gray-500"
        }
      >
        {label}
      </p>
      <p className="font-display mt-2 text-2xl font-semibold text-gray-900">{value}</p>
      {hint && <p className={`mt-1 text-xs ${HINT_TONES[hintTone]}`}>{hint}</p>}
    </div>
  );
}
