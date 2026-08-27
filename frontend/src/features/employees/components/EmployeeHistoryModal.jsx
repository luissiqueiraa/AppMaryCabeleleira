import { useEffect, useRef } from "react";
import { FiX } from "react-icons/fi";
import AppointmentHistoryList from "../../../shared/components/AppointmentHistoryList";

export default function EmployeeHistoryModal({ employee, onClose }) {
  const dialogRef = useRef(null);

  useEffect(() => {
    dialogRef.current?.focus();
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button type="button" aria-label="Fechar" onClick={onClose} className="absolute inset-0 bg-black/40" />

      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="employee-history-title"
        tabIndex={-1}
        className="relative flex max-h-[85vh] w-full max-w-md flex-col overflow-hidden rounded-lg bg-white shadow-xl outline-none"
      >
        <div className="flex items-center justify-between border-b border-gray-100 p-5">
          <div>
            <h2 id="employee-history-title" className="font-display text-lg font-semibold text-gray-900">
              Agenda de {employee.user.fullName}
            </h2>
            <p className="text-xs text-gray-500">Histórico de agendamentos</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-gray-400 hover:bg-gray-100"
          >
            <FiX aria-hidden="true" />
          </button>
        </div>

        <div className="overflow-y-auto p-5">
          <AppointmentHistoryList
            employeeId={employee.id}
            emptyLabel="Essa funcionária ainda não tem agendamentos."
          />
        </div>
      </div>
    </div>
  );
}
