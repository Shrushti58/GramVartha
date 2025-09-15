import React from "react";
import { useTranslation } from "react-i18next";

export default function Features() {
  const { t } = useTranslation();

  const features = [
    { 
      key: "f1", 
      descKey: "f1_desc",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      )
    },
    { 
      key: "f2", 
      descKey: "f2_desc",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      )
    },
    { 
      key: "f3", 
      descKey: "f3_desc",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      )
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-[#FFF9E6] to-[#f5edd8] relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-[#2E8B57] rounded-full mix-blend-multiply opacity-10"></div>
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-[#B5651D] rounded-full mix-blend-multiply opacity-10"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Title */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-extrabold text-[#37474F] mb-4 tracking-tight">
            {t("nav_features")}
          </h2>
          <div className="w-20 h-1 bg-gradient-to-r from-[#2E8B57] to-[#B5651D] mx-auto rounded-full"></div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature) => (
            <div 
              key={feature.key}
              className="bg-white rounded-xl shadow-sm p-8 transition-all duration-300 hover:shadow-xl hover:-translate-y-2 group relative overflow-hidden border border-[#f5edd8]"
            >
              {/* Hover effect background */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#2E8B57]/10 to-[#B5651D]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-0"></div>
              
              <div className="relative z-10">
                {/* Icon Container */}
                <div className="inline-flex items-center justify-center p-3 bg-gradient-to-r from-[#2E8B57] to-[#B5651D] rounded-lg mb-6 text-white group-hover:scale-110 transition-transform duration-300 shadow-md">
                  {feature.icon}
                </div>

                {/* Feature Title */}
                <h3 className="text-xl md:text-2xl font-bold text-[#37474F] mb-4 tracking-tight">
                  {t(feature.key)}
                </h3>

                {/* Feature Description */}
                <p className="text-[#37474F] leading-relaxed">
                  {t(feature.descKey)}
                </p>

                {/* Decorative line */}
                <div className="w-12 h-0.5 bg-gradient-to-r from-[#2E8B57] to-[#B5651D] mt-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <button className="bg-gradient-to-b from-[#3DA56B] to-[#2E8B57] text-white px-8 py-3 rounded-lg font-medium hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5 shadow-md">
            {t("explore_all_features")}
          </button>
        </div>
      </div>
    </section>
  );
}