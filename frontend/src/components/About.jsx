import React from "react";
import { useTranslation } from "react-i18next";

const stats = [
  { value: "10K+", labelKey: "active_readers" },
  { value: "50+", labelKey: "villages_served" },
  { value: "100%", labelKey: "free_access" },
];

const features = [
  "feature.no_login",
  "feature.local_lang",
  "feature.verified",
];

export default function About() {
  const { t } = useTranslation();

  return (
    <section
      id="about"
      className="py-12 sm:py-16 md:py-20 lg:py-28 bg-white dark:bg-dark-background font-sans transition-colors duration-300"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="grid lg:grid-cols-2 gap-8 md:gap-10 lg:gap-14 items-center">

          {/* Left — Image */}
          <div className="relative order-2 lg:order-1">
            <div className="absolute -inset-3 sm:-inset-4 bg-accent-mist dark:bg-dark-surface rounded-3xl -z-10" />

            <div className="relative rounded-2xl overflow-hidden aspect-[4/3] shadow-large dark:shadow-dark-large">
              <img
                src="/about.jpg"
                alt="GramVartha in action"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

              {/* Badge bottom left */}
              <div className="absolute bottom-3 sm:bottom-5 left-3 sm:left-5 bg-white dark:bg-dark-surface rounded-lg sm:rounded-xl shadow-medium px-3 sm:px-4 py-2 sm:py-3 flex items-center gap-2 sm:gap-3 text-xs sm:text-sm">
                <div className="w-7 sm:w-9 h-7 sm:h-9 bg-primary-100 dark:bg-primary-900/60 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 sm:w-5 h-4 sm:h-5 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs text-text-muted dark:text-dark-text-muted">{t('villages_served')}</p>
                  <p className="text-xs sm:text-sm font-bold text-text-primary dark:text-dark-text-primary">50+ {t('villages_served')}</p>
                </div>
              </div>

              {/* Badge top right */}
              <div className="absolute top-3 sm:top-5 right-3 sm:right-5 bg-primary-800 dark:bg-primary-900 rounded-lg sm:rounded-xl px-3 sm:px-4 py-2 sm:py-3 flex items-center gap-2 sm:gap-3 text-xs sm:text-sm">
                <div className="w-7 sm:w-9 h-7 sm:h-9 bg-primary-600/30 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 sm:w-5 h-4 sm:h-5 text-primary-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs text-white/50">{t('active_readers')}</p>
                  <p className="text-xs sm:text-sm font-bold text-white">10,000+</p>
                </div>
              </div>
            </div>

            {/* Live bar */}
            <div className="mt-3 sm:mt-4 bg-primary-800 dark:bg-primary-900 rounded-xl sm:rounded-2xl px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
              <div className="flex items-center gap-2 sm:gap-3">
                <span className="w-2 h-2 bg-primary-400 rounded-full animate-pulse" />
                <p className="text-white text-xs sm:text-sm font-medium">{t('actively_serving')}</p>
              </div>
              <span className="text-primary-400 text-xs sm:text-sm font-semibold">Live</span>
            </div>
          </div>

          {/* Right — Content */}
          <div className="space-y-6 sm:space-y-8 order-1 lg:order-2">

            <div>
              <span className="inline-flex items-center gap-2 text-primary-600 dark:text-primary-400 text-xs sm:text-sm font-semibold uppercase tracking-wider mb-3 sm:mb-4">
                <span className="w-4 sm:w-6 h-px bg-primary-600 dark:bg-primary-400" />
                {t('about_us')}
              </span>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-text-primary dark:text-dark-text-primary leading-tight mt-2">
                {t('governance_title')}
              </h2>
              <p className="mt-3 sm:mt-4 text-sm sm:text-base text-text-muted dark:text-dark-text-muted leading-relaxed">
                {t('governance_desc')}
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 py-4 sm:py-6 border-y border-border dark:border-dark-border">
              {stats.map((s, i) => (
                <div key={i}>
                  <p className="text-xl sm:text-2xl md:text-3xl font-bold text-primary-600 dark:text-primary-400">{s.value}</p>
                  <p className="text-xs sm:text-sm text-text-muted dark:text-dark-text-muted mt-1">{t(s.labelKey)}</p>
                </div>
              ))}
            </div>

            {/* Checklist */}
            <div className="space-y-2 sm:space-y-3">
              {features.map((key, i) => (
                <div key={i} className="flex items-center gap-2 sm:gap-3">
                  <div className="w-5 h-5 bg-primary-100 dark:bg-primary-900/60 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-3 h-3 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className="text-xs sm:text-sm text-text-secondary dark:text-dark-text-secondary">{t(key)}</p>
                </div>
              ))}
            </div>

            {/* Vision quote */}
            <div className="bg-accent-mist dark:bg-dark-surface border border-border dark:border-dark-border rounded-xl sm:rounded-2xl px-4 sm:px-6 py-4 sm:py-5">
              <p className="text-xs sm:text-sm font-medium text-text-secondary dark:text-dark-text-secondary italic">
                "{t('vision.quote')}"
              </p>
              <p className="text-xs text-text-muted dark:text-dark-text-muted mt-1">{t('vision.author')}</p>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}