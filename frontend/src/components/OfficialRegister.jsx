import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";

export default function OfficialRegister() {
  const { dark } = useTheme();
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
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [otpStatus, setOtpStatus] = useState({ text: "", success: false });
  const [otpLoading, setOtpLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [showCpw, setShowCpw] = useState(false);
  const [message, setMessage] = useState({ text: "", success: false });
  const [loading, setLoading] = useState(false);
  const [villages, setVillages] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_API_URL}/villages`)
      .then((r) => setVillages(r.data || []))
      .catch(() => {});
  }, []);

  const handleChange = (e) => {
    setFormData((p) => ({ ...p, [e.target.name]: e.target.value }));
    if (e.target.name === 'phone') {
      setPhoneVerified(false);
      setOtpSent(false);
      setOtpStatus({ text: '', success: false });
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0] || null;
    setProfileImage(file);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePreview(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      setProfilePreview(null);
    }
  };

  const handleDocumentChange = (e) => {
    const file = e.target.files?.[0] || null;
    setDocumentProof(file);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setDocumentPreview(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      setDocumentPreview(null);
    }
  };

  const sendOtp = async () => {
    if (!formData.phone) {
      setOtpStatus({ text: "Enter your phone number first", success: false });
      return;
    }
    setOtpLoading(true);
    setOtpStatus({ text: "", success: false });

    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/officials/send-otp`, {
        phone: formData.phone,
      });
      setOtpSent(true);
      setOtpStatus({ text: res.data.message, success: true });
    } catch (err) {
      setOtpStatus({
        text: err.response?.data?.message || "OTP request failed",
        success: false,
      });
    } finally {
      setOtpLoading(false);
    }
  };

  const verifyOtp = async () => {
    if (!formData.phone || !otp) {
      setOtpStatus({ text: "Phone and OTP are required", success: false });
      return;
    }
    setOtpLoading(true);
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/officials/verify-otp`, {
        phone: formData.phone,
        otp,
      });
      setPhoneVerified(true);
      setOtpStatus({ text: res.data.message, success: true });
    } catch (err) {
      setOtpStatus({
        text: err.response?.data?.message || "OTP verification failed",
        success: false,
      });
      setPhoneVerified(false);
    } finally {
      setOtpLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword)
      return setMessage({ text: "Passwords do not match!", success: false });
    if (!profileImage)
      return setMessage({
        text: "Profile photo is required for verification.",
        success: false,
      });
    if (!documentProof)
      return setMessage({
        text: "Document proof is required for verification.",
        success: false,
      });
    if (!phoneVerified)
      return setMessage({
        text: "Please verify your phone number via OTP before registering.",
        success: false,
      });

    setLoading(true);
    setMessage({ text: "", success: false });
    try {
      const fd = new FormData();
      ["name", "email", "password", "village", "phone"].forEach((k) =>
        fd.append(k, formData[k])
      );
      fd.append("phoneVerified", "true");
      fd.append("profileImage", profileImage);
      fd.append("documentProof", documentProof);
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/officials/register`,
        fd,
        {
          withCredentials: true,
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      setMessage({ text: res.data.message, success: true });
      if (res.data.official) navigate("/officials/dashboard");
    } catch (err) {
      setMessage({
        text: err.response?.data?.message || "Something went wrong!",
        success: false,
      });
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full px-3.5 py-2.5 rounded-xl border " +
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
    "block text-xs font-semibold uppercase tracking-wider " +
    "text-text-secondary dark:text-dark-text-muted mb-1.5";

  return (
    <div className="h-screen w-screen overflow-hidden flex items-center justify-center font-sans transition-colors duration-300 relative bg-accent-mist dark:bg-dark-background">
      
      {/* Animated Gradient Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-100/40 via-transparent to-primary-200/30 dark:from-primary-900/20 dark:via-transparent dark:to-primary-800/20" />
        
        {/* Floating Orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-300/20 dark:bg-primary-500/10 rounded-full blur-3xl animate-float-slow" />
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-primary-400/20 dark:bg-primary-600/10 rounded-full blur-3xl animate-float-medium" />
        <div className="absolute top-2/3 left-1/2 w-72 h-72 bg-primary-200/30 dark:bg-primary-400/15 rounded-full blur-3xl animate-float-fast" />
        
        {/* Mesh Gradient Pattern */}
        <svg className="absolute inset-0 w-full h-full opacity-30 dark:opacity-20" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="mesh" patternUnits="userSpaceOnUse" width="40" height="40">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-primary-300 dark:text-primary-700" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#mesh)" />
        </svg>
        
        {/* Radial Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-radial from-transparent via-transparent to-accent-mist/50 dark:to-dark-background/50" />
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-10 left-10 w-24 h-24 border border-primary-200/50 dark:border-primary-700/30 rounded-full opacity-30 animate-pulse-slow" />
      <div className="absolute bottom-10 right-10 w-32 h-32 border border-primary-300/40 dark:border-primary-600/20 rounded-full opacity-30 animate-pulse-slow animation-delay-1000" />
      
      {/* Card */}
      <div className="relative z-10 w-full max-w-xl mx-4 bg-white/95 dark:bg-dark-surface/95 backdrop-blur-sm border border-border dark:border-dark-border rounded-3xl shadow-2xl dark:shadow-dark-2xl p-7 animate-fade-in-up">
        
        {/* Card Header with Glow Effect */}
        <div className="absolute -top-3 -right-3 w-20 h-20 bg-primary-400/30 dark:bg-primary-500/20 rounded-full blur-2xl" />
        
        {/* Header */}
        <div className="flex items-center justify-between mb-5 relative">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl overflow-hidden bg-primary-100 dark:bg-primary-900/60 border border-border dark:border-dark-border flex items-center justify-center flex-shrink-0 shadow-md">
              <img
                src="/gramvarthalogo.png"
                alt="GramVartha"
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <p className="text-xs font-semibold text-text-muted dark:text-dark-text-muted uppercase tracking-wider">
                GramVartha
              </p>
              <h1 className="text-base font-bold text-text-primary dark:text-dark-text-primary leading-tight">
                Official Registration
              </h1>
            </div>
          </div>
          <div className="inline-flex items-center gap-1.5 bg-primary-100/80 dark:bg-primary-900/60 backdrop-blur-sm border border-primary-200 dark:border-primary-700 text-primary-700 dark:text-primary-300 px-3 py-1.5 rounded-full text-xs font-medium shadow-sm">
            <span className="w-1.5 h-1.5 bg-primary-500 dark:bg-primary-400 rounded-full animate-pulse" />
            Officials Portal
          </div>
        </div>

        {/* Divider with Gradient */}
        <div className="h-px bg-gradient-to-r from-transparent via-border dark:via-dark-border to-transparent mb-5" />

        {/* Alert */}
        {message.text && (
          <div
            className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs border mb-4 animate-slide-down ${
              message.success
                ? "bg-primary-50 dark:bg-primary-900/30 border-primary-200 dark:border-primary-700 text-primary-700 dark:text-primary-300"
                : "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-600 dark:text-red-400"
            }`}
          >
            <svg
              className="w-3.5 h-3.5 flex-shrink-0"
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
            {message.text}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Row 1: Name + Village */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="name" className={labelClass}>
                Full Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                value={formData.name}
                onChange={handleChange}
                placeholder="Sarpanch / Gram Sevak"
                disabled={loading}
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="village" className={labelClass}>
                Village <span className="text-primary-500 normal-case tracking-normal">*</span>
              </label>
              <div className="relative">
                <select
                  id="village"
                  name="village"
                  required
                  value={formData.village}
                  onChange={handleChange}
                  disabled={loading}
                  className={inputClass + " appearance-none pr-8 cursor-pointer"}
                >
                  <option value="">Select village</option>
                  {villages.map((v) => (
                    <option key={v._id} value={v._id}>
                      {v.name}
                      {v.district ? ` · ${v.district}` : ""}
                    </option>
                  ))}
                </select>
                <svg
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 text-text-muted dark:text-dark-text-muted pointer-events-none"
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

          {/* Row 2: Email + Phone */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="email" className={labelClass}>
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="official@gramvartha.in"
                disabled={loading}
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="phone" className={labelClass}>
                Phone <span className="text-primary-500 normal-case tracking-normal">*</span>
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                required
                value={formData.phone}
                onChange={handleChange}
                placeholder="+91 98765 43210"
                disabled={loading}
                className={inputClass}
              />
            </div>
          </div>

          {/* Phone OTP Verification */}
          <div className="grid grid-cols-3 gap-3 items-end">
            <div className="col-span-2">
              <label className={labelClass}>OTP Code</label>
              <input
                name="otp"
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="Enter OTP"
                disabled={otpLoading || phoneVerified}
                className={inputClass}
              />
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={sendOtp}
                disabled={otpLoading || !formData.phone}
                className="inline-flex justify-center items-center rounded-xl px-3 py-2 text-xs font-semibold text-white bg-primary-600 hover:bg-primary-700 disabled:bg-primary-300"
              >
                {otpLoading ? 'Sending...' : otpSent ? 'Resend OTP' : 'Send OTP'}
              </button>
              <button
                type="button"
                onClick={verifyOtp}
                disabled={otpLoading || !otp}
                className="inline-flex justify-center items-center rounded-xl px-3 py-2 text-xs font-semibold text-white bg-secondary-600 hover:bg-secondary-700 disabled:bg-secondary-300"
              >
                {otpLoading ? 'Verifying...' : 'Verify'}
              </button>
            </div>
            {otpStatus.text && (
              <p className={`col-span-3 text-xs ${otpStatus.success ? 'text-green-600' : 'text-red-600'}`}>
                {otpStatus.text}
              </p>
            )}
            {phoneVerified && (
              <p className="col-span-3 text-xs text-green-700">Phone verified ✅</p>
            )}
          </div>

          {/* Profile Photo - Enhanced */}
          <div>
            <label className={labelClass}>
              Profile Photo <span className="text-primary-500 normal-case tracking-normal">*</span>
              <span className="normal-case tracking-normal font-normal text-text-light dark:text-dark-text-muted ml-1">
                (for verification)
              </span>
            </label>
            <div className="flex items-start gap-4">
              <label
                htmlFor="profileImage"
                className="flex-1 flex items-center gap-3 px-3.5 py-2.5 rounded-xl border cursor-pointer bg-white dark:bg-dark-surface2 border-border dark:border-dark-border hover:border-primary-300 dark:hover:border-primary-600 hover:shadow-md transition-all duration-200 group"
              >
                <div className="w-7 h-7 bg-primary-100 dark:bg-primary-900/60 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-primary-200 dark:group-hover:bg-primary-800/60 transition-colors">
                  <svg
                    className="w-3.5 h-3.5 text-primary-600 dark:text-primary-400"
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
                <span className="flex-1 text-sm text-text-muted dark:text-dark-text-muted truncate">
                  {profileImage ? (
                    <span className="text-primary-600 dark:text-primary-400 font-medium">
                      ✓ {profileImage.name}
                    </span>
                  ) : (
                    "Click to upload photo"
                  )}
                </span>
                <span className="text-xs font-semibold text-primary-600 dark:text-primary-400 border border-primary-200 dark:border-primary-700 bg-primary-50 dark:bg-primary-900/40 rounded-lg px-2.5 py-1 flex-shrink-0">
                  Browse
                </span>
              </label>
              {profilePreview && (
                <div className="flex-shrink-0 relative">
                  <img
                    src={profilePreview}
                    alt="Preview"
                    className="w-12 h-12 rounded-full object-cover border-2 border-primary-300 dark:border-primary-600 shadow-md"
                  />
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-primary-500 rounded-full border-2 border-white dark:border-dark-surface animate-pulse" />
                </div>
              )}
            </div>
            <input
              id="profileImage"
              type="file"
              accept="image/*"
              required
              onChange={handleImageChange}
              disabled={loading}
              className="hidden"
            />
          </div>

          {/* Document Proof Upload */}
          <div>
            <label className={labelClass}>
              ID Proof (Aadhar/Passport/BPL Card) <span className="text-primary-500 normal-case tracking-normal">*</span>
            </label>
            <div className="flex items-start gap-4">
              <label
                htmlFor="documentProof"
                className="flex-1 flex items-center gap-3 px-3.5 py-2.5 rounded-xl border cursor-pointer bg-white dark:bg-dark-surface2 border-border dark:border-dark-border hover:border-primary-300 dark:hover:border-primary-600 hover:shadow-md transition-all duration-200 group"
              >
                <div className="w-7 h-7 bg-primary-100 dark:bg-primary-900/60 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-primary-200 dark:group-hover:bg-primary-800/60 transition-colors">
                  <svg
                    className="w-3.5 h-3.5 text-primary-600 dark:text-primary-400"
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
                <span className="flex-1 text-sm text-text-muted dark:text-dark-text-muted truncate">
                  {documentProof ? (
                    <span className="text-primary-600 dark:text-primary-400 font-medium">
                      ✓ {documentProof.name}
                    </span>
                  ) : (
                    "Click to upload document proof"
                  )}
                </span>
                <span className="text-xs font-semibold text-primary-600 dark:text-primary-400 border border-primary-200 dark:border-primary-700 bg-primary-50 dark:bg-primary-900/40 rounded-lg px-2.5 py-1 flex-shrink-0">
                  Browse
                </span>
              </label>
              {documentPreview && (
                <div className="flex-shrink-0 relative">
                  <img
                    src={documentPreview}
                    alt="Document preview"
                    className="w-12 h-12 rounded-lg object-cover border-2 border-primary-300 dark:border-primary-600 shadow-md"
                  />
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-primary-500 rounded-full border-2 border-white dark:border-dark-surface animate-pulse" />
                </div>
              )}
            </div>
            <input
              id="documentProof"
              type="file"
              accept="image/*,.pdf"
              required
              onChange={handleDocumentChange}
              disabled={loading}
              className="hidden"
            />
          </div>

          {/* Row 3: Password + Confirm */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="password" className={labelClass}>
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPw ? "text" : "password"}
                  required
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Create password"
                  disabled={loading}
                  className={inputClass + " pr-10"}
                />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowPw((p) => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-light dark:text-dark-text-muted hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                >
                  <EyeIcon open={showPw} />
                </button>
              </div>
            </div>
            <div>
              <label htmlFor="confirmPassword" className={labelClass}>
                Confirm
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showCpw ? "text" : "password"}
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Re-enter"
                  disabled={loading}
                  className={inputClass + " pr-10"}
                />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowCpw((p) => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-light dark:text-dark-text-muted hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                >
                  <EyeIcon open={showCpw} />
                </button>
              </div>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-700 hover:to-primary-600 dark:from-primary-500 dark:to-primary-600 dark:hover:from-primary-600 dark:hover:to-primary-700 text-white font-semibold text-sm px-6 py-3 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:translate-y-0 mt-2 relative overflow-hidden group"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
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
                Creating account…
              </>
            ) : (
              <>
                Create Official Account
                <svg
                  className="w-4 h-4 group-hover:translate-x-0.5 transition-transform"
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

        {/* Footer */}
        <div className="flex items-center justify-between mt-5 pt-4 border-t border-border dark:border-dark-border">
          <Link
            to="/"
            className="flex items-center gap-1 text-xs text-text-muted dark:text-dark-text-muted hover:text-text-primary dark:hover:text-dark-text-primary transition-colors duration-200 group"
          >
            <svg
              className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform"
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
            Back to home
          </Link>
          <div className="flex items-center gap-2 text-xs text-text-light dark:text-dark-text-muted">
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
            Secure & encrypted
          </div>
          <Link
            to="/officials/login"
            className="text-xs font-semibold text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors duration-200"
          >
            Login instead →
          </Link>
        </div>
      </div>

      <style jsx>{`
        @keyframes float-slow {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(20px, -20px) scale(1.1); }
        }
        @keyframes float-medium {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(-15px, 15px) scale(1.05); }
        }
        @keyframes float-fast {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(10px, -10px) scale(1.08); }
        }
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.05); }
        }
        @keyframes slide-down {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-float-slow {
          animation: float-slow 12s ease-in-out infinite;
        }
        .animate-float-medium {
          animation: float-medium 10s ease-in-out infinite;
        }
        .animate-float-fast {
          animation: float-fast 8s ease-in-out infinite;
        }
        .animate-pulse-slow {
          animation: pulse-slow 4s ease-in-out infinite;
        }
        .animate-slide-down {
          animation: slide-down 0.3s ease-out;
        }
        .animation-delay-1000 {
          animation-delay: 1s;
        }
        .bg-gradient-radial {
          background-image: radial-gradient(circle at center, var(--tw-gradient-stops));
        }
      `}</style>
    </div>
  );
}

function EyeIcon({ open }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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