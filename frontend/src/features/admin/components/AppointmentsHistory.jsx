import { useEffect, useState } from "react";
import { FiSearch, FiChevronLeft, FiChevronRight, FiDollarSign, FiTrash2, FiSlash, FiCalendar } from "react-icons/fi";
import Avatar from "../../../shared/components/Avatar";
import { listAppointments, cancelAppointment } from "../../dashboard/services/appointmentService";
import { updateAppointmentPayment, deleteAppointment } from "../services/adminAppointmentService";
import OverflowMenu from "../../../shared/components/OverflowMenu";
import ConfirmationModal from "../../../shared/components/ConfirmationModal";
import { useAuth } from "../../../shared/contexts/useAuth";
import { ROLES } from "../../../shared/constants/roles";
import { useToast } from "../../../shared/contexts/useToast";
import { getErrorMessage } from "../../../shared/utils/errorMessage";
import { APPOINTMENT_STATUS } from "../../../shared/constants/appointmentStatus";
import { formatBRL } from "../../../shared/utils/formatCurrency";
import { formatDateOnly, formatTime } from "../../../shared/utils/formatDate";
import { formatServiceNames } from "../../../shared/utils/formatServices";

const PAGE_SIZE = 10;

// "" = todos. O histórico nasce sem filtro: a admin abre o painel e vê a
// agenda inteira, passada e futura, e só então recorta se quiser.
const STATUS_OPTIONS = [
  { value: "", label: "Todas as situações" },
  { value: "confirmed", label: "Agendados" },
  { value: "completed", label: "Finalizados" },
  { value: "cancelled", label: "Cancelados" },
];

// StatusBadge não mostra nada para "confirmed" (é o estado padrão de quase
// todo agendamento). Aqui, numa lista que mistura tudo, a situação precisa
// aparecer em toda linha — senão um cancelado passa por atendido. As cores vêm
// do mesmo lugar, para as duas telas não divergirem.
function StatusPill({ status }) {
  const config = APPOINTMENT_STATUS[status];
  if (!config) return null;
  return (
    <span className={`inline-flex shrink-0 items-center rounded-md px-2 py-0.5 text-xs font-semibold ${config.className}`}>
      {config.label}
    </span>
  );
}

const PAYMENT_METHOD_LABEL = { pix: "Pix", card: "Cartão", on_site: "No salão" };

// Pago x a receber importa para o caixa: só o que está pago entra em
// "Recebido". Pix e cartão nascem pagos (o provedor confirma); o presencial
// depende da equipe dar baixa — então ali a etiqueta é um botão.
function PaymentCell({ item, isUpdating, onConfirm, onRevert }) {
  const label = PAYMENT_METHOD_LABEL[item.paymentMethod] ?? item.paymentMethod;
  const paid = item.paymentStatus === "paid";
  const podeMexer = item.paymentMethod === "on_site" && item.status !== "cancelled";

  if (paid) {
    return (
      <span className="whitespace-nowrap text-xs text-gray-500">
        {label} · <span className="font-semibold text-emerald-600">pago</span>
        {podeMexer && (
          <button
            type="button"
            onClick={() => onRevert(item)}
            disabled={isUpdating}
            title="Desfazer a baixa deste pagamento"
            className="ml-1.5 text-gray-400 underline hover:text-gray-600 disabled:cursor-not-allowed"
          >
            desfazer
          </button>
        )}
      </span>
    );
  }

  if (!podeMexer) {
    return (
      <span className="whitespace-nowrap text-xs text-gray-500">
        {label} · <span className="text-amber-600">a receber</span>
      </span>
    );
  }

  return (
    <button
      type="button"
      onClick={() => onConfirm(item)}
      disabled={isUpdating}
      className="inline-flex shrink-0 items-center gap-1 rounded-md border border-emerald-200 bg-emerald-50 px-2 py-1 text-xs font-semibold whitespace-nowrap text-emerald-700 hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-60"
    >
      <FiDollarSign size={12} aria-hidden="true" />
      Confirmar recebimento
    </button>
  );
}

