import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import * as api from '../services/api';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await api.adminLogin(email, password);
      if (res.status === 200) {
        // Get user profile to determine role
        const profileRes = await api.getAdminProfile();
        const userRole = profileRes.data.role;
        
        toast.success('Login successful!');
        // Route based on role
        setTimeout(() => {
          if (userRole === 'superadmin') {
            navigate("/admin/superadmin");
          } else if (userRole === 'admin') {
            navigate("/admin/village");
          } else {
            toast.error('Unknown user role');
            navigate("/admin/login");
          }
        }, 500);
      }
    } catch (err) {
      console.error(err);
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
      console.error(err);
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-primary-100 to-primary-200 flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-md bg-surface rounded-2xl shadow-earth-lg border border-primary-200 animate-fade-in">
        <div className="p-8">
          <div className="text-center mb-8">
            <div className="mx-auto w-16 h-16 bg-button-primary rounded-full flex items-center justify-center mb-4 shadow-soft-earth">
              <svg className="w-8 h-8 text-cream" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h2 className="text-2xl font-semibold text-primary-900 font-serif">Admin Login</h2>
            <p className="text-primary-600 text-sm mt-1">Welcome back to your dashboard</p>
          </div>

          <form className="space-y-6" onSubmit={isRegisterMode ? handleRegister : handleLogin}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-primary-800 mb-2">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-primary-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors bg-primary-50 text-primary-900 placeholder-primary-400"
                placeholder="admin@example.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-primary-800 mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-primary-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors bg-primary-50 text-primary-900 placeholder-primary-400"
                placeholder="Enter your password"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 font-semibold text-primary-50 bg-button-primary rounded-lg shadow-soft-earth hover:shadow-earth-md hover:brightness-110 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed animate-slide-up"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-primary-50" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {isRegisterMode ? 'Creating Account...' : 'Signing in...'}
                </div>
              ) : (
                isRegisterMode ? 'Create Superadmin Account' : 'Sign in to Dashboard'
              )}
            </button>
          </form>

          <div className="mt-6 text-center space-y-3">
            <button
              type="button"
              onClick={() => setIsRegisterMode(!isRegisterMode)}
              className="text-sm text-primary-600 hover:text-primary-700 font-medium"
            >
              {isRegisterMode ? 'Already have an account? Login' : 'First time? Register as Superadmin'}
            </button>
            <p className="text-xs text-primary-600">Secure admin access only</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;