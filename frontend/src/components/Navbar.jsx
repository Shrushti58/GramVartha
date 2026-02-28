import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";

const scrollTo = (id) => {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: "smooth" });
};

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const isHome = location.pathname === "/";

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
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
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-white shadow-md border-b border-gray-100"
            : "bg-white/95 backdrop-blur-md border-b border-gray-100"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">

            {/* Logo */}
            <Link to="/" className="flex items-center space-x-3 group">
              <div className="w-9 h-9 rounded-lg overflow-hidden border border-green-100 flex items-center justify-center bg-green-50">
                <img
                  src="/gramvarthalogo.png"
                  alt="GramVartha Logo"
                  className="w-full h-full object-contain"
                />
              </div>
              <span className="text-lg font-bold text-gray-900 tracking-tight group-hover:text-green-700 transition-colors duration-200">
                GramVartha
              </span>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center space-x-1">
              <button
                onClick={() => handleNavClick("about")}
                className="text-sm font-medium text-gray-600 hover:text-green-700 px-4 py-2 rounded-lg hover:bg-green-50 transition-all duration-200"
              >
                About
              </button>
              <button
                onClick={() => handleNavClick("features")}
                className="text-sm font-medium text-gray-600 hover:text-green-700 px-4 py-2 rounded-lg hover:bg-green-50 transition-all duration-200"
              >
                Features
              </button>
              <Link
                to="/qr-scanner"
                className="text-sm font-medium text-gray-600 hover:text-green-700 px-4 py-2 rounded-lg hover:bg-green-50 transition-all duration-200"
              >
                Scan QR
              </Link>

              <div className="w-px h-5 bg-gray-200 mx-2" />

              <Link
                to="/officials/login"
                className="text-sm font-medium text-gray-700 px-4 py-2 rounded-lg border border-gray-200 hover:border-green-300 hover:text-green-700 hover:bg-green-50 transition-all duration-200"
              >
                Officials Login
              </Link>
              <Link
                to="/admin/login"
                className="text-sm font-medium text-gray-700 px-4 py-2 rounded-lg border border-gray-200 hover:border-green-300 hover:text-green-700 hover:bg-green-50 transition-all duration-200"
              >
                Admin Login
              </Link>
              <Link
                to="/village/register"
                className="text-sm font-semibold text-white px-5 py-2 rounded-lg bg-green-600 hover:bg-green-700 transition-all duration-200 shadow-sm"
              >
                Register Village
              </Link>
            </div>

            {/* Mobile Hamburger */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-all duration-200"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <div
          className={`md:hidden overflow-hidden transition-all duration-300 ${
            isMenuOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <div className="bg-white border-t border-gray-100 px-6 py-4 space-y-1">
            <button
              onClick={() => handleNavClick("about")}
              className="block w-full text-left text-sm font-medium text-gray-700 px-4 py-3 rounded-lg hover:bg-green-50 hover:text-green-700 transition-all duration-200"
            >
              About
            </button>
            <button
              onClick={() => handleNavClick("features")}
              className="block w-full text-left text-sm font-medium text-gray-700 px-4 py-3 rounded-lg hover:bg-green-50 hover:text-green-700 transition-all duration-200"
            >
              Features
            </button>
            <Link
              to="/qr-scanner"
              onClick={() => setIsMenuOpen(false)}
              className="block text-sm font-medium text-gray-700 px-4 py-3 rounded-lg hover:bg-green-50 hover:text-green-700 transition-all duration-200"
            >
              Scan QR
            </Link>

            <div className="pt-2 border-t border-gray-100 space-y-2 mt-2">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-4 pb-1">
                Login Portals
              </p>
              <Link
                to="/officials/login"
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center justify-between text-sm font-medium text-gray-700 px-4 py-3 rounded-lg border border-gray-200 hover:border-green-300 hover:text-green-700 hover:bg-green-50 transition-all duration-200"
              >
                <span>Officials Login</span>
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
              <Link
                to="/admin/login"
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center justify-between text-sm font-medium text-gray-700 px-4 py-3 rounded-lg border border-gray-200 hover:border-green-300 hover:text-green-700 hover:bg-green-50 transition-all duration-200"
              >
                <span>Admin Login</span>
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
              <Link
                to="/village/register"
                onClick={() => setIsMenuOpen(false)}
                className="block text-sm font-semibold text-white text-center px-4 py-3 rounded-lg bg-green-600 hover:bg-green-700 transition-all duration-200"
              >
                Register Village
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Spacer */}
      <div className="h-16" />
    </>
  );
}