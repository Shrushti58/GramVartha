import React from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

const scrollTo = (id) => {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: "smooth" });
};

export default function Footer() {
  const { t } = useTranslation();
  return (
    <footer className="bg-primary-900 dark:bg-dark-background text-white font-sans transition-colors duration-300 overflow-hidden">

      {/* CTA Banner */}
      <div className="border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 md:py-16 flex flex-col lg:flex-row items-center justify-between gap-6 sm:gap-8">
          <div className="text-center lg:text-left">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white leading-tight">
              {t('footer_cta_title')}
            </h2>
            <p className="mt-2 sm:mt-3 text-white/50 text-sm sm:text-base">
              {t('footer_cta_desc')}
            </p>
          </div>
          <div className="flex gap-3 sm:gap-4 flex-shrink-0 w-full sm:w-auto justify-center sm:justify-end">
            <Link
              to="/village/register"
              className="inline-flex items-center gap-2 bg-primary-500 hover:bg-primary-400 text-white font-semibold px-5 sm:px-7 py-2.5 sm:py-3.5 rounded-lg sm:rounded-xl transition-all duration-200 shadow-large hover:-translate-y-0.5 text-sm sm:text-base"
            >
              {t('register_village')}
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12 md:py-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 md:gap-10">

          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-2 space-y-4 sm:space-y-5">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-8 sm:w-9 h-8 sm:h-9 rounded-lg overflow-hidden bg-primary-600/30 border border-primary-500/30 flex items-center justify-center">
                <img src="/gramvarthalogo.png" alt="GramVartha" className="w-full h-full object-contain" />
              </div>
              <span className="text-lg sm:text-xl font-bold text-white">GramVartha</span>
            </div>
            <p className="text-white/50 text-xs sm:text-sm leading-relaxed max-w-xs">
              {t('footer_description')}
            </p>
            <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-3 sm:px-4 py-2">
              <span className="w-2 h-2 bg-primary-400 rounded-full animate-pulse" />
              <span className="text-xs text-white/60 font-medium">{t('footer_live_text')}</span>
            </div>
          </div>

          {/* Platform */}
          <div>
            <h4 className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-4 sm:mb-5">{t('footer_platform')}</h4>
            <ul className="space-y-2 sm:space-y-3">
              {[
                { labelKey: "nav_about", action: () => scrollTo("about") },
                { labelKey: "nav_features", action: () => scrollTo("features") },
              ].map((item) => (
                <li key={item.labelKey}>
                  <button
                    onClick={item.action}
                    className="text-xs sm:text-sm text-white/50 hover:text-primary-400 transition-colors duration-200 text-left"
                  >
                    {t(item.labelKey)}
                  </button>
                </li>
              ))}
              <li>
                <Link
                  to="/village/register"
                  className="text-xs sm:text-sm text-white/50 hover:text-primary-400 transition-colors duration-200"
                >
                  {t('register_village')}
                </Link>
              </li>
              <li>
                <Link
                  to="/privacy-policy"
                  className="text-xs sm:text-sm text-white/50 hover:text-primary-400 transition-colors duration-200"
                >
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Portals */}
          <div>
            <h4 className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-4 sm:mb-5">{t('footer_portals')}</h4>
            <ul className="space-y-2 sm:space-y-3">
              <li>
                <Link
                  to="/officials/login"
                  className="text-xs sm:text-sm text-white/50 hover:text-primary-400 transition-colors duration-200"
                >
                  {t('nav_officials_login')}
                </Link>
              </li>
              <li>
                <Link
                  to="/admin/login"
                  className="text-xs sm:text-sm text-white/50 hover:text-primary-400 transition-colors duration-200"
                >
                  {t('nav_admin_login')}
                </Link>
              </li>
            </ul>
          </div>

        </div>
      </div>

     

      {/* Bottom Bar */}
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-center py-4 sm:py-6 gap-2 sm:gap-4">
            <p className="text-xs text-white/30 text-center">
              {t('footer_rights').replace('2025', new Date().getFullYear())}
            </p>
            <Link
              to="/privacy-policy"
              className="text-xs text-white/40 hover:text-primary-400 transition-colors duration-200"
            >
              Privacy Policy
            </Link>
          </div>
        </div>
      </div>

    </footer>
  );
}
