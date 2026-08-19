import { FiChevronLeft, FiChevronRight, FiLogOut } from "react-icons/fi";
import SidebarNavList from "./SidebarNavList";
import { sidebarNav } from "../data/sidebarNav";

export default function Sidebar({ collapsed, onToggle, onLogout, navItems = sidebarNav }) {
  return (
    <aside
      className={`hidden h-screen flex-col border-r border-gray-200 bg-white transition-all duration-200 lg:flex ${
        collapsed ? "w-20" : "w-64"
      }`}
    >
      <div className="flex items-center gap-2 border-b border-gray-100 p-5">
        <img src="/Mary_Cabelereira.jpeg" alt="Logo" className="h-12 w-13" />
        {!collapsed && (
          <p className="font-display text-md font-semibold text-gray-900 italic">MaryCabeleleira</p>
        )}
      </div>

      <SidebarNavList
        items={navItems}
        collapsed={collapsed}
        className="flex-1 space-y-1 overflow-y-auto p-3"
      />

      <div className="space-y-2 p-3">
        <button
          type="button"
          onClick={onLogout}
          className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900"
          title={collapsed ? "Sair" : undefined}
        >
          <FiLogOut size={18} aria-hidden="true" />
          {!collapsed && "Sair"}
        </button>

        <button
          type="button"
          onClick={onToggle}
          aria-label={collapsed ? "Expandir menu" : "Recolher menu"}
          className="flex w-full items-center justify-center rounded-md border border-gray-200 py-2 text-gray-500 hover:bg-gray-50"
        >
          {collapsed ? <FiChevronRight aria-hidden="true" /> : <FiChevronLeft aria-hidden="true" />}
        </button>
      </div>
    </aside>
  );
}
