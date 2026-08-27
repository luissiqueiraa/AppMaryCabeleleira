import { FiHome, FiCalendar, FiUsers, FiUser, FiScissors, FiSettings } from "react-icons/fi";

export const adminBottomNav = [
  { label: "Dashboard", to: "/admin", icon: FiHome },
  { label: "Agenda", to: "/admin/appointments", icon: FiCalendar },
  { label: "Funcionárias", to: "/admin/employees", icon: FiUsers },
  { label: "Serviços", to: "/admin/services", icon: FiScissors },
  { label: "Clientes", to: "/admin/clients", icon: FiUser },
  { label: "Config.", to: "/admin/settings", icon: FiSettings },
];

// Funcionárias (employee) não gerencia a equipe: troca esse item por Serviços.
export const employeeAdminBottomNav = [
  { label: "Dashboard", to: "/admin", icon: FiHome },
  { label: "Agenda", to: "/admin/appointments", icon: FiCalendar },
  { label: "Serviços", to: "/admin/services", icon: FiScissors },
  { label: "Clientes", to: "/admin/clients", icon: FiUser },
];
