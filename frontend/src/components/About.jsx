import React from "react";
import { useTranslation } from "react-i18next";

export default function About() {
  const { t } = useTranslation();
  
  return (
    <section className="p-10 md:p-16 lg:p-20 bg-gradient-to-br from-white to-gray-50">
      <div className="max-w-6xl mx-auto">
        <div className="text-center md:text-left">
          <h2 className="text-3xl md:text-4xl font-extrabold mb-6 text-gray-900 tracking-tight">
            {t("about_title")}
          </h2>
          <p className="text-lg md:text-xl text-gray-700 max-w-2xl mx-auto md:mx-0 leading-relaxed">
            {t("about_text")}
          </p>
        </div>
        
        {/* Optional Stats Section */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center p-6 rounded-xl hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
            <div className="text-4xl font-bold text-green-600 mb-2">10K+</div>
            <div className="text-gray-600 font-medium">Active Readers</div>
          </div>
          
          <div className="text-center p-6 rounded-xl hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
            <div className="text-4xl font-bold text-blue-600 mb-2">50+</div>
            <div className="text-gray-600 font-medium">Villages Served</div>
          </div>
          
          <div className="text-center p-6 rounded-xl hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
            <div className="text-4xl font-bold text-pink-600 mb-2">24/7</div>
            <div className="text-gray-600 font-medium">News Updates</div>
          </div>
        </div>
        
        
      </div>
    </section>
  );
}