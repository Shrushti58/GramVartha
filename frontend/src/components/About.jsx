import React, { useEffect, useRef, useState } from "react";

const About = () => {
  const sectionRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      {
        threshold: 0.15,
      }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="about"
      className="
        relative
        -mt-[1px]
        overflow-hidden
        bg-[#fdf6f2]
        px-5
        pt-6
        pb-24
        sm:px-8
        sm:pt-8
        lg:px-12
        lg:pt-10
      "
    >
      {/* =====================================================
          BACKGROUND
      ====================================================== */}

      {/* Top-left glow */}
      <div
        className={`pointer-events-none absolute -left-40 -top-40 h-[500px] w-[500px] rounded-full bg-primary-100/50 blur-[110px] transition-all duration-[1600ms] ${
          isVisible ? "opacity-100" : "opacity-0"
        }`}
      />

      {/* Right glow */}
      <div
        className={`pointer-events-none absolute -right-48 top-[25%] h-[500px] w-[500px] rounded-full bg-primary-50 blur-[120px] transition-all duration-[1800ms] ${
          isVisible ? "opacity-100" : "opacity-0"
        }`}
      />

      {/* Bottom glow */}
      <div className="pointer-events-none absolute -bottom-60 left-1/2 h-[500px] w-[700px] -translate-x-1/2 rounded-full bg-primary-100/25 blur-[120px]" />

      {/* Subtle dots */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.13]"
        style={{
          backgroundImage:
            "radial-gradient(#c0613a 1px, transparent 1px)",
          backgroundSize: "30px 30px",
          maskImage:
            "linear-gradient(to bottom, black, transparent 75%)",
          WebkitMaskImage:
            "linear-gradient(to bottom, black, transparent 75%)",
        }}
      />

      {/* Decorative dots */}
      <div className="pointer-events-none absolute left-[8%] top-[20%] h-3 w-3 rounded-full bg-primary-300/50" />

      <div className="pointer-events-none absolute left-[12%] top-[60%] h-2 w-2 rounded-full bg-primary-400/40" />

      <div className="pointer-events-none absolute right-[10%] top-[18%] h-4 w-4 rounded-full border border-primary-300/50" />

      <div className="pointer-events-none absolute right-[7%] bottom-[20%] h-3 w-3 rounded-full bg-primary-300/40" />

      {/* =====================================================
          MAIN CONTENT
      ====================================================== */}

      <div className="relative z-10 mx-auto max-w-6xl">

        {/* =====================================================
            INTRO
        ====================================================== */}

        <div className="mx-auto max-w-3xl text-center">

          {/* Label */}
          <div
            className={`mb-5 transition-all duration-700 ${
              isVisible
                ? "translate-y-0 opacity-100"
                : "translate-y-5 opacity-0"
            }`}
          >
            <span
              className="
                inline-flex
                items-center
                rounded-full
                border
                border-primary-200
                bg-white/90
                px-4
                py-2
                text-xs
                font-semibold
                uppercase
                tracking-[0.18em]
                text-primary-600
                shadow-sm
                backdrop-blur-sm
              "
            >
              About GramVartha
            </span>
          </div>

          {/* Heading */}
          <h2
            className={`font-display text-4xl font-extrabold leading-tight tracking-tight text-text-primary transition-all duration-700 delay-100 sm:text-5xl lg:text-6xl ${
              isVisible
                ? "translate-y-0 opacity-100"
                : "translate-y-8 opacity-0"
            }`}
          >
            Stay connected.
            <br />

            <span className="text-primary-500">
              Stay informed.
            </span>
          </h2>

          {/* Description */}
          <p
            className={`mx-auto mt-6 max-w-2xl text-sm leading-7 text-text-secondary transition-all duration-700 delay-200 sm:text-base ${
              isVisible
                ? "translate-y-0 opacity-100"
                : "translate-y-6 opacity-0"
            }`}
          >
            GramVartha connects your Gram Panchayat with the people
            of your village. Get important notices, discover
            government schemes, and raise complaints — all in one
            place.
          </p>

          {/* CTA */}
          <div
            className={`mt-8 transition-all duration-700 delay-300 ${
              isVisible
                ? "scale-100 opacity-100"
                : "scale-90 opacity-0"
            }`}
          >
            <a
              href="#features"
              className="
                group
                inline-flex
                items-center
                gap-2
                rounded-full
                bg-primary-600
                px-6
                py-3
                text-sm
                font-semibold
                text-white
                shadow-lg
                shadow-primary-600/20
                transition-all
                duration-300
                hover:-translate-y-1
                hover:bg-primary-700
                hover:shadow-xl
              "
            >
              Explore GramVartha

              <span className="transition-transform duration-300 group-hover:translate-x-1">
                →
              </span>
            </a>
          </div>
        </div>

        {/* =====================================================
            WHAT YOU GET
        ====================================================== */}

        <div className="mt-20 sm:mt-24">

          {/* Section heading */}
          <div
            className={`mb-10 transition-all duration-700 delay-300 ${
              isVisible
                ? "translate-y-0 opacity-100"
                : "translate-y-6 opacity-0"
            }`}
          >
            <p
              className="
                text-sm
                font-semibold
                uppercase
                tracking-[0.16em]
                text-primary-500
              "
            >
              What you get here?
            </p>

            <div className="mt-3 h-1 w-12 rounded-full bg-primary-400" />
          </div>

          {/* =====================================================
              CARDS
          ====================================================== */}

          <div className="grid gap-6 lg:grid-cols-2">

            {/* ===================================================
                PANCHAYAT CARD
            ==================================================== */}

            <div
              className={`group relative min-h-[370px] overflow-hidden rounded-[2rem] border border-primary-200/70 bg-white/95 p-7 shadow-[0_20px_60px_rgba(138,60,36,0.07)] backdrop-blur-sm transition-all duration-700 hover:-translate-y-2 hover:shadow-[0_28px_70px_rgba(138,60,36,0.12)] sm:p-9 ${
                isVisible
                  ? "translate-x-0 opacity-100"
                  : "-translate-x-20 opacity-0"
              }`}
            >
              {/* Background blob */}
              <div
                className="
                  pointer-events-none
                  absolute
                  -bottom-20
                  -right-20
                  h-72
                  w-72
                  rounded-full
                  bg-primary-50
                  transition-transform
                  duration-700
                  group-hover:scale-105
                "
              />

              {/* Inner glow */}
              <div
                className="
                  pointer-events-none
                  absolute
                  bottom-10
                  right-14
                  h-48
                  w-48
                  rounded-full
                  bg-primary-100/40
                  blur-2xl
                "
              />

              <div className="relative z-10 flex h-full flex-col">

                {/* Icon */}
                <div
                  className="
                    flex
                    h-12
                    w-12
                    shrink-0
                    items-center
                    justify-center
                    rounded-2xl
                    bg-primary-50
                    text-primary-600
                    transition-all
                    duration-500
                    group-hover:-rotate-3
                    group-hover:scale-105
                  "
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    className="h-6 w-6"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3 21h18"
                    />

                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 21V8l7-4 7 4v13"
                    />

                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 21v-5h6v5"
                    />
                  </svg>
                </div>

                {/* Text */}
                <div className="mt-7 max-w-[47%]">

                  <h3
                    className="
                      text-2xl
                      font-extrabold
                      leading-tight
                      tracking-tight
                      text-text-primary
                      sm:text-3xl
                    "
                  >
                    For Your
                    <br />
                    Panchayat
                  </h3>

                  <div
                    className="
                      mt-3
                      h-1
                      w-11
                      rounded-full
                      bg-primary-400
                      transition-all
                      duration-500
                      group-hover:w-16
                    "
                  />

                  <p
                    className="
                      mt-5
                      text-sm
                      leading-7
                      text-text-secondary
                      sm:text-base
                    "
                  >
                    Publish village notices, upload government
                    schemes, and view complaints from villagers.
                  </p>
                </div>

                {/* Panchayat Illustration */}
                <div
                  className="
                    pointer-events-none
                    absolute
                    bottom-0
                    right-[-15px]
                    z-10
                    w-[52%]
                    max-w-[310px]
                    sm:right-[-20px]
                    sm:w-[52%]
                    sm:max-w-[310px]
                    lg:w-[52%]
                    lg:max-w-[310px]
                  "
                >
                  <img
                    src="/illustrations/panchayat-removebg-preview.png"
                    alt=""
                    className="
                      block
                      w-full
                      scale-110
                      object-contain
                      drop-shadow-sm
                      transition-transform
                      duration-700
                      group-hover:-translate-y-2
                      group-hover:scale-[1.16]
                    "
                  />
                </div>

                {/* Button */}
                <div className="relative z-20 mt-auto pt-8">
                  <a
                    href="/panchayat"
                    className="
                      group/btn
                      inline-flex
                      items-center
                      gap-2
                      rounded-full
                      border
                      border-primary-200
                      bg-white
                      px-5
                      py-2.5
                      text-sm
                      font-semibold
                      text-text-primary
                      shadow-sm
                      transition-all
                      duration-300
                      hover:-translate-y-0.5
                      hover:border-primary-300
                      hover:bg-primary-50
                    "
                  >
                    Manage Village

                    <span
                      className="
                        transition-transform
                        duration-300
                        group-hover/btn:translate-x-1
                      "
                    >
                      →
                    </span>
                  </a>
                </div>
              </div>
            </div>

            {/* ===================================================
                VILLAGER CARD
            ==================================================== */}

            <div
              className={`group relative min-h-[370px] overflow-hidden rounded-[2rem] border border-primary-200/70 bg-white/95 p-7 shadow-[0_20px_60px_rgba(138,60,36,0.07)] backdrop-blur-sm transition-all duration-700 delay-150 hover:-translate-y-2 hover:shadow-[0_28px_70px_rgba(138,60,36,0.12)] sm:p-9 ${
                isVisible
                  ? "translate-x-0 opacity-100"
                  : "translate-x-20 opacity-0"
              }`}
            >
              {/* Background blob */}
              <div
                className="
                  pointer-events-none
                  absolute
                  -bottom-20
                  -right-20
                  h-72
                  w-72
                  rounded-full
                  bg-primary-50
                  transition-transform
                  duration-700
                  group-hover:scale-105
                "
              />

              {/* Inner glow */}
              <div
                className="
                  pointer-events-none
                  absolute
                  bottom-10
                  right-14
                  h-48
                  w-48
                  rounded-full
                  bg-primary-100/40
                  blur-2xl
                "
              />

              <div className="relative z-10 flex h-full flex-col">

                {/* Icon */}
                <div
                  className="
                    flex
                    h-12
                    w-12
                    shrink-0
                    items-center
                    justify-center
                    rounded-2xl
                    bg-primary-50
                    text-primary-600
                    transition-all
                    duration-500
                    group-hover:rotate-3
                    group-hover:scale-105
                  "
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    className="h-6 w-6"
                  >
                    <rect
                      x="5"
                      y="2"
                      width="14"
                      height="20"
                      rx="3"
                    />

                    <path
                      strokeLinecap="round"
                      d="M9 18h6"
                    />

                    <path
                      strokeLinecap="round"
                      d="M9 6h6"
                    />
                  </svg>
                </div>

                {/* Text */}
                <div className="mt-7 max-w-[48%]">

                  <h3
                    className="
                      text-2xl
                      font-extrabold
                      leading-tight
                      tracking-tight
                      text-text-primary
                      sm:text-3xl
                    "
                  >
                    For Villagers
                  </h3>

                  <div
                    className="
                      mt-3
                      h-1
                      w-11
                      rounded-full
                      bg-primary-400
                      transition-all
                      duration-500
                      group-hover:w-16
                    "
                  />

                  <p
                    className="
                      mt-5
                      text-sm
                      leading-7
                      text-text-secondary
                      sm:text-base
                    "
                  >
                    Stay updated with notices and schemes, and raise
                    complaints directly with your Gram Panchayat.
                  </p>
                </div>

                {/* Village Illustration */}
                <div
                  className="
                    pointer-events-none
                    absolute
                    bottom-5
                    right-3
                    z-10
                    w-[39%]
                    max-w-[225px]
                    sm:right-5
                    sm:w-[39%]
                    sm:max-w-[235px]
                  "
                >
                  <img
                    src="/illustrations/village-removebg-preview.png"
                    alt=""
                    className="
                      block
                      w-full
                      object-contain
                      drop-shadow-sm
                      transition-transform
                      duration-700
                      group-hover:-translate-y-2
                      group-hover:scale-[1.03]
                    "
                  />
                </div>

                {/* Button */}
                <div className="relative z-20 mt-auto pt-8">
                  <a
                    href="/village"
                    className="
                      group/btn
                      inline-flex
                      items-center
                      gap-2
                      rounded-full
                      border
                      border-primary-200
                      bg-white
                      px-5
                      py-2.5
                      text-sm
                      font-semibold
                      text-text-primary
                      shadow-sm
                      transition-all
                      duration-300
                      hover:-translate-y-0.5
                      hover:border-primary-300
                      hover:bg-primary-50
                    "
                  >
                    Explore Village

                    <span
                      className="
                        transition-transform
                        duration-300
                        group-hover/btn:translate-x-1
                      "
                    >
                      →
                    </span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* =====================================================
            BOTTOM STATEMENT
        ====================================================== */}

        <div
          className={`mt-20 text-center transition-all duration-700 delay-500 ${
            isVisible
              ? "translate-y-0 opacity-100"
              : "translate-y-6 opacity-0"
          }`}
        >
          <p className="text-sm font-medium text-text-muted sm:text-base">
            Simple information.

            <span className="mx-2 text-primary-400">
              •
            </span>

            Better communication.

            <span className="mx-2 text-primary-400">
              •
            </span>

            Stronger villages.
          </p>
        </div>

      </div>
    </section>
  );
};

export default About;