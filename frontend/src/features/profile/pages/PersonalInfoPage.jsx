import { Link } from "react-router-dom";
import { FiChevronLeft } from "react-icons/fi";
import PersonalInfoForm from "../components/PersonalInfoForm";
import { profile } from "../data/mockProfile";

export default function PersonalInfoPage() {
  return (
    <div className="mx-auto max-w-lg">
      <Link to="/profile" className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-gray-700">
        <FiChevronLeft aria-hidden="true" />
        Voltar ao perfil
      </Link>

      <div className="mt-4">
        <PersonalInfoForm profile={profile} />
      </div>
    </div>
  );
}
