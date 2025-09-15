import React from "react";
import { useTranslation } from "react-i18next";

export default function About() {
  const { t } = useTranslation();
  
  return (
    <section className="p-10 md:p-16 lg:p-20 bg-gradient-to-br from-[#FFF9E6] to-[#f5edd8]">
      <div className="max-w-6xl mx-auto">
        <div className="text-center md:text-left">
          <h2 className="text-3xl md:text-4xl font-extrabold mb-6 text-[#37474F] tracking-tight">
            {t("about_title")}
          </h2>
          <p className="text-lg md:text-xl text-[#37474F] max-w-2xl mx-auto md:mx-0 leading-relaxed">
            {t("about_text")}
          </p>
        </div>
        
        {/* Stats Section */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center p-6 rounded-xl bg-white shadow-sm hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 border border-[#f5edd8]">
            <div className="text-4xl font-bold text-[#2E8B57] mb-2">10K+</div>
            <div className="text-[#37474F] font-medium">Active Readers</div>
          </div>
          
          <div className="text-center p-6 rounded-xl bg-white shadow-sm hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 border border-[#f5edd8]">
            <div className="text-4xl font-bold text-[#B5651D] mb-2">50+</div>
            <div className="text-[#37474F] font-medium">Villages Served</div>
          </div>
          
          <div className="text-center p-6 rounded-xl bg-white shadow-sm hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 border border-[#f5edd8]">
            <div className="text-4xl font-bold text-[#4A90E2] mb-2">24/7</div>
            <div className="text-[#37474F] font-medium">News Updates</div>
          </div>
        </div>
      </div>
    </section>
  );
}