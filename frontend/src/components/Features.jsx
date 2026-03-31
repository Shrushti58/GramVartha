import React, { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";

const features = [
  {
    titleKey: "feature1_title",
    tagKey: "feature1_tag",
    descKey: "feature1_desc",
    image: "/qr.jpeg",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
      </svg>
    ),
  },
  {
    titleKey: "feature2_title",
    tagKey: "feature2_tag",
    descKey: "feature2_desc",
    image: "/f3.png",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    ),
  },
  {
    titleKey: "feature3_title",
    tagKey: "feature3_tag",
    descKey: "feature3_desc",
    image: "/f2.jpg",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
  {
    titleKey: "feature4_title",
    tagKey: "feature4_tag",
    descKey: "feature4_desc",
    image: "/illu1.png",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
      </svg>
    ),
  },
];

const DURATION = 5000;

export default function Features() {
  const { t } = useTranslation();
  const [active, setActive] = useState(0);
  const [prev, setPrev] = useState(null);
  const [transitioning, setTransitioning] = useState(false);
  const [paused, setPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const progressRef = useRef(null);
  const startTimeRef = useRef(null);
  const rafRef = useRef(null);

  const goTo = (index) => {
    if (index === active || transitioning) return;
    setPrev(active);
    setTransitioning(true);
    setProgress(0);
    setTimeout(() => {
      setActive(index);
      setPrev(null);
      setTransitioning(false);
    }, 600);
  };

  const next = () => goTo((active + 1) % features.length);
  const prevSlide = () => goTo((active - 1 + features.length) % features.length);

  // Progress ticker
  useEffect(() => {
    if (paused) {
      cancelAnimationFrame(rafRef.current);
      return;
    }

    startTimeRef.current = performance.now() - progress * DURATION;

    const tick = (now) => {
      const elapsed = now - startTimeRef.current;
      const p = Math.min(elapsed / DURATION, 1);
      setProgress(p);
      if (p >= 1) {
        next();
      } else {
        rafRef.current = requestAnimationFrame(tick);
      }
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [active, paused]);

  const current = features[active];

  return (
    <section
      id="features"
      className="py-20 lg:py-28 bg-white dark:bg-dark-background font-sans transition-colors duration-300"
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8">

        {/* Header */}
        <div className="max-w-xl mb-12">
          <span className="inline-flex items-center gap-2 text-primary-600 dark:text-primary-400 text-sm font-semibold uppercase tracking-wider mb-4">
            <span className="w-6 h-px bg-primary-600 dark:bg-primary-400" />
            {t('features_header')}
          </span>
          <h2 className="text-4xl lg:text-5xl font-bold text-text-primary dark:text-dark-text-primary leading-tight">
            {t('features_title')}
          </h2>
        </div>

        {/* Cinematic Carousel */}
        <div
          className="relative rounded-3xl overflow-hidden"
          style={{ minHeight: "520px" }}
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >

          {/* Slides */}
          {features.map((feature, index) => (
            <div
              key={index}
              className="absolute inset-0 transition-opacity duration-700"
              style={{
                opacity: index === active ? 1 : 0,
                zIndex: index === active ? 2 : 1,
                pointerEvents: index === active ? "auto" : "none",
              }}
            >
              {/* BG Image */}
              <img
                src={feature.image}
                alt={feature.title}
                className="absolute inset-0 w-full h-full object-cover scale-105 transition-transform duration-700"
                style={{
                  transform: index === active ? "scale(1)" : "scale(1.05)",
                }}
              />

              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-r from-primary-900/95 via-primary-900/75 to-primary-900/30 dark:from-black/95 dark:via-black/75 dark:to-black/30" />

              {/* Content */}
              <div
                className="absolute inset-0 flex flex-col justify-end p-10 lg:p-16 transition-all duration-700"
                style={{
                  opacity: index === active && !transitioning ? 1 : 0,
                  transform: index === active && !transitioning ? "translateY(0)" : "translateY(24px)",
                }}
              >
                {/* Tag */}
                <span className="inline-flex items-center gap-2 bg-primary-400/20 border border-primary-400/30 text-primary-300 text-xs font-semibold uppercase tracking-wider px-3 py-1.5 rounded-full w-fit mb-6">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary-400" />
                  {t(feature.tagKey)}
                </span>

                {/* Icon + Title */}
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-white/10 border border-white/20 rounded-xl flex items-center justify-center text-white flex-shrink-0">
                    {feature.icon}
                  </div>
                  <h3 className="text-3xl lg:text-4xl font-bold text-white leading-tight">
                    {t(feature.titleKey)}
                  </h3>
                </div>

                {/* Description */}
                <p className="text-white/65 text-base leading-relaxed max-w-lg mb-8">
                  {t(feature.descKey)}
                </p>

                {/* Bottom controls row */}
                <div className="flex items-center justify-between gap-6">

                  {/* Feature tabs */}
                  <div className="flex items-center gap-2 flex-wrap">
                    {features.map((f, i) => (
                      <button
                        key={i}
                        onClick={() => goTo(i)}
                        className={`text-xs font-medium px-4 py-2 rounded-full border transition-all duration-300 ${
                          i === active
                            ? "bg-white text-primary-800 border-white"
                            : "bg-white/10 text-white/60 border-white/20 hover:bg-white/20 hover:text-white"
                        }`}
                      >
                        {t(f.titleKey)}
                      </button>
                    ))}
                  </div>

                  {/* Arrows */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={prevSlide}
                      className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 hover:bg-white/20 text-white transition-all duration-200 flex items-center justify-center"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    <button
                      onClick={next}
                      className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 hover:bg-white/20 text-white transition-all duration-200 flex items-center justify-center"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Progress bar */}
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-white/10 z-10">
            <div
              className="h-full bg-primary-400 transition-none"
              style={{ width: `${progress * 100}%` }}
            />
          </div>

          {/* Paused indicator */}
          {paused && (
            <div className="absolute top-5 right-5 z-10 bg-black/30 backdrop-blur-sm text-white/60 text-xs px-3 py-1.5 rounded-full border border-white/10">
              Paused
            </div>
          )}

        </div>
      </div>
    </section>
  );
}