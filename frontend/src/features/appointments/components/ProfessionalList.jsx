import Avatar from "../../../shared/components/Avatar";

function ProfessionalAvatar({ professional, isSelected }) {
  const ringClass = isSelected ? "ring-2 ring-pink-600 ring-offset-2" : "";
  return (
    <span className={`inline-flex rounded-full ${ringClass}`}>
      <Avatar name={professional.user.fullName} avatarUrl={professional.user.avatarUrl} size="lg" />
    </span>
  );
}

export default function ProfessionalList({
  professionals,
  isLoading,
  selectedId,
  onSelect,
  selectedServices = [],
  totalDuration = 0,
  onEditService,
}) {
  return (
    <section aria-labelledby="professional-section-title">
      {selectedServices.length > 0 && (
        <div className="flex items-center justify-between gap-3 rounded-lg bg-pink-50 px-4 py-3">
          <p className="min-w-0 text-sm font-medium text-pink-700">
            {selectedServices.map((service) => service.name).join(" + ")} · {totalDuration} min
          </p>
          <button
            type="button"
            onClick={onEditService}
            className="shrink-0 text-sm font-semibold text-pink-700 hover:underline"
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
        <ul className="mt-4 flex flex-wrap gap-4">
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
