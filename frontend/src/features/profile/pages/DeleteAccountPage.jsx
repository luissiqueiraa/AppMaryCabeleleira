import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiChevronLeft, FiAlertTriangle } from "react-icons/fi";
import ConfirmationModal from "../../../shared/components/ConfirmationModal";
import { deleteAccount } from "../services/profileService";
import { useAuth } from "../../../shared/contexts/useAuth";

export default function DeleteAccountPage() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [modalOpen, setModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState("");

  async function handleConfirmDelete() {
    setIsDeleting(true);
    setError("");
    try {
      await deleteAccount();
      await logout();
      navigate("/login", { replace: true });
    } catch {
      setError("Não foi possível excluir sua conta agora. Tente novamente em instantes.");
      setIsDeleting(false);
      setModalOpen(false);
    }
  }

  return (
    <div className="mx-auto max-w-lg">
      <Link to="/profile" className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-gray-700">
        <FiChevronLeft aria-hidden="true" />
        Voltar ao perfil
      </Link>

      <div className="mt-4 rounded-lg border border-red-200 bg-white p-6 shadow-sm">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-50 text-red-600">
            <FiAlertTriangle aria-hidden="true" />
          </span>
          <div>
            <h2 className="font-display text-lg font-semibold text-gray-900">Excluir conta</h2>
            <p className="mt-1 text-sm text-gray-500">
              Essa ação é permanente. Seus dados, agendamentos e histórico serão apagados e não
              poderão ser recuperados.
            </p>
          </div>
        </div>

        {error && (
          <p role="alert" className="mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        )}

        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="mt-6 w-full rounded-lg border border-red-600 py-3 text-sm font-semibold text-red-600 transition-colors hover:bg-red-50"
        >
          Excluir minha conta
        </button>
      </div>

      <ConfirmationModal
        open={modalOpen}
        title="Excluir conta permanentemente?"
        description="Essa ação não pode ser desfeita. Tem certeza que deseja continuar?"
        confirmLabel="Sim, excluir conta"
        cancelLabel="Cancelar"
        isLoading={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setModalOpen(false)}
      />
    </div>
  );
}
