import { useEffect, useState } from "react";
import { getHomeContent } from "../services/publicService";

// A home é vitrine: se a API falhar, ela não pode ficar em branco. Por isso o
// estado de erro devolve listas vazias e cada seção decide o que mostrar no
// lugar — o texto fixo de apoio continua lá.
export function useHomeContent() {
  const [content, setContent] = useState({ salon: null, services: [], professionals: [] });
  const [loadStatus, setLoadStatus] = useState("loading");

  useEffect(() => {
    let isMounted = true;
    getHomeContent()
      .then(({ data }) => {
        if (!isMounted) return;
        setContent({
          salon: data.salon ?? null,
          services: data.services ?? [],
          professionals: data.professionals ?? [],
        });
        setLoadStatus("success");
      })
      .catch(() => {
        if (isMounted) setLoadStatus("error");
      });
    return () => {
      isMounted = false;
    };
  }, []);

  return { ...content, loadStatus };
}
