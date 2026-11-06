import { useEffect, useRef, useState } from "react";

// A frase precisa bater exatamente com a que o backend cobra
// (RESET_CONFIRMATION_PHRASE em settings.service.js).
const CONFIRMATION_PHRASE = "APAGAR TUDO";

// Montado só enquanto aberto (quem controla isso é o DangerZoneCard): assim a
// frase digitada não fica guardada esperando o próximo clique.
export default function SystemResetModal({ isLoading, error, onConfirm, onCancel }) {
  const dialogRef = useRef(null);
  const [confirmation, setConfirmation] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    dialogRef.current?.focus();
  }, []);

  const canConfirm = confirmation === CONFIRMATION_PHRASE && password.length > 0 && !isLoading;

  function handleSubmit(event) {
    event.preventDefault();
    if (canConfirm) onConfirm({ confirmation, password });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button type="button" aria-label="Fechar" onClick={onCancel} className="absolute inset-0 bg-black/40" />

      <form
        ref={dialogRef}
        onSubmit={handleSubmit}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="reset-title"
        aria-describedby="reset-description"
        tabIndex={-1}
        className="relative w-full max-w-md rounded-lg bg-white p-6 shadow-xl outline-none"
      >
        <h2 id="reset-title" className="font-display text-lg font-semibold text-gray-900">
          Apagar tudo e restaurar o padrão?
        </h2>
        <p id="reset-description" className="mt-2 text-sm text-gray-500">
          Todos os agendamentos, serviços, clientes e funcionárias serão apagados para sempre.
          Continuam apenas a sua conta e a da proprietária. Essa ação não pode ser desfeita.
        </p>

        <div className="mt-5">
          <label htmlFor="reset-confirmation" className="text-sm font-medium text-gray-700">
            Digite <span className="font-semibold text-red-600">{CONFIRMATION_PHRASE}</span> para
            confirmar
          </label>
          <input
            id="reset-confirmation"
            type="text"
            value={confirmation}
            onChange={(event) => setConfirmation(event.target.value)}
            autoComplete="off"
            className="mt-1.5 w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm text-gray-900 outline-none placeholder:text-gray-400 focus-visible:border-red-500 focus-visible:ring-2 focus-visible:ring-red-100"
            placeholder={CONFIRMATION_PHRASE}
          />
        </div>

        <div className="mt-4">
          <label htmlFor="reset-password" className="text-sm font-medium text-gray-700">
            Sua senha atual
          </label>
          <input
            id="reset-password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="current-password"
            className="mt-1.5 w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm text-gray-900 outline-none focus-visible:border-red-500 focus-visible:ring-2 focus-visible:ring-red-100"
          />
        </div>

        {error && (
          <p role="alert" className="mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        )}

        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 rounded-lg border border-gray-200 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={!canConfirm}
            className="flex-1 rounded-lg bg-red-600 py-2.5 text-sm font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoading ? "Apagando..." : "Apagar tudo"}
          </button>
        </div>
      </form>
    </div>
  );
}
