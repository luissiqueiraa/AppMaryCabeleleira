import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { FiCheck, FiClock, FiAlertTriangle } from "react-icons/fi";
import { getPayment } from "../services/paymentService";
import { formatDateOnly, formatTime } from "../../../shared/utils/formatDate";

// Onde o Mercado Pago devolve a cliente depois do checkout de cartão. A
// resposta do checkout não decide nada: quem diz se o pagamento entrou é o
// nosso backend, que confirma com o provedor.
export default function PaymentReturnPage() {
  const { id } = useParams();
  const [payment, setPayment] = useState(null);
  const [loadStatus, setLoadStatus] = useState("loading");

  useEffect(() => {
    let isMounted = true;
    let intervalId;

    async function check() {
      try {
        const { data } = await getPayment(id);
        if (!isMounted) return;
        setPayment(data);
        setLoadStatus("success");
        // Aprovação por cartão pode levar alguns segundos: enquanto estiver
        // pendente, segue perguntando.
        if (data.status !== "pending" && intervalId) clearInterval(intervalId);
      } catch {
        if (isMounted) setLoadStatus("error");
      }
    }

    check();
    intervalId = setInterval(check, 4000);
    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, [id]);

  if (loadStatus === "loading") {
    return <p className="p-8 text-center text-sm text-gray-500">Verificando o pagamento...</p>;
  }

  if (loadStatus === "error" || !payment) {
    return (
      <div className="mx-auto max-w-md px-6 py-10 text-center">
        <p className="text-sm text-gray-500">Não encontramos esse pagamento.</p>
        <Link to="/appointments" className="mt-4 inline-block text-sm font-semibold text-pink-600 hover:underline">
          Ver meus agendamentos
        </Link>
      </div>
    );
  }

  const states = {
    paid: {
      icon: FiCheck,
      tone: "bg-pink-600 text-white",
      title: "Pagamento confirmado",
      description: `Seu horário está reservado para ${formatDateOnly(payment.scheduledAt)} às ${formatTime(payment.scheduledAt)}.`,
    },
    pending: {
      icon: FiClock,
      tone: "bg-amber-50 text-amber-600",
      title: "Aguardando a confirmação",
      description:
        "Assim que o pagamento for aprovado, o horário é reservado e você recebe o aviso. Pode deixar esta tela aberta.",
    },
    expired: {
      icon: FiAlertTriangle,
      tone: "bg-amber-50 text-amber-600",
      title: "O prazo do pagamento terminou",
      description: "Nenhum valor foi cobrado. Você pode escolher o horário novamente.",
    },
    failed: {
      icon: FiAlertTriangle,
      tone: "bg-red-50 text-red-600",
      title:
        payment.failureReason === "slot_taken"
          ? "O horário não está mais disponível"
          : "O pagamento não foi concluído",
      description:
        payment.failureReason === "slot_taken"
          ? "Recebemos seu pagamento, mas outra cliente ficou com o horário antes da confirmação. O salão vai entrar em contato para devolver o valor ou remarcar."
          : "Nenhum valor foi cobrado. Você pode tentar de novo escolhendo o horário.",
    },
  };

  const state = states[payment.status] ?? states.pending;
  const Icon = state.icon;

  return (
    <div className="mx-auto flex max-w-md flex-col items-center px-6 py-12 text-center">
      <span className={`flex h-16 w-16 items-center justify-center rounded-full ${state.tone}`}>
        <Icon size={26} aria-hidden="true" />
      </span>

      <h1 className="font-display mt-6 text-2xl font-semibold text-gray-900">{state.title}</h1>
      <p className="mt-2 text-sm text-gray-500">{state.description}</p>

      {payment.status === "paid" ? (
        <Link
          to={payment.appointmentId ? `/appointments/${payment.appointmentId}` : "/appointments"}
          className="mt-6 w-full rounded-lg bg-pink-600 py-3 text-sm font-semibold text-white hover:bg-pink-700"
        >
          Ver meu agendamento
        </Link>
      ) : (
        <Link
          to="/appointments/new"
          className="mt-6 w-full rounded-lg border border-pink-600 py-3 text-sm font-semibold text-pink-600 hover:bg-pink-50"
        >
          Escolher outro horário
        </Link>
      )}

      <Link to="/dashboard" className="mt-4 text-sm font-medium text-gray-500 hover:text-gray-700">
        Voltar para o início
      </Link>
    </div>
  );
}
