import { NavLink } from "react-router-dom";
import { FiPlus } from "react-icons/fi";
import { bottomNav } from "../data/sidebarNav";

export default function BottomNav({ items = bottomNav }) {
  const [first, second, ...rest] = items;

  return (
    <nav
      aria-label="Navegação inferior"
      className="fixed inset-x-0 bottom-0 z-30 border-t border-gray-100 bg-white/95 backdrop-blur-sm lg:hidden"
    >
      <ul className="flex items-center justify-between px-4 py-2">
        <NavItem item={first} />
        <NavItem item={second} />

        <li>
          <NavLink
            to="/appointments/new"
            aria-label="Novo agendamento"
            className="flex h-12 w-12 -translate-y-3 items-center justify-center rounded-full bg-pink-600 text-white shadow-lg shadow-pink-600/30 hover:bg-pink-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pink-600"
          >
            <FiPlus size={22} aria-hidden="true" />
          </NavLink>
        </li>

        {rest.map((item) => (
          <NavItem key={item.to} item={item} />
        ))}
      </ul>
    </nav>
  );
}

function NavItem({ item }) {
  const Icon = item.icon;
  return (
    <li>
      <NavLink
        to={item.to}
        end
        className={({ isActive }) =>
          `flex flex-col items-center gap-1 px-2 py-1 text-xs font-medium ${
            isActive ? "text-pink-600" : "text-gray-400"
          }`
        }
      >
        <Icon size={20} aria-hidden="true" />
        {item.label}
      </NavLink>
    </li>
  );
}
