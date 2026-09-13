import React from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

const scrollTo = (id) => {
  const el = document.getElementById(id);

  if (el) {
    el.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }
};

export default function Footer() {
  const { t } = useTranslation();

  return (
    <footer
      className="
        relative
        overflow-hidden
        bg-primary-600
        text-white
        font-sans
        transition-colors
        duration-300
        dark:bg-primary-800
      "
    >
      {/* =====================================================
          CURVED TOP
      ====================================================== */}

      <div
        className="
          relative
          h-[95px]
          w-full
          sm:h-[125px]
          md:h-[155px]
          lg:h-[185px]
        "
      >
        <svg
          className="absolute inset-0 h-full w-full"
          viewBox="0 0 1440 230"
          preserveAspectRatio="none"
        >
          <path
            d="
              M0 0
              L0 105
              C180 50 340 40 510 85
              C680 130 820 165 990 140
              C1160 115 1300 48 1440 18
              L1440 0
              Z
            "
            fill="#fdf6f2"
          />
        </svg>

        {/* Decorative details */}
        <div
          className="
            pointer-events-none
            absolute
            right-[10%]
            top-[55%]
            h-2
            w-2
            rounded-full
            bg-white/20
            sm:right-[12%]
            sm:h-2.5
            sm:w-2.5
          "
        />

        <div
          className="
            pointer-events-none
            absolute
            left-[10%]
            top-[48%]
            text-xs
            text-white/15
            sm:left-[14%]
            sm:text-sm
          "
        >
          ✦
        </div>
      </div>

      {/* =====================================================
          FOOTER CONTENT
      ====================================================== */}

      <div
        className="
          relative
          -mt-px
          px-5
          pb-5
          sm:px-8
          sm:pb-7
          md:pb-8
          lg:px-12
          lg:pb-10
        "
      >
        <div className="mx-auto max-w-6xl">

          {/* =================================================
              BRAND
          ================================================== */}

          <div className="flex flex-col items-center text-center">

            <Link
              to="/"
              className="
                inline-flex
                items-center
                gap-2
                transition-transform
                duration-300
                hover:scale-[1.02]
                sm:gap-2.5
              "
            >
              {/* Logo */}
              <div
                className="
                  flex
                  h-9
                  w-9
                  items-center
                  justify-center
                  overflow-hidden
                  rounded-full
                  bg-white/10
                  ring-1
                  ring-white/15
                  sm:h-10
                  sm:w-10
                "
              >
                <img
                  src="/gramvarthalogo.png"
                  alt="GramVartha"
                  className="h-full w-full object-contain"
                />
              </div>

              {/* Brand name */}
              <span
                className="
                  text-lg
                  font-bold
                  tracking-tight
                  sm:text-xl
                "
              >
                Gram
                <span className="text-accent-lime">
                  Vartha
                </span>
              </span>
            </Link>

            {/* =================================================
                DESCRIPTION
            ================================================== */}

            <p
              className="
                mt-3
                max-w-[310px]
                text-[10px]
                leading-5
                text-white/50
                sm:mt-4
                sm:max-w-md
                sm:text-sm
                sm:leading-relaxed
              "
            >
              {t("footer_description")}
            </p>

            {/* =================================================
                NAVIGATION
            ================================================== */}

            <div
              className="
                mt-6
                flex
                max-w-[340px]
                flex-wrap
                items-center
                justify-center
                gap-x-5
                gap-y-2
                sm:mt-8
                sm:max-w-none
                sm:gap-x-8
                sm:gap-y-3
                md:gap-x-9
              "
            >
              {/* About */}
              <button
                onClick={() => scrollTo("about")}
                className="
                  rounded-full
                  px-1
                  py-1
                  text-[10px]
                  font-medium
                  text-white/55
                  transition-colors
                  duration-200
                  hover:text-white
                  sm:text-sm
                "
              >
                {t("nav_about")}
              </button>

              {/* How It Works */}
              <button
                onClick={() => scrollTo("how-it-works")}
                className="
                  rounded-full
                  px-1
                  py-1
                  text-[10px]
                  font-medium
                  text-white/55
                  transition-colors
                  duration-200
                  hover:text-white
                  sm:text-sm
                "
              >
                How It Works
              </button>

              {/* Register */}
              <Link
                to="/village/register"
                className="
                  rounded-full
                  px-1
                  py-1
                  text-[10px]
                  font-medium
                  text-white/55
                  transition-colors
                  duration-200
                  hover:text-white
                  sm:text-sm
                "
              >
                {t("register_village")}
              </Link>

              {/* Officials */}
              <Link
                to="/officials/login"
                className="
                  rounded-full
                  px-1
                  py-1
                  text-[10px]
                  font-medium
                  text-white/55
                  transition-colors
                  duration-200
                  hover:text-white
                  sm:text-sm
                "
              >
                {t("nav_officials_login")}
              </Link>

              {/* Admin */}
              <Link
                to="/admin/login"
                className="
                  rounded-full
                  px-1
                  py-1
                  text-[10px]
                  font-medium
                  text-white/55
                  transition-colors
                  duration-200
                  hover:text-white
                  sm:text-sm
                "
              >
                {t("nav_admin_login")}
              </Link>
            </div>

            {/* =================================================
                POLICY LINKS
            ================================================== */}

            <div
              className="
                mt-4
                flex
                items-center
                gap-3
                text-[9px]
                text-white/35
                sm:mt-5
                sm:gap-5
                sm:text-xs
              "
            >
              <Link
                to="/privacy-policy"
                className="
                  transition-colors
                  hover:text-white/70
                "
              >
                Privacy Policy
              </Link>

              <span
                className="
                  h-1
                  w-1
                  shrink-0
                  rounded-full
                  bg-white/20
                "
              />

              <Link
                to="/delete-account"
                className="
                  transition-colors
                  hover:text-white/70
                "
              >
                Delete Account
              </Link>
            </div>
          </div>

          {/* =================================================
              DIVIDER
          ================================================== */}

          <div
            className="
              mt-6
              h-px
              w-full
              bg-white/10
              sm:mt-8
              md:mt-10
            "
          />

          {/* =================================================
              BOTTOM
          ================================================== */}

          <div
            className="
              flex
              flex-col
              items-center
              justify-center
              gap-2
              pt-4
              text-center
              sm:gap-3
              sm:pt-5
              md:pt-6
            "
          >
            {/* Copyright */}
            <p
              className="
                text-[8px]
                leading-4
                text-white/30
                sm:text-xs
              "
            >
              {t("footer_rights").replace(
                "2025",
                new Date().getFullYear()
              )}
            </p>

            {/* Live status */}
            <div
              className="
                flex
                items-center
                gap-1.5
                text-[8px]
                text-white/25
                sm:gap-2
                sm:text-xs
              "
            >
              <span
                className="
                  h-1.5
                  w-1.5
                  shrink-0
                  rounded-full
                  bg-accent-lime/70
                "
              />

              <span>
                {t("footer_live_text")}
              </span>
            </div>
          </div>

        </div>
      </div>
    </footer>
  );
}