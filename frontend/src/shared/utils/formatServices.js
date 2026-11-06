// Um agendamento pode ter vários procedimentos. Onde a tela tem espaço para
// uma linha só (tabelas, cards, títulos), eles aparecem assim: "Corte + Escova".
export function formatServiceNames(services = []) {
  return services.map((service) => service.name).join(" + ");
}
