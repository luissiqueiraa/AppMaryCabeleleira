import { useCallback, useEffect, useRef } from "react";
import { Outlet } from "react-router-dom";
import { AppointmentEventsContext } from "./AppointmentEventsContext";
import { subscribeToAppointmentEvents } from "../../../shared/services/appointmentEvents";
import { describeAppointmentChange } from "../../../shared/utils/describeAppointmentChange";
import { useAuth } from "../../../shared/contexts/useAuth";
import { useToast } from "../../../shared/contexts/useToast";

// Mudanças em sequência viram um recarregamento só.
const BATCH_MS = 300;
// Acima disso, um aviso resumido em vez de uma pilha de avisos.
const MAX_TOASTS = 3;

// Envolve as telas da equipe: abre UMA conexão de tempo real enquanto a pessoa
// estiver em qualquer página do painel, avisa quando outra pessoa (cliente ou
// colega) mexe num agendamento e repassa a mudança para a tela aberta
// recarregar. A ação da própria pessoa não gera aviso: o toast dela já veio.
export default function StaffLiveUpdates() {
  const { user } = useAuth();
  const toast = useToast();
  const listenersRef = useRef(new Set());
  const userIdRef = useRef(user?.id);
  const toastRef = useRef(toast);

  useEffect(() => {
    userIdRef.current = user?.id;
    toastRef.current = toast;
  });

  const subscribe = useCallback((listener) => {
    listenersRef.current.add(listener);
    return () => listenersRef.current.delete(listener);
  }, []);

  useEffect(() => {
    let pending = [];
    let timer = null;

    const flush = () => {
      const changes = pending;
      pending = [];
      listenersRef.current.forEach((listener) => listener(changes));

      const fromOthers = changes.filter((change) => change.actorId !== userIdRef.current);
      if (fromOthers.length > MAX_TOASTS) {
        toastRef.current.success(`${fromOthers.length} agendamentos foram atualizados.`);
        return;
      }
      fromOthers.forEach((change) => {
        const message = describeAppointmentChange(change);
        if (message) toastRef.current.success(message);
      });
    };

    const schedule = (change) => {
      if (change) pending.push(change);
      clearTimeout(timer);
      timer = setTimeout(flush, BATCH_MS);
    };

    const unsubscribe = subscribeToAppointmentEvents({
      onEvent: schedule,
      onReconnect: () => schedule(null),
    });
    return () => {
      clearTimeout(timer);
      unsubscribe();
    };
  }, []);

  return (
    <AppointmentEventsContext.Provider value={subscribe}>
      <Outlet />
    </AppointmentEventsContext.Provider>
  );
}
