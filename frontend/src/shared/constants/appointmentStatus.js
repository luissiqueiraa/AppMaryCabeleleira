// Fonte única dos rótulos e cores de situação do agendamento. Antes existiam
// dois mapas (StatusBadge e o histórico do painel) que podiam divergir — e
// divergiram: o mesmo "Finalizado" aparecia roxo num lugar e em outro lugar
// nem aparecia.
//
// A cor segue o que a situação significa, não a paleta da marca:
//   azul    = está por vir (agendado)
//   verde   = deu certo, acabou (finalizado)
//   âmbar   = precisa de alguém (aguardando confirmação)
//   vermelho = não vai acontecer (cancelado)
export const APPOINTMENT_STATUS = {
  pending: { label: "Aguardando confirmação", className: "bg-amber-50 text-amber-700" },
  confirmed: { label: "Agendado", className: "bg-blue-50 text-blue-700" },
  completed: { label: "Finalizado", className: "bg-emerald-50 text-emerald-700" },
  cancelled: { label: "Cancelado", className: "bg-red-50 text-red-600" },
};
