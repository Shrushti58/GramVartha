import React from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

export default function Hero() {
  const { t } = useTranslation();

  const scrollTo = (id) => {
    const element = document.getElementById(id);

    if (element) {
      element.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  };

  return (
    <section
      className="
        relative
        w-full
        min-h-[100svh]
        overflow-hidden
        bg-primary-600
        dark:bg-primary-800
        font-sans
      "
    >
      {/* =====================================================
          BACKGROUND
      ====================================================== */}

      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Top-right glow */}
        <div
          className="
            absolute
            -top-32
            -right-32
            h-[280px]
            w-[280px]
            sm:h-[380px]
            sm:w-[380px]
            lg:h-[450px]
            lg:w-[450px]
            rounded-full
            bg-white/[0.06]
            blur-xl
            sm:blur-3xl
          "
        />

        {/* Phone area glow */}
        <div
          className="
            absolute
            right-[10%]
            top-[30%]
            h-[220px]
            w-[220px]
            sm:h-[300px]
            sm:w-[300px]
            lg:h-[360px]
            lg:w-[360px]
            rounded-full
            bg-accent-lime/[0.06]
            blur-xl
            sm:blur-3xl
          "
        />

        {/* Background text */}
        <div
          className="
            absolute
            right-[-5%]
            top-[8%]
            select-none
            whitespace-nowrap
            text-[25vw]
            sm:text-[18vw]
            lg:text-[13vw]
            font-black
            uppercase
            tracking-[-0.09em]
            leading-none
            text-white/[0.035]
          "
        >
          GRAM
        </div>

        {/* Circle */}
        <div
          className="
            absolute
            right-[25%]
            top-[28%]
            h-20
            w-20
            sm:h-24
            sm:w-24
            lg:h-28
            lg:w-28
            rounded-full
            border
            border-white/[0.06]
          "
        />

        {/* Dot */}
        <div
          className="
            absolute
            right-[8%]
            bottom-[22%]
            h-2.5
            w-2.5
            sm:h-3
            sm:w-3
            rounded-full
            bg-accent-lime/40
          "
        />
      </div>

      {/* =====================================================
          MAIN CONTAINER
      ====================================================== */}

      <div
        className="
          relative
          z-10
          mx-auto
          w-full
          max-w-7xl
          px-5
          sm:px-8
          md:px-10
          lg:px-12
        "
      >
        <div
          className="
            grid
            min-h-[100svh]
            grid-cols-1
            items-center
            lg:grid-cols-[0.9fr_1.1fr]
            xl:grid-cols-[0.85fr_1.15fr]
          "
        >
          {/* =================================================
              LEFT — TEXT
          ================================================== */}

          <div
            className="
              relative
              z-40
              max-w-xl
              pt-28
              pb-4
              sm:pt-32
              sm:pb-6
              md:pt-32
              lg:pt-20
              lg:pb-20
              animate-hero-text
            "
          >
            {/* Decorative mark */}
            <div
              className="
                absolute
                left-0
                top-24
                hidden
                sm:block
                lg:top-14
              "
            >
              <span
                className="
                  block
                  h-1
                  w-4
                  rounded-full
                  bg-white
                  rotate-[8deg]
                "
              />

              <span
                className="
                  ml-4
                  -mt-1
                  block
                  h-4
                  w-1
                  rounded-full
                  bg-white
                  rotate-[-20deg]
                "
              />
            </div>

            {/* =================================================
                HEADLINE
            ================================================== */}

            <h1
              className="
                font-black
                leading-[0.87]
                tracking-[-0.065em]
                text-white
                text-[3.1rem]
                xs:text-[3.4rem]
                sm:text-[4rem]
                md:text-[4.6rem]
                lg:text-[4.2rem]
                xl:text-[5rem]
              "
            >
              <span className="block">
                Digital
              </span>

              {/* Highlighted word + underline */}
              <span
                className="
                  relative
                  inline-block
                  font-extrabold
                  italic
                  tracking-[-0.07em]
                  text-accent-lime
                "
              >
                Panchayat

                {/* Same hand-drawn underline */}
                <svg
                  className="
                    absolute
                    -bottom-1
                    left-0
                    h-2
                    w-[106%]
                    sm:-bottom-2
                    sm:h-3
                  "
                  viewBox="0 0 400 20"
                  preserveAspectRatio="none"
                  fill="none"
                >
                  <path
                    d="M5 12C95 17 245 5 395 10"
                    stroke="currentColor"
                    strokeWidth="6"
                    strokeLinecap="round"
                  />
                </svg>
              </span>

              <span className="mt-2 block sm:mt-3">
                with
              </span>

              <span
                className="
                  block
                  tracking-[-0.07em]
                  text-primary-100
                "
              >
                GramVartha.
              </span>
            </h1>

            {/* =================================================
                DESCRIPTION
            ================================================== */}

            <p
              className="
                mt-5
                max-w-[390px]
                text-sm
                font-medium
                leading-relaxed
                text-white/65
                sm:mt-6
                sm:text-base
              "
            >
              Notices, updates and services from your
              Gram Panchayat — all in one place.
            </p>

            {/* =================================================
                CTA
            ================================================== */}

            <div
              className="
                mt-5
                flex
                flex-wrap
                items-center
                gap-2
                sm:mt-6
                sm:gap-3
              "
            >
              <Link
                to="/village/register"
                className="
                  group
                  inline-flex
                  items-center
                  gap-2.5
                  rounded-full
                  bg-white
                  px-4
                  py-2.5
                  text-sm
                  font-bold
                  text-primary-700
                  shadow-lg
                  transition-[transform,box-shadow]
                  duration-300
                  hover:-translate-y-0.5
                  hover:shadow-xl
                  sm:gap-3
                  sm:px-5
                  sm:py-3
                "
              >
                <span>
                  {t("register_village")}
                </span>

                <span
                  className="
                    flex
                    h-6
                    w-6
                    items-center
                    justify-center
                    rounded-full
                    bg-primary-600
                    text-xs
                    text-white
                    transition-transform
                    group-hover:translate-x-1
                  "
                >
                  →
                </span>
              </Link>

              <button
                onClick={() => scrollTo("how-it-works")}
                className="
                  inline-flex
                  items-center
                  gap-2
                  px-2
                  py-2.5
                  text-sm
                  font-semibold
                  text-white/70
                  transition-colors
                  hover:text-white
                  sm:px-3
                  sm:py-3
                "
              >
                Explore
                <span>↓</span>
              </button>
            </div>
          </div>

          {/* =================================================
              RIGHT — 3 PHONE FAN
          ================================================== */}

          <div
            className="
              relative
              mx-auto
              translate-y-3
              h-[330px]
              w-full
              max-w-[500px]
              sm:translate-y-4
              sm:h-[400px]
              sm:max-w-[600px]
              md:translate-y-5
              md:h-[470px]
              lg:translate-y-7
              lg:h-[600px]
              lg:max-w-none
            "
          >
            {/* =================================================
                LEFT PHONE
            ================================================== */}

            <div
              className="
                absolute
                z-10
                left-[5%]
                top-[15%]
                w-[115px]
                sm:left-[10%]
                sm:top-[14%]
                sm:w-[145px]
                md:left-[10%]
                md:w-[165px]
                lg:left-[5%]
                lg:top-[17%]
                lg:w-[200px]
                xl:left-[9%]
                xl:w-[215px]
                rotate-[-9deg]
                animate-hero-left
              "
            >
              <img
                src="/notice.webp"
                alt="GramVartha Notices"
                width="640"
                height="1261"
                loading="eager"
                decoding="async"
                fetchPriority="high"
                className="
                  block
                  h-auto
                  w-full
                  max-w-full
                  object-contain
                  drop-shadow-sm
                  sm:drop-shadow-[0_25px_45px_rgba(0,0,0,0.32)]
                  animate-float-slow
                "
              />
            </div>

            {/* =================================================
                CENTER PHONE
            ================================================== */}

            <div
              className="
                absolute
                z-30
                left-1/2
                top-[52%]
                w-[150px]
                sm:w-[185px]
                md:w-[215px]
                lg:top-1/2
                lg:w-[265px]
                xl:w-[285px]
                -translate-x-1/2
                -translate-y-1/2
                animate-hero-center
              "
            >
              <img
                src="/mainscreen.webp"
                alt="GramVartha Citizen App"
                width="640"
                height="1261"
                loading="eager"
                decoding="async"
                fetchPriority="high"
                className="
                  block
                  h-auto
                  w-full
                  max-w-full
                  object-contain
                  drop-shadow-sm
                  sm:drop-shadow-[0_30px_60px_rgba(0,0,0,0.40)]
                  lg:drop-shadow-[0_35px_70px_rgba(0,0,0,0.42)]
                  animate-float
                "
              />
            </div>

            {/* =================================================
                RIGHT PHONE
            ================================================== */}

            <div
              className="
                absolute
                z-10
                right-[5%]
                top-[15%]
                w-[115px]
                sm:right-[10%]
                sm:top-[14%]
                sm:w-[145px]
                md:right-[10%]
                md:w-[165px]
                lg:right-[5%]
                lg:top-[17%]
                lg:w-[200px]
                xl:right-[8%]
                xl:w-[215px]
                rotate-[9deg]
                animate-hero-right
              "
            >
              <img
                src="/comp.webp"
                alt="GramVartha Complaints"
                width="640"
                height="1261"
                loading="eager"
                decoding="async"
                fetchPriority="high"
                className="
                  block
                  h-auto
                  w-full
                  max-w-full
                  object-contain
                  drop-shadow-sm
                  sm:drop-shadow-[0_25px_45px_rgba(0,0,0,0.32)]
                  animate-float-side
                "
              />
            </div>

            {/* =================================================
                DECORATIVE STARS
            ================================================== */}

            <span
              className="
                absolute
                bottom-[17%]
                left-[15%]
                z-40
                text-base
                text-white/60
                sm:text-xl
              "
            >
              ✦
            </span>

            <span
              className="
                absolute
                bottom-[15%]
                right-[12%]
                z-40
                text-sm
                text-accent-lime/70
                sm:text-lg
              "
            >
              ✦
            </span>
          </div>
        </div>
      </div>

      {/* =====================================================
          BOTTOM WAVE
      ====================================================== */}

      <div
        className="
          pointer-events-none
          absolute
          bottom-[-1px]
          left-0
          z-40
          h-[42px]
          w-full
          sm:h-[55px]
          md:h-[65px]
          lg:h-[85px]
        "
      >
        <svg
          className="h-full w-full"
          viewBox="0 0 1440 120"
          preserveAspectRatio="none"
        >
          <path
            d="
              M0 80
              C180 15 330 15 500 65
              C690 120 830 115 1000 90
              C1180 65 1300 65 1440 30
              L1440 120
              L0 120
              Z
            "
            className="
              fill-accent-mist
              dark:fill-dark-background
            "
          />
        </svg>
      </div>

      {/* =====================================================
          SCROLL
      ====================================================== */}

      <button
        onClick={() => scrollTo("how-it-works")}
        className="
          absolute
          bottom-2
          left-1/2
          z-50
          hidden
          -translate-x-1/2
          items-center
          gap-2
          text-white/35
          transition-colors
          hover:text-white/70
          lg:flex
        "
      >
        <span
          className="
            text-[8px]
            font-bold
            uppercase
            tracking-[0.3em]
          "
        >
          Scroll
        </span>

        <span className="animate-bounce text-xs">
          ↓
        </span>
      </button>
    </section>
  );
}