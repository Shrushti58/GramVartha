import React, { useState } from "react";

const features = [
  {
    number: "01",
    title: "QR-First Access",
    description:
      "Scan once and get instant access to village notices — no login, no account required. Designed for every citizen regardless of technical ability.",
    tag: "Zero Friction",
    image: "/illu1.png",
    icon: (
      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
      </svg>
    ),
  },
  {
    number: "02",
    title: "Offline Storage",
    description:
      "Village data is saved locally so citizens can access previously loaded notices even without an active internet connection.",
    tag: "Always Available",
    image: "/illu1.png",
    icon: (
      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
      </svg>
    ),
  },
  {
    number: "03",
    title: "Notice Management",
    description:
      "Officials can publish, edit, and manage public notices from a dedicated dashboard — fast and without technical complexity.",
    tag: "For Officials",
    image: "/illu1.png",
    icon: (
      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
  },
  {
    number: "04",
    title: "Scalable Backend",
    description:
      "Built on Express and MongoDB with unique indexing, ensuring the platform scales reliably as more villages come onboard.",
    tag: "Enterprise Grade",
    image: "/illu1.png",
    icon: (
      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
      </svg>
    ),
  },
];

export default function Features() {
  const [active, setActive] = useState(0);

  return (
    <section className="py-20 lg:py-28 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">

        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between mb-16 gap-6">
          <div className="max-w-xl">
            <span className="inline-flex items-center gap-2 text-green-600 text-sm font-semibold uppercase tracking-wider mb-4">
              <span className="w-6 h-px bg-green-600" />
              What We Offer
            </span>
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 leading-tight tracking-tight">
              Key Features
            </h2>
            <p className="mt-4 text-lg text-gray-500 leading-relaxed">
              Built for rural India — every feature is designed with simplicity, reach, and reliability in mind.
            </p>
          </div>
          {/* Feature count */}
          <div className="flex items-center gap-1">
            {features.map((_, i) => (
              <button
                key={i}
                onClick={() => setActive(i)}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  active === i ? "w-8 bg-green-500" : "w-4 bg-gray-200 hover:bg-gray-300"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Main Feature Display */}
        <div className="grid lg:grid-cols-2 gap-8 items-stretch mb-10">

          {/* Left: Active Feature Visual */}
          <div className="relative rounded-3xl overflow-hidden bg-[#1a3a2a] min-h-[420px] flex flex-col justify-end">
            {/* Background image */}
            <img
              src={features[active].image}
              alt={features[active].title}
              className="absolute inset-0 w-full h-full object-cover opacity-25 transition-opacity duration-500"
            />

            {/* Oversized number */}
            <div className="absolute top-0 right-0 leading-none font-black text-white/5 text-[180px] select-none pointer-events-none translate-x-6 -translate-y-4">
              {features[active].number}
            </div>

            {/* Content overlay */}
            <div className="relative z-10 p-10">
              <span className="inline-block bg-green-500/20 border border-green-400/30 text-green-300 text-xs font-semibold uppercase tracking-wider px-3 py-1 rounded-full mb-5">
                {features[active].tag}
              </span>
              <div className="w-12 h-12 bg-green-500/20 border border-green-400/30 rounded-xl flex items-center justify-center mb-5">
                {features[active].icon}
              </div>
              <h3 className="text-3xl font-bold text-white mb-3">{features[active].title}</h3>
              <p className="text-white/60 leading-relaxed max-w-sm">{features[active].description}</p>
            </div>
          </div>

          {/* Right: Feature List */}
          <div className="flex flex-col gap-4">
            {features.map((feature, index) => (
              <button
                key={index}
                onClick={() => setActive(index)}
                className={`group relative text-left rounded-2xl p-6 border transition-all duration-300 overflow-hidden ${
                  active === index
                    ? "bg-green-600 border-green-600 shadow-lg shadow-green-500/20"
                    : "bg-white border-gray-100 hover:border-green-200 hover:shadow-md"
                }`}
              >
                {/* Oversized number background */}
                <span
                  className={`absolute right-4 top-1/2 -translate-y-1/2 text-8xl font-black leading-none select-none pointer-events-none transition-colors duration-300 ${
                    active === index ? "text-white/10" : "text-gray-100 group-hover:text-green-50"
                  }`}
                >
                  {feature.number}
                </span>

                <div className="relative z-10 flex items-center gap-4">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors duration-300 ${
                      active === index ? "bg-white/20" : "bg-green-50 group-hover:bg-green-100"
                    }`}
                  >
                    <span className={active === index ? "text-white" : "text-green-600"}>
                      {React.cloneElement(feature.icon, {
                        className: "w-5 h-5",
                      })}
                    </span>
                  </div>
                  <div>
                    <p
                      className={`text-base font-semibold transition-colors duration-300 ${
                        active === index ? "text-white" : "text-gray-900"
                      }`}
                    >
                      {feature.title}
                    </p>
                    <p
                      className={`text-xs mt-0.5 transition-colors duration-300 ${
                        active === index ? "text-white/60" : "text-gray-400"
                      }`}
                    >
                      {feature.tag}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}