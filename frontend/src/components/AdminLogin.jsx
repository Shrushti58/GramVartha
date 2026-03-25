import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import * as api from '../services/api';
import { useTheme } from '../context/ThemeContext';

const LoginPage = () => {
  const { dark } = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await api.adminLogin(email, password);
      if (res.status === 200) {
        const profileRes = await api.getAdminProfile();
        const userRole = profileRes.data.role;
        toast.success('Login successful!');
        setTimeout(() => {
          if (userRole === 'superadmin') navigate("/admin/superadmin");
          else if (userRole === 'admin') navigate("/admin/village");
          else { toast.error('Unknown user role'); navigate("/admin/login"); }
        }, 500);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await api.adminRegister(email, password);
      if (res.status === 201) {
        toast.success('Registration successful! Please login.');
        setIsRegisterMode(false);
        setEmail('');
        setPassword('');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  const inputClass =
    "w-full px-4 py-3.5 rounded-xl border " +
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
            <pattern id="mesh-admin" patternUnits="userSpaceOnUse" width="40" height="40">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-primary-300 dark:text-primary-700" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#mesh-admin)" />
        </svg>
        
        {/* Radial Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-radial from-transparent via-transparent to-accent-mist/50 dark:to-dark-background/50" />
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-10 left-10 w-24 h-24 border border-primary-200/50 dark:border-primary-700/30 rounded-full opacity-30 animate-pulse-slow" />
      <div className="absolute bottom-10 right-10 w-32 h-32 border border-primary-300/40 dark:border-primary-600/20 rounded-full opacity-30 animate-pulse-slow animation-delay-1000" />
      
      {/* Card */}
      <div className="relative z-10 w-full max-w-md mx-4 bg-white/95 dark:bg-dark-surface/95 backdrop-blur-sm border border-border dark:border-dark-border rounded-3xl shadow-2xl dark:shadow-dark-2xl p-7 animate-fade-in-up">
        
        {/* Card Header Glow Effect */}
        <div className="absolute -top-3 -right-3 w-20 h-20 bg-primary-400/30 dark:bg-primary-500/20 rounded-full blur-2xl" />
        
        {/* Header */}
        <div className="flex items-center justify-between mb-6 relative">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl overflow-hidden bg-primary-100 dark:bg-primary-900/60 border border-border dark:border-dark-border flex items-center justify-center flex-shrink-0 shadow-md">
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
                {isRegisterMode ? 'Admin Registration' : 'Admin Login'}
              </h1>
            </div>
          </div>
          <div className="inline-flex items-center gap-1.5 bg-primary-100/80 dark:bg-primary-900/60 backdrop-blur-sm border border-primary-200 dark:border-primary-700 text-primary-700 dark:text-primary-300 px-3 py-1.5 rounded-full text-xs font-medium shadow-sm">
            <span className="w-1.5 h-1.5 bg-primary-500 dark:bg-primary-400 rounded-full animate-pulse" />
            Secure Admin Portal
          </div>
        </div>

        {/* Divider with Gradient */}
        <div className="h-px bg-gradient-to-r from-transparent via-border dark:via-dark-border to-transparent mb-6" />

        {/* Heading */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-text-primary dark:text-dark-text-primary">
            {isRegisterMode ? 'Create an account' : 'Welcome back'}
          </h2>
          <p className="text-xs text-text-muted dark:text-dark-text-muted mt-1">
            {isRegisterMode
              ? 'Register a new superadmin account'
              : 'Enter your credentials to access the dashboard'}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={isRegisterMode ? handleRegister : handleLogin} className="space-y-5">
          {/* Email field */}
          <div>
            <label htmlFor="email" className={labelClass}>
              Email address
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@gramvartha.in"
              disabled={isLoading}
              className={inputClass}
            />
          </div>

          {/* Password field */}
          <div>
            <label htmlFor="password" className={labelClass}>
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                disabled={isLoading}
                className={inputClass + " pr-10"}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-light dark:text-dark-text-muted hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                tabIndex={-1}
              >
                <EyeIcon open={showPassword} />
              </button>
            </div>
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-700 hover:to-primary-600 dark:from-primary-500 dark:to-primary-600 dark:hover:from-primary-600 dark:hover:to-primary-700 text-white font-semibold text-sm px-6 py-3.5 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:translate-y-0 mt-2 relative overflow-hidden group"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
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
                {isRegisterMode ? 'Creating Account...' : 'Signing in...'}
              </>
            ) : (
              <>
                {isRegisterMode ? 'Create Superadmin Account' : 'Sign in to Dashboard'}
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

        {/* Divider */}
        <div className="flex items-center gap-3 my-6">
          <div className="flex-1 h-px bg-border dark:bg-dark-border" />
          <span className="text-xs text-text-light dark:text-dark-text-muted font-medium">or</span>
          <div className="flex-1 h-px bg-border dark:bg-dark-border" />
        </div>

        {/* Toggle mode */}
        <div className="text-center space-y-4">
          <button
            type="button"
            onClick={() => setIsRegisterMode(!isRegisterMode)}
            className="inline-flex items-center gap-1.5 text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium transition-colors duration-200"
          >
            {isRegisterMode
              ? 'Already have an account? Sign in'
              : 'First time? Register as Superadmin'}
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          <div className="flex items-center justify-center gap-2 text-xs text-text-light dark:text-dark-text-muted">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            Secure, encrypted admin access
          </div>
        </div>

        {/* Back link */}
        <Link
          to="/"
          className="flex items-center justify-center gap-1.5 text-sm text-text-muted dark:text-dark-text-muted hover:text-text-primary dark:hover:text-dark-text-primary transition-colors duration-200 mt-6 pt-4 border-t border-border dark:border-dark-border"
        >
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
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Back to homepage
        </Link>
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
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(20px);
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
        .animate-fade-in-up {
          animation: fade-in-up 0.5s ease-out;
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
};

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

export default LoginPage;