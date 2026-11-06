import { useOutletContext } from "react-router-dom";

// Nome e contato do salão vêm das configurações (o PublicLayout já carregou),
// com texto neutro enquanto não carregou ou se faltar cadastro. Em arquivo
// próprio porque o lint exige que um módulo de componente só exporte
// componentes.
export function useSalonIdentity() {
  const salon = useOutletContext()?.salon;

  return {
    nome: salon?.name ?? "o salão",
    email: salon?.email ?? null,
    telefone: salon?.phone ?? null,
    endereco: salon?.address ?? null,
  };
}
