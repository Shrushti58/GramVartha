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
      className="py-20 lg:py-28 bg-white dark:bg-dark-background font-sans transition-colors duration-300"
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8">

        <div className="grid lg:grid-cols-2 gap-14 items-center">

          {/* Left — Image */}
          <div className="relative">
            <div className="absolute -inset-4 bg-accent-mist dark:bg-dark-surface rounded-3xl -z-10" />

            <div className="relative rounded-2xl overflow-hidden aspect-[4/3] shadow-large dark:shadow-dark-large">
              <img
                src="/about.jpg"
                alt="GramVartha in action"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

              {/* Badge bottom left */}
              <div className="absolute bottom-5 left-5 bg-white dark:bg-dark-surface rounded-xl shadow-medium px-4 py-3 flex items-center gap-3">
                <div className="w-9 h-9 bg-primary-100 dark:bg-primary-900/60 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs text-text-muted dark:text-dark-text-muted">{t('villages_served')}</p>
                  <p className="text-sm font-bold text-text-primary dark:text-dark-text-primary">50+ {t('villages_served')}</p>
                </div>
              </div>

              {/* Badge top right */}
              <div className="absolute top-5 right-5 bg-primary-800 dark:bg-primary-900 rounded-xl px-4 py-3 flex items-center gap-3">
                <div className="w-9 h-9 bg-primary-600/30 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-primary-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs text-white/50">{t('active_readers')}</p>
                  <p className="text-sm font-bold text-white">10,000+</p>
                </div>
              </div>
            </div>

            {/* Live bar */}
            <div className="mt-4 bg-primary-800 dark:bg-primary-900 rounded-2xl px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="w-2 h-2 bg-primary-400 rounded-full animate-pulse" />
                <p className="text-white text-sm font-medium">{t('actively_serving')}</p>
              </div>
              <span className="text-primary-400 text-sm font-semibold">Live</span>
            </div>
          </div>

          {/* Right — Content */}
          <div className="space-y-8">

            <div>
              <span className="inline-flex items-center gap-2 text-primary-600 dark:text-primary-400 text-sm font-semibold uppercase tracking-wider mb-4">
                <span className="w-6 h-px bg-primary-600 dark:bg-primary-400" />
                {t('about_us')}
              </span>
              <h2 className="text-4xl font-bold text-text-primary dark:text-dark-text-primary leading-tight mt-2">
                {t('governance_title')}
              </h2>
              <p className="mt-4 text-text-muted dark:text-dark-text-muted leading-relaxed">
                {t('governance_desc')}
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 py-6 border-y border-border dark:border-dark-border">
              {stats.map((s, i) => (
                <div key={i}>
                  <p className="text-3xl font-bold text-primary-600 dark:text-primary-400">{s.value}</p>
                  <p className="text-sm text-text-muted dark:text-dark-text-muted mt-1">{t(s.labelKey)}</p>
                </div>
              ))}
            </div>

            {/* Checklist */}
            <div className="space-y-3">
              {features.map((key, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-5 h-5 bg-primary-100 dark:bg-primary-900/60 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-3 h-3 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className="text-sm text-text-secondary dark:text-dark-text-secondary">{t(key)}</p>
                </div>
              ))}
            </div>

            {/* Vision quote */}
            <div className="bg-accent-mist dark:bg-dark-surface border border-border dark:border-dark-border rounded-2xl px-6 py-5">
              <p className="text-sm font-medium text-text-secondary dark:text-dark-text-secondary italic">
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