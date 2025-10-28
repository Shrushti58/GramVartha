import React from "react";
import {Link} from "react-router-dom"

export default function Hero() {
  return (
    <section className="min-h-screen relative overflow-hidden flex items-center justify-center bg-gradient-to-br from-primary-50 via-primary-100 to-primary-200 py-8 md:py-16 font-sans">
      {/* Enhanced animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Improved gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-primary-100/40 via-transparent to-primary-50/30"></div>
        
        {/* Enhanced floating elements with better positioning - reduced on mobile */}
        <div className="absolute top-1/4 left-4 md:left-10 w-12 h-12 md:w-20 md:h-20 bg-gradient-to-br from-primary-300 to-primary-400 rounded-full opacity-20 animate-float blur-sm"></div>
        <div className="absolute top-1/3 right-8 md:right-20 w-8 h-8 md:w-12 md:h-12 bg-gradient-to-br from-primary-400 to-primary-500 rounded-full opacity-30 animate-float animation-delay-2000"></div>
        <div className="absolute bottom-1/4 left-8 md:left-20 w-10 h-10 md:w-16 md:h-16 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full opacity-25 animate-float animation-delay-4000 blur-sm"></div>
        <div className="absolute bottom-1/3 right-8 md:right-16 w-10 h-10 md:w-18 md:h-18 bg-gradient-to-br from-accent-teal/50 to-accent-teal rounded-full opacity-20 animate-float animation-delay-3000"></div>
        
        {/* Additional decorative elements - hidden on mobile */}
        <div className="hidden md:block absolute top-1/2 left-1/4 w-8 h-8 bg-primary-300 rounded-full opacity-15 animate-pulse"></div>
        <div className="hidden md:block absolute top-3/4 right-1/3 w-6 h-6 bg-primary-400 rounded-full opacity-20 animate-pulse animation-delay-1000"></div>
        
        {/* Subtle pattern overlay */}
        <div className="absolute inset-0 opacity-[0.02] bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4MCIgaGVpZ2h0PSI4MCIgdmlld0JveD0iMCAwIDgwIDgwIj48ZyBmaWxsPSJub25lIiBzdHJva2U9IiMwMDAiIHN0cm9rZS13aWR0aD0iMSI+PGNpcmNsZSBjeD0iNDAiIGN5PSI0MCIgcj0iMzgiLz48L2c+PC9zdmc+')]"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
        <div className="grid lg:grid-cols-2 gap-8 md:gap-16 items-center">
          
          {/* Enhanced Left Content */}
          <div className="text-center lg:text-left space-y-6 md:space-y-8">
            <div className="inline-flex items-center bg-primary-100 text-primary-800 px-4 py-2 md:px-5 md:py-3 rounded-full text-xs md:text-sm font-semibold mb-4 md:mb-6 border border-primary-200/50 shadow-soft-earth hover:shadow-md transition-all duration-300 font-sans">
              <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-primary-500 rounded-full mr-2 md:mr-3 animate-pulse"></div>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Serving Rural Communities
            </div>

            <div className="space-y-3 md:space-y-4">
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-primary-900 leading-tight md:leading-[1.1] tracking-tight font-sans">
                Welcome to{" "}
                <span className="relative inline-block">
                  <span className="bg-gradient-to-r from-[#8B6B61] via-[#6D4C41] to-[#5D4037] bg-clip-text text-transparent relative z-10 font-serif">
                    GramVartha
                  </span>
                  <div className="absolute -inset-2 md:-inset-3 bg-gradient-to-r from-primary-200/40 to-primary-300/30 rounded-lg -z-10 blur-md"></div>
                </span>
              </h1>
              
              <p className="mt-4 md:mt-6 text-lg md:text-xl lg:text-2xl text-primary-700 max-w-2xl leading-relaxed font-medium font-sans">
                Empowering rural communities through digital governance and transparent communication
              </p>
            </div>

          {/* Enhanced CTA Buttons */}
<div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center lg:justify-start pt-2 md:pt-4">
  {/* View All Notices */}
  <Link
    to="/notices"
    className="group relative bg-button-primary text-primary-50 px-6 py-3 md:px-8 md:py-4 rounded-xl md:rounded-2xl font-semibold hover:shadow-earth-md transition-all duration-300 transform hover:-translate-y-1 md:hover:-translate-y-2 shadow-soft-earth overflow-hidden text-sm md:text-base font-sans"
  >
    <span className="relative z-10 flex items-center justify-center">
      View All Notices
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-4 w-4 md:h-5 md:w-5 ml-1 md:ml-2 group-hover:translate-x-1 transition-transform"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M13 7l5 5m0 0l-5 5m5-5H6"
        />
      </svg>
    </span>
    <div className="absolute inset-0 bg-primary-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
    <div className="absolute inset-0 bg-white/20 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>
  </Link>

  {/* Citizen Registration */}
  <Link
    to="/citizen/register"
    className="group flex items-center justify-center gap-2 md:gap-3 bg-surface text-primary-700 border-2 border-primary-200 px-6 py-3 md:px-8 md:py-4 rounded-xl md:rounded-2xl font-semibold hover:border-primary-300 hover:shadow-soft-earth hover:bg-primary-50 transition-all duration-300 hover:-translate-y-1 text-sm md:text-base font-sans"
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-4 w-4 md:h-5 md:w-5 text-primary-600"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 4v16m8-8H4"
      />
    </svg>
    <span>Register as Citizen</span>
  </Link>
</div>


            {/* Enhanced Stats */}
            <div className="grid grid-cols-2 gap-4 md:gap-6 max-w-md mx-auto lg:mx-0 pt-6 md:pt-8">
              <div className="group bg-surface backdrop-blur-md p-4 md:p-6 rounded-2xl md:rounded-3xl border border-primary-200/50 shadow-soft-earth hover:shadow-earth-md transition-all duration-300 hover:-translate-y-1">
                <div className="flex items-center justify-center w-10 h-10 md:w-14 md:h-14 bg-primary-100 rounded-xl md:rounded-2xl mb-2 md:mb-4 mx-auto group-hover:scale-110 transition-transform duration-300">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 md:h-7 md:w-7 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <p className="font-bold text-primary-900 text-xl md:text-3xl mb-1 font-sans">10,000+</p>
                <p className="text-xs md:text-sm text-primary-600 font-medium font-sans">Active Readers</p>
              </div>

              <div className="group bg-surface backdrop-blur-md p-4 md:p-6 rounded-2xl md:rounded-3xl border border-primary-200/50 shadow-soft-earth hover:shadow-earth-md transition-all duration-300 hover:-translate-y-1">
                <div className="flex items-center justify-center w-10 h-10 md:w-14 md:h-14 bg-primary-100 rounded-xl md:rounded-2xl mb-2 md:mb-4 mx-auto group-hover:scale-110 transition-transform duration-300">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 md:h-7 md:w-7 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <p className="font-bold text-primary-900 text-xl md:text-3xl mb-1 font-sans">50+</p>
                <p className="text-xs md:text-sm text-primary-600 font-medium font-sans">Villages Served</p>
              </div>
            </div>
          </div>

          {/* Enhanced Right Image Section */}
          <div className="relative lg:pl-8 mt-10 md:mt-0">
            {/* Main image container with advanced styling */}
            <div className="relative z-20 group">
              <div className="relative overflow-hidden rounded-2xl md:rounded-3xl shadow-earth-lg border-4 border-white/50 backdrop-blur-sm">
                {/* Image with enhanced effects */}
                <img
                  src="/illu1.png"
                  alt="GramVartha App"
                  className="w-full max-w-2xl mx-auto h-auto transform group-hover:scale-105 transition-all duration-700 ease-out"
                />
                
                {/* Overlay gradient for depth */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/5 via-transparent to-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                {/* Shine effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out"></div>
              </div>
            </div>
            
            {/* Enhanced floating notification cards - hidden on mobile */}
            <div className="hidden md:block absolute -top-8 -left-8 z-30 animate-float">
              <div className="bg-surface backdrop-blur-xl rounded-3xl shadow-earth-lg p-5 w-48 border border-primary-200/50 hover:shadow-earth-md transition-all duration-300 hover:-translate-y-1">
                <div className="flex items-center mb-3">
                  <div className="bg-primary-100 p-3 rounded-2xl mr-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                </div>
                <p className="text-sm font-semibold text-primary-800 mb-1 font-sans">New Notices</p>
                <p className="text-xs text-primary-600 font-sans">Just added to your feed</p>
              </div>
            </div>
            
            <div className="hidden md:block absolute -bottom-8 -right-8 z-30 animate-float animation-delay-2000">
              <div className="bg-surface backdrop-blur-xl rounded-3xl shadow-earth-lg p-5 w-52 border border-primary-200/50 hover:shadow-earth-md transition-all duration-300 hover:-translate-y-1">
                <div className="flex items-center mb-3">
                  <div className="bg-primary-100 p-3 rounded-2xl mr-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="flex space-x-1">
                    <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full animate-bounce"></div>
                    <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full animate-bounce animation-delay-200"></div>
                    <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full animate-bounce animation-delay-400"></div>
                  </div>
                </div>
                <p className="text-sm font-semibold text-primary-800 mb-1 font-sans">User Friendly</p>
                <p className="text-xs text-primary-600 font-sans">Simple & intuitive design</p>
              </div>
            </div>

            {/* Additional floating element - hidden on mobile */}
            <div className="hidden md:block absolute top-1/2 -left-4 z-30 animate-float animation-delay-3000">
              <div className="bg-surface backdrop-blur-lg rounded-2xl shadow-soft-earth p-4 border border-primary-200/50">
                <div className="bg-primary-100 p-2 rounded-xl">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
              </div>
            </div>
            
            {/* Enhanced background decorative elements - reduced on mobile */}
            <div className="absolute -z-10 -inset-4 md:-inset-12">
              {/* Primary glow */}
              <div className="absolute inset-0 bg-primary-200/40 rounded-2xl md:rounded-[3rem] blur-xl md:blur-2xl"></div>
              
              {/* Secondary glow */}
              <div className="absolute -inset-4 md:-inset-8 bg-gradient-to-tl from-primary-300/20 via-transparent to-accent-teal/20 rounded-xl md:rounded-[2.5rem] blur-lg md:blur-xl"></div>
              
              {/* Accent elements */}
              <div className="absolute top-2 right-2 md:top-4 md:right-4 w-16 h-16 md:w-32 md:h-32 bg-primary-300/30 rounded-full blur-xl md:blur-2xl"></div>
              <div className="absolute bottom-4 left-4 md:bottom-8 md:left-8 w-12 h-12 md:w-24 md:h-24 bg-accent-teal/40 rounded-full blur-lg md:blur-xl"></div>
            </div>

            {/* Geometric accent - hidden on mobile */}
            <div className="hidden md:block absolute -z-20 top-1/4 right-1/4 w-64 h-64 border border-primary-200/20 rounded-full"></div>
            <div className="hidden md:block absolute -z-20 bottom-1/4 left-1/4 w-48 h-48 border border-primary-200/20 rounded-full"></div>
          </div>
        </div>
      </div>

      {/* Enhanced scroll indicator */}
      <div className="absolute bottom-4 md:bottom-8 left-1/2 transform -translate-x-1/2 z-20">
        <div className="flex flex-col items-center space-y-1 md:space-y-2">
          <p className="text-xs text-primary-600 font-medium uppercase tracking-wider font-sans">Scroll Down</p>
          <div className="animate-bounce">
            <div className="w-5 h-8 md:w-6 md:h-10 border-2 border-primary-400 rounded-full flex justify-center">
              <div className="w-1 h-2 md:h-3 bg-primary-500 rounded-full mt-1 md:mt-2 animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced animations */}
      <style jsx>{`
        @keyframes float {
          0% { transform: translateY(0px) rotate(0deg); }
          33% { transform: translateY(-10px) rotate(1deg); }
          66% { transform: translateY(-5px) rotate(-1deg); }
          100% { transform: translateY(0px) rotate(0deg); }
        }
        
        @keyframes pulse-glow {
          0%, 100% { opacity: 0.5; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.05); }
        }
        
        .animate-float { 
          animation: float 8s ease-in-out infinite; 
        }
        
        .animate-pulse-glow {
          animation: pulse-glow 3s ease-in-out infinite;
        }
        
        .animation-delay-200 { animation-delay: 0.2s; }
        .animation-delay-400 { animation-delay: 0.4s; }
        .animation-delay-1000 { animation-delay: 1s; }
        .animation-delay-2000 { animation-delay: 2s; }
        .animation-delay-3000 { animation-delay: 3s; }
        .animation-delay-4000 { animation-delay: 4s; }
      `}</style>
    </section>
  );
}