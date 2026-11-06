// O horário de funcionamento é cadastrado dia a dia no painel, mas ninguém lê
// sete linhas num site. Aqui os dias seguidos com o mesmo horário viram uma
// faixa só: "Segunda – Sexta 09:00 – 19:00".
const ORDEM = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];
const NOMES = {
  mon: "Segunda",
  tue: "Terça",
  wed: "Quarta",
  thu: "Quinta",
  fri: "Sexta",
  sat: "Sábado",
  sun: "Domingo",
};

export function groupBusinessHours(hours = []) {
  const dias = ORDEM.map((id) => hours.find((day) => day.id === id)).filter(Boolean);
  const faixas = [];

  for (const dia of dias) {
    if (!dia.enabled || !dia.open || !dia.close) continue;
    const anterior = faixas.at(-1);
    const mesmoHorario = anterior && anterior.open === dia.open && anterior.close === dia.close;
    const diaSeguinte = anterior && ORDEM.indexOf(dia.id) === ORDEM.indexOf(anterior.lastId) + 1;

    if (mesmoHorario && diaSeguinte) {
      anterior.lastId = dia.id;
      anterior.label = `${NOMES[anterior.firstId]} – ${NOMES[dia.id]}`;
      continue;
    }

    faixas.push({
      firstId: dia.id,
      lastId: dia.id,
      label: NOMES[dia.id],
      open: dia.open,
      close: dia.close,
    });
  }

  return faixas.map(({ label, open, close }) => ({ label, range: `${open} – ${close}` }));
}
