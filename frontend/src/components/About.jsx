import React from "react";
import { useTranslation } from "react-i18next";

export default function About() {
  const { t } = useTranslation();
  return (
    <section className="p-10 text-center">
      <h2 className="text-3xl font-bold mb-4">{t("about_title")}</h2>
      <p className="max-w-2xl mx-auto text-gray-700">{t("about_text")}</p>
    </section>
  );
}
