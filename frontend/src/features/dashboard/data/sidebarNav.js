import {
  FiHome,
  FiCalendar,
  FiClock,
  FiUser,
  FiUsers,
  FiScissors,
  FiSettings,
  FiShield,
} from "react-icons/fi";

export const clientNavItems = [
  { label: "Início", to: "/dashboard", icon: FiHome },
  { label: "Agendamentos", to: "/appointments", icon: FiCalendar },
  { label: "Histórico", to: "/service-history", icon: FiClock },
  { label: "Perfil", to: "/profile", icon: FiUser },
];

const adminNavItemsAll = [
  { label: "Dashboard", to: "/admin", icon: FiHome },
  { label: "Agenda do salão", to: "/admin/appointments", icon: FiCalendar },
  { label: "Funcionárias", to: "/admin/employees", icon: FiUsers, ownerOnly: true },
  { label: "Serviços", to: "/admin/services", icon: FiScissors },
  { label: "Clientes", to: "/admin/clients", icon: FiUser },
  { label: "Configurações", to: "/admin/settings", icon: FiSettings, ownerOnly: true },
];

export const bottomNav = [
  { label: "Início", to: "/dashboard", icon: FiHome },
  { label: "Agenda", to: "/appointments", icon: FiCalendar },
  { label: "Histórico", to: "/service-history", icon: FiClock },
  { label: "Perfil", to: "/profile", icon: FiUser },
  { label: "Admin", to: "/admin", icon: FiShield, scope: "admin" },
];

// "Funcionárias"/"Configurações" são owner/admin só — ver PrivateRoute em
// app/routes/AppRoutes.jsx (funcionária não acessa essas duas rotas).
export function getAdminNavItems({ canManageStaff }) {
  return adminNavItemsAll.filter((item) => !item.ownerOnly || canManageStaff);
}

export function getBottomNav({ canSeeAdmin }) {
  return bottomNav.filter((item) => item.scope !== "admin" || canSeeAdmin);
}
