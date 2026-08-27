import { FiCalendar, FiEdit2, FiTrash2 } from "react-icons/fi";
import OverflowMenu from "../../../shared/components/OverflowMenu";
import Avatar from "../../../shared/components/Avatar";

export default function EmployeeCard({ employee, onViewAgenda, onEdit, onDelete }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-4">
        <Avatar name={employee.user.fullName} avatarUrl={employee.user.avatarUrl} size={56} />
        <div className="min-w-0 flex-1">
          <p className="font-display truncate font-semibold text-gray-900">{employee.user.fullName}</p>
          <p className="truncate text-sm text-gray-500">{employee.user.email}</p>
        </div>
        <OverflowMenu
          ariaLabel={`Mais opções de ${employee.user.fullName}`}
          actions={[
            { label: "Ver agenda", icon: FiCalendar, onClick: () => onViewAgenda(employee) },
            { label: "Editar", icon: FiEdit2, onClick: () => onEdit(employee) },
            { label: "Excluir", icon: FiTrash2, onClick: () => onDelete(employee), danger: true },
          ]}
        />
      </div>
    </div>
  );
}
