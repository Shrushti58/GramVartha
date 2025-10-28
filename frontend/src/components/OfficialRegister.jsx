import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function OfficialRegister() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
  });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    
    try {
      const res = await axios.post(`${process.env.REACT_APP_API_URL}/officials/register`, formData);
      setMessage(res.data.message);
      
      // Redirect to login after successful registration
      if (res.status === 201) {
        setTimeout(() => {
          navigate("/officials/login");
        }, 2000);
      }
    } catch (err) {
      setMessage(err.response?.data?.message || "Something went wrong!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-primary-100 to-primary-200 py-8 px-4 font-sans">
      <div className="bg-surface/90 backdrop-blur-sm rounded-2xl shadow-earth-lg border border-primary-200 p-8 w-full max-w-md animate-fade-in">
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-button-primary rounded-full flex items-center justify-center mb-4 shadow-soft-earth">
            <svg className="w-8 h-8 text-primary-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h2 className="text-2xl font-semibold text-primary-900 font-serif">Register as Official</h2>
          <p className="text-primary-600 text-sm mt-1">Create your official account</p>
        </div>

        {message && (
          <div className={`px-4 py-3 rounded-lg text-sm mb-6 text-center animate-slide-up ${
            message.includes("wrong") || message.includes("error") || message.includes("invalid") || message.includes("failed")
              ? "bg-red-50 border border-red-200 text-red-700"
              : "bg-green-50 border border-green-200 text-green-700"
          }`}>
            {message}
            {!message.includes("wrong") && !message.includes("error") && !message.includes("invalid") && !message.includes("failed") && (
              <p className="text-xs mt-1 text-primary-600">Redirecting to login...</p>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-primary-800 mb-2">
              Full Name *
            </label>
            <input
              type="text"
              name="name"
              placeholder="Enter your full name"
              value={formData.name}
              onChange={handleChange}
              className="w-full p-3 border border-primary-200 rounded-lg bg-primary-50 text-primary-900 placeholder-primary-400 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200"
              required
              disabled={loading}
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-primary-800 mb-2">
              Email Address *
            </label>
            <input
              type="email"
              name="email"
              placeholder="Enter your official email"
              value={formData.email}
              onChange={handleChange}
              className="w-full p-3 border border-primary-200 rounded-lg bg-primary-50 text-primary-900 placeholder-primary-400 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200"
              required
              disabled={loading}
            />
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-primary-800 mb-2">
              Phone Number
            </label>
            <input
              type="text"
              name="phone"
              placeholder="Enter your phone number"
              value={formData.phone}
              onChange={handleChange}
              className="w-full p-3 border border-primary-200 rounded-lg bg-primary-50 text-primary-900 placeholder-primary-400 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200"
              disabled={loading}
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-primary-800 mb-2">
              Password *
            </label>
            <input
              type="password"
              name="password"
              placeholder="Create a secure password"
              value={formData.password}
              onChange={handleChange}
              className="w-full p-3 border border-primary-200 rounded-lg bg-primary-50 text-primary-900 placeholder-primary-400 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200"
              required
              disabled={loading}
            />
            <p className="text-xs text-primary-500 mt-2">Must be at least 6 characters long</p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full p-3 bg-button-primary text-primary-50 rounded-lg font-semibold hover:shadow-earth-md hover:brightness-110 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-soft-earth"
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-primary-50" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Creating Account...
              </div>
            ) : (
              'Register as Official'
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-primary-600">
            Already have an official account?{" "}
            <a 
              href="/officials/login" 
              className="font-semibold text-accent-teal hover:text-accent-teal-dark transition-colors duration-200"
            >
              Login here
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}