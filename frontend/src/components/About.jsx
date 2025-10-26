import React from "react";

export default function About() {
  return (
    <section className="py-16 md:py-20 lg:py-24 bg-gradient-to-br from-primary-50 via-primary-100 to-primary-200 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-primary-900 mb-6 tracking-tight font-serif">
            About GramVartha
          </h2>
          <p className="text-lg md:text-xl lg:text-2xl text-primary-700 max-w-3xl mx-auto leading-relaxed font-medium">
            Transforming rural governance through innovative digital solutions that bridge the gap between communities and local authorities, fostering transparency and empowerment.
          </p>
        </div>
        

        {/* Mission Section */}
        <div className="mt-20 text-center">
          <h3 className="text-2xl md:text-3xl font-bold text-primary-900 font-serif mb-8">Our Mission</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="bg-surface rounded-2xl p-6 shadow-soft-earth border border-primary-200/50 backdrop-blur-sm">
              <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center mb-4 mx-auto">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h4 className="text-lg font-semibold text-primary-900 mb-2">Transparency</h4>
              <p className="text-primary-600 text-sm">Ensuring open and honest communication between communities and authorities</p>
            </div>
            
            <div className="bg-surface rounded-2xl p-6 shadow-soft-earth border border-primary-200/50 backdrop-blur-sm">
              <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center mb-4 mx-auto">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h4 className="text-lg font-semibold text-primary-900 mb-2">Efficiency</h4>
              <p className="text-primary-600 text-sm">Streamlining access to government services and information</p>
            </div>
            
            <div className="bg-surface rounded-2xl p-6 shadow-soft-earth border border-primary-200/50 backdrop-blur-sm">
              <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center mb-4 mx-auto">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h4 className="text-lg font-semibold text-primary-900 mb-2">Community</h4>
              <p className="text-primary-600 text-sm">Empowering rural communities through digital inclusion and participation</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}