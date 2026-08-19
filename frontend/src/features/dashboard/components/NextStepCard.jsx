import { Link } from "react-router-dom";

export default function NextStepCard() {
  return (
    <div className="flex h-full flex-col rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <p className="text-xs font-semibold tracking-[0.2em] text-pink-600 uppercase">
        Novo agendamento
      </p>

      <div className="mt-6">
        <Link
          to="/appointments/new"
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-pink-600 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-pink-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pink-600"
        >
          Agendar agora
        </Link>
      </div>
    </div>
  );
}

