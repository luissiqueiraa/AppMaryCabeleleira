import { Link } from "react-router-dom";
import { FiChevronLeft, FiX } from "react-icons/fi";
import StepProgress from "./StepProgress";

const STEP_TITLES = {
  1: "Escolha um serviço",
  2: "Escolha quem irá te atender",
  3: "Escolha data e horário",
  4: "Confirme seu agendamento",
};

export default function BookingHeader({ step, totalSteps, onBack }) {
  return (
    <div className="border-b border-gray-100 px-4 py-4 lg:hidden">
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          aria-label="Voltar"
          className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 text-gray-600 hover:bg-gray-50"
        >
          <FiChevronLeft size={18} aria-hidden="true" />
        </button>

        <Link
          to="/dashboard"
          aria-label="Fechar e voltar para a página principal"
          className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 text-gray-600 hover:bg-gray-50"
        >
          <FiX size={18} aria-hidden="true" />
        </Link>
      </div>

      <p className="mt-3 text-xs font-semibold tracking-[0.15em] text-gray-400 uppercase">
        Etapa {step} de {totalSteps}
      </p>
      <h1 className="font-display text-lg font-semibold text-gray-900">{STEP_TITLES[step]}</h1>
      <StepProgress step={step} totalSteps={totalSteps} />
    </div>
  );
}
