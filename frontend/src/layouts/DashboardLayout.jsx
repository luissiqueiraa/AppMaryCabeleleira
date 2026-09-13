import { useState } from "react";
import { Outlet, useNavigate, useLocation, matchPath, Link } from "react-router-dom";
import { FiSettings } from "react-icons/fi";
import Sidebar from "../features/dashboard/components/Sidebar";
import DashboardHeader from "../features/dashboard/components/DashboardHeader";
import BottomNav from "../features/dashboard/components/BottomNav";
import MobileDrawer from "../features/dashboard/components/MobileDrawer";
import { clientNavItems, getAdminNavItems, getBottomNav } from "../features/dashboard/data/sidebarNav";
import { adminBottomNav, employeeAdminBottomNav } from "../features/admin/data/adminNav";
import { useAuth } from "../shared/contexts/useAuth";
import { ROLES } from "../shared/constants/roles";

const SETTINGS_LINK = (
  <Link
    to="/settings"
    aria-label="Configurações"
    className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 text-gray-500 hover:bg-gray-50"
  >
    <FiSettings size={18} aria-hidden="true" />
  </Link>
);

const PAGE_TITLES = {
  "/dashboard": { eyebrow: "Painel da cliente", title: "Início", mobileTitle: "Início" },
  "/appointments": { eyebrow: "Agenda", title: "Agendamentos", mobileTitle: "Agendamentos" },
  "/service-history": {
    eyebrow: "Seus atendimentos",
    title: "Histórico",
    mobileTitle: "Histórico",

  },
  "/profile": {
    eyebrow: "Conta e preferências",
    title: "Meu perfil",
    mobileTitle: "Perfil",
    mobileAction: SETTINGS_LINK,
  },
  "/profile/personal-info": { eyebrow: "Conta e preferências", title: "Meu perfil", mobileTitle: "Meu perfil" },
  "/profile/preferences": { eyebrow: "Conta e preferências", title: "Preferências", mobileTitle: "Preferências" },
  "/profile/change-password": { eyebrow: "Conta e preferências", title: "Alterar senha", mobileTitle: "Alterar senha" },
  "/profile/phone": { eyebrow: "Conta e preferências", title: "Telefone", mobileTitle: "Telefone" },
  "/profile/delete-account": { eyebrow: "Conta e preferências", title: "Excluir conta", mobileTitle: "Excluir conta" },
  "/settings": { eyebrow: "Conta", title: "Configurações", mobileTitle: "Configurações" },
  "/admin": {
    eyebrow: "Visão geral de hoje",
    title: "Dashboard",
    mobileTitle: "Dashboard",
  },
  "/admin/appointments": {
    eyebrow: "Quinta, 22 maio 2026",
    title: "Agenda do salão",
    mobileTitle: "Agenda",
  },
  "/admin/employees": {
    eyebrow: "Equipe atual",
    title: "Funcionárias",
    mobileTitle: "Funcionárias",
  },
  "/admin/services": {
    eyebrow: "Catálogo do salão",
    title: "Serviços",
    mobileTitle: "Serviços",
  },
  "/admin/clients": {
    eyebrow: "Base de clientes",
    title: "Clientes",
    mobileTitle: "Clientes",
  },
  "/admin/settings": { eyebrow: "Identidade do salão", title: "Configurações", mobileTitle: "Configurações" },
};

function resolvePageInfo(pathname, isAdmin) {
  const exact = PAGE_TITLES[pathname];
  if (exact) return exact;

  if (matchPath("/appointments/:id", pathname)) {
    return {
      eyebrow: "Agenda",
      title: "Detalhes do agendamento",
      mobileTitle: "Agendamento",
    };
  }

  const fallbackTitle = isAdmin ? "Painel admin" : "MaryCabeleleira";
  return { eyebrow: fallbackTitle, title: fallbackTitle, mobileTitle: fallbackTitle };
}

export default function DashboardLayout() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const isAdmin = location.pathname.startsWith("/admin");
  const pageInfo = resolvePageInfo(location.pathname, isAdmin);
  const { logout, user } = useAuth();
  const canManageStaff = user?.role?.name === ROLES.OWNER || user?.role?.name === ROLES.ADMIN;
  const canSeeAdmin = canManageStaff || user?.role?.name === ROLES.EMPLOYEE;
  const navItems = isAdmin ? getAdminNavItems({ canManageStaff }) : clientNavItems;

  async function handleLogout() {
    await logout();
    navigate("/login", { replace: true });
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 text-gray-900">
      <Sidebar onLogout={handleLogout} navItems={navItems} isAdmin={isAdmin} canSeeAdmin={canSeeAdmin} />
      <MobileDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onLogout={handleLogout}
        navItems={navItems}
        isAdmin={isAdmin}
        canSeeAdmin={canSeeAdmin}
      />

      <div className="flex h-screen flex-1 flex-col overflow-hidden">
        <DashboardHeader
          eyebrow={pageInfo.eyebrow}
          title={pageInfo.title}
          mobileTitle={pageInfo.mobileTitle}
          mobileAction={pageInfo.mobileAction}
          headerAction={pageInfo.headerAction}
          user={{ name: user?.fullName ?? "", email: user?.email, avatarUrl: user?.avatarUrl }}
          onOpenMenu={() => setDrawerOpen(true)}
          onLogout={handleLogout}
        />
        <main className="flex-1 overflow-y-auto px-4 py-6 pb-24 sm:px-6 lg:px-8 lg:pb-8">
          <Outlet />
        </main>
        <BottomNav
          items={
            isAdmin
              ? canManageStaff
                ? adminBottomNav
                : employeeAdminBottomNav
              : getBottomNav({ canSeeAdmin, canManageStaff })
          }
        />
      </div>
    </div>
  );
}
