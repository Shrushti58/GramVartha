import React from "react";
import { useTranslation } from "react-i18next";

export default function Features() {
  const { t } = useTranslation();
  return (
    <section className="p-10 bg-white text-center">
      <h2 className="text-3xl font-bold mb-8">{t("features_title")}</h2>
      <div className="grid md:grid-cols-3 gap-6">
        <div className="p-6 shadow rounded-xl bg-green-50 hover:shadow-lg transition">{t("f1")}</div>
        <div className="p-6 shadow rounded-xl bg-green-50 hover:shadow-lg transition">{t("f2")}</div>
        <div className="p-6 shadow rounded-xl bg-green-50 hover:shadow-lg transition">{t("f3")}</div>
      </div>
    </section>
  );
}
