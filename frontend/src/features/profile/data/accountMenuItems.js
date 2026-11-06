import { FiUser, FiLock, FiPhone, FiTrash2, FiLogOut } from "react-icons/fi";

export function getAccountMenuItems(onLogout) {
  return [
    {
      label: "Meu perfil",
      description: "Confira e altere suas informações",
      icon: FiUser,
      to: "/profile/personal-info",
    },
    {
      label: "Alterar senha",
      description: "Altere sua senha de acesso",
      icon: FiLock,
      to: "/profile/change-password",
    },
    {
      label: "Telefone",
      description: "Altere seu número",
      icon: FiPhone,
      to: "/profile/phone",
    },
    {
      label: "Excluir conta",
      description: "Exclua sua conta permanentemente",
      icon: FiTrash2,
      to: "/profile/delete-account",
    },
    {
      label: "Sair",
      description: "Encerrar sessão no aplicativo",
      icon: FiLogOut,
      onClick: onLogout,
      chevrons: 2,
    },
  ];
}
