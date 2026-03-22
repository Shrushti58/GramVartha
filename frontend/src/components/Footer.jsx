import React from "react";
import { Link } from "react-router-dom";

const scrollTo = (id) => {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: "smooth" });
};

export default function Footer() {
  return (
    <footer className="bg-primary-900 dark:bg-dark-background text-white font-sans transition-colors duration-300 overflow-hidden">

      {/* CTA Banner */}
      <div className="border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16 flex flex-col lg:flex-row items-center justify-between gap-8">
          <div>
            <h2 className="text-3xl lg:text-4xl font-bold text-white leading-tight">
              Ready to connect your village?
            </h2>
            <p className="mt-3 text-white/50 text-base">
              Join 50+ villages already on GramVartha.
            </p>
          </div>
          <div className="flex gap-4 flex-shrink-0">
            <Link
              to="/village/register"
              className="inline-flex items-center gap-2 bg-primary-500 hover:bg-primary-400 text-white font-semibold px-7 py-3.5 rounded-xl transition-all duration-200 shadow-large hover:-translate-y-0.5"
            >
              Register Village
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">

          {/* Brand */}
          <div className="md:col-span-2 space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg overflow-hidden bg-primary-600/30 border border-primary-500/30 flex items-center justify-center">
                <img src="/gramvarthalogo.png" alt="GramVartha" className="w-full h-full object-contain" />
              </div>
              <span className="text-xl font-bold text-white">GramVartha</span>
            </div>
            <p className="text-white/50 text-sm leading-relaxed max-w-xs">
              Connecting rural communities with their local government through transparent digital governance.
            </p>
            <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-2">
              <span className="w-2 h-2 bg-primary-400 rounded-full animate-pulse" />
              <span className="text-xs text-white/60 font-medium">Platform is live across Maharashtra</span>
            </div>
          </div>

          {/* Platform */}
          <div>
            <h4 className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-5">Platform</h4>
            <ul className="space-y-3">
              {[
                { label: "About", action: () => scrollTo("about") },
                { label: "Features", action: () => scrollTo("features") },
              ].map((item) => (
                <li key={item.label}>
                  <button
                    onClick={item.action}
                    className="text-sm text-white/50 hover:text-primary-400 transition-colors duration-200 text-left"
                  >
                    {item.label}
                  </button>
                </li>
              ))}
              <li>
                <Link
                  to="/village/register"
                  className="text-sm text-white/50 hover:text-primary-400 transition-colors duration-200"
                >
                  Register Village
                </Link>
              </li>
            </ul>
          </div>

          {/* Portals */}
          <div>
            <h4 className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-5">Portals</h4>
            <ul className="space-y-3">
              <li>
                <Link
                  to="/officials/login"
                  className="text-sm text-white/50 hover:text-primary-400 transition-colors duration-200"
                >
                  Officials Login
                </Link>
              </li>
              <li>
                <Link
                  to="/admin/login"
                  className="text-sm text-white/50 hover:text-primary-400 transition-colors duration-200"
                >
                  Admin Login
                </Link>
              </li>
            </ul>
          </div>

        </div>
      </div>

     

      {/* Bottom Bar */}
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between py-6 gap-4">
            <p className="text-xs text-white/30">
              © {new Date().getFullYear()} GramVartha. All rights reserved.
            </p>
            
          </div>
        </div>
      </div>

    </footer>
  );
}