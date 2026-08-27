import { Link } from "react-router-dom";
import { FiShield, FiArrowLeft } from "react-icons/fi";
import SidebarNavList from "./SidebarNavList";
import { clientNavItems } from "../data/sidebarNav";

export default function Sidebar({ onLogout, navItems = clientNavItems, isAdmin = false, canSeeAdmin = false }) {
  return (
    <aside className="hidden h-screen w-64 flex-col border-r border-gray-200 bg-white lg:flex">
      <div className="flex items-center gap-2 border-b border-gray-100 p-5">
        <img src="/Mary_Cabelereira.png" alt="Logo" className="h-12 w-13" />
        <p className="font-display text-md font-semibold text-gray-900 italic">MaryCabeleleira</p>
      </div>

      <SidebarNavList items={navItems} className="flex-1 space-y-1 overflow-y-auto p-3" />

      {canSeeAdmin && (
        <div className="p-3">
          <Link
            to={isAdmin ? "/dashboard" : "/admin"}
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

      <div className="p-3">
        <button
          type="button"
          onClick={onLogout}
          className="w-full py-2.5 text-center text-sm font-semibold text-red-600 hover:text-red-700"
        >
          Sair
        </button>
      </div>
    </aside>
  );
}
