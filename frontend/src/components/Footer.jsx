import React from "react";
import { useTranslation } from "react-i18next";

export default function Footer() {
  const { t } = useTranslation();
  return (
    <footer className="bg-green-700 text-white text-center p-4 mt-10">
      <p>{t("footer")}</p>
    </footer>
  );
}
