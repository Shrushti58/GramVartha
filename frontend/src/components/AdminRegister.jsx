import React, { useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

export default function AdminRegister() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", success: false });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage({ text: "", success: false });
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/admin/register`, formData);
      setMessage({ text: res.data.message, success: true });
    } catch (err) {
      setMessage({
        text: err.response?.data?.message || "Something went wrong, try again.",
        success: false,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">

      {/* ── Left Panel ── */}
      <div className="hidden lg:flex lg:w-[52%] relative flex-col justify-between overflow-hidden">
        <img
          src="/illu1.png"
          alt="Village"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-[#0d2218]/95 via-[#1a3a2a]/80 to-[#0d2218]/60" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0d2218]/90 via-transparent to-transparent" />
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px),
                              linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)`,
            backgroundSize: "40px 40px",
          }}
        />
        <div className="absolute top-1/4 -left-20 w-72 h-72 bg-green-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Logo */}
        <div className="relative z-10 p-10">
          <Link to="/" className="inline-flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl overflow-hidden bg-white/10 border border-white/20 backdrop-blur-sm flex items-center justify-center">
              <img src="/gramvarthalogo.png" alt="GramVartha" className="w-full h-full object-contain" />
            </div>
            <span className="text-lg font-bold text-white tracking-tight">GramVartha</span>
          </Link>
        </div>

        {/* Copy */}
        <div className="relative z-10 px-10 pb-16 space-y-5">
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/15 backdrop-blur-sm rounded-full px-4 py-2">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <span className="text-xs text-white/70 font-medium tracking-wide">Admin Registration</span>
          </div>
          <h2 className="text-4xl xl:text-5xl font-bold text-white leading-[1.1] tracking-tight">
            Set up your<br />
            <span className="text-green-400">admin account</span>
          </h2>
          <p className="text-white/50 leading-relaxed max-w-sm text-sm">
            Create your superadmin account to start managing villages, publishing notices, and overseeing community governance.
          </p>
          <div className="flex flex-wrap gap-2 pt-2">
            {["Notice Management", "Village Dashboard", "QR Generator", "Analytics"].map((f) => (
              <span key={f} className="text-xs text-white/60 border border-white/10 rounded-full px-3 py-1.5">
                {f}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ── Right Panel ── */}
      <div className="w-full lg:w-[48%] flex items-center justify-center bg-white px-8 py-12">
        <div className="w-full max-w-[400px] space-y-8">

          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg overflow-hidden bg-green-50 border border-green-100">
              <img src="/gramvarthalogo.png" alt="GramVartha" className="w-full h-full object-contain" />
            </div>
            <span className="text-lg font-bold text-gray-900">GramVartha</span>
          </div>

          {/* Heading */}
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Create an account</h1>
            <p className="text-sm text-gray-400 mt-1.5">Register a new superadmin account to get started</p>
          </div>

          {/* Status message */}
          {message.text && (
            <div className={`flex items-start gap-3 px-4 py-3 rounded-xl text-sm border ${
              message.success
                ? "bg-green-50 border-green-100 text-green-700"
                : "bg-red-50 border-red-100 text-red-600"
            }`}>
              <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {message.success ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                )}
              </svg>
              {message.text}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <input
                id="email"
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="admin@gramvartha.in"
                className="w-full px-4 py-3.5 rounded-xl border border-gray-200 bg-white text-sm text-gray-900 placeholder-gray-300 outline-none transition-all duration-200 focus:border-green-500 focus:ring-4 focus:ring-green-500/10 hover:border-gray-300"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Create a strong password"
                  className="w-full px-4 py-3.5 pr-12 rounded-xl border border-gray-200 bg-white text-sm text-gray-900 placeholder-gray-300 outline-none transition-all duration-200 focus:border-green-500 focus:ring-4 focus:ring-green-500/10 hover:border-gray-300"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 px-4 bg-[#1a3a2a] hover:bg-green-800 text-white text-sm font-semibold rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2 shadow-sm hover:shadow-lg hover:shadow-green-900/20"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Creating Account...
                </>
              ) : (
                <>
                  Create Superadmin Account
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-gray-100" />
            <span className="text-xs text-gray-300 font-medium">or</span>
            <div className="flex-1 h-px bg-gray-100" />
          </div>

          <div className="text-center space-y-4">
            <Link
              to="/admin/login"
              className="text-sm text-green-600 hover:text-green-700 font-medium transition-colors duration-200"
            >
              Already have an account? Sign in
            </Link>
            <div className="flex items-center justify-center gap-2 text-xs text-gray-300">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              Secure, encrypted admin access
            </div>
          </div>

          <Link
            to="/"
            className="flex items-center justify-center gap-1.5 text-sm text-gray-400 hover:text-gray-600 transition-colors duration-200"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to homepage
          </Link>

        </div>
      </div>
    </div>
  );
}