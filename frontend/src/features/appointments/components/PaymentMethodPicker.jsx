import { FiCheck, FiCreditCard, FiDollarSign } from "react-icons/fi";
import { FaPix } from "react-icons/fa6";


// Pix e cartão cobram antes e só então reservam o horário; no salão o horário
// é reservado na hora e o pagamento acontece depois do atendimento. A cliente
// precisa saber dessa diferença antes de escolher.
const METHODS = [
  {
    id: "pix",
    label: "Pix",
    icon: FaPix,
    online: true,
  },
  {
    id: "card",
    label: "Cartão",
    icon: FiCreditCard,
    online: true,
  },
  {
    id: "on_site",
    label: "Pagar no salão",
    icon: FiDollarSign,
    online: false,
  },
];

export default function PaymentMethodPicker({ value, onChange, onlinePaymentsEnabled = false }) {
  return (
    <fieldset>
      <legend className="text-sm font-medium text-gray-700">Como você quer pagar?</legend>

      <div className="mt-2 space-y-2">
        {METHODS.map((method) => {
          const Icon = method.icon;
          const isDisabled = method.online && !onlinePaymentsEnabled;
          const isSelected = value === method.id;

          return (
            <button
              key={method.id}
              type="button"
              onClick={() => onChange(method.id)}
              disabled={isDisabled}
              aria-pressed={isSelected}
              className={`flex w-full items-center gap-3 rounded-lg border p-3 text-left transition-colors ${
                isSelected
                  ? "border-pink-500 bg-pink-50/60 ring-1 ring-pink-200"
                  : "border-gray-200 hover:border-gray-300"
              } ${isDisabled ? "cursor-not-allowed opacity-50" : ""}`}
            >
              <span
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
                  isSelected ? "bg-pink-600 text-white" : "bg-gray-100 text-gray-500"
                }`}
                aria-hidden="true"
              >
                <Icon size={16} />
              </span>

              <span className="min-w-0 flex-1">
                <span className="block text-sm font-semibold text-gray-900">{method.label}</span>
                <span className="block text-xs text-gray-500">
                  {isDisabled ? "Pagamento online indisponível no momento." : method.description}
                </span>
              </span>

              <span
                className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${
                  isSelected ? "border-pink-600 bg-pink-600 text-white" : "border-gray-300"
                }`}
                aria-hidden="true"
              >
                {isSelected && <FiCheck size={12} />}
              </span>
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
