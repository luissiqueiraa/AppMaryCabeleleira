import { FiMessageSquare } from "react-icons/fi";

// Observação que a cliente escreveu ao agendar ("não precisa lavar", "não
// quero conversar"). Aparece para ela, para conferir o que mandou, e para a
// equipe, que é quem precisa ler antes do atendimento. "compact" é para linha
// de tabela: uma linha só, com o texto inteiro no title.
export default function AppointmentNote({ notes, label = "Observação da cliente", compact = false, className = "" }) {
  const text = notes?.trim();
  if (!text) return null;

  if (compact) {
    return (
      <p title={text} className={`flex max-w-xs items-center gap-1 text-xs text-amber-700 ${className}`}>
        <FiMessageSquare size={12} className="shrink-0" aria-hidden="true" />
        <span className="sr-only">{label}: </span>
        <span className="truncate">{text}</span>
      </p>
    );
  }

  return (
    <div className={`rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 ${className}`}>
      <p className="flex items-center gap-1.5 text-xs font-semibold text-amber-800">
        <FiMessageSquare size={12} aria-hidden="true" />
        {label}
      </p>
      <p className="mt-0.5 text-sm break-words whitespace-pre-line text-amber-900">{text}</p>
    </div>
  );
}
