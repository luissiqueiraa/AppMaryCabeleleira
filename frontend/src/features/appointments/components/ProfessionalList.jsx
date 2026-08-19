import { HiSparkles } from "react-icons/hi2";
import { resolveAssetUrl } from "../../../shared/utils/assetUrl";
import { avatarColorFor } from "../../../shared/utils/avatarColor";

export const NO_PREFERENCE = "no-preference";

function ProfessionalAvatar({ professional, isSelected }) {
  const avatarUrl = professional.user.avatarUrl;
  const ringClass = isSelected ? "ring-2 ring-pink-600 ring-offset-2" : "";

  if (avatarUrl) {
    return (
      <img
        src={resolveAssetUrl(avatarUrl)}
        alt=""
        aria-hidden="true"
        className={`h-16 w-16 rounded-full object-cover ${ringClass}`}
      />
    );
  }

  const { from, to } = avatarColorFor(professional.id);
  return (
    <span
      className={`h-16 w-16 rounded-full ${ringClass}`}
      style={{ background: `linear-gradient(135deg, ${from}, ${to})` }}
      aria-hidden="true"
    />
  );
}

export default function ProfessionalList({ professionals, isLoading, selectedId, onSelect, selectedService, onEditService }) {
  return (
    <section aria-labelledby="professional-section-title">
      {selectedService && (
        <div className="flex items-center justify-between rounded-lg bg-pink-50 px-4 py-3">
          <p className="text-sm font-medium text-pink-700">
            {selectedService.name} · {selectedService.duration} min
          </p>
          <button
            type="button"
            onClick={onEditService}
            className="text-sm font-semibold text-pink-700 hover:underline"
          >
            Editar
          </button>
        </div>
      )}

      <h2 id="professional-section-title" className="font-display mt-6 text-lg font-semibold text-gray-900">
        Selecione o profissional
      </h2>

      {isLoading ? (
        <p className="mt-4 text-sm text-gray-500">Carregando profissionais...</p>
      ) : (
        <ul className="mt-4 flex gap-4 overflow-x-auto pb-1">
          <li className="shrink-0">
            <button
              type="button"
              onClick={() => onSelect(NO_PREFERENCE)}
              aria-pressed={selectedId === NO_PREFERENCE}
              className="flex w-20 flex-col items-center gap-2 text-center"
            >
              <span
                className={`flex h-16 w-16 items-center justify-center rounded-full bg-pink-50 text-pink-500 ${
                  selectedId === NO_PREFERENCE ? "ring-2 ring-pink-600 ring-offset-2" : ""
                }`}
              >
                <HiSparkles size={22} aria-hidden="true" />
              </span>
              <span
                className={`text-xs font-semibold ${
                  selectedId === NO_PREFERENCE ? "text-pink-600" : "text-gray-700"
                }`}
              >
                Sem preferência
              </span>
            </button>
          </li>

          {professionals.map((professional) => {
            const isSelected = professional.id === selectedId;
            return (
              <li key={professional.id} className="shrink-0">
                <button
                  type="button"
                  onClick={() => onSelect(professional.id)}
                  aria-pressed={isSelected}
                  className="flex w-20 flex-col items-center gap-2 text-center"
                >
                  <ProfessionalAvatar professional={professional} isSelected={isSelected} />
                  <span className={`text-xs font-semibold ${isSelected ? "text-pink-600" : "text-gray-700"}`}>
                    {professional.user.fullName.split(" ")[0]}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
