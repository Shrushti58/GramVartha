import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import { useTranslation } from "react-i18next";
import { officialLogin } from "../services/api";

export default function OfficialLogin({ onLogin }) {
  const { dark } = useTheme();
  const { t } = useTranslation();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);

  const [message, setMessage] = useState({
    text: "",
    success: false,
  });

  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  /* =========================================
     HANDLE INPUT
  ========================================= */

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  /* =========================================
     LOGIN
  ========================================= */

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);

    setMessage({
      text: "",
      success: false,
    });

    try {
      const res = await officialLogin(
        formData.email,
        formData.password
      );

      setMessage({
        text:
          res.data.message ||
          t("official.login.success"),
        success: true,
      });

      if (res.data.official) {
        navigate("/officials/dashboard");
      }
    } catch (err) {
      setMessage({
        text:
          err.response?.data?.message ||
          t("official.login.error"),
        success: false,
      });
    } finally {
      setLoading(false);
    }
  };

  /* =========================================
     STYLES
  ========================================= */

  const inputClass =
    "w-full px-3 py-2.5 rounded-xl border " +
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
    "block text-[11px] font-semibold uppercase tracking-wider " +
    "text-text-secondary dark:text-dark-text-muted mb-1.5";

  /* =========================================
     JSX
  ========================================= */

  return (
    <div
      className="
        min-h-[100svh]
        w-full
        bg-accent-mist
        dark:bg-dark-background
        text-text-primary
        dark:text-dark-text-primary
        transition-colors duration-300
        overflow-x-hidden
      "
    >
      <div
        className="
          min-h-[100svh]
          max-w-[1200px]
          mx-auto
          grid
          lg:grid-cols-[0.9fr_1.1fr]
          gap-8
          lg:gap-14
          px-4
          sm:px-6
          lg:px-10
          xl:px-14
          py-5
          lg:py-6
          items-center
        "
      >

        {/* =====================================
            LEFT SIDE
        ===================================== */}

        <section
          className="
            hidden
            lg:flex
            flex-col
            justify-center
            min-h-0
          "
        >
          <div className="max-w-md">

            {/* Small label */}

            <div
              className="
                inline-flex
                items-center
                gap-2
                mb-5
                text-[10px]
                font-semibold
                uppercase
                tracking-[0.18em]
                text-text-muted
                dark:text-dark-text-muted
              "
            >
              <span
                className="
                  w-6
                  h-px
                  bg-primary-500
                "
              />

              {t("official_login_access_label")}
            </div>

            {/* Heading */}

            <h1
              className="
                text-4xl
                xl:text-5xl
                font-semibold
                tracking-[-0.055em]
                leading-[0.98]
                text-text-primary
                dark:text-dark-text-primary
              "
            >
              {t("official_login_heading")}

              <span
                className="
                  block
                  italic
                  font-extrabold
                  text-primary-500
                  tracking-[-0.07em]
                  mt-1
                "
              >
                GramVartha.
              </span>
            </h1>

            {/* Hand drawn underline */}

            <div
              className="
                mt-3
                relative
                w-[170px]
                h-4
              "
            >
              <svg
                viewBox="0 0 220 24"
                className="
                  absolute
                  left-0
                  top-0
                  w-[170px]
                  h-4
                  text-primary-500
                "
                fill="none"
              >
                <path
                  d="M4 13C45 19 112 5 216 11"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
              </svg>
            </div>

            {/* Description */}

            <p
              className="
                mt-5
                text-sm
                leading-6
                text-text-secondary
                dark:text-dark-text-secondary
                max-w-sm
              "
            >
              {t("official_login_desktop_description")}
            </p>

            {/* Bottom statement */}

            <div
              className="
                mt-8
                pt-5
                border-t
                border-border
                dark:border-dark-border
                max-w-sm
              "
            >
              <p
                className="
                  text-[10px]
                  font-semibold
                  uppercase
                  tracking-[0.16em]
                  text-text-muted
                  dark:text-dark-text-muted
                  mb-2
                "
              >
                {t("official_login_account_label")}
              </p>

              <p
                className="
                  text-sm
                  leading-6
                  text-text-secondary
                  dark:text-dark-text-secondary
                "
              >
                {t("official_login_account_description")}
              </p>
            </div>
          </div>
        </section>

        {/* =====================================
            MOBILE HEADING
        ===================================== */}

        <div
          className="
            lg:hidden
            pt-2
            pb-1
          "
        >
          <div
            className="
              flex
              items-center
              gap-2
              mb-3
              text-[10px]
              font-semibold
              uppercase
              tracking-[0.18em]
              text-text-muted
              dark:text-dark-text-muted
            "
          >
            <span
              className="
                w-5
                h-px
                bg-primary-500
              "
            />

            {t("official_login_access_label")}
          </div>

          <h1
            className="
              text-3xl
              sm:text-4xl
              font-semibold
              tracking-[-0.05em]
              leading-[1]
              text-text-primary
              dark:text-dark-text-primary
            "
          >
            {t("official_login_heading")}{" "}

            <span
              className="
                italic
                font-extrabold
                text-primary-500
              "
            >
              GramVartha.
            </span>
          </h1>

          <p
            className="
              mt-3
              text-sm
              leading-6
              text-text-secondary
              dark:text-dark-text-secondary
              max-w-lg
            "
          >
            {t("official_login_mobile_description")}
          </p>
        </div>

        {/* =====================================
            LOGIN CARD
        ===================================== */}

        <section
          className="
            w-full
            flex
            justify-center
            lg:justify-end
          "
        >
          <div
            className="
              w-full
              max-w-[500px]
              bg-white
              dark:bg-dark-surface
              border
              border-border
              dark:border-dark-border
              rounded-2xl
              sm:rounded-3xl
              shadow-sm
              dark:shadow-black/20
              p-5
              sm:p-6
              lg:p-7
            "
          >

            {/* =================================
                CARD HEADER
            ================================= */}

            <div
              className="
                flex
                items-start
                justify-between
                gap-4
                mb-5
              "
            >
              <div>

                <p
                  className="
                    text-[10px]
                    font-semibold
                    uppercase
                    tracking-[0.16em]
                    text-text-muted
                    dark:text-dark-text-muted
                    mb-1
                  "
                >
                  GramVartha
                </p>

                <h2
                  className="
                    text-xl
                    sm:text-2xl
                    font-semibold
                    tracking-[-0.035em]
                    text-text-primary
                    dark:text-dark-text-primary
                  "
                >
                  {t("official.login.title")}
                </h2>

              </div>

              <div
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
                  text-[10px]
                  font-medium
                  text-primary-600
                  dark:text-primary-400
                  flex-shrink-0
                "
              >
                <span
                  className="
                    w-1.5
                    h-1.5
                    rounded-full
                    bg-primary-500
                    animate-pulse
                  "
                />

                {t("official.login.badge")}
              </div>
            </div>

            {/* Divider */}

            <div
              className="
                h-px
                bg-border
                dark:bg-dark-border
                mb-5
              "
            />

            {/* =================================
                WELCOME
            ================================= */}

            <div className="mb-5">

              <h3
                className="
                  text-base
                  sm:text-lg
                  font-semibold
                  text-text-primary
                  dark:text-dark-text-primary
                  tracking-[-0.02em]
                "
              >
                {t("official.login.welcome")}
              </h3>

              <p
                className="
                  text-[11px]
                  sm:text-xs
                  text-text-muted
                  dark:text-dark-text-muted
                  mt-1
                  leading-5
                "
              >
                {t("official.login.subtitle")}
              </p>

            </div>

            {/* =================================
                MESSAGE
            ================================= */}

            {message.text && (
              <div
                className={`
                  flex
                  items-center
                  gap-2
                  px-3
                  py-2.5
                  rounded-xl
                  text-xs
                  border
                  mb-4
                  ${
                    message.success
                      ? `
                        bg-primary-50
                        dark:bg-primary-900/30
                        border-primary-200
                        dark:border-primary-700
                        text-primary-700
                        dark:text-primary-300
                      `
                      : `
                        bg-red-50
                        dark:bg-red-900/20
                        border-red-200
                        dark:border-red-800
                        text-red-600
                        dark:text-red-400
                      `
                  }
                `}
              >

                <svg
                  className="
                    w-3.5
                    h-3.5
                    flex-shrink-0
                  "
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  {message.success ? (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  ) : (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  )}
                </svg>

                <span>{message.text}</span>

              </div>
            )}

            {/* =================================
                FORM
            ================================= */}

            <form
              onSubmit={handleSubmit}
              className="space-y-4"
            >

              {/* Email */}

              <div>

                <label
                  htmlFor="email"
                  className={labelClass}
                >
                  {t("official.login.email")}
                </label>

                <input
                  id="email"
                  type="email"
                  name="email"
                  required
                  autoComplete="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder={t(
                    "official.login.email_placeholder"
                  )}
                  disabled={loading}
                  className={inputClass}
                />

              </div>

              {/* Password */}

              <div>

                <label
                  htmlFor="password"
                  className={labelClass}
                >
                  {t("official.login.password")}
                </label>

                <div className="relative">

                  <input
                    id="password"
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    name="password"
                    required
                    autoComplete="current-password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder={t(
                      "official.login.password_placeholder"
                    )}
                    disabled={loading}
                    className={`${inputClass} pr-10`}
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
                      text-text-light
                      dark:text-dark-text-muted
                      hover:text-primary-600
                      dark:hover:text-primary-400
                      transition-colors
                    "
                    tabIndex={-1}
                    aria-label={
                      showPassword
                        ? t(
                            "official.login.hide_password"
                          )
                        : t(
                            "official.login.show_password"
                          )
                    }
                  >
                    <EyeIcon
                      open={showPassword}
                    />
                  </button>

                </div>

              </div>

              {/* =================================
                  LOGIN BUTTON
              ================================= */}

              <button
                type="submit"
                disabled={loading}
                className="
                  w-full
                  flex
                  items-center
                  justify-center
                  gap-2
                  bg-primary-600
                  hover:bg-primary-700
                  dark:bg-primary-500
                  dark:hover:bg-primary-600
                  text-white
                  font-semibold
                  text-sm
                  px-5
                  py-2.5
                  rounded-xl
                  transition-all
                  duration-200
                  shadow-sm
                  hover:shadow-md
                  disabled:opacity-50
                  disabled:cursor-not-allowed
                  mt-1
                "
              >

                {loading ? (
                  <>
                    <svg
                      className="
                        animate-spin
                        w-3.5
                        h-3.5
                      "
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

                    {t(
                      "official.login.signing_in"
                    )}
                  </>
                ) : (
                  <>
                    {t(
                      "official.login.login_button"
                    )}

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
                  </>
                )}

              </button>

            </form>

            {/* =================================
                DIVIDER
            ================================= */}

            <div
              className="
                flex
                items-center
                gap-3
                my-5
              "
            >
              <div
                className="
                  flex-1
                  h-px
                  bg-border
                  dark:bg-dark-border
                "
              />

              <span
                className="
                  text-[10px]
                  text-text-light
                  dark:text-dark-text-muted
                  font-medium
                "
              >
                {t("official.login.or")}
              </span>

              <div
                className="
                  flex-1
                  h-px
                  bg-border
                  dark:bg-dark-border
                "
              />
            </div>

            {/* =================================
                REGISTER
            ================================= */}

            <div className="text-center">

              <Link
                to="/officials/register"
                className="
                  inline-flex
                  items-center
                  gap-1.5
                  text-xs
                  sm:text-sm
                  text-primary-600
                  dark:text-primary-400
                  hover:text-primary-700
                  dark:hover:text-primary-300
                  font-medium
                  transition-colors
                "
              >
                {t(
                  "official.login.register_link"
                )}

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
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </Link>

            </div>

            {/* =================================
                SECURITY
            ================================= */}

            <div
              className="
                flex
                items-center
                justify-center
                gap-1.5
                mt-4
                pt-3
                border-t
                border-border
                dark:border-dark-border
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

              {t(
                "official.login.secure_access"
              )}

            </div>

          </div>
        </section>

      </div>
    </div>
  );
}

/* =========================================
   EYE ICON
========================================= */

function EyeIcon({ open }) {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
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
