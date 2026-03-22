import React from "react";
import { Link } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";

export default function Hero() {
  const { dark } = useTheme();

  return (
    <section className="relative min-h-screen bg-accent-mist dark:bg-dark-background overflow-hidden flex items-center font-sans transition-colors duration-300">

      {/* Background image overlay */}
      <div className="absolute inset-0">
        <img
          src="/smallgirls.jpg"
          alt=""
          className="w-full h-full object-cover opacity-10 dark:opacity-20"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-accent-mist/98 via-accent-mist/90 to-accent-mist/60 dark:from-dark-background/98 dark:via-dark-background/85 dark:to-dark-background/50" />
      </div>

      {/* Decorative blobs */}
      <div className="absolute top-20 right-10 w-96 h-96 bg-primary-200/30 dark:bg-primary-900/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-20 left-10 w-72 h-72 bg-accent-lime/10 dark:bg-accent-lime/5 rounded-full blur-3xl pointer-events-none" />

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 w-full py-24">
        <div className="grid lg:grid-cols-2 gap-16 items-center">

          {/* Left */}
          <div className="space-y-8 animate-fade-in-up">

            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-primary-100 dark:bg-primary-900/60 border border-primary-200 dark:border-primary-700 text-primary-700 dark:text-primary-300 px-4 py-2 rounded-full text-sm font-medium backdrop-blur-sm">
              <span className="w-2 h-2 bg-primary-500 dark:bg-primary-400 rounded-full animate-pulse" />
              Serving Rural Communities
            </div>

            {/* Heading */}
            <div className="space-y-4">
              <h1 className="text-5xl lg:text-6xl xl:text-7xl font-bold text-text-primary dark:text-dark-text-primary leading-[1.05] tracking-tight">
                Welcome to<br />
                <span className="text-primary-600 dark:text-primary-400">GramVartha</span>
              </h1>
              <p className="text-lg text-text-secondary dark:text-dark-text-secondary max-w-lg leading-relaxed font-light">
                Empowering rural communities through digital governance and transparent communication.
              </p>
            </div>

            {/* CTA */}
            <div className="flex flex-col sm:flex-row gap-4 pt-2">
              <Link
                to="/qr-scanner"
                className="inline-flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-400 text-white font-semibold px-8 py-4 rounded-xl transition-all duration-200 shadow-large dark:shadow-dark-large hover:-translate-y-0.5"
              >
                Scan QR to View Notices
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
              <Link
                to="/village/register"
                className="inline-flex items-center justify-center gap-2 bg-white dark:bg-dark-surface2 hover:bg-primary-50 dark:hover:bg-dark-surface border border-border dark:border-dark-border hover:border-primary-300 dark:hover:border-primary-600 text-text-primary dark:text-dark-text-primary font-semibold px-8 py-4 rounded-xl transition-all duration-200"
              >
                Register Village
              </Link>
            </div>

            {/* Stats */}
            <div className="flex gap-10 pt-4 border-t border-border dark:border-dark-border">
              <div>
                <p className="text-3xl font-bold text-text-primary dark:text-dark-text-primary">10,000+</p>
                <p className="text-sm text-text-muted dark:text-dark-text-muted mt-1">Active Readers</p>
              </div>
              <div className="w-px bg-border dark:bg-dark-border" />
              <div>
                <p className="text-3xl font-bold text-text-primary dark:text-dark-text-primary">50+</p>
                <p className="text-sm text-text-muted dark:text-dark-text-muted mt-1">Villages Served</p>
              </div>
              <div className="w-px bg-border dark:bg-dark-border" />
              <div>
                <p className="text-3xl font-bold text-text-primary dark:text-dark-text-primary">500+</p>
                <p className="text-sm text-text-muted dark:text-dark-text-muted mt-1">Notices Published</p>
              </div>
            </div>
          </div>

          {/* Right — floating cards */}
          <div className="hidden lg:flex flex-col gap-4 items-end">

            {/* Card 1 */}
            <div className="bg-white dark:bg-dark-surface border border-border dark:border-dark-border rounded-2xl p-5 w-64 hover:-translate-y-1 transition-all duration-300 shadow-medium dark:shadow-dark-medium">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/60 rounded-xl flex items-center justify-center">
                  <svg className="w-5 h-5 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <span className="w-2 h-2 bg-primary-500 rounded-full animate-pulse" />
              </div>
              <p className="text-sm font-semibold text-text-primary dark:text-dark-text-primary">New Notices</p>
              <p className="text-xs text-text-muted dark:text-dark-text-muted mt-1">Just added to your feed</p>
            </div>

            {/* Card 2 */}
            <div className="bg-white dark:bg-dark-surface border border-border dark:border-dark-border rounded-2xl p-5 w-64 hover:-translate-y-1 transition-all duration-300 shadow-medium dark:shadow-dark-medium">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/60 rounded-xl flex items-center justify-center">
                  <svg className="w-5 h-5 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
              </div>
              <p className="text-sm font-semibold text-text-primary dark:text-dark-text-primary">Village Coverage</p>
              <p className="text-xs text-text-muted dark:text-dark-text-muted mt-1">Across Maharashtra & beyond</p>
            </div>

            {/* Card 3 */}
            <div className="bg-primary-600 dark:bg-primary-800 border border-primary-500 dark:border-primary-700 rounded-2xl p-5 w-64 hover:-translate-y-1 transition-all duration-300 shadow-large dark:shadow-dark-large">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
              </div>
              <p className="text-sm font-semibold text-white">Simple & Fast</p>
              <p className="text-xs text-white/70 mt-1">Accessible to all citizens</p>
            </div>

          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
        <p className="text-xs text-text-muted dark:text-dark-text-muted uppercase tracking-widest font-medium">Scroll</p>
        <div className="w-5 h-8 border border-border dark:border-dark-border rounded-full flex justify-center pt-1.5">
          <div className="w-1 h-2 bg-primary-400 dark:bg-primary-500 rounded-full animate-bounce" />
        </div>
      </div>

    </section>
  );
}