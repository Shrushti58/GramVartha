// src/i18n.js
import i18n from "i18next";
import { initReactI18next } from "react-i18next";


import translationEN from "../locales/en/translation.json";
import translationMR from "../locales/mr/translation.json";

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: translationEN },
    mr: { translation: translationMR }
  },
  lng: "mr", // default language
  fallbackLng: "en",
  interpolation: { escapeValue: false }
});

export default i18n;
