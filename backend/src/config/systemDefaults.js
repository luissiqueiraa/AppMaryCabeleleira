// Estado "de fábrica" do sistema: o que o seed cria numa base nova e o que o
// reset das configurações restaura. Os dois caminhos leem daqui para não
// divergirem — um padrão que só existe no seed vira mentira depois do reset.

export const PERMISSIONS = [
  { key: "manage_users", description: "Create, update and deactivate user accounts" },
  { key: "manage_roles", description: "Create, update and delete roles and their permissions" },
  { key: "manage_services", description: "Manage the services catalog" },
  { key: "manage_schedules", description: "Manage employee work schedules" },
  { key: "manage_appointments", description: "Manage client appointments" },
  { key: "manage_financial", description: "Manage financial transactions and payments" },
  { key: "manage_reports", description: "Access business reports" },
  { key: "manage_settings", description: "Manage critical salon settings" },
  { key: "view_dashboard", description: "View dashboard metrics" },
  { key: "view_clients", description: "View the clients list (read-only)" },
];

export const ROLES = [
  { name: "owner", description: "Full access. Manages roles, permissions and critical settings." },
  { name: "admin", description: "Manages daily operations. Cannot alter the owner." },
  { name: "employee", description: "Manages own schedule and linked clients." },
  { name: "client", description: "Accesses only their own data." },
];

// client tem acesso garantido por ownership (próprios dados), não por permission.
export const ROLE_PERMISSIONS = {
  owner: PERMISSIONS.map((permission) => permission.key),
  admin: [
    "manage_users",
    "manage_services",
    "manage_schedules",
    "manage_appointments",
    "manage_financial",
    "manage_reports",
    "manage_settings",
    "view_dashboard",
  ],
  employee: ["manage_schedules", "manage_appointments", "view_dashboard", "view_clients"],
  client: [],
};

export const DEFAULT_BUSINESS_HOURS = [
  { id: "mon", label: "Segunda", enabled: true, open: "09:00", close: "19:00" },
  { id: "tue", label: "Terça", enabled: true, open: "09:00", close: "19:00" },
  { id: "wed", label: "Quarta", enabled: true, open: "09:00", close: "19:00" },
  { id: "thu", label: "Quinta", enabled: true, open: "09:00", close: "19:00" },
  { id: "fri", label: "Sexta", enabled: true, open: "09:00", close: "20:00" },
  { id: "sat", label: "Sábado", enabled: true, open: "09:00", close: "17:00" },
  { id: "sun", label: "Domingo", enabled: false, open: "", close: "" },
];

export const DEFAULT_SALON_PROFILE = {
  name: "MaryCabeleleira",
  address: "R. Oscar Freire, 472 — Jardins",
  phone: "(11) 3456-2210",
  email: "ola@marycabeleleira.com.br",
  logoUrl: null,
  hours: DEFAULT_BUSINESS_HOURS,
};
