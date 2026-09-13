import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import { useTranslation } from "react-i18next";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:3000";

export default function OfficialRegister() {
  const { dark } = useTheme();
  const { t } = useTranslation();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    village: "",
    phone: "",
  });

  const [documentProof, setDocumentProof] = useState(null);
  const [documentPreview, setDocumentPreview] = useState(null);

  const [profileImage, setProfileImage] = useState(null);
  const [profilePreview, setProfilePreview] = useState(null);

  const [showPw, setShowPw] = useState(false);
  const [showCpw, setShowCpw] = useState(false);

  const [message, setMessage] = useState({
    text: "",
    success: false,
  });

  const [loading, setLoading] = useState(false);
  const [villages, setVillages] = useState([]);

  const navigate = useNavigate();

  /* =========================================
     FETCH VILLAGES
  ========================================= */

  useEffect(() => {
    axios
      .get(`${API_BASE_URL}/villages`)
      .then((r) => {
        setVillages(r.data || []);
      })
      .catch(() => {});
  }, []);

  /* =========================================
     HANDLE INPUT
  ========================================= */

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  /* =========================================
     PROFILE IMAGE
  ========================================= */

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) {
      setProfileImage(null);
      setProfilePreview(null);
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setMessage({
        text: "Profile image should be less than 5MB",
        success: false,
      });
      return;
    }

    setProfileImage(file);

    const reader = new FileReader();

    reader.onloadend = () => {
      setProfilePreview(reader.result);
    };

    reader.readAsDataURL(file);
  };

  /* =========================================
     DOCUMENT
  ========================================= */

  const handleDocumentChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) {
      setDocumentProof(null);
      setDocumentPreview(null);
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setMessage({
        text: "Document should be less than 5MB",
        success: false,
      });
      return;
    }

    setDocumentProof(file);

    const reader = new FileReader();

    reader.onloadend = () => {
      setDocumentPreview(reader.result);
    };

    reader.readAsDataURL(file);
  };

  /* =========================================
     SUBMIT
  ========================================= */

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      return setMessage({
        text: t("official.register.password_mismatch"),
        success: false,
      });
    }

    if (!profileImage) {
      return setMessage({
        text: t("official.register.photo_required"),
        success: false,
      });
    }

    if (!documentProof) {
      return setMessage({
        text: t("official.register.document_required"),
        success: false,
      });
    }

    if (!formData.phone) {
      return setMessage({
        text: t("official.register.phone_required"),
        success: false,
      });
    }

    setLoading(true);

    setMessage({
      text: "",
      success: false,
    });

    try {
      const fd = new FormData();

      ["name", "email", "password", "village", "phone"].forEach(
        (key) => {
          fd.append(key, formData[key]);
        }
      );

      fd.append("profileImage", profileImage);
      fd.append("documentProof", documentProof);

      const res = await axios.post(
        `${API_BASE_URL}/officials/register`,
        fd,
        {
          withCredentials: true,
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setMessage({
        text:
          res.data.message ||
          t("official.register.success"),
        success: true,
      });

      setTimeout(() => {
        if (res.data.official) {
          navigate("/officials/dashboard");
        }
      }, 1500);
    } catch (err) {
      setMessage({
        text:
          err.response?.data?.message ||
          t("official.register.error"),
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
    "w-full px-3 py-2 rounded-xl border " +
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
          max-w-[1450px]
          mx-auto
          grid
          lg:grid-cols-[0.75fr_1.25fr]
          gap-6
          lg:gap-10
          px-4
          sm:px-6
          lg:px-10
          xl:px-14
          py-4
          lg:py-5
          items-center
        "
      >
        {/* =========================================
            LEFT SIDE - DESKTOP
        ========================================= */}

        <section
          className="
            hidden
            lg:flex
            flex-col
            justify-center
            min-h-0
            pr-4
          "
        >
          <div className="max-w-md">
            {/* Small Label */}

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
              <span className="w-6 h-px bg-primary-500" />

              {t("official_register_access_label")}
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
              {t("official_register_heading_join")}

              <span
                className="
                  block
                  italic
                  font-extrabold
                  text-primary-500
                  tracking-[-0.07em]
                "
              >
                {t("official_register_heading_panchayat")}
              </span>

              <span className="block mt-1">
                {t("official_register_heading_brand")}
              </span>
            </h1>

            {/* Underline */}

            <div className="mt-3 relative w-[170px] h-4">
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
              {t("official_register_desktop_description")}
            </p>

            {/* Bottom Text */}

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
                {t("official_register_account_label")}
              </p>

              <p
                className="
                  text-sm
                  leading-6
                  text-text-secondary
                  dark:text-dark-text-secondary
                "
              >
                {t("official_register_account_description")}
              </p>
            </div>
          </div>
        </section>

        {/* =========================================
            MOBILE HEADING
        ========================================= */}

        <div className="lg:hidden pt-2 pb-1">
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
            <span className="w-5 h-px bg-primary-500" />

            {t("official_register_access_label")}
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
            {t("official_register_heading_join")}{" "}
            <span
              className="
                italic
                font-extrabold
                text-primary-500
              "
            >
              {t("official_register_heading_panchayat")}
            </span>

            <span className="block mt-1">
              {t("official_register_heading_brand")}
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
            {t("official_register_mobile_description")}
          </p>
        </div>

        {/* =========================================
            FORM AREA
        ========================================= */}

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
              max-w-2xl
              bg-white
              dark:bg-dark-surface
              border
              border-border
              dark:border-dark-border
              rounded-2xl
              sm:rounded-3xl
              shadow-sm
              dark:shadow-black/20
              p-4
              sm:p-5
              lg:p-6
            "
          >
            {/* =====================================
                FORM HEADER
            ===================================== */}

            <div
              className="
                flex
                items-start
                justify-between
                gap-4
                mb-4
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
                  {t("official.register.title")}
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

                {t("official.register.badge")}
              </div>
            </div>

            {/* Divider */}

            <div
              className="
                h-px
                bg-border
                dark:bg-dark-border
                mb-4
              "
            />

            {/* =====================================
                MESSAGE
            ===================================== */}

            {message.text && (
              <div
                className={`
                  flex
                  items-start
                  gap-2.5
                  px-3
                  py-2.5
                  rounded-xl
                  text-xs
                  border
                  mb-4
                  ${
                    message.success
                      ? `
                        bg-green-50
                        dark:bg-green-900/20
                        border-green-200
                        dark:border-green-800
                        text-green-700
                        dark:text-green-400
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
                  className="w-4 h-4 flex-shrink-0"
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

            {/* =====================================
                FORM
            ===================================== */}

            <form
              onSubmit={handleSubmit}
              className="space-y-3.5"
            >
              {/* Name + Village */}

              <div
                className="
                  grid
                  grid-cols-1
                  sm:grid-cols-2
                  gap-3.5
                "
              >
                <div>
                  <label
                    htmlFor="name"
                    className={labelClass}
                  >
                    {t("official.register.full_name")}
                  </label>

                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    placeholder={t(
                      "official.register.name_placeholder"
                    )}
                    disabled={loading}
                    className={inputClass}
                  />
                </div>

                <div>
                  <label
                    htmlFor="village"
                    className={labelClass}
                  >
                    {t("official.register.village")}{" "}
                    <span className="text-primary-500">
                      *
                    </span>
                  </label>

                  <div className="relative">
                    <select
                      id="village"
                      name="village"
                      required
                      value={formData.village}
                      onChange={handleChange}
                      disabled={loading}
                      className={`${inputClass} appearance-none pr-9 cursor-pointer`}
                    >
                      <option value="">
                        {t(
                          "official.register.select_village"
                        )}
                      </option>

                      {villages.map((village) => (
                        <option
                          key={village._id}
                          value={village._id}
                        >
                          {village.name}
                          {village.district
                            ? ` · ${village.district}`
                            : ""}
                        </option>
                      ))}
                    </select>

                    <svg
                      className="
                        absolute
                        right-3
                        top-1/2
                        -translate-y-1/2
                        w-3.5
                        h-3.5
                        text-text-muted
                        dark:text-dark-text-muted
                        pointer-events-none
                      "
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Email + Phone */}

              <div
                className="
                  grid
                  grid-cols-1
                  sm:grid-cols-2
                  gap-3.5
                "
              >
                <div>
                  <label
                    htmlFor="email"
                    className={labelClass}
                  >
                    {t("official.register.email")}
                  </label>

                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    placeholder={t(
                      "official.register.email_placeholder"
                    )}
                    disabled={loading}
                    className={inputClass}
                  />
                </div>

                <div>
                  <label
                    htmlFor="phone"
                    className={labelClass}
                  >
                    {t("official.register.phone")}{" "}
                    <span className="text-primary-500">
                      *
                    </span>
                  </label>

                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder={t(
                      "official.register.phone_placeholder"
                    )}
                    disabled={loading}
                    className={inputClass}
                  />
                </div>
              </div>

              {/* =====================================
                  PROFILE PHOTO
              ===================================== */}

              <div>
                <label className={labelClass}>
                  {t("official.register.profile_photo")}{" "}
                  <span className="text-primary-500">
                    *
                  </span>

                  <span
                    className="
                      normal-case
                      tracking-normal
                      font-normal
                      text-text-light
                      dark:text-dark-text-muted
                      ml-1
                      text-[10px]
                    "
                  >
                    (
                    {t(
                      "official.register.for_verification"
                    )}
                    )
                  </span>
                </label>

                <div
                  className="
                    flex
                    flex-col
                    sm:flex-row
                    gap-2.5
                    items-start
                  "
                >
                  <label
                    htmlFor="profileImage"
                    className="
                      flex-1
                      min-w-0
                      flex
                      items-center
                      gap-2.5
                      px-3
                      py-2
                      rounded-xl
                      border
                      border-border
                      dark:border-dark-border
                      bg-white
                      dark:bg-dark-surface2
                      cursor-pointer
                      hover:border-primary-300
                      dark:hover:border-primary-600
                      transition-all
                    "
                  >
                    <div
                      className="
                        w-7
                        h-7
                        rounded-lg
                        bg-primary-50
                        dark:bg-primary-900/40
                        border
                        border-primary-100
                        dark:border-primary-800
                        flex
                        items-center
                        justify-center
                        flex-shrink-0
                      "
                    >
                      <svg
                        className="
                          w-3.5
                          h-3.5
                          text-primary-600
                          dark:text-primary-400
                        "
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                    </div>

                    <span
                      className="
                        flex-1
                        min-w-0
                        text-xs
                        text-text-muted
                        dark:text-dark-text-muted
                        truncate
                      "
                    >
                      {profileImage ? (
                        <span
                          className="
                            text-primary-600
                            dark:text-primary-400
                            font-medium
                          "
                        >
                          ✓{" "}
                          {profileImage.name.length > 30
                            ? profileImage.name.substring(
                                0,
                                27
                              ) + "..."
                            : profileImage.name}
                        </span>
                      ) : (
                        t(
                          "official.register.click_to_upload_photo"
                        )
                      )}
                    </span>

                    <span
                      className="
                        text-[10px]
                        font-semibold
                        text-primary-600
                        dark:text-primary-400
                        border
                        border-primary-200
                        dark:border-primary-700
                        bg-primary-50
                        dark:bg-primary-900/30
                        rounded-lg
                        px-2
                        py-1
                        flex-shrink-0
                      "
                    >
                      {t("official.register.browse")}
                    </span>
                  </label>

                  {profilePreview && (
                    <div className="relative flex-shrink-0">
                      <img
                        src={profilePreview}
                        alt="Profile preview"
                        className="
                          w-12
                          h-12
                          rounded-xl
                          object-cover
                          border
                          border-primary-200
                          dark:border-primary-700
                        "
                      />

                      <button
                        type="button"
                        onClick={() => {
                          setProfileImage(null);
                          setProfilePreview(null);

                          const input =
                            document.getElementById(
                              "profileImage"
                            );

                          if (input) {
                            input.value = "";
                          }
                        }}
                        className="
                          absolute
                          -top-1.5
                          -right-1.5
                          w-5
                          h-5
                          rounded-full
                          bg-red-500
                          text-white
                          flex
                          items-center
                          justify-center
                          text-xs
                          hover:bg-red-600
                          transition-colors
                        "
                      >
                        ×
                      </button>
                    </div>
                  )}
                </div>

                <input
                  id="profileImage"
                  type="file"
                  accept="image/jpeg,image/png,image/jpg,image/webp"
                  onChange={handleImageChange}
                  disabled={loading}
                  className="hidden"
                />

                <p
                  className="
                    text-[9px]
                    text-text-light
                    dark:text-dark-text-muted
                    mt-1
                    ml-1
                  "
                >
                  JPG, PNG, WEBP (Max 5MB)
                </p>
              </div>

              {/* =====================================
                  ID PROOF
              ===================================== */}

              <div>
                <label className={labelClass}>
                  {t("official.register.id_proof")}{" "}
                  <span className="text-primary-500">
                    *
                  </span>

                  <span
                    className="
                      normal-case
                      tracking-normal
                      font-normal
                      text-text-light
                      dark:text-dark-text-muted
                      ml-1
                      text-[10px]
                    "
                  >
                    (Aadhar, PAN, Voter ID, etc.)
                  </span>
                </label>

                <label
                  htmlFor="documentProof"
                  className="
                    w-full
                    flex
                    items-center
                    gap-2.5
                    px-3
                    py-2
                    rounded-xl
                    border
                    border-border
                    dark:border-dark-border
                    bg-white
                    dark:bg-dark-surface2
                    cursor-pointer
                    hover:border-primary-300
                    dark:hover:border-primary-600
                    transition-all
                  "
                >
                  <div
                    className="
                      w-7
                      h-7
                      rounded-lg
                      bg-primary-50
                      dark:bg-primary-900/40
                      border
                      border-primary-100
                      dark:border-primary-800
                      flex
                      items-center
                      justify-center
                      flex-shrink-0
                    "
                  >
                    <svg
                      className="
                        w-3.5
                        h-3.5
                        text-primary-600
                        dark:text-primary-400
                      "
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                  </div>

                  <span
                    className="
                      flex-1
                      min-w-0
                      text-xs
                      text-text-muted
                      dark:text-dark-text-muted
                      truncate
                    "
                  >
                    {documentProof ? (
                      <span
                        className="
                          text-primary-600
                          dark:text-primary-400
                          font-medium
                        "
                      >
                        ✓{" "}
                        {documentProof.name.length > 35
                          ? documentProof.name.substring(
                              0,
                              32
                            ) + "..."
                          : documentProof.name}
                      </span>
                    ) : (
                      t(
                        "official.register.click_to_upload_document"
                      )
                    )}
                  </span>

                  <span
                    className="
                      text-[10px]
                      font-semibold
                      text-primary-600
                      dark:text-primary-400
                      border
                      border-primary-200
                      dark:border-primary-700
                      bg-primary-50
                      dark:bg-primary-900/30
                      rounded-lg
                      px-2
                      py-1
                      flex-shrink-0
                    "
                  >
                    {t("official.register.browse")}
                  </span>
                </label>

                <input
                  id="documentProof"
                  name="documentProof"
                  type="file"
                  accept="image/jpeg,image/png,image/jpg,application/pdf"
                  onChange={handleDocumentChange}
                  disabled={loading}
                  className="hidden"
                />

                {documentPreview && (
                  <div
                    className="
                      mt-2
                      p-2
                      rounded-xl
                      border
                      border-primary-100
                      dark:border-primary-800
                      bg-primary-50/60
                      dark:bg-primary-900/20
                    "
                  >
                    <div
                      className="
                        flex
                        items-center
                        justify-between
                        gap-2
                      "
                    >
                      <div
                        className="
                          flex
                          items-center
                          gap-2
                          min-w-0
                        "
                      >
                        {documentProof?.type?.startsWith(
                          "image/"
                        ) ? (
                          <img
                            src={documentPreview}
                            alt="Document preview"
                            className="
                              w-10
                              h-10
                              rounded-lg
                              object-cover
                              border
                              border-primary-200
                              dark:border-primary-700
                              flex-shrink-0
                            "
                          />
                        ) : (
                          <div
                            className="
                              w-10
                              h-10
                              rounded-lg
                              bg-primary-100
                              dark:bg-primary-800
                              flex
                              items-center
                              justify-center
                              flex-shrink-0
                            "
                          >
                            <svg
                              className="
                                w-5
                                h-5
                                text-primary-600
                                dark:text-primary-400
                              "
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M7 21h10a2 2 0 002-2V9.414a2 2 0 00-.586-1.414l-5.414-5.414A2 2 0 0011.586 2H7a2 2 0 00-2 2v15a2 2 0 002 2z"
                              />
                            </svg>
                          </div>
                        )}

                        <div className="min-w-0">
                          <p
                            className="
                              text-xs
                              font-medium
                              text-text-primary
                              dark:text-dark-text-primary
                              truncate
                            "
                          >
                            {documentProof?.name}
                          </p>

                          <p
                            className="
                              text-[9px]
                              text-text-muted
                              dark:text-dark-text-muted
                            "
                          >
                            {(
                              documentProof?.size /
                              1024 /
                              1024
                            ).toFixed(2)}{" "}
                            MB
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setDocumentProof(null);
                          setDocumentPreview(null);

                          const input =
                            document.getElementById(
                              "documentProof"
                            );

                          if (input) {
                            input.value = "";
                          }
                        }}
                        className="
                          px-2
                          py-1
                          text-[10px]
                          font-medium
                          text-red-600
                          dark:text-red-400
                          hover:bg-red-50
                          dark:hover:bg-red-900/20
                          rounded-lg
                          transition-colors
                          flex-shrink-0
                        "
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                )}

                <p
                  className="
                    text-[9px]
                    text-text-light
                    dark:text-dark-text-muted
                    mt-1
                    ml-1
                  "
                >
                  JPG, PNG, PDF (Max 5MB)
                </p>
              </div>

              {/* =====================================
                  PASSWORD
              ===================================== */}

              <div
                className="
                  grid
                  grid-cols-1
                  sm:grid-cols-2
                  gap-3.5
                "
              >
                <div>
                  <label
                    htmlFor="password"
                    className={labelClass}
                  >
                    {t("official.register.password")}
                  </label>

                  <div className="relative">
                    <input
                      id="password"
                      name="password"
                      type={
                        showPw ? "text" : "password"
                      }
                      required
                      value={formData.password}
                      onChange={handleChange}
                      placeholder={t(
                        "official.register.password_placeholder"
                      )}
                      disabled={loading}
                      className={`${inputClass} pr-10`}
                    />

                    <button
                      type="button"
                      tabIndex={-1}
                      onClick={() =>
                        setShowPw((prev) => !prev)
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
                    >
                      <EyeIcon open={showPw} />
                    </button>
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="confirmPassword"
                    className={labelClass}
                  >
                    {t(
                      "official.register.confirm_password"
                    )}
                  </label>

                  <div className="relative">
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={
                        showCpw ? "text" : "password"
                      }
                      required
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder={t(
                        "official.register.confirm_placeholder"
                      )}
                      disabled={loading}
                      className={`${inputClass} pr-10`}
                    />

                    <button
                      type="button"
                      tabIndex={-1}
                      onClick={() =>
                        setShowCpw((prev) => !prev)
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
                    >
                      <EyeIcon open={showCpw} />
                    </button>
                  </div>
                </div>
              </div>

              {/* =====================================
                  SUBMIT
              ===================================== */}

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
                  px-6
                  py-2.5
                  rounded-xl
                  transition-all
                  duration-200
                  shadow-sm
                  hover:shadow-md
                  disabled:opacity-50
                  disabled:cursor-not-allowed
                  mt-0.5
                "
              >
                {loading ? (
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

                    {t(
                      "official.register.creating_account"
                    )}
                  </>
                ) : (
                  <>
                    {t(
                      "official.register.create_account"
                    )}

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
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </>
                )}
              </button>
            </form>

            {/* =====================================
                FOOTER
            ===================================== */}

            <div
              className="
                flex
                flex-col
                sm:flex-row
                items-center
                justify-between
                gap-2
                mt-4
                pt-3
                border-t
                border-border
                dark:border-dark-border
              "
            >
              <div
                className="
                  flex
                  items-center
                  gap-1.5
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
                  "official.register.secure_encrypted"
                )}
              </div>

              <Link
                to="/officials/login"
                className="
                  text-[11px]
                  font-semibold
                  text-primary-600
                  dark:text-primary-400
                  hover:text-primary-700
                  dark:hover:text-primary-300
                  transition-colors
                "
              >
                {t(
                  "official.register.login_instead"
                )}{" "}
                →
              </Link>
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
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      {open ? (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
        />
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
