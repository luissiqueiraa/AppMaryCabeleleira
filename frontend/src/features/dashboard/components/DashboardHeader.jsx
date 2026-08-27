import { FiMenu } from "react-icons/fi";
import NotificationBell from "./NotificationBell";
import Avatar from "../../../shared/components/Avatar";

export default function DashboardHeader({
  title,
  mobileTitle,
  mobileAction,
  headerAction,
  user,
  onOpenMenu,
}) {
  return (
    <header className="sticky top-0 z-30 border-b border-gray-100 bg-white/95 backdrop-blur-sm">
      <div className="flex items-center gap-3 px-4 py-4 sm:px-6 lg:px-8">
        <button
          type="button"
          onClick={onOpenMenu}
          aria-label="Abrir menu"
          className="text-gray-500 lg:hidden"
        >
          <FiMenu size={22} aria-hidden="true" />
        </button>

        <div className="flex-1 lg:hidden">
          <h1 className="font-display text-xl font-semibold text-gray-900">{mobileTitle}</h1>
        </div>

        <div className="hidden flex-1 lg:block">
          <h1 className="font-display text-2xl font-semibold text-gray-900">{title}</h1>
        </div>

        <div className="ml-auto flex items-center gap-3">
          {mobileAction && <span className="lg:hidden">{mobileAction}</span>}

          <NotificationBell className={mobileAction ? "hidden lg:flex" : ""} />

          <div className="hidden lg:flex" aria-label={`Conta de ${user.name}`}>
            <Avatar name={user.name} avatarUrl={user.avatarUrl} size="md" />
          </div>

          {headerAction && <span className="hidden lg:block">{headerAction}</span>}
        </div>
      </div>
    </header>
  );
}
