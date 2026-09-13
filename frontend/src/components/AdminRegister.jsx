import React, { useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { useTranslation } from "react-i18next";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:3000";

export default function AdminRegister() {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({
    text: "",
    success: false,
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setIsLoading(true);
    setMessage({
      text: "",
      success: false,
    });

    try {
      const res = await axios.post(
        `${API_BASE_URL}/admin/register`,
        formData
      );

      setMessage({
        text: res.data.message,
        success: true,
      });
    } catch (err) {
      setMessage({
        text:
          err.response?.data?.message ||
          t("admin_error"),
        success: false,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-accent-mist dark:bg-dark-background flex items-center justify-center overflow-hidden">
      <div className="w-full min-h-screen lg:h-screen flex">

        {/* =====================================================
            LEFT SIDE — DESKTOP
        ===================================================== */}
        <section className="hidden lg:flex lg:w-[52%] items-center justify-center px-12 xl:px-16">
          <div className="w-full max-w-[560px]">

            {/* Small label */}
            <div className="mb-5">
              <span className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-primary-500 dark:text-primary-300">
                <span className="w-1.5 h-1.5 rounded-full bg-primary-400" />
                {t("admin_register_label")}
              </span>
            </div>

            {/* Main heading */}
            <h1 className="text-[48px] xl:text-[58px] font-bold leading-[0.98] tracking-[-0.055em] text-text-primary dark:text-dark-text-primary">
              {t("admin_register_heading")}
              <br />

              <span className="relative inline-block mt-2 italic font-extrabold text-primary-500 dark:text-primary-300 tracking-[-0.065em]">
                {t("admin_register_heading_account")}

                {/* Hand drawn underline */}
                <svg
                  className="absolute left-0 -bottom-3 w-full h-[10px]"
                  viewBox="0 0 300 10"
                  fill="none"
                  preserveAspectRatio="none"
                  aria-hidden="true"
                >
                  <path
                    d="M3 7C60 8 135 2 205 5C245 7 270 3 297 5"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
            </h1>

            {/* Description */}
            <p className="mt-8 max-w-[440px] text-sm xl:text-[15px] leading-7 text-text-secondary dark:text-dark-text-secondary">
              {t("admin_register_description")}
            </p>

            {/* Small feature list */}
            <div className="mt-8 flex flex-wrap gap-2">
              {[
                "admin_notice_management",
                "admin_village_dashboard",
                "admin_qr_generator",
                "admin_analytics",
              ].map((feature) => (
                <span
                  key={feature}
                  className="
                    px-3 py-1.5
                    rounded-full
                    border border-border dark:border-dark-border
                    bg-white/70 dark:bg-dark-surface
                    text-[11px]
                    font-medium
                    text-text-secondary dark:text-dark-text-secondary
                  "
                >
                  {t(feature)}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* =====================================================
            RIGHT SIDE — FORM
        ===================================================== */}
        <section
          className="
            w-full lg:w-[48%]
            flex items-center justify-center
            px-4 sm:px-6 lg:px-8
            py-6
            bg-white dark:bg-dark-surface
            overflow-y-auto
          "
        >
          <div className="w-full max-w-[390px]">

            {/* Mobile heading */}
            <div className="lg:hidden mb-7">
              <div className="mb-4">
                <span className="inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.15em] text-primary-500">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary-400" />
                  {t("admin_register_label")}
                </span>
              </div>

              <h1 className="text-[30px] sm:text-[34px] font-bold leading-[1] tracking-[-0.045em] text-text-primary dark:text-dark-text-primary">
                {t("admin_register_heading")}
                <br />

                <span className="relative inline-block mt-1 italic font-extrabold text-primary-500 tracking-[-0.06em]">
                  {t("admin_register_heading_account")}

                  <svg
                    className="absolute left-0 -bottom-2 w-full h-[8px]"
                    viewBox="0 0 300 10"
                    fill="none"
                    preserveAspectRatio="none"
                    aria-hidden="true"
                  >
                    <path
                      d="M3 7C60 8 135 2 205 5C245 7 270 3 297 5"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeLinecap="round"
                    />
                  </svg>
                </span>
              </h1>

              <p className="mt-6 text-xs leading-6 text-text-secondary dark:text-dark-text-secondary">
                {t("admin_register_mobile_description")}
              </p>
            </div>

            {/* =================================================
                FORM CARD
            ================================================= */}
            <div
              className="
                rounded-[24px]
                border border-border dark:border-dark-border
                bg-white dark:bg-dark-surface
                p-5 sm:p-6
                shadow-[0_12px_40px_rgba(59,20,8,0.07)]
                dark:shadow-none
              "
            >
              {/* Form heading */}
              <div className="mb-5">
                <h2 className="text-lg font-bold tracking-tight text-text-primary dark:text-dark-text-primary">
                  {t("admin_register_form_heading")}
                </h2>

                <p className="mt-1 text-[11px] leading-5 text-text-muted dark:text-dark-text-muted">
                  {t("admin_register_form_description")}
                </p>
              </div>

              {/* =================================================
                  STATUS MESSAGE
              ================================================= */}
              {message.text && (
                <div
                  className={`
                    mb-5
                    flex items-start gap-2.5
                    rounded-xl
                    border
                    px-3.5 py-3
                    text-xs
                    ${
                      message.success
                        ? "bg-green-50 border-green-100 text-green-700"
                        : "bg-red-50 border-red-100 text-red-600"
                    }
                  `}
                >
                  <svg
                    className="w-4 h-4 mt-0.5 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
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

              {/* =================================================
                  FORM
              ================================================= */}
              <form
                onSubmit={handleSubmit}
                className="space-y-4"
              >
                {/* EMAIL */}
                <div className="space-y-1.5">
                  <label
                    htmlFor="email"
                    className="
                      block
                      text-[11px]
                      font-semibold
                      text-text-primary
                      dark:text-dark-text-primary
                    "
                  >
                    {t("admin_email")}
                  </label>

                  <input
                    id="email"
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="admin@gramvartha.in"
                    autoComplete="email"
                    className="
                      w-full
                      h-[43px]
                      px-3.5
                      rounded-xl
                      border border-border
                      dark:border-dark-border
                      bg-white
                      dark:bg-dark-surface2
                      text-sm
                      text-text-primary
                      dark:text-dark-text-primary
                      placeholder-text-light
                      dark:placeholder-dark-text-light
                      outline-none
                      transition-all duration-200
                      focus:border-primary-400
                      focus:ring-4
                      focus:ring-primary-400/10
                      hover:border-primary-200
                    "
                  />
                </div>

                {/* PASSWORD */}
                <div className="space-y-1.5">
                  <label
                    htmlFor="password"
                    className="
                      block
                      text-[11px]
                      font-semibold
                      text-text-primary
                      dark:text-dark-text-primary
                    "
                  >
                    {t("admin_password")}
                  </label>

                  <div className="relative">
                    <input
                      id="password"
                      type={
                        showPassword ? "text" : "password"
                      }
                      name="password"
                      required
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Create a strong password"
                      autoComplete="new-password"
                      className="
                        w-full
                        h-[43px]
                        px-3.5
                        pr-11
                        rounded-xl
                        border border-border
                        dark:border-dark-border
                        bg-white
                        dark:bg-dark-surface2
                        text-sm
                        text-text-primary
                        dark:text-dark-text-primary
                        placeholder-text-light
                        dark:placeholder-dark-text-light
                        outline-none
                        transition-all duration-200
                        focus:border-primary-400
                        focus:ring-4
                        focus:ring-primary-400/10
                        hover:border-primary-200
                      "
                    />

                    {/* Password toggle */}
                    <button
                      type="button"
                      onClick={() =>
                        setShowPassword(!showPassword)
                      }
                      className="
                        absolute
                        right-3
                        top-1/2
                        -translate-y-1/2
                        p-1
                        text-text-light
                        hover:text-primary-500
                        dark:text-dark-text-light
                        dark:hover:text-primary-300
                        transition-colors
                      "
                      tabIndex={-1}
                      aria-label={
                        showPassword
                          ? t("admin_hide_password")
                          : t("admin_show_password")
                      }
                    >
                      {showPassword ? (
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                          />
                        </svg>
                      ) : (
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                          />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                {/* PASSWORD HINT */}
                <p className="-mt-1 text-[10px] leading-4 text-text-muted dark:text-dark-text-muted">
                  {t("admin_password_hint")}
                </p>

                {/* SUBMIT */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="
                    w-full
                    h-[44px]
                    mt-2
                    px-4
                    rounded-xl
                    bg-primary-600
                    hover:bg-primary-700
                    active:bg-primary-800
                    text-white
                    text-xs
                    sm:text-sm
                    font-semibold
                    transition-all duration-200
                    disabled:opacity-50
                    disabled:cursor-not-allowed
                    flex
                    items-center
                    justify-center
                    gap-2
                    shadow-sm
                    hover:shadow-md
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

                      {t("admin_creating_account")}
                    </>
                  ) : (
                    <>
                      {t("admin_create_account")}

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

              {/* =================================================
                  DIVIDER
              ================================================= */}
              <div className="flex items-center gap-3 my-5">
                <div className="flex-1 h-px bg-border dark:bg-dark-border" />

                <span className="text-[10px] text-text-light dark:text-dark-text-light">
                  {t("common.or")}
                </span>

                <div className="flex-1 h-px bg-border dark:bg-dark-border" />
              </div>

              {/* =================================================
                  FOOTER
              ================================================= */}
              <div className="text-center">
                <Link
                  to="/admin/login"
                  className="
                    text-xs
                    font-semibold
                    text-primary-500
                    hover:text-primary-600
                    dark:text-primary-300
                    dark:hover:text-primary-200
                    transition-colors
                  "
                >
                  {t("admin_sign_in_instead")}
                </Link>

                <div
                  className="
                    flex
                    items-center
                    justify-center
                    gap-1.5
                    mt-4
                    text-[10px]
                    text-text-light
                    dark:text-dark-text-light
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

                  {t("admin_secure_access")}
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
