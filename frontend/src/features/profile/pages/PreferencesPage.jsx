import { Link } from "react-router-dom";
import { FiChevronLeft } from "react-icons/fi";
import PreferencesPanel from "../components/PreferencesPanel";
import { useAuth } from "../../../shared/contexts/useAuth";

export default function PreferencesPage() {
  const { user, updateUser } = useAuth();

  return (
    <div className="mx-auto max-w-lg">
      <Link to="/profile" className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-gray-700">
        <FiChevronLeft aria-hidden="true" />
        Voltar ao perfil
      </Link>

      <div className="mt-4">
        <PreferencesPanel whatsappReminders={user.whatsappReminders} onSaved={updateUser} />
      </div>
    </div>
  );
}
