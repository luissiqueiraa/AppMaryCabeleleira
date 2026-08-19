import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import RegisterForm from "../components/RegisterForm";
import SocialAuthButtons from "../components/SocialAuthButtons";

export default function RegisterPage() {
  const { t } = useTranslation("register");

  return (
    <div className="flex min-h-screen flex-col lg:flex-row lg:items-center">
      <div className="mx-auto w-full max-w-sm my-auto shadow-lg p-10 mx-10 mt-10 md:max-w-2xl">

        <h1 className="font-display text-3xl leading-tight font-semibold text-gray-900 sm:text-4xl">
          {t("title")}
        </h1>
        <p className="mt-3 text-sm text-gray-500">{t("subtitle")}</p>

        <div className="mt-8">
          <RegisterForm />
          <SocialAuthButtons />
        </div>

        <p className="mt-8 text-center text-sm text-gray-600">
          {t("footer.text")}{" "}
          <Link to="/login" className="font-semibold text-pink-600 hover:underline">
            {t("footer.link")}
          </Link>
        </p>
      </div>
    </div>
  );
}
