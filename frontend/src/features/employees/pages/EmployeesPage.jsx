import { useEffect, useState } from "react";
import { FiPlus } from "react-icons/fi";
import EmployeeCard from "../components/EmployeeCard";
import EmployeeFormModal from "../components/EmployeeFormModal";
import EmployeeHistoryModal from "../components/EmployeeHistoryModal";
import ConfirmationModal from "../../../shared/components/ConfirmationModal";
import { listEmployees, deleteEmployee } from "../services/employeeService";
import { useToast } from "../../../shared/contexts/useToast";
import { getErrorMessage } from "../../../shared/utils/errorMessage";

export default function EmployeesPage() {
  const toast = useToast();
  const [employees, setEmployees] = useState([]);
  const [loadStatus, setLoadStatus] = useState("loading");
  const [isCreating, setIsCreating] = useState(false);
  const [formTarget, setFormTarget] = useState(null);
  const [historyTarget, setHistoryTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  function loadEmployees() {
    listEmployees()
      .then(({ data }) => {
        setEmployees(data);
        setLoadStatus("success");
      })
      .catch(() => setLoadStatus("error"));
  }

  useEffect(() => {
    loadEmployees();
  }, []);

  async function handleDelete() {
    setIsDeleting(true);
    try {
      await deleteEmployee(deleteTarget.id);
      toast.success(`${deleteTarget.user.fullName} foi removida das funcionárias.`);
      setDeleteTarget(null);
      loadEmployees();
    } catch (err) {
      toast.error(getErrorMessage(err, "Não foi possível excluir agora. Tente novamente em instantes."));
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => setIsCreating(true)}
          className="flex items-center gap-1.5 rounded-lg bg-pink-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-pink-700"
        >
          <FiPlus size={16} aria-hidden="true" />
          Adicionar
        </button>
      </div>

      {loadStatus === "loading" && <p className="text-sm text-gray-500">Carregando...</p>}

      {loadStatus === "error" && (
        <p role="alert" className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          Não foi possível carregar as funcionárias agora. Tente novamente em instantes.
        </p>
      )}

      {loadStatus === "success" && employees.length === 0 && (
        <p className="rounded-lg border border-dashed border-gray-200 bg-white p-8 text-center text-sm text-gray-500">
          Nenhuma funcionária cadastrada ainda.
        </p>
      )}

      {loadStatus === "success" && employees.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {employees.map((employee) => (
            <EmployeeCard
              key={employee.id}
              employee={employee}
              onViewAgenda={setHistoryTarget}
              onEdit={setFormTarget}
              onDelete={setDeleteTarget}
            />
          ))}
        </div>
      )}

      {isCreating && <EmployeeFormModal onClose={() => setIsCreating(false)} onSaved={loadEmployees} />}
      {formTarget && (
        <EmployeeFormModal employee={formTarget} onClose={() => setFormTarget(null)} onSaved={loadEmployees} />
      )}
      {historyTarget && (
        <EmployeeHistoryModal employee={historyTarget} onClose={() => setHistoryTarget(null)} />
      )}

      <ConfirmationModal
        open={Boolean(deleteTarget)}
        title="Excluir funcionária"
        description={deleteTarget ? `Tem certeza que deseja excluir "${deleteTarget.user.fullName}"?` : ""}
        confirmLabel="Excluir"
        cancelLabel="Cancelar"
        isLoading={isDeleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
