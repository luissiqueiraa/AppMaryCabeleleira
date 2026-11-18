import { useEffect, useState } from "react";
import { getHomeContent } from "../../features/institutional/services/publicService";

// Nome e telefone do salão, das configurações. A busca é feita uma vez e
// compartilhada: uma lista com vários cards de estorno não dispara uma
// requisição por card. Se falhar, a próxima tela tenta de novo.
let cached = null;
let pending = null;

function loadSalon() {
  if (cached) return Promise.resolve(cached);
  if (!pending) {
    pending = getHomeContent()
      .then(({ data }) => {
        cached = { name: data?.salon?.name ?? null, phone: data?.salon?.phone ?? null };
        return cached;
      })
      .finally(() => {
        pending = null;
      });
  }
  return pending;
}

export function useSalonContact() {
  const [salon, setSalon] = useState(cached);

  useEffect(() => {
    if (cached) return undefined;
    let isMounted = true;
    loadSalon()
      .then((value) => {
        if (isMounted) setSalon(value);
      })
      .catch(() => {});
    return () => {
      isMounted = false;
    };
  }, []);

  return salon;
}
