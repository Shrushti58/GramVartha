import React from "react";
import { useTranslation } from "react-i18next";

export default function Hero() {
  const { t } = useTranslation();
  return (
    <section className="text-center py-20 bg-gradient-to-r from-green-600 to-blue-600 text-white">
      <h1 className="text-5xl font-extrabold mb-4">{t("welcome")}</h1>
      <p className="text-lg">{t("tagline")}</p>
      <button className="mt-6 px-6 py-3 bg-yellow-400 text-black font-semibold rounded-xl shadow-lg hover:scale-105 transition">
        {t("nav_features")}
      </button>
    </section>
  );
}
