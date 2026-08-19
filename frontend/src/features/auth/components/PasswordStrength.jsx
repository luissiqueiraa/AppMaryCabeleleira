import { useTranslation } from "react-i18next";
import { getPasswordScore } from "../utils/passwordPolicy";

const LEVELS = [
  { max: 2, key: "weak", color: "bg-red-400" },
  { max: 3, key: "fair", color: "bg-amber-400" },
  { max: 4, key: "good", color: "bg-yellow-400" },
  { max: 5, key: "strong", color: "bg-emerald-500" },
];

export default function PasswordStrength({ password }) {
  const { t } = useTranslation("register");

  if (!password) return null;

  const score = getPasswordScore(password);
  const level = LEVELS.find((item) => score <= item.max) ?? LEVELS[LEVELS.length - 1];

  return (
    <div className="mt-2" aria-live="polite">
      <div className="flex gap-1.5" role="presentation">
        {LEVELS.map((item, index) => (
          <span
            key={item.key}
            className={`h-1.5 flex-1 rounded-full ${
              index < LEVELS.indexOf(level) + 1 ? level.color : "bg-gray-200"
            }`}
          />
        ))}
      </div>
      <p className="mt-1.5 text-xs text-gray-500">
        {t("passwordStrength.label")}: {t(`passwordStrength.${level.key}`)}
      </p>
    </div>
  );
}
