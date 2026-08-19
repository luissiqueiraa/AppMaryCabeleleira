import { useState } from "react";
import { Outlet, useNavigate, useLocation, matchPath, Link } from "react-router-dom";
import { FiSettings, FiPlus } from "react-icons/fi";
import Sidebar from "../features/dashboard/components/Sidebar";
import DashboardHeader from "../features/dashboard/components/DashboardHeader";
import BottomNav from "../features/dashboard/components/BottomNav";
import MobileDrawer from "../features/dashboard/components/MobileDrawer";
import { bottomNav } from "../features/dashboard/data/sidebarNav";
import { adminBottomNav } from "../features/admin/data/adminNav";
import { currentUser } from "../features/dashboard/data/currentUser";
import { useAuth } from "../shared/contexts/useAuth";

const SETTINGS_LINK = (
  <Link
    to="/settings"
    aria-label="Configurações"
    className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 text-gray-500 hover:bg-gray-50"
  >
    <FiSettings size={18} aria-hidden="true" />
  </Link>
);

const ADD_EMPLOYEE_BUTTON = (
  <button
    type="button"
    className="flex items-center gap-1.5 rounded-lg bg-pink-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-pink-700"
  >
    <FiPlus size={16} aria-hidden="true" />
    Adicionar
  </button>
);

const NEW_SERVICE_BUTTON = (
  <button
    type="button"
    className="flex items-center gap-1.5 rounded-lg bg-pink-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-pink-700"
  >
    <FiPlus size={16} aria-hidden="true" />
    Novo serviço
  </button>
);

const ADD_CLIENT_BUTTON = (
  <button
    type="button"
    className="flex items-center gap-1.5 rounded-lg bg-pink-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-pink-700"
  >
    <FiPlus size={16} aria-hidden="true" />
    Adicionar cliente
  </button>
);

const PAGE_TITLES = {
  "/dashboard": { eyebrow: "Painel da cliente", title: "Início", mobileTitle: "Início" },
  "/appointments": { eyebrow: "Agenda", title: "Agendamentos", mobileTitle: "Agendamentos" },
  "/service-history": {
    eyebrow: "Seus atendimentos",
    title: "Histórico",
    mobileTitle: "Histórico",

  },
  "/notifications": { eyebrow: "Avisos", title: "Notificações", mobileTitle: "Notificações" },
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
    headerAction: ADD_EMPLOYEE_BUTTON,
  },
  "/admin/services": {
    eyebrow: "Catálogo do salão",
    title: "Serviços",
    mobileTitle: "Serviços",
    headerAction: NEW_SERVICE_BUTTON,
  },
  "/admin/clients": {
    eyebrow: "Base de clientes",
    title: "Clientes",
    mobileTitle: "Clientes",
    headerAction: ADD_CLIENT_BUTTON,
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
  const [collapsed, setCollapsed] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const isAdmin = location.pathname.startsWith("/admin");
  const pageInfo = resolvePageInfo(location.pathname, isAdmin);
  const { logout } = useAuth();

  async function handleLogout() {
    await logout();
    navigate("/login", { replace: true });
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 text-gray-900">
      <Sidebar
        collapsed={collapsed}
        onToggle={() => setCollapsed((prev) => !prev)}
        onLogout={handleLogout}
      />
      <MobileDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onLogout={handleLogout}
      />

      <div className="flex h-screen flex-1 flex-col overflow-hidden">
        <DashboardHeader
          eyebrow={pageInfo.eyebrow}
          title={pageInfo.title}
          mobileTitle={pageInfo.mobileTitle}
          mobileAction={pageInfo.mobileAction}
          headerAction={pageInfo.headerAction}
          user={currentUser}
          onOpenMenu={() => setDrawerOpen(true)}
        />
        <main className="flex-1 overflow-y-auto px-4 py-6 pb-24 sm:px-6 lg:px-8 lg:pb-8">
          <Outlet />
        </main>
        <BottomNav items={isAdmin ? adminBottomNav : bottomNav} />
      </div>
    </div>
  );
}
