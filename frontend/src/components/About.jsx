import React from "react";

export default function About() {
  return (
    <section className="py-20 lg:py-28 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">

        {/* Top Header */}
        <div className="max-w-2xl mb-16">
          <span className="inline-flex items-center gap-2 text-green-600 text-sm font-semibold uppercase tracking-wider mb-4">
            <span className="w-6 h-px bg-green-600" />
            About Us
          </span>
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 leading-tight tracking-tight">
            About GramVartha
          </h2>
          <p className="mt-5 text-lg text-gray-500 leading-relaxed">
            Transforming rural governance through innovative digital solutions that bridge the gap between communities and local authorities.
          </p>
        </div>

        {/* Split Layout */}
        <div className="grid lg:grid-cols-2 gap-14 items-center">

          {/* Left — Image Block */}
          <div className="relative">
            {/* Decorative background blob */}
            <div className="absolute -inset-4 bg-green-50 rounded-3xl -z-10" />

            {/* Main image */}
            <div className="relative rounded-2xl overflow-hidden aspect-[4/3] shadow-xl">
              <img
                src="/illu1.png"
                alt="GramVartha in action"
                className="w-full h-full object-cover"
              />
              {/* Dark gradient at bottom */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

              {/* Floating villages badge — bottom left */}
              <div className="absolute bottom-5 left-5 bg-white rounded-xl shadow-lg px-4 py-3 flex items-center gap-3">
                <div className="w-9 h-9 bg-green-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-medium">Villages Served</p>
                  <p className="text-sm font-bold text-gray-900">50+ Villages</p>
                </div>
              </div>

              {/* Floating readers badge — top right */}
              <div className="absolute top-5 right-5 bg-[#1a3a2a] rounded-xl px-4 py-3 flex items-center gap-3">
                <div className="w-9 h-9 bg-green-500/20 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs text-white/50 font-medium">Active Readers</p>
                  <p className="text-sm font-bold text-white">10,000+</p>
                </div>
              </div>
            </div>

            {/* Small accent card below image */}
            <div className="mt-4 bg-[#1a3a2a] rounded-2xl px-6 py-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                <p className="text-white text-sm font-medium">Platform actively serving rural Maharashtra</p>
              </div>
              <span className="text-green-400 text-sm font-semibold">Live</span>
            </div>
          </div>

          {/* Right — Text Content */}
          <div className="space-y-8">
            <div className="space-y-5">
              <h3 className="text-3xl lg:text-4xl font-bold text-gray-900 leading-snug">
                Empowering rural communities through digital governance
              </h3>
              <p className="text-gray-500 leading-relaxed">
                GramVartha is a digital platform built to connect villages with their local government. We make it easy for citizens to access official notices, government updates, and public announcements — directly from their phones.
              </p>
              <p className="text-gray-500 leading-relaxed">
                Our QR-based system ensures that even citizens with limited internet access can stay informed. By placing QR codes in public spaces, we bring governance to every doorstep.
              </p>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-3 gap-4 py-6 border-y border-gray-100">
              <div>
                <p className="text-3xl font-bold text-green-600">10K+</p>
                <p className="text-sm text-gray-400 mt-1">Active Readers</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-green-600">50+</p>
                <p className="text-sm text-gray-400 mt-1">Villages Onboarded</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-green-600">100%</p>
                <p className="text-sm text-gray-400 mt-1">Free Access</p>
              </div>
            </div>

            {/* Feature checklist */}
            <div className="space-y-3">
              {[
                "No login required — scan and access instantly",
                "Works in low connectivity areas",
                "Available in local languages",
                "Verified official notices only",
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-3 h-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className="text-sm text-gray-600">{item}</p>
                </div>
              ))}
            </div>

          </div>
        </div>

      </div>
    </section>
  );
}