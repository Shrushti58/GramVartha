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
        px-4
        pt-8
        pb-16
        sm:px-6
        sm:pt-10
        sm:pb-20
        md:px-8
        md:pb-24
        lg:px-12
        lg:pt-10
      "
    >
      {/* =====================================================
          BACKGROUND
      ====================================================== */}

      {/* Top-left glow */}
      <div
        className={`pointer-events-none absolute -left-32 -top-32 h-[300px] w-[300px] rounded-full bg-primary-100/40 blur-[45px] transition-opacity duration-[1600ms] sm:-left-40 sm:-top-40 sm:h-[500px] sm:w-[500px] sm:blur-[110px] ${
          isVisible ? "opacity-100" : "opacity-0"
        }`}
      />

      {/* Right glow */}
      <div
        className={`pointer-events-none absolute -right-32 top-[25%] h-[300px] w-[300px] rounded-full bg-primary-50 blur-[45px] transition-opacity duration-[1800ms] sm:-right-48 sm:h-[500px] sm:w-[500px] sm:blur-[120px] ${
          isVisible ? "opacity-100" : "opacity-0"
        }`}
      />

      {/* Bottom glow */}
      <div className="pointer-events-none absolute -bottom-48 left-1/2 h-[350px] w-[500px] -translate-x-1/2 rounded-full bg-primary-100/25 blur-[50px] sm:-bottom-60 sm:h-[500px] sm:w-[700px] sm:blur-[120px]" />

      {/* Subtle dots */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.09] sm:opacity-[0.13]"
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
      <div className="pointer-events-none absolute left-[7%] top-[20%] h-2 w-2 rounded-full bg-primary-300/40 sm:h-3 sm:w-3" />

      <div className="pointer-events-none absolute left-[10%] top-[60%] h-1.5 w-1.5 rounded-full bg-primary-400/30 sm:h-2 sm:w-2" />

      <div className="pointer-events-none absolute right-[8%] top-[18%] h-3 w-3 rounded-full border border-primary-300/40 sm:h-4 sm:w-4" />

      <div className="pointer-events-none absolute right-[6%] bottom-[20%] h-2 w-2 rounded-full bg-primary-300/30 sm:h-3 sm:w-3" />

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
            className={`mb-4 transition-[transform,opacity] duration-700 sm:mb-5 ${
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
                px-3.5
                py-1.5
                text-[10px]
                font-semibold
                uppercase
                tracking-[0.16em]
                text-primary-600
                shadow-sm
                backdrop-blur-sm
                sm:px-4
                sm:py-2
                sm:text-xs
              "
            >
              About GramVartha
            </span>
          </div>

          {/* Heading */}
          <h2
            className={`font-display text-[32px] font-extrabold leading-[1.05] tracking-[-0.035em] text-text-primary transition-[transform,opacity] duration-700 delay-100 sm:text-5xl sm:leading-tight lg:text-6xl ${
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
            className={`mx-auto mt-4 max-w-[340px] text-xs leading-5 text-text-secondary transition-[transform,opacity] duration-700 delay-200 sm:mt-6 sm:max-w-2xl sm:text-base sm:leading-7 ${
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
            className={`mt-6 transition-[transform,opacity] duration-700 delay-300 sm:mt-8 ${
              isVisible
                ? "scale-100 opacity-100"
                : "scale-90 opacity-0"
            }`}
          >
            <a
              href="#how-it-works"
              className="
                group
                inline-flex
                items-center
                gap-2
                rounded-full
                bg-primary-600
                px-5
                py-2.5
                text-xs
                font-semibold
                text-white
                shadow-lg
                shadow-primary-600/20
                transition-[transform,background-color,box-shadow]
                duration-300
                hover:-translate-y-1
                hover:bg-primary-700
                hover:shadow-xl
                sm:px-6
                sm:py-3
                sm:text-sm
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

        <div className="mt-14 sm:mt-20 md:mt-24">

          {/* Section heading */}
          <div
            className={`mb-7 transition-[transform,opacity] duration-700 delay-300 sm:mb-10 ${
              isVisible
                ? "translate-y-0 opacity-100"
                : "translate-y-6 opacity-0"
            }`}
          >
            <p
              className="
                text-xs
                font-semibold
                uppercase
                tracking-[0.14em]
                text-primary-500
                sm:text-sm
                sm:tracking-[0.16em]
              "
            >
              What you get here?
            </p>

            <div className="mt-2.5 h-1 w-10 rounded-full bg-primary-400 sm:mt-3 sm:w-12" />
          </div>

          {/* =====================================================
              CARDS
          ====================================================== */}

          <div className="grid gap-5 sm:gap-6 lg:grid-cols-2">

            {/* ===================================================
                PANCHAYAT CARD
            ==================================================== */}

            <div
              className={`group relative overflow-hidden rounded-[1.5rem] border border-primary-200/70 bg-white/95 shadow-sm backdrop-blur-none transition-[transform,opacity,box-shadow] duration-700 hover:-translate-y-2 hover:shadow-[0_25px_60px_rgba(138,60,36,0.11)] sm:rounded-[2rem] sm:shadow-[0_15px_45px_rgba(138,60,36,0.06)] sm:backdrop-blur-sm ${
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
                  -bottom-24
                  -right-24
                  h-64
                  w-64
                  rounded-full
                  bg-primary-50
                  transition-transform
                  duration-700
                  group-hover:scale-105
                  sm:h-72
                  sm:w-72
                "
              />

              {/* Inner glow */}
              <div
                className="
                  pointer-events-none
                  absolute
                  bottom-8
                  right-10
                  h-40
                  w-40
                  rounded-full
                  bg-primary-100/40
                  blur-xl
                  sm:blur-2xl
                  sm:bottom-10
                  sm:right-14
                  sm:h-48
                  sm:w-48
                "
              />

              <div className="relative z-10 flex min-h-[430px] flex-col p-6 sm:min-h-[370px] sm:p-9">

                {/* Icon */}
                <div
                  className="
                    flex
                    h-10
                    w-10
                    shrink-0
                    items-center
                    justify-center
                    rounded-xl
                    bg-primary-50
                    text-primary-600
                    transition-transform
                    duration-500
                    group-hover:-rotate-3
                    group-hover:scale-105
                    sm:h-12
                    sm:w-12
                    sm:rounded-2xl
                  "
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    className="h-5 w-5 sm:h-6 sm:w-6"
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
                <div className="mt-5 max-w-full sm:mt-7 sm:max-w-[47%]">

                  <h3
                    className="
                      text-[22px]
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
                      mt-2.5
                      h-1
                      w-9
                      rounded-full
                      bg-primary-400
                      transition-[width]
                      duration-500
                      group-hover:w-14
                      sm:mt-3
                      sm:w-11
                      sm:group-hover:w-16
                    "
                  />

                  <p
                    className="
                      mt-3
                      max-w-[330px]
                      text-xs
                      leading-5
                      text-text-secondary
                      sm:mt-5
                      sm:text-base
                      sm:leading-7
                    "
                  >
                    Publish village notices, upload government
                    schemes, and view complaints from villagers.
                  </p>
                </div>

                {/* Panchayat Illustration - mobile */}
                <div
                  className="
                    pointer-events-none
                    relative
                    mt-4
                    flex
                    min-h-[135px]
                    flex-1
                    items-end
                    justify-end
                    sm:absolute
                    sm:bottom-0
                    sm:right-[-15px]
                    sm:mt-0
                    sm:min-h-0
                    sm:w-[52%]
                    sm:max-w-[310px]
                  "
                >
                  <img
                    src="/illustrations/panchayat-card.webp"
                    alt=""
                    width="587"
                    height="425"
                    loading="lazy"
                    decoding="async"
                    className="
                      block
                      w-[58%]
                      max-w-[210px]
                      object-contain
                      drop-shadow-sm
                      transition-transform
                      duration-700
                      group-hover:-translate-y-2
                      group-hover:scale-[1.05]
                      sm:w-full
                      sm:max-w-none
                      sm:scale-110
                      sm:group-hover:scale-[1.16]
                    "
                  />
                </div>

                {/* Button */}
                <div className="relative z-20 mt-3 pt-2 sm:mt-auto sm:pt-8">
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
                      px-4
                      py-2
                      text-xs
                      font-semibold
                      text-text-primary
                      shadow-sm
                      transition-[transform,background-color,border-color]
                      duration-300
                      hover:-translate-y-0.5
                      hover:border-primary-300
                      hover:bg-primary-50
                      sm:px-5
                      sm:py-2.5
                      sm:text-sm
                    "
                  >
                    Manage Village

                    <span className="transition-transform duration-300 group-hover/btn:translate-x-1">
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
              className={`group relative overflow-hidden rounded-[1.5rem] border border-primary-200/70 bg-white/95 shadow-sm backdrop-blur-none transition-[transform,opacity,box-shadow] duration-700 delay-150 hover:-translate-y-2 hover:shadow-[0_25px_60px_rgba(138,60,36,0.11)] sm:rounded-[2rem] sm:shadow-[0_15px_45px_rgba(138,60,36,0.06)] sm:backdrop-blur-sm ${
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
                  -bottom-24
                  -right-24
                  h-64
                  w-64
                  rounded-full
                  bg-primary-50
                  transition-transform
                  duration-700
                  group-hover:scale-105
                  sm:h-72
                  sm:w-72
                "
              />

              {/* Inner glow */}
              <div
                className="
                  pointer-events-none
                  absolute
                  bottom-8
                  right-10
                  h-40
                  w-40
                  rounded-full
                  bg-primary-100/40
                  blur-xl
                  sm:blur-2xl
                  sm:bottom-10
                  sm:right-14
                  sm:h-48
                  sm:w-48
                "
              />

              <div className="relative z-10 flex min-h-[430px] flex-col p-6 sm:min-h-[370px] sm:p-9">

                {/* Icon */}
                <div
                  className="
                    flex
                    h-10
                    w-10
                    shrink-0
                    items-center
                    justify-center
                    rounded-xl
                    bg-primary-50
                    text-primary-600
                    transition-transform
                    duration-500
                    group-hover:rotate-3
                    group-hover:scale-105
                    sm:h-12
                    sm:w-12
                    sm:rounded-2xl
                  "
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    className="h-5 w-5 sm:h-6 sm:w-6"
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
                <div className="mt-5 max-w-full sm:mt-7 sm:max-w-[48%]">

                  <h3
                    className="
                      text-[22px]
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
                      mt-2.5
                      h-1
                      w-9
                      rounded-full
                      bg-primary-400
                      transition-[width]
                      duration-500
                      group-hover:w-14
                      sm:mt-3
                      sm:w-11
                      sm:group-hover:w-16
                    "
                  />

                  <p
                    className="
                      mt-3
                      max-w-[330px]
                      text-xs
                      leading-5
                      text-text-secondary
                      sm:mt-5
                      sm:text-base
                      sm:leading-7
                    "
                  >
                    Stay updated with notices and schemes, and
                    raise complaints directly with your Gram
                    Panchayat.
                  </p>
                </div>

                {/* Village Illustration - mobile */}
                <div
                  className="
                    pointer-events-none
                    relative
                    mt-4
                    flex
                    min-h-[135px]
                    flex-1
                    items-end
                    justify-end
                    sm:absolute
                    sm:bottom-5
                    sm:right-3
                    sm:mt-0
                    sm:min-h-0
                    sm:w-[39%]
                    sm:max-w-[225px]
                  "
                >
                  <img
                    src="/illustrations/village-card.webp"
                    alt=""
                    width="500"
                    height="500"
                    loading="lazy"
                    decoding="async"
                    className="
                      block
                      w-[45%]
                      max-w-[180px]
                      object-contain
                      drop-shadow-sm
                      transition-transform
                      duration-700
                      group-hover:-translate-y-2
                      group-hover:scale-[1.03]
                      sm:w-full
                      sm:max-w-none
                    "
                  />
                </div>

                {/* Button */}
                <div className="relative z-20 mt-3 pt-2 sm:mt-auto sm:pt-8">
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
                      px-4
                      py-2
                      text-xs
                      font-semibold
                      text-text-primary
                      shadow-sm
                      transition-[transform,background-color,border-color]
                      duration-300
                      hover:-translate-y-0.5
                      hover:border-primary-300
                      hover:bg-primary-50
                      sm:px-5
                      sm:py-2.5
                      sm:text-sm
                    "
                  >
                    Explore Village

                    <span className="transition-transform duration-300 group-hover/btn:translate-x-1">
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
          className={`mt-12 text-center transition-[transform,opacity] duration-700 delay-500 sm:mt-20 ${
            isVisible
              ? "translate-y-0 opacity-100"
              : "translate-y-6 opacity-0"
          }`}
        >
          <p className="text-xs font-medium text-text-muted sm:text-base">
            Simple information.

            <span className="mx-1.5 text-primary-400 sm:mx-2">
              •
            </span>

            Better communication.

            <span className="mx-1.5 text-primary-400 sm:mx-2">
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
