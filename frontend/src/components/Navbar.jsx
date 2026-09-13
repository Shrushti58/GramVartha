import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "./LanguageSwitcher";

const scrollTo = (id) => {
  const el = document.getElementById(id);
  if (el) {
    el.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }
};

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const { dark, toggleTheme } = useTheme();
  const location = useLocation();
  const { t } = useTranslation();

  const isHome = location.pathname === "/";

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const handleNavClick = (id) => {
    setIsMenuOpen(false);

    if (isHome) {
      scrollTo(id);
    } else {
      window.location.href = `/#${id}`;
    }
  };

  return (
    <>
      {/* Floating Navbar */}
      <nav
        className={`
          fixed top-4 sm:top-5 left-1/2 -translate-x-1/2
          z-50
          w-[calc(100%-24px)]
          sm:w-[calc(100%-40px)]
          max-w-6xl
          transition-all duration-300
          ${scrolled ? "scale-[0.98]" : "scale-100"}
        `}
      >
        <div
          className={`
            relative
            flex items-center justify-between
            h-16 sm:h-[72px]
            px-4 sm:px-6 lg:px-7
            rounded-full
            border
            backdrop-blur-xl
            transition-all duration-300

            ${
              scrolled
                ? "bg-white/95 dark:bg-dark-surface/95 border-white/70 dark:border-dark-border shadow-xl"
                : "bg-white/75 dark:bg-dark-surface/75 border-white/60 dark:border-dark-border/60 shadow-lg"
            }
          `}
        >
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-2.5 sm:gap-3 flex-shrink-0 group"
          >
            <div
              className="
                w-9 h-9 sm:w-10 sm:h-10
                rounded-full
                overflow-hidden
                flex items-center justify-center
                bg-primary-50
                dark:bg-dark-surface2
              "
            >
              <img
                src="/gramvarthalogo.png"
                alt="GramVartha"
                className="w-full h-full object-contain"
              />
            </div>

            <span
              className="
                text-lg sm:text-xl
                font-bold
                tracking-tight
                text-gray-950
                dark:text-white
                group-hover:opacity-70
                transition-opacity
              "
            >
              Gram<span className="text-primary-600">Vartha</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-1">
            <button
              onClick={() => handleNavClick("about")}
              className="
                px-4 py-2
                text-sm font-medium
                text-gray-700 dark:text-gray-200
                rounded-full
                hover:bg-black/5
                dark:hover:bg-white/10
                transition-all
              "
            >
              {t("nav_about")}
            </button>

            <button
              onClick={() => handleNavClick("how-it-works")}
              className="
                px-4 py-2
                text-sm font-medium
                text-gray-700 dark:text-gray-200
                rounded-full
                hover:bg-black/5
                dark:hover:bg-white/10
                transition-all
              "
            >
              {t("nav_how_it_works")}
            </button>
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-2">
            {/* Theme */}
            <button
              onClick={toggleTheme}
              className="
                w-9 h-9
                rounded-full
                flex items-center justify-center
                text-gray-700 dark:text-gray-200
                hover:bg-black/5
                dark:hover:bg-white/10
                transition-all
              "
              aria-label={t("nav_toggle_theme")}
            >
              {dark ? (
                <svg
                  className="w-[18px] h-[18px]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 3v1m0 16v1m8.66-9h-1M4.34 12h-1m15.07-6.07-.7.7M6.34 17.66l-.7.7m12.02 0-.7-.7M6.34 6.34l-.7-.7M12 7a5 5 0 100 10A5 5 0 0012 7z"
                  />
                </svg>
              ) : (
                <svg
                  className="w-[18px] h-[18px]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"
                  />
                </svg>
              )}
            </button>

            <LanguageSwitcher />

            {/* Login Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsLoginOpen(!isLoginOpen)}
                className="
                  px-4 py-2
                  rounded-full
                  text-sm font-semibold
                  text-gray-900 dark:text-white
                  hover:bg-black/5
                  dark:hover:bg-white/10
                  transition-all
                "
              >
                {t("nav_login")}
              </button>

              {isLoginOpen && (
                <div
                  className="
                    absolute right-0 top-12
                    w-48
                    p-2
                    rounded-2xl
                    bg-white
                    dark:bg-dark-surface
                    border border-gray-200
                    dark:border-dark-border
                    shadow-xl
                  "
                >
                  <Link
                    to="/officials/login"
                    onClick={() => setIsLoginOpen(false)}
                    className="
                      block px-4 py-3
                      rounded-xl
                      text-sm font-medium
                      hover:bg-primary-50
                      dark:hover:bg-dark-surface2
                    "
                  >
                    {t("nav_officials_login")}
                  </Link>

                  <Link
                    to="/admin/login"
                    onClick={() => setIsLoginOpen(false)}
                    className="
                      block px-4 py-3
                      rounded-xl
                      text-sm font-medium
                      hover:bg-primary-50
                      dark:hover:bg-dark-surface2
                    "
                  >
                    {t("nav_admin_login")}
                  </Link>
                </div>
              )}
            </div>

            {/* Main CTA */}
            <Link
              to="/village/register"
              className="
                inline-flex items-center gap-2
                px-5 sm:px-6
                py-3
                rounded-full
                bg-primary-600
                hover:bg-primary-700
                dark:bg-primary-500
                dark:hover:bg-primary-400
                text-white
                text-sm
                font-semibold
                shadow-sm
                hover:shadow-md
                transition-all duration-200
              "
            >
              {t("register_village")}

              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 12h14m-6-6 6 6-6 6"
                />
              </svg>
            </Link>
          </div>

          {/* Mobile */}
          <div className="flex md:hidden items-center gap-1">
            <button
              onClick={toggleTheme}
              className="
                w-9 h-9
                rounded-full
                flex items-center justify-center
                hover:bg-black/5
                dark:hover:bg-white/10
              "
            >
              {dark ? "☀️" : "🌙"}
            </button>

            <LanguageSwitcher />

            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="
                w-10 h-10
                rounded-full
                flex items-center justify-center
                bg-gray-100
                dark:bg-dark-surface2
              "
              aria-label={t("nav_toggle_menu")}
            >
              {isMenuOpen ? (
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              ) : (
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div
            className="
              lg:hidden
              mt-3
              p-3
              rounded-3xl
              bg-white/95
              dark:bg-dark-surface/95
              backdrop-blur-xl
              border border-white/60
              dark:border-dark-border
              shadow-xl
            "
          >
            <button
              onClick={() => handleNavClick("about")}
              className="
                block w-full text-left
                px-4 py-3
                rounded-xl
                text-sm font-medium
                hover:bg-gray-100
                dark:hover:bg-dark-surface2
              "
            >
              {t("nav_about")}
            </button>

            <button
              onClick={() => handleNavClick("how-it-works")}
              className="
                block w-full text-left
                px-4 py-3
                rounded-xl
                text-sm font-medium
                hover:bg-gray-100
                dark:hover:bg-dark-surface2
              "
            >
              {t("nav_how_it_works")}
            </button>

            <div className="border-t border-gray-200 dark:border-dark-border my-2" />

            <Link
              to="/officials/login"
              onClick={() => setIsMenuOpen(false)}
              className="
                block px-4 py-3
                rounded-xl
                text-sm font-medium
                hover:bg-gray-100
                dark:hover:bg-dark-surface2
              "
            >
              {t("nav_officials_login")}
            </Link>

            <Link
              to="/admin/login"
              onClick={() => setIsMenuOpen(false)}
              className="
                block px-4 py-3
                rounded-xl
                text-sm font-medium
                hover:bg-gray-100
                dark:hover:bg-dark-surface2
              "
            >
              {t("nav_admin_login")}
            </Link>

            <Link
              to="/village/register"
              onClick={() => setIsMenuOpen(false)}
              className="
                flex items-center justify-center gap-2
                w-full
                mt-2
                px-4 py-3
                rounded-full
                bg-primary-600
                text-white
                text-sm font-semibold
              "
            >
              {t("register_village")}
              <span>→</span>
            </Link>
          </div>
        )}
      </nav>
    </>
  );
}
