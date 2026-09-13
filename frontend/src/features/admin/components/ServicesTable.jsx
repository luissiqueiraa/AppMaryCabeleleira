import { useEffect, useState } from "react";
import { FiEdit2, FiPlus, FiTrash2 } from "react-icons/fi";
import AutocompleteFilter from "../../../shared/components/AutocompleteFilter";
import ConfirmationModal from "../../../shared/components/ConfirmationModal";
import OverflowMenu from "../../../shared/components/OverflowMenu";
import ServiceFormModal from "./ServiceFormModal";
import { listServices, deleteService } from "../services/serviceCatalogService";
import { serviceFilters } from "../data/mockAdminServices";
import { formatBRL } from "../../../shared/utils/formatCurrency";
import { useAuth } from "../../../shared/contexts/useAuth";
import { ROLES } from "../../../shared/constants/roles";
import { useToast } from "../../../shared/contexts/useToast";
import { getErrorMessage } from "../../../shared/utils/errorMessage";

const CATEGORY_LABEL = {
  all: "Todos",
  hair: "Cabelo",
  nails: "Unhas",
  makeup: "Maquiagem",
  brows: "Sobrancelha",
};

export default function ServicesTable() {
  const { user } = useAuth();
  const toast = useToast();
  const canManageServices = user?.role?.name !== ROLES.EMPLOYEE;
  const [services, setServices] = useState([]);
  const [loadStatus, setLoadStatus] = useState("loading");
  const [filter, setFilter] = useState("all");
  const [formTarget, setFormTarget] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  function loadServices() {
    listServices()
      .then(({ data }) => {
        setServices(data);
        setLoadStatus("success");
      })
      .catch(() => setLoadStatus("error"));
  }

  async function handleDelete() {
    setIsDeleting(true);
    try {
      await deleteService(deleteTarget.id);
      toast.success(`"${deleteTarget.name}" foi excluído.`);
      setDeleteTarget(null);
      loadServices();
    } catch (err) {
      toast.error(getErrorMessage(err, "Não foi possível excluir agora. Tente novamente em instantes."));
    } finally {
      setIsDeleting(false);
    }
  }

  useEffect(() => {
    loadServices();
  }, []);

  const filteredServices =
    filter === "all" ? services : services.filter((service) => service.category === filter);

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-display text-lg font-semibold text-gray-900">Todos os serviços</h2>
        <div className="flex items-center gap-3">
          <AutocompleteFilter
            options={serviceFilters}
            value={filter}
            onChange={setFilter}
            ariaLabel="Filtrar serviços"
            placeholder="Filtrar serviços"
          />
          {canManageServices && (
            <button
              type="button"
              onClick={() => setIsCreating(true)}
              className="flex items-center gap-1.5 rounded-lg bg-pink-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-pink-700"
            >
              <FiPlus size={16} aria-hidden="true" />
              Novo serviço
            </button>
          )}
        </div>
      </div>

      {loadStatus === "loading" && <p className="mt-4 text-sm text-gray-500">Carregando...</p>}

      {loadStatus === "error" && (
        <p role="alert" className="mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          Não foi possível carregar os serviços agora. Tente novamente em instantes.
        </p>
      )}

      {loadStatus === "success" && filteredServices.length === 0 && (
        <p className="mt-4 rounded-lg border border-dashed border-gray-200 p-8 text-center text-sm text-gray-500">
          Nenhum serviço encontrado para esse filtro.
        </p>
      )}

      {loadStatus === "success" && filteredServices.length > 0 && (
        <ul className="mt-4 space-y-3 lg:hidden">
          {filteredServices.map((service) => (
            <li key={service.id} className="flex items-center gap-3 rounded-lg border border-gray-200 p-4">
              <img
                src="/Mary_Cabelereira.png"
                alt=""
                aria-hidden="true"
                className="h-10 w-10 shrink-0 rounded-full object-cover"
              />
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold text-gray-900">{service.name}</p>
                <p className="text-xs text-gray-500">
                  {CATEGORY_LABEL[service.category] ?? service.category} · {service.duration} min
                </p>
                <p className="mt-0.5 text-sm font-semibold text-gray-900">{formatBRL(service.price)}</p>
              </div>
              {canManageServices && (
                <OverflowMenu
                  ariaLabel={`Mais opções de ${service.name}`}
                  actions={[
                    { label: "Editar", icon: FiEdit2, onClick: () => setFormTarget(service) },
                    { label: "Excluir", icon: FiTrash2, onClick: () => setDeleteTarget(service), danger: true },
                  ]}
                />
              )}
            </li>
          ))}
        </ul>
      )}

      {loadStatus === "success" && filteredServices.length > 0 && (
        <div className="mt-4 hidden overflow-x-auto lg:block">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="text-xs font-semibold tracking-wide text-gray-400 uppercase">
                  <th className="pb-3 font-semibold">Serviço</th>
                  <th className="pb-3 font-semibold">Categoria</th>
                  <th className="pb-3 font-semibold">Duração</th>
                  <th className="pb-3 font-semibold">Preço</th>
                  <th className="pb-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredServices.map((service) => (
                  <tr key={service.id}>
                    <td className="py-4 pr-4 align-middle">
                      <div className="flex items-center gap-3">
                        <img
                          src="/Mary_Cabelereira.png"
                          alt=""
                          aria-hidden="true"
                          className="h-9 w-9 shrink-0 rounded-full object-cover"
                        />
                        <p className="font-semibold whitespace-nowrap text-gray-900">{service.name}</p>
                      </div>
                    </td>
                    <td className="py-4 pr-4 align-middle whitespace-nowrap text-gray-600">
                      {CATEGORY_LABEL[service.category] ?? service.category}
                    </td>
                    <td className="py-4 pr-4 align-middle whitespace-nowrap text-gray-600">
                      {service.duration} min
                    </td>
                    <td className="py-4 pr-4 align-middle font-semibold whitespace-nowrap text-gray-900">
                      {formatBRL(service.price)}
                    </td>
                    <td className="py-4 align-middle text-right whitespace-nowrap">
                      {canManageServices && (
                        <OverflowMenu
                          ariaLabel={`Mais opções de ${service.name}`}
                          actions={[
                            { label: "Editar", icon: FiEdit2, onClick: () => setFormTarget(service) },
                            { label: "Excluir", icon: FiTrash2, onClick: () => setDeleteTarget(service), danger: true },
                          ]}
                        />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
        </div>
      )}

      {isCreating && (
        <ServiceFormModal onClose={() => setIsCreating(false)} onSaved={loadServices} />
      )}
      {formTarget && (
        <ServiceFormModal service={formTarget} onClose={() => setFormTarget(null)} onSaved={loadServices} />
      )}

      <ConfirmationModal
        open={Boolean(deleteTarget)}
        title="Excluir serviço"
        description={deleteTarget ? `Tem certeza que deseja excluir "${deleteTarget.name}"?` : ""}
        confirmLabel="Excluir"
        cancelLabel="Cancelar"
        isLoading={isDeleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
