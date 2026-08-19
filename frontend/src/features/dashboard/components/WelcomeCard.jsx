import { FiCalendar, FiClock } from "react-icons/fi";
import { Link } from "react-router-dom";

function WelcomeCardShell({ children }) {
  return (
    <div className="relative isolate overflow-hidden rounded-lg bg-gradient-to-br from-neutral-800 via-neutral-900 to-black p-6 text-white sm:p-8">
      <div
        className="pointer-events-none absolute inset-0 -z-10 bg-cover bg-center opacity-25"
        style={{ backgroundImage: "url('/fotoCabelo1.jpg')" }}
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -top-10 -right-10 h-56 w-56 rounded-full bg-white/10 blur-2xl"
        aria-hidden="true"
      />
      {children}
    </div>
  );
}

export default function WelcomeCard({ appointment, onCancel }) {
  if (!appointment) {
    return (
      <WelcomeCardShell>
        <p className="text-xs font-semibold tracking-[0.2em] text-white/80 uppercase">Próximo horário</p>
        <h2 className="font-display mt-2 text-2xl font-semibold sm:text-3xl">Nenhum agendamento marcado</h2>
        <p className="mt-1 text-sm text-white/85">Que tal marcar seu próximo horário agora?</p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            to="/appointments/new"
            className="rounded-lg bg-white px-5 py-2.5 text-sm font-semibold text-pink-700 shadow-sm transition-colors hover:bg-pink-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            Agendar agora
          </Link>
        </div>
      </WelcomeCardShell>
    );
  }

  return (
    <WelcomeCardShell>
      <p className="text-xs font-semibold tracking-[0.2em] text-white/80 uppercase">
        Próximo horário
      </p>
      <h2 className="font-display mt-2 text-2xl font-semibold sm:text-3xl">{appointment.service}</h2>
      <p className="mt-1 text-sm text-white/85">com {appointment.professional}</p>

      <div className="mt-5 flex flex-wrap gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-md bg-white/15 px-3 py-1.5 text-xs font-medium">
          <FiCalendar aria-hidden="true" />
          {appointment.dateShort ?? appointment.date}
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-md bg-white/15 px-3 py-1.5 text-xs font-medium">
          <FiClock aria-hidden="true" />
          {appointment.time}
        </span>
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <Link
          to={`/appointments/${appointment.id}`}
          className="rounded-lg bg-white px-5 py-2.5 text-sm font-semibold text-pink-700 shadow-sm transition-colors hover:bg-pink-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
        >
          Ver detalhes
        </Link>
        <Link
          to={`/appointments/${appointment.id}/reschedule`}
          className="rounded-lg bg-white/15 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-white/25 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
        >
          Remarcar
        </Link>
        <button
          type="button"
          onClick={onCancel}
          className="hidden rounded-lg bg-white/15 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-white/25 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:inline-flex"
        >
          Cancelar
        </button>
      </div>
    </WelcomeCardShell>
  );
}
