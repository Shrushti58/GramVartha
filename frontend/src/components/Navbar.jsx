import React, { useState } from "react";
import { Link } from "react-router-dom";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="sticky top-0 z-50 bg-primary-700/30 backdrop-blur-xl border-b border-primary-300/30 shadow-earth-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex justify-between items-center h-16 sm:h-20">
          {/* Brand / Logo */}
          <Link to="/" className="flex items-center space-x-3 sm:space-x-4 group">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-cream/20 backdrop-blur-md flex items-center justify-center overflow-hidden border border-latte/40 shadow-soft-earth transition-all duration-300 group-hover:scale-105 group-hover:bg-cream/30 group-hover:shadow-earth-md">
              <img
                src="/gramvarthalogo.png"
                alt="GramVartha Logo"
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold font-serif tracking-wide text-primary-900 drop-shadow-lg transition-all duration-300 group-hover:scale-105">
                GramVartha
              </h1>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-2 lg:space-x-3">
            <Link
              to="/notices"
              className="relative text-primary-900 font-medium transition-all duration-300 px-4 py-2 rounded-xl hover:bg-latte/30 backdrop-blur-md border border-transparent hover:border-mocha/40 hover:shadow-soft-earth group overflow-hidden"
            >
              <span className="relative z-10">Notices</span>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-latte/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
            </Link>

            {/* Login Buttons with Glassmorphism */}
            <div className="flex items-center space-x-2 lg:space-x-3 ml-4">
              <Link
                to="/citizen/login"
                className="relative bg-cream/40 hover:bg-sand/50 text-primary-900 px-4 py-2 rounded-xl font-medium transition-all duration-300 backdrop-blur-md border border-latte/50 hover:border-mocha/60 shadow-soft-earth hover:shadow-earth-md hover:scale-105 group overflow-hidden"
              >
                <span className="relative z-10">Citizen Login</span>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-latte/30 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
              </Link>
              <Link
                to="/officials/login"
                className="relative bg-cream/40 hover:bg-sand/50 text-primary-900 px-4 py-2 rounded-xl font-medium transition-all duration-300 backdrop-blur-md border border-latte/50 hover:border-mocha/60 shadow-soft-earth hover:shadow-earth-md hover:scale-105 group overflow-hidden"
              >
                <span className="relative z-10">Officials Login</span>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-latte/30 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
              </Link>
              <Link
                to="/admin/login"
                className="relative bg-gradient-to-r from-mocha/30 to-clay/30 hover:from-mocha/40 hover:to-clay/40 text-primary-900 px-4 py-2 rounded-xl font-medium transition-all duration-300 backdrop-blur-md border border-cocoa/50 hover:border-cocoa/70 shadow-soft-earth hover:shadow-earth-md hover:scale-105 group overflow-hidden"
              >
                <span className="relative z-10 flex items-center space-x-2">
                  <span>Admin Login</span>
                  <svg className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-latte/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
              </Link>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-xl text-primary-900 hover:bg-latte/30 focus:outline-none transition-all duration-300 backdrop-blur-md border border-latte/50 shadow-soft-earth hover:scale-105"
              aria-expanded={isMenuOpen}
            >
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

      {/* Mobile menu with enhanced glassmorphism */}
      <div
        className={`md:hidden fixed inset-y-0 right-0 w-72 bg-cream/30 backdrop-blur-2xl shadow-earth-lg transform ${
          isMenuOpen ? "translate-x-0" : "translate-x-full"
        } transition-transform duration-300 ease-in-out z-50 border-l border-latte/40`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex justify-between items-center p-5 border-b border-latte/40 bg-sand/20">
            <span className="text-lg font-semibold text-primary-900 drop-shadow-lg">Menu</span>
            <button
              onClick={toggleMenu}
              className="p-2 rounded-xl text-primary-900 hover:bg-latte/30 transition-all duration-300 border border-latte/50 backdrop-blur-md hover:scale-105 shadow-soft-earth"
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

          {/* Menu Items */}
          <div className="flex-1 px-5 pb-5 space-y-6 overflow-y-auto mt-6">
            {/* Navigation Links */}
            <div className="space-y-3">
              <Link
                to="/notices"
                className="block w-full text-primary-900 font-medium px-4 py-3 rounded-xl hover:bg-latte/40 transition-all duration-300 border border-latte/50 backdrop-blur-md shadow-soft-earth hover:shadow-earth-md hover:scale-105 group"
                onClick={() => setIsMenuOpen(false)}
              >
                <span className="flex items-center justify-between">
                  <span>Notices</span>
                  <svg className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1 text-mocha" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </span>
              </Link>
            </div>

            {/* Login Buttons Section */}
            <div className="pt-6 space-y-3 border-t border-latte/40">
              <p className="text-text-secondary text-sm font-medium px-2 mb-3">Login Portals</p>
              
              <Link
                to="/citizen/login"
                className="block w-full bg-cream/50 text-primary-900 px-4 py-3 rounded-xl font-medium text-center hover:bg-sand/60 transition-all duration-300 border border-latte/50 hover:border-mocha/60 backdrop-blur-md shadow-soft-earth hover:shadow-earth-md hover:scale-105 group"
                onClick={() => setIsMenuOpen(false)}
              >
                <span className="flex items-center justify-center space-x-2">
                  <svg className="w-5 h-5 text-mocha" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span>Citizen Login</span>
                </span>
              </Link>
              
              <Link
                to="/officials/login"
                className="block w-full bg-cream/50 text-primary-900 px-4 py-3 rounded-xl font-medium text-center hover:bg-sand/60 transition-all duration-300 border border-latte/50 hover:border-mocha/60 backdrop-blur-md shadow-soft-earth hover:shadow-earth-md hover:scale-105 group"
                onClick={() => setIsMenuOpen(false)}
              >
                <span className="flex items-center justify-center space-x-2">
                  <svg className="w-5 h-5 text-mocha" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span>Officials Login</span>
                </span>
              </Link>
              
              <Link
                to="/admin/login"
                className="block w-full bg-gradient-to-r from-mocha/40 to-clay/40 text-cream px-4 py-3 rounded-xl font-medium text-center hover:from-mocha/50 hover:to-clay/50 transition-all duration-300 border border-cocoa/60 hover:border-cocoa/80 backdrop-blur-md shadow-soft-earth hover:shadow-earth-md hover:scale-105 group"
                onClick={() => setIsMenuOpen(false)}
              >
                <span className="flex items-center justify-center space-x-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <span>Admin Login</span>
                </span>
              </Link>
            </div>
          </div>

          {/* Footer decoration */}
          <div className="p-5 border-t border-latte/40 bg-sand/20">
            <div className="flex items-center justify-center space-x-2 text-text-secondary text-sm">
              <div className="w-2 h-2 rounded-full bg-mocha/60 animate-pulse"></div>
              <span>Powered by GramVartha</span>
            </div>
          </div>
        </div>
      </div>

      {/* Backdrop overlay with blur */}
      {isMenuOpen && (
        <div
          className="fixed inset-0 bg-primary-900/30 backdrop-blur-sm z-40 md:hidden animate-fade-in"
          onClick={() => setIsMenuOpen(false)}
        ></div>
      )}
    </nav>
  );
}
