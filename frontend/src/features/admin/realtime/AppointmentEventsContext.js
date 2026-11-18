import { createContext, useContext, useEffect, useRef } from "react";

// Quem quer saber de mudanças de agendamento se inscreve aqui; a conexão em si
// é uma só, aberta pelo StaffLiveUpdates para todas as telas da equipe.
export const AppointmentEventsContext = createContext(null);

// Chama onChange (com a lista de mudanças agrupadas) sempre que algum
// agendamento mudar — inclusive depois de a conexão cair e voltar, com lista
// vazia, porque algo pode ter mudado no intervalo. Fora do provider, não faz nada.
export function useAppointmentChanges(onChange) {
  const subscribe = useContext(AppointmentEventsContext);
  const handlerRef = useRef(onChange);

  useEffect(() => {
    handlerRef.current = onChange;
  });

  useEffect(() => {
    if (!subscribe) return undefined;
    return subscribe((changes) => handlerRef.current(changes));
  }, [subscribe]);
}
