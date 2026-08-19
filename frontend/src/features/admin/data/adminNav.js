import { FiHome, FiCalendar, FiUsers, FiUser } from "react-icons/fi";

export const adminBottomNav = [
  { label: "Dashboard", to: "/admin", icon: FiHome },
  { label: "Agenda", to: "/admin/appointments", icon: FiCalendar },
  { label: "Funcionárias", to: "/admin/employees", icon: FiUsers },
  { label: "Clientes", to: "/admin/clients", icon: FiUser },
];
