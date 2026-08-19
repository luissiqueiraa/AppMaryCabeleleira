import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import enCommon from "./locales/en/common.json";
import enRegister from "./locales/en/register.json";
import ptBRCommon from "./locales/pt-BR/common.json";
import ptBRRegister from "./locales/pt-BR/register.json";

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: "en",
    supportedLngs: ["en", "pt-BR"],
    defaultNS: "common",
    ns: ["common", "register"],
    resources: {
      en: { common: enCommon, register: enRegister },
      "pt-BR": { common: ptBRCommon, register: ptBRRegister },
    },
    interpolation: { escapeValue: false },
    detection: { order: ["navigator"], caches: [] },
  });

export default i18n;
