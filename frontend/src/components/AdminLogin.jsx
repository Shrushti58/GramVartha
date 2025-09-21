import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff, Loader2, Shield, Leaf, Trees } from "lucide-react";

export default function AdminLogin() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const navigate = useNavigate();

  // Check if user is already logged in
  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    if (token) {
      navigate("/admin/dashboard");
    }
  }, [navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");

    try {
      const res = await axios.post(
        `${process.env.REACT_APP_API_URL || "http://localhost:3000"}/admin/login`, 
        formData
      );

      setMessage(res.data.message);

      if (res.data.message === "Login Successful" && res.data.token) {
        // Store token in localStorage
        localStorage.setItem("adminToken", res.data.token);
        
        // Redirect after short delay
        setTimeout(() => {
          navigate("/admin/dashboard");
        }, 1000);
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Something went wrong, please try again!";
      setMessage(errorMsg);
      setAttempts(prev => prev + 1);
    } finally {
      setIsLoading(false);
    }
  };

  // Too many attempts warning
  const showAttemptWarning = attempts >= 3;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background-cream to-field-green-50 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute top-10 left-10 opacity-20 text-field-green-300">
        <Trees size={120} />
      </div>
      <div className="absolute bottom-10 right-10 opacity-20 text-field-green-300">
        <Leaf size={100} />
      </div>
      <div className="absolute top-1/4 -left-20 w-40 h-40 rounded-full bg-field-green-100 opacity-30"></div>
      <div className="absolute bottom-1/3 -right-20 w-48 h-48 rounded-full bg-field-green-200 opacity-20"></div>
      
      {/* Floating circles */}
      <div className="absolute top-1/3 right-1/4 w-12 h-12 rounded-full bg-field-green-200 opacity-40 animate-pulse"></div>
      <div className="absolute bottom-1/4 left-1/4 w-16 h-16 rounded-full bg-field-green-100 opacity-30 animate-bounce"></div>

      {/* Main Content */}
      <div className="relative z-10 w-full max-w-md px-4">
        <div className="bg-white shadow-2xl rounded-2xl p-8 w-full border border-field-green-200 relative overflow-hidden">
          {/* Decorative elements inside card */}
          <div className="absolute -top-10 -right-10 w-28 h-28 rounded-full bg-field-green-100 opacity-50"></div>
          <div className="absolute -bottom-8 -left-8 w-24 h-24 rounded-full bg-field-green-200 opacity-30"></div>
          
          <div className="relative z-10">
            <div className="flex justify-center mb-4">
              <div className="p-3 rounded-full bg-field-green-100">
                <Shield className="h-8 w-8 text-field-green-600" />
              </div>
            </div>
            <h2 className="text-2xl font-bold mb-2 text-center text-field-green-800">Admin Portal</h2>
            <p className="text-sm text-center text-field-green-600 mb-6">Sign in to access the dashboard</p>
            
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <input
                  type="email"
                  name="email"
                  placeholder="Email address"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full p-3 border border-field-green-300 rounded-lg focus:ring-2 focus:ring-field-green-500 focus:border-transparent transition"
                  required
                  disabled={isLoading}
                />
              </div>
              
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full p-3 border border-field-green-300 rounded-lg focus:ring-2 focus:ring-field-green-500 focus:border-transparent transition pr-10"
                  required
                  disabled={isLoading}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-field-green-500 hover:text-field-green-700"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>

              {showAttemptWarning && (
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-700">
                  Having trouble logging in? <Link to="/admin/forgot-password" className="font-semibold underline">Reset your password</Link>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-field-green-600 text-white p-3 rounded-lg hover:bg-field-green-700 transition font-semibold shadow-md flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    Logging in...
                  </>
                ) : (
                  "Login"
                )}
              </button>
            </form>

            {/* Message display */}
            {message && (
              <div className={`mt-4 p-3 rounded-lg text-center ${message === "Login Successful" ? "bg-green-100 text-green-800 border border-green-200" : "bg-red-100 text-red-700 border border-red-200"}`}>
                {message}
              </div>
            )}

            <p className="text-sm mt-6 text-center text-field-green-700">
              Don't have an account?{" "}
              <Link to="/admin/register" className="text-field-green-600 font-semibold hover:text-field-green-800 transition underline">
                Register here
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Wave Decoration */}
      <div className="absolute bottom-0 w-full">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" className="w-full">
          <path
            fill="#2E8B57"
            fillOpacity="0.3"
            d="M0,96L48,112C96,128,192,160,288,186.7C384,213,480,235,576,213.3C672,192,768,128,864,128C960,128,1056,192,1152,208C1248,224,1344,192,1392,176L1440,160L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
          ></path>
          <path
            fill="#2E8B57"
            fillOpacity="0.5"
            d="M0,192L48,197.3C96,203,192,213,288,197.3C384,181,480,139,576,138.7C672,139,768,181,864,192C960,203,1056,181,1152,165.3C1248,149,1344,139,1392,133.3L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
          ></path>
        </svg>
      </div>
    </div>
  );
}