import { Link } from "react-router-dom";
import { FiScissors, FiMapPin, FiCalendar } from "react-icons/fi";
import { quickActions } from "../data/mockDashboard";
import { useHomeContent } from "../../institutional/hooks/useHomeContent";
import { googleMapsUrl } from "../../../shared/utils/googleMaps";

const ICONS = { calendar: FiCalendar, scissors: FiScissors, pin: FiMapPin };

const CARD_CLASS =
  "flex flex-col items-center gap-2 rounded-lg border border-gray-200 bg-white py-4 text-center shadow-sm transition-colors hover:bg-gray-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pink-600";

export default function QuickActions() {
  // O endereço vem das configurações do salão. O card "Salão" abre o Google
  // Maps nele; sem endereço cadastrado, cai no site do salão como antes.
  const { salon } = useHomeContent();
  const mapsUrl = googleMapsUrl(salon?.address);

  return (
    <ul className="grid grid-cols-3 gap-3">
      {quickActions.map((action) => {
        const Icon = ICONS[action.icon];
        const content = (
          <>
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-pink-50 text-pink-500">
              <Icon aria-hidden="true" />
            </span>
            <span className="text-xs font-medium text-gray-700">{action.label}</span>
          </>
        );
        return (
          <li key={action.id}>
            {action.id === "salon" && mapsUrl ? (
              <a
                href={mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Ver o salão no Google Maps"
                className={CARD_CLASS}
              >
                {content}
              </a>
            ) : (
              <Link to={action.to} className={CARD_CLASS}>
                {content}
              </Link>
            )}
          </li>
        );
      })}
    </ul>
  );
}
