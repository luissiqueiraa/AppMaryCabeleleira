import { useEffect, useState } from "react";
import { FiCalendar, FiUser, FiTrash2 } from "react-icons/fi";
import AutocompleteFilter from "../../../shared/components/AutocompleteFilter";
import OverflowMenu from "../../../shared/components/OverflowMenu";
import Avatar from "../../../shared/components/Avatar";
import ConfirmationModal from "../../../shared/components/ConfirmationModal";
import ClientHistoryModal from "./ClientHistoryModal";
import ClientProfileModal from "./ClientProfileModal";
import { listClients, deleteClient } from "../services/clientService";
import { clientFilters } from "../data/mockClients";
import { formatBRL } from "../../../shared/utils/formatCurrency";
import { formatRelativeDate } from "../../../shared/utils/formatDate";
import { maskBrazilianPhone } from "../../../shared/utils/phoneMask";
import { useToast } from "../../../shared/contexts/useToast";
import { getErrorMessage } from "../../../shared/utils/errorMessage";

export default function ClientsTable() {
  const toast = useToast();
  const [clients, setClients] = useState([]);
  const [loadStatus, setLoadStatus] = useState("loading");
  const [filter, setFilter] = useState("all");
  const [historyTarget, setHistoryTarget] = useState(null);
  const [profileTarget, setProfileTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  function loadClients() {
    listClients()
      .then(({ data }) => {
        setClients(data);
        setLoadStatus("success");
      })
      .catch(() => setLoadStatus("error"));
  }

  useEffect(() => {
    loadClients();
  }, []);

  async function handleDelete() {
    setIsDeleting(true);
    try {
      await deleteClient(deleteTarget.id);
      toast.success(`"${deleteTarget.name}" foi excluída.`);
      setDeleteTarget(null);
      loadClients();
    } catch (err) {
      toast.error(getErrorMessage(err, "Não foi possível excluir agora. Tente novamente em instantes."));
    } finally {
      setIsDeleting(false);
    }
  }

  const filteredClients = filter === "all" ? clients : clients.filter((client) => client.segment === filter);

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-display text-lg font-semibold text-gray-900">Todas as clientes</h2>
        <AutocompleteFilter
          options={clientFilters}
          value={filter}
          onChange={setFilter}
          ariaLabel="Filtrar clientes"
          placeholder="Filtrar clientes"
        />
      </div>

      {loadStatus === "loading" && <p className="mt-4 text-sm text-gray-500">Carregando...</p>}

      {loadStatus === "error" && (
        <p role="alert" className="mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          Não foi possível carregar as clientes agora. Tente novamente em instantes.
        </p>
      )}

      {loadStatus === "success" && filteredClients.length === 0 && (
        <p className="mt-4 rounded-lg border border-dashed border-gray-200 p-8 text-center text-sm text-gray-500">
          Nenhuma cliente encontrada para esse filtro.
        </p>
      )}

      {loadStatus === "success" && filteredClients.length > 0 && (
        <ul className="mt-4 space-y-3 lg:hidden">
          {filteredClients.map((client) => {
            return (
              <li key={client.id} className="rounded-lg border border-gray-200 p-4">
                <div className="flex items-center gap-3">
                  <Avatar name={client.name} avatarUrl={client.avatarUrl} size={36} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-gray-900">{client.name}</p>
                    <p className="truncate text-xs text-gray-500">{client.email}</p>
                  </div>
                  <OverflowMenu
                    ariaLabel={`Mais opções de ${client.name}`}
                    actions={[
                      { label: "Ver agenda", icon: FiCalendar, onClick: () => setHistoryTarget(client) },
                      { label: "Ver perfil completo", icon: FiUser, onClick: () => setProfileTarget(client) },
                      { label: "Excluir", icon: FiTrash2, onClick: () => setDeleteTarget(client), danger: true },
                    ]}
                  />
                </div>

                <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs">
                  <div>
                    <p className="font-semibold text-gray-900">{client.visits}</p>
                    <p className="text-gray-400">Visitas</p>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{formatBRL(client.spent)}</p>
                    <p className="text-gray-400">Gasto</p>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{formatRelativeDate(client.lastVisit)}</p>
                    <p className="text-gray-400">Última</p>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {loadStatus === "success" && filteredClients.length > 0 && (
        <div className="mt-4 hidden overflow-x-auto lg:block">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="text-xs font-semibold tracking-wide text-gray-400 uppercase">
                  <th className="pb-3 font-semibold">Cliente</th>
                  <th className="pb-3 font-semibold">Contato</th>
                  <th className="pb-3 font-semibold">Telefone</th>
                  <th className="pb-3 font-semibold">Visitas</th>
                  <th className="pb-3 font-semibold">Gasto total</th>
                  <th className="pb-3 font-semibold">Última</th>
                  <th className="pb-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredClients.map((client) => {
                  return (
                    <tr key={client.id}>
                      <td className="py-4 pr-4 align-middle">
                        <div className="flex items-center gap-3">
                          <Avatar name={client.name} avatarUrl={client.avatarUrl} size={36} />
                          <p className="font-semibold whitespace-nowrap text-gray-900">{client.name}</p>
                        </div>
                      </td>
                      <td className="py-4 pr-4 align-middle">
                        <p className="text-gray-600">{client.email}</p>
                      </td>
                      <td className="py-4 pr-4 align-middle whitespace-nowrap text-gray-600">
                        {client.phone ? maskBrazilianPhone(client.phone) : "Não informado"}
                      </td>
                      <td className="py-4 pr-4 align-middle text-gray-600">{client.visits}</td>
                      <td className="py-4 pr-4 align-middle font-semibold text-gray-900 whitespace-nowrap">
                        {formatBRL(client.spent)}
                      </td>
                      <td className="py-4 pr-4 align-middle text-gray-500 whitespace-nowrap">
                        {formatRelativeDate(client.lastVisit)}
                      </td>
                      <td className="py-4 align-middle text-right whitespace-nowrap">
                        <OverflowMenu
                          ariaLabel={`Mais opções de ${client.name}`}
                          actions={[
                            { label: "Ver agenda", icon: FiCalendar, onClick: () => setHistoryTarget(client) },
                            { label: "Ver perfil completo", icon: FiUser, onClick: () => setProfileTarget(client) },
                            { label: "Excluir", icon: FiTrash2, onClick: () => setDeleteTarget(client), danger: true },
                          ]}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
        </div>
      )}

      {historyTarget && (
        <ClientHistoryModal client={historyTarget} onClose={() => setHistoryTarget(null)} />
      )}
      {profileTarget && (
        <ClientProfileModal client={profileTarget} onClose={() => setProfileTarget(null)} />
      )}

      <ConfirmationModal
        open={Boolean(deleteTarget)}
        title="Excluir cliente"
        description={deleteTarget ? `Tem certeza que deseja excluir "${deleteTarget.name}"? Essa ação não pode ser desfeita.` : ""}
        confirmLabel="Excluir"
        cancelLabel="Cancelar"
        isLoading={isDeleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
