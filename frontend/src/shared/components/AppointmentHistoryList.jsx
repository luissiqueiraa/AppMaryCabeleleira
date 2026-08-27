import { useEffect, useState } from "react";
import StatusBadge from "./StatusBadge";
import { listAppointments } from "../../features/dashboard/services/appointmentService";
import { mapAppointment } from "../utils/mapAppointment";

// Passe clientId para ver a agenda de uma cliente (mostra o profissional em
// cada linha) ou employeeId para ver a agenda de uma profissional (mostra a
// cliente em cada linha).
export default function AppointmentHistoryList({ clientId, employeeId, emptyLabel = "Nenhum agendamento por aqui." }) {
  const [history, setHistory] = useState([]);
  const [loadStatus, setLoadStatus] = useState("loading");
  const showClientName = Boolean(employeeId);

  useEffect(() => {
    listAppointments(clientId ? { clientId } : { employeeId })
      .then(({ data }) => {
        setHistory(
          data.map(mapAppointment).sort((a, b) => new Date(b.scheduledAt) - new Date(a.scheduledAt))
        );
        setLoadStatus("success");
      })
      .catch(() => setLoadStatus("error"));
  }, [clientId, employeeId]);

  if (loadStatus === "loading") {
    return <p className="text-sm text-gray-500">Carregando...</p>;
  }

  if (loadStatus === "error") {
    return (
      <p role="alert" className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
        Não foi possível carregar o histórico agora.
      </p>
    );
  }

  if (history.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-gray-200 p-6 text-center text-sm text-gray-500">
        {emptyLabel}
      </p>
    );
  }

  return (
    <ul className="divide-y divide-gray-100">
      {history.map((item) => (
        <li key={item.id} className="flex items-center gap-3 py-3">
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-gray-900">{item.service}</p>
            <p className="truncate text-xs text-gray-500">
              com {showClientName ? item.client : item.professional} · {item.dateShort}, {item.time}
            </p>
          </div>
          <StatusBadge status={item.status} />
          <p className="w-20 shrink-0 text-right text-sm font-semibold text-gray-900">{item.price}</p>
        </li>
      ))}
    </ul>
  );
}
