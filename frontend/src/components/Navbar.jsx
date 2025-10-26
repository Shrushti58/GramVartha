import React, { useState } from "react";
import { Link } from "react-router-dom";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="sticky top-0 z-50 bg-gradient-to-r from-primary-900 to-primary-800 text-white font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex justify-between items-center h-16 sm:h-20">
          {/* Brand */}
          <div className="flex items-center space-x-3 sm:space-x-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-white/20">
              <span className="text-white font-bold text-lg sm:text-xl font-serif">G</span>
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold font-serif">GramVartha</h1>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Navigation Links */}
            <Link
              to="/notices"
              className="text-white/90 hover:text-white font-medium transition-all duration-200 hover:scale-105 px-4 py-2 rounded-lg hover:bg-white/10"
            >
              Notices
            </Link>

            {/* Login Buttons */}
            <div className="flex items-center space-x-3 ml-4">
              <Link
                to="/citizen/login"
                className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-xl font-medium transition-all duration-200 backdrop-blur-sm border border-white/20 hover:border-white/30"
              >
                Citizen Login
              </Link>
              <Link
                to="/officials/login"
                className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-xl font-medium transition-all duration-200 backdrop-blur-sm border border-white/20 hover:border-white/30"
              >
                Officials Login
              </Link>
              <Link
                to="/admin/login"
                className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-xl font-medium transition-all duration-200 backdrop-blur-sm border border-white/20 hover:border-white/30"
              >
                Admin Login
              </Link>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-lg text-white hover:bg-white/10 focus:outline-none transition-all duration-200 border border-white/20"
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
        className={`md:hidden fixed inset-y-0 right-0 w-64 bg-gradient-to-b from-primary-900 to-primary-800 backdrop-blur-2xl shadow-2xl transform ${
          isMenuOpen ? "translate-x-0" : "translate-x-full"
        } transition-transform duration-300 ease-in-out z-50 border-l border-white/20`}
      >
        <div className="flex flex-col h-full">
          <div className="flex justify-between items-center p-4 border-b border-white/20">
            <span className="text-lg font-semibold text-white">Menu</span>
            <button
              onClick={toggleMenu}
              className="p-2 rounded-lg text-white hover:bg-white/10 transition-colors duration-200 border border-white/20"
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
                className="block w-full text-white font-medium px-4 py-3 rounded-lg hover:bg-white/10 transition-all duration-200 border border-white/20"
                onClick={() => setIsMenuOpen(false)}
              >
                Notices
              </Link>
            </div>

            <div className="pt-8 space-y-4 border-t border-white/20">
              <Link
                to="/citizen/login"
                className="block w-full bg-white/10 text-white px-4 py-3 rounded-xl font-medium text-center hover:bg-white/20 transition-all duration-200 border border-white/20 hover:border-white/30"
                onClick={() => setIsMenuOpen(false)}
              >
                Citizen Login
              </Link>
              <Link
                to="/officials/login"
                className="block w-full bg-white/10 text-white px-4 py-3 rounded-xl font-medium text-center hover:bg-white/20 transition-all duration-200 border border-white/20 hover:border-white/30"
                onClick={() => setIsMenuOpen(false)}
              >
                Officials Login
              </Link>
              <Link
                to="/admin/login"
                className="block w-full bg-white/10 text-white px-4 py-3 rounded-xl font-medium text-center hover:bg-white/20 transition-all duration-200 border border-white/20 hover:border-white/30"
                onClick={() => setIsMenuOpen(false)}
              >
                Admin Login
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Overlay for mobile menu */}
      {isMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setIsMenuOpen(false)}
        ></div>
      )}
    </nav>
  );
}