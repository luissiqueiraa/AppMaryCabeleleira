import { useCallback, useEffect, useState } from "react";
import { listServiceCategories } from "../services/serviceCategoryService";

// As categorias eram uma lista fixa no código; agora vêm do banco, e mais de
// uma tela precisa delas (o formulário de serviço e o filtro da tabela). O
// hook centraliza a carga para não repetir o estado de erro em cada uma.
export function useServiceCategories() {
  const [categories, setCategories] = useState([]);
  const [loadStatus, setLoadStatus] = useState("loading");

  // Sem setState síncrono aqui: "loading" já é o estado inicial, e marcá-lo de
  // novo dentro do efeito dispara renderização em cascata. Numa recarga manual
  // a lista atual permanece na tela até a resposta chegar — evita o piscar.
  const reload = useCallback(
    () =>
      listServiceCategories()
        .then(({ data }) => {
          setCategories(data);
          setLoadStatus("success");
        })
        .catch(() => setLoadStatus("error")),
    []
  );

  useEffect(() => {
    reload();
  }, [reload]);

  return { categories, loadStatus, reload };
}
