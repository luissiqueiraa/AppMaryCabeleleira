import { NavLink } from "react-router-dom";

export default function SidebarNavList({ items, collapsed = false, onNavigate, className = "" }) {
  return (
    <nav aria-label="Navegação principal" className={className}>
      {items.map((item) =>
        item.section ? (
          <p
            key={item.section}
            className={`px-3 pt-4 pb-1 text-[11px] font-semibold tracking-wide text-gray-400 uppercase first:pt-0 ${
              collapsed ? "sr-only" : ""
            }`}
          >
            {item.section}
          </p>
        ) : (
          <NavLink
            key={item.to}
            to={item.to}
            end
            onClick={onNavigate}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-pink-50 text-pink-600"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`
            }
            title={collapsed ? item.label : undefined}
          >
            <item.icon size={18} aria-hidden="true" />
            {!collapsed && item.label}
          </NavLink>
        )
      )}
    </nav>
  );
}
