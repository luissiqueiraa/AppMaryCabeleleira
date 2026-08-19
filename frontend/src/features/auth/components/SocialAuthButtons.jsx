import { FaGoogle, FaApple } from "react-icons/fa";
import { useTranslation } from "react-i18next";

const PROVIDERS = [
  { name: "Google", icon: FaGoogle },
  { name: "Apple", icon: FaApple },
];

export default function SocialAuthButtons() {
  const { t } = useTranslation();

  return (
    <div className="mt-6">
      <div className="relative flex items-center justify-center">
        <div className="absolute inset-x-0 h-px bg-gray-200" aria-hidden="true" />
        <span className="relative bg-white px-3 text-xs text-gray-500">{t("socialDivider")}</span>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        {PROVIDERS.map(({ name, icon: Icon }) => (
          <button
            key={name}
            type="button"
            aria-label={t("continueWith", { provider: name })}
            className="flex items-center justify-center gap-2 rounded-md border border-gray-200 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pink-600"
          >
            <Icon aria-hidden="true" />
          </button>
        ))}
      </div>
    </div>
  );
}
