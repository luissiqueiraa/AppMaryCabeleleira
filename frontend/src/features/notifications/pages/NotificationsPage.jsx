import { Link } from "react-router-dom";
import { FiCheckCircle, FiClock, FiInfo, FiChevronLeft } from "react-icons/fi";
import { notifications } from "../data/mockNotifications";

const ICONS = { confirmation: FiCheckCircle, reminder: FiClock, update: FiInfo };

export default function NotificationsPage() {
  return (
    <div className="mx-auto max-w-2xl">
      <Link to="/profile" className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-gray-700">
        <FiChevronLeft aria-hidden="true" />
        Voltar ao perfil
      </Link>

      {notifications.length === 0 ? (
        <p className="mt-4 rounded-lg border border-dashed border-gray-200 bg-white p-8 text-center text-sm text-gray-500">
          Você não tem notificações por aqui.
        </p>
      ) : (
        <ul className="mt-4 space-y-3">
          {notifications.map((notification) => {
            const Icon = ICONS[notification.type] ?? FiInfo;
            return (
              <li
                key={notification.id}
                className={`flex items-start gap-3 rounded-lg border p-4 shadow-sm ${
                  notification.read ? "border-gray-200 bg-white" : "border-pink-200 bg-pink-50/40"
                }`}
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-pink-50 text-pink-500">
                  <Icon aria-hidden="true" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-gray-900">{notification.title}</p>
                  <p className="mt-0.5 text-sm text-gray-500">{notification.description}</p>
                  <p className="mt-1 text-xs text-gray-400">{notification.date}</p>
                </div>
                {!notification.read && (
                  <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-pink-500" aria-hidden="true" />
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
