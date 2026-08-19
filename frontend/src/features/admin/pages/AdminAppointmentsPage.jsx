import { useEffect, useState } from "react";
import ScheduleToolbar from "../components/ScheduleToolbar";
import ScheduleGrid from "../components/ScheduleGrid";
import { listEmployees } from "../../employees/services/employeeService";
import { listAppointments } from "../../dashboard/services/appointmentService";
import { BUSINESS_HOURS_LIST } from "../../../shared/config/businessHours";
import { formatFullDate, toLocalIsoDate as isoDate } from "../../../shared/utils/formatDate";

function addDays(iso, amount) {
  const date = new Date(`${iso}T00:00:00`);
  date.setDate(date.getDate() + amount);
  return isoDate(date);
}

export default function AdminAppointmentsPage() {
  const [view, setView] = useState("day");
  const [selectedDate, setSelectedDate] = useState(() => isoDate(new Date()));
  const [professionals, setProfessionals] = useState([]);
  const [events, setEvents] = useState([]);
  const [loadStatus, setLoadStatus] = useState("loading");

  useEffect(() => {
    let isMounted = true;
    async function load() {
      try {
        const [employeesRes, appointmentsRes] = await Promise.all([
          listEmployees(),
          listAppointments({ date: selectedDate }),
        ]);
        if (!isMounted) return;

        const activeAppointments = appointmentsRes.data.filter((item) => item.status !== "cancelled");
        const countByEmployee = activeAppointments.reduce((acc, item) => {
          if (item.employee) acc[item.employee.id] = (acc[item.employee.id] ?? 0) + 1;
          return acc;
        }, {});

        setProfessionals(
          employeesRes.data.map((employee) => ({
            id: employee.id,
            name: employee.user.fullName,
            avatarUrl: employee.user.avatarUrl,
            count: countByEmployee[employee.id] ?? 0,
          }))
        );

        setEvents(
          activeAppointments
            .filter((item) => item.employee)
            .map((item) => {
              const scheduled = new Date(item.scheduledAt);
              return {
                id: item.id,
                employeeId: item.employee.id,
                service: item.service.name,
                client: item.client.fullName,
                startHour: scheduled.getHours(),
                rowSpan: Math.max(1, Math.round(item.durationMinutes / 60)),
              };
            })
        );

        setLoadStatus("success");
      } catch {
        if (isMounted) setLoadStatus("error");
      }
    }
    load();
    return () => {
      isMounted = false;
    };
  }, [selectedDate]);

  if (loadStatus === "error") {
    return (
      <p role="alert" className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
        Não foi possível carregar a agenda agora. Tente novamente em instantes.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <ScheduleToolbar
        view={view}
        onChangeView={setView}
        dateLabel={formatFullDate(selectedDate)}
        onPrevDay={() => setSelectedDate((prev) => addDays(prev, -1))}
        onNextDay={() => setSelectedDate((prev) => addDays(prev, 1))}
        onToday={() => setSelectedDate(isoDate(new Date()))}
      />

      {loadStatus === "loading" ? (
        <p className="text-sm text-gray-500">Carregando...</p>
      ) : view === "day" ? (
        <ScheduleGrid professionals={professionals} hours={BUSINESS_HOURS_LIST} events={events} />
      ) : (
        <p className="rounded-lg border border-dashed border-gray-200 bg-white p-8 text-center text-sm text-gray-500">
          Visão por {view === "week" ? "semana" : "mês"} em breve.
        </p>
      )}
    </div>
  );
}
