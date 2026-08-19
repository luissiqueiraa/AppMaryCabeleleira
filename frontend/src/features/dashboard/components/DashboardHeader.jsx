import { FiBell, FiMenu, FiUser } from "react-icons/fi";

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

          <button
            type="button"
            aria-label="Notificações"
            className={`relative flex h-10 w-10 items-center justify-center text-gray-500 hover:text-gray-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pink-600 ${
              mobileAction ? "hidden lg:flex" : ""
            }`}
          >
            <FiBell size={18} aria-hidden="true" />
            <span className="absolute top-2 right-2.5 h-1.5 w-1.5 rounded-full bg-pink-500" aria-hidden="true" />
          </button>

          <div
            className="hidden h-10 w-10 items-center justify-center rounded-full border border-gray-200 text-gray-500 lg:flex"
            aria-label={`Conta de ${user.name}`}
          >
            <FiUser size={18} aria-hidden="true" />
          </div>

          {headerAction && <span className="hidden lg:block">{headerAction}</span>}
        </div>
      </div>
    </header>
  );
}
