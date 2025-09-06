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
    <nav className="sticky top-0 z-50 bg-white/70 backdrop-blur-lg shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Brand */}
          <Link 
            to="/" 
            className="text-2xl font-bold text-gray-900 flex-shrink-0"
          >
            GramVartha
          </Link>

          {/* Right side items */}
          <div className="hidden md:flex items-center space-x-4">
            <LanguageSwitcher />
            
            {/* New Notices link */}
            <Link
              to="/notices"
              className="text-gray-700 font-medium hover:text-green-600 transition-all"
            >
              {t("nav_notices")}
            </Link>

            <div className="flex space-x-2">
              <Link
                to="/admin/login"
                className="bg-gradient-to-r from-green-500 to-green-700 text-white px-4 py-2 rounded-full font-medium hover:shadow-md transition-all whitespace-nowrap"
              >
                {t("nav_admin_login")}
              </Link>

              <Link
                to="/officials/login"
                className="bg-white text-green-600 border border-green-500 px-4 py-2 rounded-full font-medium hover:shadow-md transition-all whitespace-nowrap"
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
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-gray-900 focus:outline-none"
              aria-expanded={isMenuOpen}
            >
              <span className="sr-only">Open main menu</span>
              {!isMenuOpen ? (
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              ) : (
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={`md:hidden fixed inset-y-0 right-0 w-64 bg-white/90 backdrop-blur-lg shadow-lg transform ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'} transition-transform duration-300 ease-in-out z-50`}>
        <div className="flex flex-col h-full">
          <div className="flex justify-end p-4">
            <button
              onClick={toggleMenu}
              className="p-2 rounded-md text-gray-700 hover:text-gray-900"
            >
              <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div className="flex-1 px-4 pb-4 space-y-6 overflow-y-auto">
            {/* Notices link for mobile */}
            <Link
              to="/notices"
              className="block w-full text-gray-700 font-medium text-center px-4 py-3 rounded-md hover:text-green-600 transition-all"
              onClick={() => setIsMenuOpen(false)}
            >
              {t("nav_notices")}
            </Link>

            <div className="pt-6 space-y-4">
              <Link
                to="/admin/login"
                className="block w-full bg-gradient-to-r from-green-500 to-green-700 text-white px-4 py-3 rounded-full font-medium text-center hover:shadow-md transition-all"
                onClick={() => setIsMenuOpen(false)}
              >
                {t("nav_admin_login")}
              </Link>
              <Link
                to="/officials/login"
                className="block w-full bg-white text-green-600 border border-green-500 px-4 py-3 rounded-full font-medium text-center hover:shadow-md transition-all"
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
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setIsMenuOpen(false)}
        ></div>
      )}
    </nav>
  );
}
