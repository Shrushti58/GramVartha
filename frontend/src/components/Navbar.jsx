import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";

const scrollTo = (id) => {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: "smooth" });
};

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { dark, toggleTheme } = useTheme();
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
        className={`fixed top-0 left-0 right-0 z-50 font-sans transition-all duration-300 ${
          scrolled
            ? "bg-white/95 dark:bg-dark-surface/95 backdrop-blur-lg shadow-medium dark:shadow-dark-medium border-b border-border dark:border-dark-border"
            : "bg-white/90 dark:bg-dark-surface/90 backdrop-blur-md border-b border-border/60 dark:border-dark-border/60"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">

            {/* Logo */}
            <Link to="/" className="flex items-center space-x-3 group">
              <div className="w-9 h-9 rounded-lg overflow-hidden border border-primary-200 dark:border-primary-700 flex items-center justify-center bg-accent-mist dark:bg-dark-surface2">
                <img
                  src="/gramvarthalogo.png"
                  alt="GramVartha Logo"
                  className="w-full h-full object-contain"
                />
              </div>
              <span className="text-lg font-bold tracking-tight text-text-primary dark:text-dark-text-primary group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors duration-200">
                GramVartha
              </span>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center space-x-1">
              <button
                onClick={() => handleNavClick("about")}
                className="text-sm font-medium text-text-secondary dark:text-dark-text-secondary hover:text-primary-600 dark:hover:text-primary-400 px-4 py-2 rounded-lg hover:bg-accent-mist dark:hover:bg-dark-surface2 transition-all duration-200"
              >
                About
              </button>
              <button
                onClick={() => handleNavClick("features")}
                className="text-sm font-medium text-text-secondary dark:text-dark-text-secondary hover:text-primary-600 dark:hover:text-primary-400 px-4 py-2 rounded-lg hover:bg-accent-mist dark:hover:bg-dark-surface2 transition-all duration-200"
              >
                Features
              </button>

              <div className="w-px h-5 bg-border dark:bg-dark-border mx-2" />

              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg border border-border dark:border-dark-border hover:bg-accent-mist dark:hover:bg-dark-surface2 text-text-muted dark:text-dark-text-muted hover:text-primary-600 dark:hover:text-primary-400 transition-all duration-200"
                aria-label="Toggle theme"
              >
                {dark ? (
                  // Sun icon
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M12 3v1m0 16v1m8.66-9h-1M4.34 12h-1m15.07-6.07-.7.7M6.34 17.66l-.7.7m12.02 0-.7-.7M6.34 6.34l-.7-.7M12 7a5 5 0 100 10A5 5 0 0012 7z"
                    />
                  </svg>
                ) : (
                  // Moon icon
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"
                    />
                  </svg>
                )}
              </button>

              <Link
                to="/officials/login"
                className="text-sm font-medium text-text-primary dark:text-dark-text-primary px-4 py-2 rounded-lg border border-border dark:border-dark-border hover:border-primary-400 dark:hover:border-primary-500 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-accent-mist dark:hover:bg-dark-surface2 transition-all duration-200"
              >
                Officials Login
              </Link>
              <Link
                to="/admin/login"
                className="text-sm font-medium text-text-primary dark:text-dark-text-primary px-4 py-2 rounded-lg border border-border dark:border-dark-border hover:border-primary-400 dark:hover:border-primary-500 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-accent-mist dark:hover:bg-dark-surface2 transition-all duration-200"
              >
                Admin Login
              </Link>
              <Link
                to="/village/register"
                className="text-sm font-semibold text-white px-5 py-2 rounded-lg bg-primary-600 hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-400 transition-all duration-200 shadow-soft"
              >
                Register Village
              </Link>
            </div>

            {/* Mobile Right — Theme Toggle + Hamburger */}
            <div className="md:hidden flex items-center gap-2">
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg border border-border dark:border-dark-border hover:bg-accent-mist dark:hover:bg-dark-surface2 text-text-muted dark:text-dark-text-muted transition-all duration-200"
                aria-label="Toggle theme"
              >
                {dark ? (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M12 3v1m0 16v1m8.66-9h-1M4.34 12h-1m15.07-6.07-.7.7M6.34 17.66l-.7.7m12.02 0-.7-.7M6.34 6.34l-.7-.7M12 7a5 5 0 100 10A5 5 0 0012 7z"
                    />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"
                    />
                  </svg>
                )}
              </button>

              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-2 rounded-lg text-text-secondary dark:text-dark-text-secondary hover:bg-accent-mist dark:hover:bg-dark-surface2 transition-all duration-200"
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
        </div>

        {/* Mobile Menu */}
        <div
          className={`md:hidden overflow-hidden transition-all duration-300 ${
            isMenuOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <div className="bg-white dark:bg-dark-surface border-t border-border dark:border-dark-border px-6 py-4 space-y-1">
            <button
              onClick={() => handleNavClick("about")}
              className="block w-full text-left text-sm font-medium text-text-secondary dark:text-dark-text-secondary px-4 py-3 rounded-lg hover:bg-accent-mist dark:hover:bg-dark-surface2 hover:text-primary-600 dark:hover:text-primary-400 transition-all duration-200"
            >
              About
            </button>
            <button
              onClick={() => handleNavClick("features")}
              className="block w-full text-left text-sm font-medium text-text-secondary dark:text-dark-text-secondary px-4 py-3 rounded-lg hover:bg-accent-mist dark:hover:bg-dark-surface2 hover:text-primary-600 dark:hover:text-primary-400 transition-all duration-200"
            >
              Features
            </button>

            <div className="pt-2 border-t border-border dark:border-dark-border space-y-2 mt-2">
              <p className="text-xs font-semibold text-text-muted dark:text-dark-text-muted uppercase tracking-wider px-4 pb-1">
                Login Portals
              </p>
              <Link
                to="/officials/login"
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center justify-between text-sm font-medium text-text-primary dark:text-dark-text-primary px-4 py-3 rounded-lg border border-border dark:border-dark-border hover:border-primary-400 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-accent-mist dark:hover:bg-dark-surface2 transition-all duration-200"
              >
                <span>Officials Login</span>
                <svg className="w-4 h-4 text-text-muted dark:text-dark-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
              <Link
                to="/admin/login"
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center justify-between text-sm font-medium text-text-primary dark:text-dark-text-primary px-4 py-3 rounded-lg border border-border dark:border-dark-border hover:border-primary-400 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-accent-mist dark:hover:bg-dark-surface2 transition-all duration-200"
              >
                <span>Admin Login</span>
                <svg className="w-4 h-4 text-text-muted dark:text-dark-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
              <Link
                to="/village/register"
                onClick={() => setIsMenuOpen(false)}
                className="block text-sm font-semibold text-white text-center px-4 py-3 rounded-lg bg-primary-600 hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-400 transition-all duration-200"
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