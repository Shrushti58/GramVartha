import React from "react";

export default function Features() {
  const features = [
    { 
      title: "Secure Platform", 
      description: "Enterprise-grade security ensuring your data and communications are protected with end-to-end encryption and privacy controls.",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 md:h-10 md:w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      )
    },
    { 
      title: "Fast Delivery", 
      description: "Lightning-fast news delivery and real-time updates ensuring you get critical information when you need it most.",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 md:h-10 md:w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      )
    },
    { 
      title: "Community Focused", 
      description: "Built specifically for rural communities with features that empower local governance and foster community engagement.",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 md:h-10 md:w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      )
    }
  ];

  return (
    <section className="py-16 md:py-20 lg:py-24 bg-gradient-to-br from-primary-50 via-primary-100 to-primary-200 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Title */}
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-primary-900 mb-6 tracking-tight font-serif">
            Key Features
          </h2>
          <p className="text-lg md:text-xl lg:text-2xl text-primary-700 max-w-3xl mx-auto leading-relaxed font-medium">
            Discover the powerful features that make GramVartha the leading platform for rural digital governance and community empowerment.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-6 md:gap-8 max-w-4xl mx-auto">
          {features.map((feature, index) => (
            <div 
              key={index}
              className="bg-surface rounded-2xl p-6 md:p-8 shadow-soft-earth hover:shadow-earth-md transition-all duration-300 transform hover:-translate-y-2 border border-primary-200/50 backdrop-blur-sm"
            >
              {/* Icon Container */}
              <div className="flex items-center justify-center w-16 h-16 md:w-20 md:h-20 bg-primary-100 rounded-2xl mb-6 mx-auto group-hover:scale-110 transition-transform duration-300">
                <div className="text-primary-600">
                  {feature.icon}
                </div>
              </div>

              {/* Feature Title */}
              <h3 className="text-xl md:text-2xl font-bold text-primary-900 mb-4 text-center tracking-tight font-serif">
                {feature.title}
              </h3>

              {/* Feature Description */}
              <p className="text-primary-600 leading-relaxed text-center text-sm md:text-base">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <button className="bg-gradient-to-b from-primary-500 to-primary-600 text-white px-8 py-4 rounded-2xl font-medium hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 shadow-md hover:shadow-xl text-lg">
            Explore All Features
          </button>
        </div>
      </div>
    </section>
  );
}