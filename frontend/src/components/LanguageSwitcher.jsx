// src/components/LanguageSwitcher.jsx
import React from "react";
import i18n from "./i18n";

export default function LanguageSwitcher() {
  const change = (lng) => i18n.changeLanguage(lng);
  return (
    <div className="flex gap-2">
      <button className="px-2 py-1 bg-yellow-300 rounded text-sm" onClick={() => change("mr")}>मराठी</button>
      <button className="px-2 py-1 bg-yellow-300 rounded text-sm" onClick={() => change("en")}>English</button>
    </div>
  );
}
