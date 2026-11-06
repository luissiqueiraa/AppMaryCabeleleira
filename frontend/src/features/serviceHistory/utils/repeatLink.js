// "Repetir" repete de verdade: leva ao agendamento já com os mesmos serviços e
// a mesma profissional pré-selecionados. Antes abria o fluxo em branco e a
// cliente tinha de escolher tudo de novo.
export function repeatLink(item) {
  const params = new URLSearchParams();
  const servicos = (item.services ?? []).map((service) => service.id).filter(Boolean);
  if (servicos.length) params.set("servicos", servicos.join(","));
  if (item.employeeId) params.set("profissional", item.employeeId);

  const query = params.toString();
  return query ? `/appointments/new?${query}` : "/appointments/new";
}
