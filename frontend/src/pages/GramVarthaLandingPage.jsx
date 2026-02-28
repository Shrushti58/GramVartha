import React, { Suspense } from "react";
import "../components/i18n";
import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import About from "../components/About";
import Features from "../components/Features";
import Footer from "../components/Footer";
import "../index.css";

const LoadingSpinner = () => (
  <div className="min-h-screen flex items-center justify-center bg-white">
    <div className="text-center">
      <div className="w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
      <p className="text-gray-500 text-sm font-medium">Loading GramVartha...</p>
    </div>
  </div>
);

const GramVarthaLandingPage = () => {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <div className="flex flex-col min-h-screen">

        <Navbar />

        <main className="flex-grow">
          {/* Hero — id used by navbar CTA */}
          <section id="home">
            <Hero />
          </section>

          {/* About */}
          <section id="about">
            <About />
          </section>

          {/* Features */}
          <section id="features">
            <Features />
          </section>
        </main>

        <Footer />

      </div>
    </Suspense>
  );
};

export default GramVarthaLandingPage;