import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import * as api from "../services/api";
import { useTheme } from "../context/ThemeContext";
import { useTranslation } from "react-i18next";

/* =========================================================
   SKELETON COMPONENTS
========================================================= */

const LoginFormSkeleton = () => (
  <div className="space-y-4 animate-pulse">
    <div>
      <div className="h-3 w-24 bg-gray-200 dark:bg-gray-700 rounded mb-1.5" />
      <div className="h-11 w-full bg-gray-200 dark:bg-gray-700 rounded-xl" />
    </div>

    <div>
      <div className="h-3 w-20 bg-gray-200 dark:bg-gray-700 rounded mb-1.5" />
      <div className="h-11 w-full bg-gray-200 dark:bg-gray-700 rounded-xl" />
    </div>

    <div className="h-11 w-full bg-gray-200 dark:bg-gray-700 rounded-xl mt-2" />
  </div>
);

const HeaderSkeleton = () => (
  <div className="mb-6 animate-pulse">
    <div className="h-3 w-28 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
    <div className="h-7 w-48 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
    <div className="h-3 w-64 bg-gray-200 dark:bg-gray-700 rounded" />
  </div>
);

const DividerSkeleton = () => (
  <div className="flex items-center gap-3 my-5 animate-pulse">
    <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
    <div className="h-3 w-7 bg-gray-200 dark:bg-gray-700 rounded" />
    <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
  </div>
);

const ToggleSkeleton = () => (
  <div className="text-center space-y-3 animate-pulse">
    <div className="h-4 w-44 bg-gray-200 dark:bg-gray-700 rounded mx-auto" />

    <div className="flex items-center justify-center gap-2">
      <div className="h-3.5 w-3.5 bg-gray-200 dark:bg-gray-700 rounded" />
      <div className="h-3.5 w-28 bg-gray-200 dark:bg-gray-700 rounded" />
    </div>
  </div>
);

const BackLinkSkeleton = () => (
  <div className="flex items-center justify-center gap-2 mt-5 pt-4 border-t border-border dark:border-dark-border animate-pulse">
    <div className="h-3.5 w-3.5 bg-gray-200 dark:bg-gray-700 rounded" />
    <div className="h-3.5 w-28 bg-gray-200 dark:bg-gray-700 rounded" />
  </div>
);

/* =========================================================
   EYE ICON
========================================================= */

function EyeIcon({ open }) {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
    >
      {open ? (
        <>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
          />
        </>
      ) : (
        <>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
          />

          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
          />
        </>
      )}
    </svg>
  );
}

/* =========================================================
   MAIN COMPONENT
========================================================= */

