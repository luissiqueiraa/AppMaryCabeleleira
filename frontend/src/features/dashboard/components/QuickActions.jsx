import { Link } from "react-router-dom";
import { HiSparkles } from "react-icons/hi2";
import { FiScissors, FiMapPin } from "react-icons/fi";
import { quickActions } from "../data/mockDashboard";

const ICONS = { sparkle: HiSparkles, scissors: FiScissors, pin: FiMapPin };

export default function QuickActions() {
  return (
    <ul className="grid grid-cols-3 gap-3">
      {quickActions.map((action) => {
        const Icon = ICONS[action.icon];
        return (
          <li key={action.id}>
            <Link
              to={action.to}
              className="flex flex-col items-center gap-2 rounded-lg border border-gray-200 bg-white py-4 text-center shadow-sm transition-colors hover:bg-gray-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pink-600"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-pink-50 text-pink-500">
                <Icon aria-hidden="true" />
              </span>
              <span className="text-xs font-medium text-gray-700">{action.label}</span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
