import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { FiCalendar, FiClock } from "react-icons/fi";
import StatusBadge from "../../../shared/components/StatusBadge";
import { getAppointment } from "../../dashboard/services/appointmentService";
import { mapAppointment } from "../../../shared/utils/mapAppointment";

export default function AppointmentDetailPage() {
  const { id } = useParams();
  const [appointment, setAppointment] = useState(null);
  const [loadStatus, setLoadStatus] = useState("loading");

  useEffect(() => {
    let isMounted = true;
    getAppointment(id)
      .then(({ data }) => {
        if (isMounted) {
          setAppointment(mapAppointment(data));
          setLoadStatus("success");
        }
      })
      .catch(() => {
        if (isMounted) setLoadStatus("error");
      });
    return () => {
      isMounted = false;
    };
  }, [id]);

  if (loadStatus === "loading") {
    return <p className="text-sm text-gray-500">Carregando...</p>;
  }

  if (loadStatus === "error" || !appointment) {
    return (
      <div className="mx-auto max-w-xl rounded-lg border border-dashed border-gray-200 bg-white p-8 text-center">
        <p className="text-sm text-gray-500">Agendamento não encontrado.</p>
        <Link to="/appointments" className="mt-3 inline-block text-sm font-semibold text-pink-600 hover:underline">
          Voltar para agendamentos
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <h2 className="font-display text-xl font-semibold text-gray-900">{appointment.service}</h2>
        <StatusBadge status={appointment.status} />
      </div>
      <p className="mt-1 text-sm text-gray-500">com {appointment.professional}</p>

      <div className="mt-5 space-y-2 text-sm text-gray-600">
        <p className="flex items-center gap-2">
          <FiCalendar className="text-pink-500" aria-hidden="true" />
          {appointment.date}
        </p>
        <p className="flex items-center gap-2">
          <FiClock className="text-pink-500" aria-hidden="true" />
          {appointment.time}
        </p>
      </div>

      <Link
        to="/appointments"
        className="mt-6 inline-block text-sm font-semibold text-pink-600 hover:underline"
      >
        Voltar para agendamentos
      </Link>
    </div>
  );
}
