import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AccountMenuList from "../components/AccountMenuList";
import { getAccountMenuItems } from "../data/accountMenuItems";
import { useAuth } from "../../../shared/contexts/useAuth";
import { uploadAvatar } from "../services/avatarService";

export default function ProfilePage() {
  const navigate = useNavigate();
  const { user, logout, updateUser } = useAuth();
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [avatarError, setAvatarError] = useState("");

  async function handleLogout() {
    await logout();
    navigate("/login", { replace: true });
  }

  async function handleAvatarChange(file) {
    setIsUploadingAvatar(true);
    setAvatarError("");
    try {
      const { data } = await uploadAvatar(file);
      updateUser({ avatarUrl: data.avatarUrl });
    } catch {
      setAvatarError("Não foi possível atualizar a foto agora. Tente novamente.");
    } finally {
      setIsUploadingAvatar(false);
    }
  }

  const menuItems = getAccountMenuItems(handleLogout);
  const profile = { name: user.fullName, email: user.email, avatarUrl: user.avatarUrl };

  return (
    <div className="mx-auto max-w-3xl">
      {avatarError && (
        <p role="alert" className="mb-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {avatarError}
        </p>
      )}
      <AccountMenuList
        profile={profile}
        items={menuItems}
        onAvatarChange={handleAvatarChange}
        isUploadingAvatar={isUploadingAvatar}
      />
    </div>
  );
}
