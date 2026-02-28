import React from "react";
import { Link } from "react-router-dom";

const scrollTo = (id) => {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: "smooth" });
};

export default function Footer() {
  return (
    <footer className="bg-[#1a3a2a] text-white overflow-hidden">

      {/* CTA Banner */}
      <div className="border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16 flex flex-col lg:flex-row items-center justify-between gap-8">
          <div>
            <h2 className="text-3xl lg:text-4xl font-bold text-white leading-tight">
              Ready to connect your village?
            </h2>
            <p className="mt-3 text-white/50 text-lg">
              Join 50+ villages already on GramVartha.
            </p>
          </div>
          <div className="flex gap-4 flex-shrink-0">
            <Link
              to="/village/register"
              className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-400 text-white font-semibold px-7 py-3.5 rounded-xl transition-all duration-200 shadow-lg hover:shadow-green-500/30"
            >
              Register Village
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
            <Link
              to="/qr-scanner"
              className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold px-7 py-3.5 rounded-xl transition-all duration-200"
            >
              Scan QR
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
              <div className="w-9 h-9 rounded-lg overflow-hidden bg-green-500/20 border border-green-400/20 flex items-center justify-center">
                <img src="/gramvarthalogo.png" alt="GramVartha" className="w-full h-full object-contain" />
              </div>
              <span className="text-xl font-bold text-white">GramVartha</span>
            </div>
            <p className="text-white/50 text-sm leading-relaxed max-w-xs">
              Connecting rural communities with their local government through transparent digital governance.
            </p>
            <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-2">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="text-xs text-white/60 font-medium">Platform is live across Maharashtra</span>
            </div>
          </div>

          {/* Platform Links */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-5">Platform</h4>
            <ul className="space-y-3">
              <li>
                <button
                  onClick={() => scrollTo("about")}
                  className="text-sm text-white/50 hover:text-green-400 transition-colors duration-200 text-left"
                >
                  About
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollTo("features")}
                  className="text-sm text-white/50 hover:text-green-400 transition-colors duration-200 text-left"
                >
                  Features
                </button>
              </li>
              <li>
                <Link
                  to="/qr-scanner"
                  className="text-sm text-white/50 hover:text-green-400 transition-colors duration-200"
                >
                  Scan QR
                </Link>
              </li>
              <li>
                <Link
                  to="/village/register"
                  className="text-sm text-white/50 hover:text-green-400 transition-colors duration-200"
                >
                  Register Village
                </Link>
              </li>
            </ul>
          </div>

          {/* Portals */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-5">Portals</h4>
            <ul className="space-y-3">
              <li>
                <Link
                  to="/officials/login"
                  className="text-sm text-white/50 hover:text-green-400 transition-colors duration-200"
                >
                  Officials Login
                </Link>
              </li>
              <li>
                <Link
                  to="/admin/login"
                  className="text-sm text-white/50 hover:text-green-400 transition-colors duration-200"
                >
                  Admin Login
                </Link>
              </li>
            </ul>
          </div>

        </div>
      </div>

      {/* Bottom bar + Giant wordmark */}
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between py-6 gap-4">
            <p className="text-xs text-white/30">
              © {new Date().getFullYear()} GramVartha. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              {["Privacy Policy", "Terms of Service"].map((item) => (
                <a
                  key={item}
                  href="#"
                  className="text-xs text-white/30 hover:text-white/60 transition-colors duration-200"
                >
                  {item}
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Giant wordmark */}
       
      </div>

    </footer>
  );
}