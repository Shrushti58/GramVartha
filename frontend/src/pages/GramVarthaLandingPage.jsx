import React, { Suspense } from "react";
import "../components/i18n";
import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import About from "../components/About";
import Features from "../components/Features";
import Footer from "../components/Footer";
import '../index.css'

// Loading component with better visual design
const LoadingSpinner = () => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50">
    <div className="text-center">
      <div className="w-16 h-16 border-4 border-t-indigo-600 border-r-indigo-600 border-b-transparent border-l-transparent rounded-full animate-spin mx-auto mb-4"></div>
      <p className="text-indigo-800 font-medium">Loading GramVartha...</p>
    </div>
  </div>
);

const GramVarthaLandingPage = () => {
  return (
   
     <div className="min-h-screen bg-landing">
  <Navbar />
  <main className="flex-grow">
    <Hero />
    <div className="relative">
      {/* Decorative elements */}
      <div className="absolute -top-20 left-0 right-0 flex justify-center">
        <div className="w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="w-72 h-72 bg-yellow-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-2000"></div>
        <div className="w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-4000"></div>
      </div>

      <About />
      <Features />
    </div>
  </main>
  <Footer />
</div>


  )
}

export default GramVarthaLandingPage