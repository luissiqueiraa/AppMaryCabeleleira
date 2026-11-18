// Link universal do Google Maps: no celular abre o app do Maps (se instalado),
// no computador abre o site. Busca pelo endereço em texto, que é o que o salão
// cadastra nas configurações — não temos latitude/longitude guardadas.
export function googleMapsUrl(address) {
  const query = address?.trim();
  if (!query) return null;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}
