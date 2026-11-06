import { NavLink } from "react-router-dom";
import { bottomNav } from "../data/sidebarNav";

// Só existe enquanto não há sidebar: a partir de md a navegação passa a ser a
// barra lateral fixa, e manter as duas seria navegação duplicada.
export default function BottomNav({ items = bottomNav }) {
  return (
    <nav
      aria-label="Navegação inferior"
      className="fixed inset-x-0 bottom-0 z-30 border-t border-gray-100 bg-white/95 backdrop-blur-sm md:hidden"
    >
      <ul className="flex items-center justify-between px-1 py-2">
        {items.map((item) => (
          <NavItem key={item.to} item={item} />
        ))}
      </ul>
    </nav>
  );
}

function NavItem({ item }) {
  const Icon = item.icon;
  return (
    <li className="min-w-0 flex-1">
      <NavLink
        to={item.to}
        end
        className={({ isActive }) =>
          `flex flex-col items-center gap-1 px-1 py-1 text-[11px] font-medium ${
            isActive ? "text-pink-600" : "text-gray-400"
          }`
        }
      >
        <Icon size={20} aria-hidden="true" />
        <span className="max-w-full truncate">{item.label}</span>
      </NavLink>
    </li>
  );
}
