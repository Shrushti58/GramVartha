import React from "react";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "./LanguageSwitcher";
import { Link } from "react-router-dom"; // 👈 import for navigation

export default function Navbar() {
  const { t } = useTranslation();

  return (
    <nav className="flex justify-between items-center p-4 bg-green-700 text-white sticky top-0">
      {/* Brand */}
      <h1 className="text-2xl font-bold">{t("brand")}</h1>

      {/* Navigation Links */}
      <ul className="flex gap-6">
        <li>{t("nav_home")}</li>
        <li>{t("nav_about")}</li>
        <li>{t("nav_features")}</li>
        <li>{t("nav_contact")}</li>
      </ul>

      <div className="flex items-center gap-4">
        {/* Language Switcher */}
        <LanguageSwitcher />

        {/* Admin Login Button */}
        <Link
          to="/admin/login"
          className="bg-white text-green-700 px-4 py-2 rounded-lg font-semibold hover:bg-gray-200 transition"
        >
          {t("nav_admin_login")}
        </Link>
      </div>
    </nav>
  );
}
