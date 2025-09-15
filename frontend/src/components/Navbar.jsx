import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "./LanguageSwitcher";
import { Link } from "react-router-dom";

export default function Navbar() {
  const { t } = useTranslation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="sticky top-0 z-50 bg-background-cream/70 backdrop-blur-xl border-b border-warm-earth/40 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Brand */}
          <Link
            to="/"
            className="text-2xl font-bold bg-header-gradient bg-clip-text text-transparent flex-shrink-0"
          >
            GramVartha
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {/* Navigation Links */}
            <div className="flex items-center space-x-6 mr-4">
              <Link
                to="/notices"
                className="text-field-green-700 font-medium hover:text-field-green-500 transition-all duration-300 hover:scale-105"
              >
                {t("nav_notices")}
              </Link>
            </div>

            <LanguageSwitcher />

            <div className="flex space-x-3 ml-4">
              <Link
                to="/admin/login"
                className="bg-button-primary text-white px-4 py-2 rounded-full font-medium hover:shadow-lg transition-all duration-300 hover:scale-105 whitespace-nowrap shadow-md"
              >
                {t("nav_admin_login")}
              </Link>

              <Link
                to="/officials/login"
                className="bg-white/80 backdrop-blur-sm text-field-green-700 border border-field-green-300 px-4 py-2 rounded-full font-medium hover:shadow-lg transition-all duration-300 hover:scale-105 whitespace-nowrap shadow-sm"
              >
                {t("nav_officials_login")}
              </Link>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center space-x-4">
            <LanguageSwitcher />
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-field-green-700 hover:text-field-green-500 focus:outline-none transition-all duration-300"
              aria-expanded={isMenuOpen}
            >
              <span className="sr-only">Open main menu</span>
              {!isMenuOpen ? (
                <svg
                  className="block h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              ) : (
                <svg
                  className="block h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div
        className={`md:hidden fixed inset-y-0 right-0 w-64 bg-background-cream/95 backdrop-blur-2xl shadow-2xl transform ${
          isMenuOpen ? "translate-x-0" : "translate-x-full"
        } transition-transform duration-300 ease-in-out z-50`}
      >
        <div className="flex flex-col h-full">
          <div className="flex justify-between items-center p-4 border-b border-warm-earth/50">
            <span className="text-lg font-semibold text-field-green-700">Menu</span>
            <button
              onClick={toggleMenu}
              className="p-2 rounded-md text-field-green-700 hover:text-field-green-500 transition-colors duration-300"
            >
              <svg
                className="h-6 w-6"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <div className="flex-1 px-4 pb-4 space-y-6 overflow-y-auto mt-6">
            {/* Mobile Navigation Links */}
            <div className="space-y-4">
              <Link
                to="/notices"
                className="block w-full text-field-green-700 font-medium px-4 py-3 rounded-lg hover:bg-field-green/10 hover:text-field-green-500 transition-all duration-300"
                onClick={() => setIsMenuOpen(false)}
              >
                {t("nav_notices")}
              </Link>
            </div>

            <div className="pt-8 space-y-4 border-t border-warm-earth/50">
              <Link
                to="/admin/login"
                className="block w-full bg-button-primary text-white px-4 py-3 rounded-full font-medium text-center hover:shadow-lg transition-all duration-300"
                onClick={() => setIsMenuOpen(false)}
              >
                {t("nav_admin_login")}
              </Link>
              <Link
                to="/officials/login"
                className="block w-full bg-white text-field-green-700 border border-field-green-300 px-4 py-3 rounded-full font-medium text-center hover:shadow-lg transition-all duration-300"
                onClick={() => setIsMenuOpen(false)}
              >
                {t("nav_officials_login")}
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Overlay for mobile menu */}
      {isMenuOpen && (
        <div
          className="fixed inset-0 bg-warm-earth/30 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setIsMenuOpen(false)}
        ></div>
      )}
    </nav>
  );
}