export default function AppointmentsHistory({ onPaymentChange, onRequestReschedule }) {
  const toast = useToast();
  const { user } = useAuth();
  const [updatingId, setUpdatingId] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [cancelTarget, setCancelTarget] = useState(null);
  const [isCancelling, setIsCancelling] = useState(false);
  // Excluir tira o agendamento das listas e do caixa: fica com admin e
  // proprietária, a mesma regra que o backend aplica.
  const canDelete = [ROLES.OWNER, ROLES.ADMIN].includes(user?.role?.name);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [page, setPage] = useState(1);
  const [items, setItems] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loadStatus, setLoadStatus] = useState("loading");

  useEffect(() => {
    let isMounted = true;
    const timeoutId = setTimeout(() => {
      setLoadStatus("loading");
      listAppointments({
        status: status || undefined,
        page,
        limit: PAGE_SIZE,
        order: "desc",
        search: search.trim() || undefined,
        from: dateFrom || undefined,
        to: dateTo || undefined,
      })
        .then(({ data, pagination: meta }) => {
          if (!isMounted) return;
          setItems(data);
          setPagination(meta);
          setLoadStatus("success");
        })
        .catch(() => {
          if (isMounted) setLoadStatus("error");
        });
    }, 300);
    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
    };
  }, [search, status, dateFrom, dateTo, page]);

  const hasFilters = Boolean(search.trim() || status || dateFrom || dateTo);

  // Baixa do pagamento sem recarregar a lista: a linha é atualizada no lugar e
  // o painel é avisado para recalcular o caixa.
  async function changePayment(item, paymentStatus) {
    setUpdatingId(item.id);
    try {
      const { data } = await updateAppointmentPayment(item.id, paymentStatus);
      setItems((prev) =>
        prev.map((row) => (row.id === item.id ? { ...row, paymentStatus: data.paymentStatus } : row))
      );
      toast.success(paymentStatus === "paid" ? "Pagamento confirmado." : "Baixa desfeita.");
      onPaymentChange?.();
    } catch (err) {
      toast.error(getErrorMessage(err, "Não foi possível atualizar o pagamento agora."));
    } finally {
      setUpdatingId(null);
    }
  }

  async function confirmDelete() {
    setIsDeleting(true);
    try {
      await deleteAppointment(deleteTarget.id);
      setItems((prev) => prev.filter((row) => row.id !== deleteTarget.id));
      toast.success("Agendamento excluído.");
      setDeleteTarget(null);
      // O caixa muda quando o excluído estava pago.
      onPaymentChange?.();
    } catch (err) {
      toast.error(getErrorMessage(err, "Não foi possível excluir o agendamento agora."));
    } finally {
      setIsDeleting(false);
    }
  }

  async function confirmCancel() {
    setIsCancelling(true);
    try {
      const { data } = await cancelAppointment(cancelTarget.id);
      setItems((prev) => prev.map((row) => (row.id === cancelTarget.id ? { ...row, status: data.status } : row)));
      toast.success("Agendamento cancelado.");
      setCancelTarget(null);
      // Cancelar tira o valor de "a receber".
      onPaymentChange?.();
    } catch (err) {
      toast.error(getErrorMessage(err, "Não foi possível cancelar o agendamento agora."));
    } finally {
      setIsCancelling(false);
    }
  }

  // Um menu por linha, igual ao do catálogo de serviços. Cancelar é o caminho
  // normal (a cliente desmarcou) e aparece enquanto o atendimento está de pé;
  // excluir é para erro de lançamento e fica com admin e proprietária.
  const rowMenu = (item) => {
    const podeCancelar = ["pending", "confirmed"].includes(item.status);
    const podeRemarcar = onRequestReschedule && podeCancelar;
    const actions = [
      ...(podeRemarcar
        ? [{ label: "Alterar data e horário", icon: FiCalendar, onClick: () => onRequestReschedule(item) }]
        : []),
      ...(podeCancelar
        ? [{ label: "Cancelar agendamento", icon: FiSlash, onClick: () => setCancelTarget(item) }]
        : []),
      ...(canDelete
        ? [{ label: "Excluir", icon: FiTrash2, onClick: () => setDeleteTarget(item), danger: true }]
        : []),
    ];

    if (actions.length === 0) return null;

    return (
      <OverflowMenu
        ariaLabel={`Mais opções do agendamento de ${item.client.fullName}`}
        actions={actions}
      />
    );
  };

  const paymentCellProps = (item) => ({
    item,
    isUpdating: updatingId === item.id,
    onConfirm: (row) => changePayment(row, "paid"),
    onRevert: (row) => changePayment(row, "pending"),
  });

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm sm:p-5 lg:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-display text-lg font-semibold text-gray-900">Histórico de atendimentos</h2>

        <div className="flex flex-wrap items-center gap-2">
          <select
            aria-label="Situação"
            value={status}
            onChange={(event) => {
              setStatus(event.target.value);
              setPage(1);
            }}
            className="rounded-lg border border-gray-200 px-2.5 py-2 text-sm text-gray-700 outline-none focus-visible:border-pink-600 focus-visible:ring-2 focus-visible:ring-pink-100"
          >
            {STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <div className="relative">
            <FiSearch
              className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-gray-400"
              size={14}
              aria-hidden="true"
            />
            <input
              type="text"
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
              placeholder="Buscar cliente ou serviço..."
              className="w-44 rounded-lg border border-gray-200 py-2 pr-3 pl-8 text-sm text-gray-900 outline-none placeholder:text-gray-400 focus-visible:border-pink-600 focus-visible:ring-2 focus-visible:ring-pink-100 sm:w-56"
            />
          </div>
          {/* As duas datas e o "até" quebram como um bloco só: soltos, o "até"
              ficava órfão no fim da linha em telas médias. */}
          <div className="flex items-center gap-2">
            <input
              type="date"
              aria-label="De"
              value={dateFrom}
              onChange={(event) => {
                setDateFrom(event.target.value);
                setPage(1);
              }}
              className="min-w-0 flex-1 rounded-lg border border-gray-200 py-2 px-2.5 text-sm text-gray-700 outline-none focus-visible:border-pink-600 focus-visible:ring-2 focus-visible:ring-pink-100"
            />
            <span className="shrink-0 text-sm text-gray-400">até</span>
            <input
              type="date"
              aria-label="Até"
              value={dateTo}
              onChange={(event) => {
                setDateTo(event.target.value);
                setPage(1);
              }}
              className="min-w-0 flex-1 rounded-lg border border-gray-200 py-2 px-2.5 text-sm text-gray-700 outline-none focus-visible:border-pink-600 focus-visible:ring-2 focus-visible:ring-pink-100"
            />
          </div>
        </div>
      </div>

      {loadStatus === "loading" && <p className="mt-4 text-sm text-gray-500">Carregando...</p>}

      {loadStatus === "error" && (
        <p role="alert" className="mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          Não foi possível carregar os atendimentos agora. Tente novamente em instantes.
        </p>
      )}

      {loadStatus === "success" && items.length === 0 && (
        <p className="mt-4 rounded-lg border border-dashed border-gray-200 p-8 text-center text-sm text-gray-500">
          {hasFilters
            ? "Nenhum atendimento encontrado para esse filtro."
            : "Nenhum atendimento registrado ainda."}
        </p>
      )}

      {loadStatus === "success" && items.length > 0 && (
        <>
          <ul className="mt-4 space-y-3 lg:hidden">
            {items.map((item) => (
              <li key={item.id} className="rounded-lg border border-gray-200 p-4">
                <div className="flex items-center gap-3">
                  <Avatar name={item.client.fullName} avatarUrl={item.client.avatarUrl} size={36} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-gray-900">{item.client.fullName}</p>
                    <p className="truncate text-xs text-gray-500">
                      {formatDateOnly(item.scheduledAt)} · {formatTime(item.scheduledAt)}
                    </p>
                  </div>
                  <p className="shrink-0 text-sm font-semibold text-gray-900">{formatBRL(item.price)}</p>
                </div>
                <div className="mt-2 flex items-center justify-between gap-2 text-xs text-gray-500">
                  <span className="truncate">{formatServiceNames(item.services)}</span>
                  <span className="shrink-0">{item.employee?.fullName ?? "Sem profissional"}</span>
                </div>
                <div className="mt-2 flex items-center justify-between gap-2">
                  <StatusPill status={item.status} />
                  <div className="flex items-center gap-1">
                    <PaymentCell {...paymentCellProps(item)} />
                    {rowMenu(item)}
                  </div>
                </div>
              </li>
            ))}
          </ul>

          <div className="mt-4 hidden overflow-x-auto lg:block">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="text-xs font-semibold tracking-wide text-gray-400 uppercase">
                  <th className="pb-3 font-semibold">Data</th>
                  <th className="pb-3 font-semibold">Cliente</th>
                  <th className="pb-3 font-semibold">Serviço</th>
                  <th className="pb-3 font-semibold">Profissional</th>
                  <th className="pb-3 font-semibold">Situação</th>
                  <th className="pb-3 font-semibold">Pagamento</th>
                  <th className="pb-3 font-semibold">Valor</th>
                  <th className="pb-3">
                    <span className="sr-only">Ações</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {items.map((item) => (
                  <tr key={item.id}>
                    <td className="py-4 pr-4 align-middle whitespace-nowrap text-gray-600">
                      {formatDateOnly(item.scheduledAt)} · {formatTime(item.scheduledAt)}
                    </td>
                    <td className="py-4 pr-4 align-middle">
                      <div className="flex items-center gap-3">
                        <Avatar name={item.client.fullName} avatarUrl={item.client.avatarUrl} size={32} />
                        <p className="font-semibold whitespace-nowrap text-gray-900">{item.client.fullName}</p>
                      </div>
                    </td>
                    <td className="py-4 pr-4 align-middle text-gray-600">{formatServiceNames(item.services)}</td>
                    <td className="py-4 pr-4 align-middle text-gray-600">{item.employee?.fullName ?? "Sem profissional"}</td>
                    <td className="py-4 pr-4 align-middle">
                      <StatusPill status={item.status} />
                    </td>
                    <td className="py-4 pr-4 align-middle">
                      <PaymentCell {...paymentCellProps(item)} />
                    </td>
                    <td className="py-4 pr-4 align-middle font-semibold whitespace-nowrap text-gray-900">
                      {formatBRL(item.price)}
                    </td>
                    <td className="py-4 align-middle text-right">{rowMenu(item)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {pagination && pagination.totalPages > 1 && (
            <div className="mt-4 flex items-center justify-between">
              <p className="text-xs text-gray-400">
                Página {pagination.page} de {pagination.totalPages} · {pagination.total} atendimentos
              </p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                  disabled={pagination.page <= 1}
                  aria-label="Página anterior"
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <FiChevronLeft size={16} aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={() => setPage((prev) => Math.min(pagination.totalPages, prev + 1))}
                  disabled={pagination.page >= pagination.totalPages}
                  aria-label="Próxima página"
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <FiChevronRight size={16} aria-hidden="true" />
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Excluir é para erro de lançamento: o texto diz o que acontece com o
          dinheiro, porque excluir um atendimento pago mexe no caixa. */}
      <ConfirmationModal
        open={Boolean(deleteTarget)}
        title="Excluir este agendamento?"
        description={
          deleteTarget
            ? `${formatServiceNames(deleteTarget.services)} de ${deleteTarget.client.fullName} em ${formatDateOnly(deleteTarget.scheduledAt)}. Ele sai das listas e do caixa, e não dá para desfazer. Para um atendimento que a cliente desmarcou, use cancelar em vez de excluir.`
            : ""
        }
        confirmLabel="Sim, excluir"
        cancelLabel="Voltar"
        isLoading={isDeleting}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      {/* Cancelar mantém o agendamento no histórico, marcado como cancelado:
          é o registro de que o horário existiu e foi desmarcado. */}
      <ConfirmationModal
        open={Boolean(cancelTarget)}
        title="Cancelar este agendamento?"
        description={
          cancelTarget
            ? `${formatServiceNames(cancelTarget.services)} de ${cancelTarget.client.fullName} em ${formatDateOnly(cancelTarget.scheduledAt)}. O horário fica livre para outra cliente e o agendamento continua no histórico como cancelado.`
            : ""
        }
        confirmLabel="Sim, cancelar"
        cancelLabel="Voltar"
        isLoading={isCancelling}
        onConfirm={confirmCancel}
        onCancel={() => setCancelTarget(null)}
      />
    </div>
  );
}
