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

export const sidebarNav = [
  { section: "Minha conta" },
  { label: "Início", to: "/dashboard", icon: FiHome },
  { label: "Agendamentos", to: "/appointments", icon: FiCalendar },
  { label: "Histórico", to: "/service-history", icon: FiClock },
  { label: "Perfil", to: "/profile", icon: FiUser },
  { section: "Painel admin" },
  { label: "Dashboard", to: "/admin", icon: FiHome },
  { label: "Agenda do salão", to: "/admin/appointments", icon: FiCalendar },
  { label: "Funcionárias", to: "/admin/employees", icon: FiUsers },
  { label: "Serviços", to: "/admin/services", icon: FiScissors },
  { label: "Clientes", to: "/admin/clients", icon: FiUser },
  { label: "Configurações", to: "/admin/settings", icon: FiSettings },
];

export const bottomNav = [
  { label: "Início", to: "/dashboard", icon: FiHome },
  { label: "Agenda", to: "/appointments", icon: FiCalendar },
  { label: "Histórico", to: "/service-history", icon: FiClock },
  { label: "Perfil", to: "/profile", icon: FiUser },
  { label: "Admin", to: "/admin", icon: FiShield },
];
