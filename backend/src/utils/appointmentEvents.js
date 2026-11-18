import { EventEmitter } from "node:events";

// Canal interno de "um agendamento mudou". Quem altera agendamento publica;
// a rota GET /appointments/events repassa ao painel do admin por SSE, e a tela
// recarrega sozinha. Em memória: vale para uma instância do backend (o deploy
// atual). Com mais de uma, o canal precisaria passar pelo banco (LISTEN/NOTIFY)
// ou por um Redis, senão o painel ligado na instância A não vê o que a B fez.
const bus = new EventEmitter();
// Cada aba de admin aberta é um ouvinte; o limite padrão (10) só serve para
// detectar vazamento, e aqui muitos ouvintes é o uso normal.
bus.setMaxListeners(0);

export function publishAppointmentChange(event) {
  bus.emit("change", { ...event, at: new Date().toISOString() });
}

export function subscribeAppointmentChanges(listener) {
  bus.on("change", listener);
  return () => bus.off("change", listener);
}
