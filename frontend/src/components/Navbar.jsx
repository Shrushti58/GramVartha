import React from "react";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "./LanguageSwitcher";

export default function Navbar() {
  const { t } = useTranslation();
  return (
    <nav className="flex justify-between items-center p-4 bg-green-700 text-white sticky top-0">
      <h1 className="text-2xl font-bold">{t("brand")}</h1>
      <ul className="flex gap-6">
        <li>{t("nav_home")}</li>
        <li>{t("nav_about")}</li>
        <li>{t("nav_features")}</li>
        <li>{t("nav_contact")}</li>
      </ul>
      <LanguageSwitcher />
    </nav>
  );
}
