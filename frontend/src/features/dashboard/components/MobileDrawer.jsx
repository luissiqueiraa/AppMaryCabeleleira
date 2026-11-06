import { Link } from "react-router-dom";
import { FiX, FiLogOut, FiShield, FiArrowLeft } from "react-icons/fi";
import SidebarNavList from "./SidebarNavList";
import { clientNavItems } from "../data/sidebarNav";

export default function MobileDrawer({
  open,
  onClose,
  onLogout,
  navItems = clientNavItems,
  isAdmin = false,
  canSeeAdmin = false,
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-40 md:hidden">
      <button
        type="button"
        aria-label="Fechar menu"
        onClick={onClose}
        className="absolute inset-0 bg-black/30"
      />

      <div className="absolute inset-y-0 left-0 flex w-72 flex-col overflow-y-auto bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-gray-100 p-5">
          <div className="flex items-center gap-2">
            <img src="/Mary_Cabelereira.png" alt="Logo" className="h-12 w-13" />
            <p className="font-display text-sm font-semibold text-gray-900 italic">MaryCabeleleira</p>
          </div>
          <button type="button" aria-label="Fechar menu" onClick={onClose} className="text-gray-500">
            <FiX size={20} aria-hidden="true" />
          </button>
        </div>

        <SidebarNavList items={navItems} onNavigate={onClose} className="flex-1 space-y-1 p-3" />

        {canSeeAdmin && (
          <div className="border-t border-gray-100 p-3">
            <Link
              to={isAdmin ? "/dashboard" : "/admin"}
              onClick={onClose}
              className="flex w-full items-center justify-center gap-2 rounded-md border border-gray-200 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
            >
              {isAdmin ? (
                <>
                  <FiArrowLeft size={16} aria-hidden="true" />
                  Voltar para minha conta
                </>
              ) : (
                <>
                  <FiShield size={16} aria-hidden="true" />
                  Acessar Painel Admin
                </>
              )}
            </Link>
          </div>
        )}

        <div className="border-t border-gray-100 p-3">
          <button
            type="button"
            onClick={onLogout}
            className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50"
          >
            <FiLogOut size={18} aria-hidden="true" />
            Sair
          </button>
        </div>
      </div>
    </div>
  );
}