const LoginPage = () => {
  const { t } = useTranslation();
  const { dark } = useTheme();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [isRegisterMode, setIsRegisterMode] = useState(false);

  const [initialLoading, setInitialLoading] = useState(true);

  const navigate = useNavigate();

  /* =========================================================
     INITIAL LOADING
  ========================================================= */

  useEffect(() => {
    const timer = setTimeout(() => {
      setInitialLoading(false);
    }, 450);

    return () => clearTimeout(timer);
  }, []);

  /* =========================================================
     LOGIN
  ========================================================= */

  const handleLogin = async (e) => {
    e.preventDefault();

    setIsLoading(true);

    try {
      const res = await api.adminLogin(email, password);

      if (res.status === 200) {
        const profileRes = await api.getAdminProfile();

        const userRole = profileRes.data.role;

        toast.success(t("login.success"));

        setTimeout(() => {
          if (userRole === "superadmin") {
            navigate("/admin/superadmin");
          } else if (userRole === "admin") {
            navigate("/admin/village");
          } else {
            toast.error(t("login.role_error"));
            navigate("/admin/login");
          }
        }, 500);
      }
    } catch (err) {
      toast.error(
        err.response?.data?.message || t("login.error")
      );
    } finally {
      setIsLoading(false);
    }
  };

  /* =========================================================
     REGISTER
  ========================================================= */

  const handleRegister = async (e) => {
    e.preventDefault();

    setIsLoading(true);

    try {
      const res = await api.adminRegister(email, password);

      if (res.status === 201) {
        toast.success(t("register.success"));

        setIsRegisterMode(false);
        setEmail("");
        setPassword("");
      }
    } catch (err) {
      toast.error(
        err.response?.data?.message || t("register.error")
      );
    } finally {
      setIsLoading(false);
    }
  };

  /* =========================================================
     STYLES
  ========================================================= */

  const inputClass =
    "w-full h-[44px] px-3.5 py-2.5 rounded-xl border " +
    "bg-white dark:bg-dark-surface2 " +
    "border-border dark:border-dark-border " +
    "text-text-primary dark:text-dark-text-primary " +
    "text-sm placeholder:text-text-light dark:placeholder:text-dark-text-muted " +
    "transition-all duration-200 " +
    "focus:outline-none focus:border-primary-400 dark:focus:border-primary-500 " +
    "focus:ring-4 focus:ring-primary-300/20 dark:focus:ring-primary-500/15 " +
    "hover:border-primary-200 dark:hover:border-primary-800 " +
    "disabled:opacity-50 disabled:cursor-not-allowed";

  const labelClass =
    "block text-[11px] font-semibold " +
    "text-text-primary dark:text-dark-text-primary mb-1.5";

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <div
      className="
        min-h-screen
        w-full
        bg-accent-mist
        dark:bg-dark-background
        flex
        items-center
        justify-center
        overflow-hidden
        font-sans
      "
    >
      <div className="w-full min-h-screen lg:h-screen flex">

        {/* =====================================================
            LEFT EDITORIAL PANEL
        ===================================================== */}

        <section
          className="
            hidden
            lg:flex
            lg:w-[52%]
            items-center
            justify-center
            px-12
            xl:px-16
          "
        >
          <div className="w-full max-w-[560px]">

            {/* Small label */}

            <div className="mb-5">
              <span
                className="
                  inline-flex
                  items-center
                  gap-2
                  text-[10px]
                  font-semibold
                  uppercase
                  tracking-[0.18em]
                  text-primary-500
                  dark:text-primary-300
                "
              >
                <span className="w-1.5 h-1.5 rounded-full bg-primary-400" />

                {t("admin_portal_label")}
              </span>
            </div>

            {/* Main heading */}

            <h1
              className="
                text-[50px]
                xl:text-[60px]
                font-bold
                leading-[0.98]
                tracking-[-0.055em]
                text-text-primary
                dark:text-dark-text-primary
              "
            >
              {t("admin_login_heading")}
              <br />

              <span className="relative inline-block mt-2">
                <span
                  className="
                    italic
                    font-extrabold
                    text-primary-500
                    dark:text-primary-300
                    tracking-[-0.065em]
                  "
                >
                  {t("admin_login_heading_panchayat")}
                </span>

                {/* Hand-drawn underline */}

                <svg
                  className="
                    absolute
                    left-0
                    -bottom-3
                    w-full
                    h-[10px]
                  "
                  viewBox="0 0 260 10"
                  fill="none"
                  preserveAspectRatio="none"
                  aria-hidden="true"
                >
                  <path
                    d="M3 7C50 8 90 3 135 5C175 7 215 3 257 5"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
            </h1>

            {/* Description */}

            <p
              className="
                mt-8
                max-w-[430px]
                text-sm
                xl:text-[15px]
                leading-7
                text-text-secondary
                dark:text-dark-text-secondary
              "
            >
              {t("admin_login_description")}
            </p>

            {/* Small capability pills */}

            <div className="mt-8 flex flex-wrap gap-2">
              {[
                "admin_village_management",
                "admin_notices",
                "admin_schemes",
                "admin_analytics",
              ].map((item) => (
                <span
                  key={item}
                  className="
                    px-3
                    py-1.5
                    rounded-full
                    border
                    border-border
                    dark:border-dark-border
                    bg-white/70
                    dark:bg-dark-surface
                    text-[10px]
                    font-medium
                    text-text-secondary
                    dark:text-dark-text-secondary
                  "
                >
                  {t(item)}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* =====================================================
            RIGHT FORM PANEL
        ===================================================== */}

        <section
          className="
            w-full
            lg:w-[48%]
            min-h-screen
            flex
            items-center
            justify-center
            px-4
            sm:px-6
            lg:px-8
            py-6
            bg-white
            dark:bg-dark-surface
            overflow-y-auto
          "
        >
          <div className="w-full max-w-[390px]">

            {/* =================================================
                MOBILE HEADING
            ================================================= */}

            <div className="lg:hidden mb-7">

              <div className="mb-4">
                <span
                  className="
                    inline-flex
                    items-center
                    gap-2
                    text-[10px]
                    font-semibold
                    uppercase
                    tracking-[0.16em]
                    text-primary-500
                    dark:text-primary-300
                  "
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-primary-400" />

                  {t("admin_portal_label")}
                </span>
              </div>

              <h1
                className="
                  text-[31px]
                  sm:text-[35px]
                  font-bold
                  leading-[1]
                  tracking-[-0.05em]
                  text-text-primary
                  dark:text-dark-text-primary
                "
              >
                {t("admin_login_heading")}
                <br />

                <span className="relative inline-block mt-1">
                  <span
                    className="
                      italic
                      font-extrabold
                      text-primary-500
                      dark:text-primary-300
                      tracking-[-0.06em]
                    "
                  >
                    {t("admin_login_heading_panchayat")}
                  </span>

                  <svg
                    className="
                      absolute
                      left-0
                      -bottom-2
                      w-full
                      h-[8px]
                    "
                    viewBox="0 0 260 10"
                    fill="none"
                    preserveAspectRatio="none"
                    aria-hidden="true"
                  >
                    <path
                      d="M3 7C50 8 90 3 135 5C175 7 215 3 257 5"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeLinecap="round"
                    />
                  </svg>
                </span>
              </h1>

              <p
                className="
                  mt-6
                  text-xs
                  leading-6
                  text-text-secondary
                  dark:text-dark-text-secondary
                "
              >
                {t("admin_login_mobile_description")}
              </p>
            </div>

            {/* =================================================
                FORM CARD
            ================================================= */}

            <div
              className="
                rounded-[24px]
                border
                border-border
                dark:border-dark-border
                bg-white
                dark:bg-dark-surface
                p-5
                sm:p-6
                shadow-[0_12px_40px_rgba(59,20,8,0.07)]
                dark:shadow-none
              "
            >

              {/* =================================================
                  HEADER
              ================================================= */}

              {initialLoading ? (
                <HeaderSkeleton />
              ) : (
                <div className="mb-6">

                  <div className="flex items-center justify-between gap-3 mb-2">

                    <p
                      className="
                        text-[10px]
                        font-semibold
                        uppercase
                        tracking-[0.15em]
                        text-primary-500
                        dark:text-primary-300
                      "
                    >
                      GramVartha
                    </p>

                    <span
                      className="
                        inline-flex
                        items-center
                        gap-1.5
                        px-2.5
                        py-1
                        rounded-full
                        bg-primary-50
                        dark:bg-primary-900/30
                        border
                        border-primary-100
                        dark:border-primary-800
                        text-[9px]
                        font-medium
                        text-primary-600
                        dark:text-primary-300
                      "
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-primary-400" />

                      {t("login.secure_portal")}
                    </span>

                  </div>

                  <h2
                    className="
                      text-xl
                      font-bold
                      tracking-[-0.025em]
                      text-text-primary
                      dark:text-dark-text-primary
                    "
                  >
                    {isRegisterMode
                      ? t("register.title")
                      : t("login.title")}
                  </h2>

                  <p
                    className="
                      text-[11px]
                      mt-1
                      leading-5
                      text-text-muted
                      dark:text-dark-text-muted
                    "
                  >
                    {isRegisterMode
                      ? t("register.subheading")
                      : t("login.subheading")}
                  </p>

                </div>
              )}

              {/* =================================================
                  DIVIDER
              ================================================= */}

              {!initialLoading && (
                <div className="h-px bg-border dark:bg-dark-border mb-6" />
              )}

              {/* =================================================
                  FORM HEADING
              ================================================= */}

              {initialLoading ? (
                <div className="mb-5">
                  <div className="h-6 w-40 bg-gray-200 dark:bg-gray-700 rounded mb-2 animate-pulse" />
                  <div className="h-3 w-60 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                </div>
              ) : (
                <div className="mb-5">

                  <h3
                    className="
                      text-base
                      font-semibold
                      text-text-primary
                      dark:text-dark-text-primary
                    "
                  >
                    {isRegisterMode
                      ? t("register.heading")
                      : t("login.heading")}
                  </h3>

                  <p
                    className="
                      text-[11px]
                      mt-1
                      text-text-muted
                      dark:text-dark-text-muted
                    "
                  >
                    {isRegisterMode
                      ? t("register.subheading")
                      : t("login.subheading")}
                  </p>

                </div>
              )}

              {/* =================================================
                  FORM
              ================================================= */}

              {initialLoading ? (
                <LoginFormSkeleton />
              ) : (
                <form
                  onSubmit={
                    isRegisterMode
                      ? handleRegister
                      : handleLogin
                  }
                  className="space-y-4"
                >

                  {/* EMAIL */}

                  <div>
                    <label
                      htmlFor="email"
                      className={labelClass}
                    >
                      {t("login.email")}
                    </label>

                    <input
                      id="email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) =>
                        setEmail(e.target.value)
                      }
                      placeholder={t(
                        "login.email_placeholder"
                      )}
                      disabled={isLoading}
                      autoComplete="email"
                      className={inputClass}
                    />
                  </div>

                  {/* PASSWORD */}

                  <div>
                    <label
                      htmlFor="password"
                      className={labelClass}
                    >
                      {t("login.password")}
                    </label>

                    <div className="relative">

                      <input
                        id="password"
                        type={
                          showPassword
                            ? "text"
                            : "password"
                        }
                        required
                        value={password}
                        onChange={(e) =>
                          setPassword(e.target.value)
                        }
                        placeholder={t(
                          "login.password_placeholder"
                        )}
                        disabled={isLoading}
                        autoComplete={
                          isRegisterMode
                            ? "new-password"
                            : "current-password"
                        }
                        className={
                          inputClass + " pr-10"
                        }
                      />

                      <button
                        type="button"
                        onClick={() =>
                          setShowPassword(
                            !showPassword
                          )
                        }
                        className="
                          absolute
                          right-3
                          top-1/2
                          -translate-y-1/2
                          p-1
                          text-text-light
                          dark:text-dark-text-muted
                          hover:text-primary-600
                          dark:hover:text-primary-300
                          transition-colors
                        "
                        tabIndex={-1}
                        aria-label={
                          showPassword
                            ? "Hide password"
                            : "Show password"
                        }
                      >
                        <EyeIcon
                          open={showPassword}
                        />
                      </button>

                    </div>
                  </div>

                  {/* SUBMIT */}

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="
                      w-full
                      h-[44px]
                      mt-2
                      flex
                      items-center
                      justify-center
                      gap-2
                      px-4
                      rounded-xl
                      bg-primary-600
                      hover:bg-primary-700
                      active:bg-primary-800
                      text-white
                      text-sm
                      font-semibold
                      transition-all
                      duration-200
                      shadow-sm
                      hover:shadow-md
                      disabled:opacity-50
                      disabled:cursor-not-allowed
                    "
                  >

                    {isLoading ? (
                      <>
                        <svg
                          className="animate-spin w-4 h-4"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          />

                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          />
                        </svg>

                        {isRegisterMode
                          ? t("register.loading")
                          : t("login.loading")}
                      </>
                    ) : (
                      <>
                        {isRegisterMode
                          ? t("register.button")
                          : t("login.button")}

                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          aria-hidden="true"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </>
                    )}

                  </button>

                </form>
              )}

              {/* =================================================
                  DIVIDER
              ================================================= */}

              {initialLoading ? (
                <DividerSkeleton />
              ) : (
                <div className="flex items-center gap-3 my-5">

                  <div className="flex-1 h-px bg-border dark:bg-dark-border" />

                  <span
                    className="
                      text-[10px]
                      font-medium
                      text-text-light
                      dark:text-dark-text-muted
                    "
                  >
                    {t("common.or")}
                  </span>

                  <div className="flex-1 h-px bg-border dark:bg-dark-border" />

                </div>
              )}

              {/* =================================================
                  SWITCH LOGIN / REGISTER
              ================================================= */}

              {initialLoading ? (
                <ToggleSkeleton />
              ) : (
                <div className="text-center">

                  <button
                    type="button"
                    onClick={() => {
                      setIsRegisterMode(
                        !isRegisterMode
                      );

                      setEmail("");
                      setPassword("");
                      setShowPassword(false);
                    }}
                    className="
                      inline-flex
                      items-center
                      gap-1.5
                      text-xs
                      font-semibold
                      text-primary-500
                      dark:text-primary-300
                      hover:text-primary-600
                      dark:hover:text-primary-200
                      transition-colors
                    "
                  >
                    {isRegisterMode
                      ? t("login.switch")
                      : t("register.switch")}

                    <svg
                      className="w-3.5 h-3.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </button>

                  {/* Secure text */}

                  <div
                    className="
                      flex
                      items-center
                      justify-center
                      gap-1.5
                      mt-4
                      text-[10px]
                      text-text-light
                      dark:text-dark-text-muted
                    "
                  >
                    <svg
                      className="w-3 h-3"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                      />
                    </svg>

                    {t("login.secure_access")}
                  </div>

                </div>
              )}

              {/* =================================================
                  BACK HOME
              ================================================= */}

              {initialLoading ? (
                <BackLinkSkeleton />
              ) : (
                <Link
                  to="/"
                  className="
                    flex
                    items-center
                    justify-center
                    gap-1.5
                    text-xs
                    text-text-muted
                    dark:text-dark-text-muted
                    hover:text-text-primary
                    dark:hover:text-dark-text-primary
                    transition-colors
                    mt-5
                    pt-4
                    border-t
                    border-border
                    dark:border-dark-border
                  "
                >
                  <svg
                    className="w-3.5 h-3.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>

                  {t("common.back_home")}
                </Link>
              )}

            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default LoginPage;
