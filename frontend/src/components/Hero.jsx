import React from "react";
import { Link } from "react-router-dom";

export default function Hero() {
  return (
    <section className="relative min-h-screen bg-[#1a3a2a] overflow-hidden flex items-center">
      
      {/* Background image overlay */}
      <div className="absolute inset-0">
        <img
          src="/illu1.png"
          alt=""
          className="w-full h-full object-cover opacity-20"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#1a3a2a]/95 via-[#1a3a2a]/80 to-[#1a3a2a]/50" />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 w-full py-24">
        <div className="grid lg:grid-cols-2 gap-16 items-center">

          {/* Left */}
          <div className="space-y-8">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-white/90 px-4 py-2 rounded-full text-sm font-medium backdrop-blur-sm">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              Serving Rural Communities
            </div>

            {/* Heading */}
            <div className="space-y-4">
              <h1 className="text-5xl lg:text-6xl xl:text-7xl font-bold text-white leading-[1.05] tracking-tight">
                Welcome to<br />
                <span className="text-green-400">GramVartha</span>
              </h1>
              <p className="text-lg text-white/70 max-w-lg leading-relaxed">
                Empowering rural communities through digital governance and transparent communication.
              </p>
            </div>

            {/* CTA */}
            <div className="flex flex-col sm:flex-row gap-4 pt-2">
              <Link
                to="/qr-scanner"
                className="inline-flex items-center justify-center gap-2 bg-green-500 hover:bg-green-400 text-white font-semibold px-8 py-4 rounded-xl transition-all duration-200 shadow-lg hover:shadow-green-500/30 hover:-translate-y-0.5"
              >
                Scan QR to View Notices
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
              <Link
                to="/village/register"
                className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 border border-white/25 text-white font-semibold px-8 py-4 rounded-xl transition-all duration-200 backdrop-blur-sm"
              >
                Register Village
              </Link>
            </div>

            {/* Stats */}
            <div className="flex gap-10 pt-4 border-t border-white/10">
              <div>
                <p className="text-3xl font-bold text-white">10,000+</p>
                <p className="text-sm text-white/50 mt-1">Active Readers</p>
              </div>
              <div className="w-px bg-white/10" />
              <div>
                <p className="text-3xl font-bold text-white">50+</p>
                <p className="text-sm text-white/50 mt-1">Villages Served</p>
              </div>
            </div>
          </div>

          {/* Right — floating cards */}
          <div className="hidden lg:flex flex-col gap-4 items-end">
            {/* Card 1 */}
            <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-5 w-64 hover:-translate-y-1 transition-transform duration-300">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-green-500/20 rounded-xl flex items-center justify-center">
                  <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              </div>
              <p className="text-sm font-semibold text-white">New Notices</p>
              <p className="text-xs text-white/50 mt-1">Just added to your feed</p>
            </div>

            {/* Card 2 */}
            <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-5 w-64 hover:-translate-y-1 transition-transform duration-300">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-green-500/20 rounded-xl flex items-center justify-center">
                  <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
              </div>
              <p className="text-sm font-semibold text-white">Village Coverage</p>
              <p className="text-xs text-white/50 mt-1">Across Maharashtra & beyond</p>
            </div>

            {/* Card 3 */}
            <div className="bg-green-500/20 backdrop-blur-md border border-green-400/30 rounded-2xl p-5 w-64 hover:-translate-y-1 transition-transform duration-300">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-green-400/20 rounded-xl flex items-center justify-center">
                  <svg className="w-5 h-5 text-green-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
              </div>
              <p className="text-sm font-semibold text-white">Simple & Fast</p>
              <p className="text-xs text-white/50 mt-1">Accessible to all citizens</p>
            </div>
          </div>

        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
        <p className="text-xs text-white/40 uppercase tracking-widest font-medium">Scroll</p>
        <div className="w-5 h-8 border border-white/20 rounded-full flex justify-center pt-1.5">
          <div className="w-1 h-2 bg-white/40 rounded-full animate-bounce" />
        </div>
      </div>
    </section>
  );
}