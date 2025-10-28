import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    profile: { phone: "" },
    address: { 
      street: "", 
      wardNumber: "", 
      city: "", 
      state: "", 
      pincode: "" 
    },
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [currentStep, setCurrentStep] = useState(1);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith("profile.")) {
      const key = name.split(".")[1];
      setFormData((prev) => ({ 
        ...prev, 
        profile: { ...prev.profile, [key]: value } 
      }));
    } else if (name.startsWith("address.")) {
      const key = name.split(".")[1];
      setFormData((prev) => ({ 
        ...prev, 
        address: { ...prev.address, [key]: value } 
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const validateStep1 = () => {
    if (!formData.name.trim() || !formData.email.trim() || !formData.password.trim()) {
      setError("Please fill in all required fields");
      return false;
    }

    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      setError("Please enter a valid email address");
      return false;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long");
      return false;
    }

    setError("");
    return true;
  };

  const validateStep2 = () => {
    setError("");
    return true;
  };

  const validateStep3 = () => {
    if (!formData.address.wardNumber.trim()) {
      setError("Ward number is required");
      return false;
    }
    setError("");
    return true;
  };

  const handleNext = () => {
    if (currentStep === 1 && validateStep1()) {
      setCurrentStep(2);
    } else if (currentStep === 2 && validateStep2()) {
      setCurrentStep(3);
    }
  };

  const handleBack = () => {
    setCurrentStep(currentStep - 1);
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateStep3()) {
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Prepare the data exactly as backend expects
      const submitData = {
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        profile: {
          phone: formData.profile.phone.trim() || undefined
        },
        address: {
          street: formData.address.street.trim() || undefined,
          wardNumber: formData.address.wardNumber.trim(),
          city: formData.address.city.trim() || undefined,
          state: formData.address.state.trim() || undefined,
          pincode: formData.address.pincode.trim() || undefined
        }
      };

      console.log("Sending registration data:", submitData);

      const res = await axios.post(`${import.meta.env.VITE_API_URL}/citizen/register`, submitData, {
        headers: { 
          "Content-Type": "application/json",
        },
        withCredentials: true // Important for cookies
      });

      console.log("Registration successful:", res.data);

      // Store token in localStorage for future requests
      if (res.data.token) {
        localStorage.setItem('authToken', res.data.token);
      }

      // Redirect to dashboard or login page
      navigate("/citizen/dashboard");
      
    } catch (err) {
      console.error("Registration error:", err);
      const errorMessage = err.response?.data?.message || 
                          err.response?.data?.error || 
                          "Registration failed. Please try again.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Progress Steps
  const steps = [
    { number: 1, title: "Account", description: "Basic info" },
    { number: 2, title: "Personal", description: "About you" },
    { number: 3, title: "Location", description: "Where you live" }
  ];

  const wardOptions = Array.from({ length: 20 }, (_, i) => (i + 1).toString());

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-primary-100 to-primary-200 flex items-center justify-center py-8 px-4 font-sans">
      <div className="max-w-md w-full">
        <div className="bg-surface/90 backdrop-blur-sm rounded-2xl shadow-earth-lg border border-primary-200 p-6 animate-fade-in">
          
          {/* Progress Steps */}
          <div className="mb-8">
            <div className="flex items-center justify-between relative">
              <div className="absolute top-4 left-0 right-0 h-0.5 bg-primary-200 -z-10"></div>
              {steps.map((step, index) => (
                <div key={step.number} className="flex flex-col items-center flex-1">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300 mb-2 ${
                    currentStep >= step.number
                      ? 'bg-button-primary text-primary-50 shadow-soft-earth'
                      : 'bg-primary-200 text-primary-600'
                  }`}>
                    {step.number}
                  </div>
                  <div className="text-center">
                    <div className={`text-xs font-semibold ${
                      currentStep >= step.number ? 'text-primary-900' : 'text-primary-500'
                    }`}>
                      {step.title}
                    </div>
                    <div className="text-xs text-primary-400 hidden sm:block">
                      {step.description}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="text-center mb-6">
            <h2 className="text-2xl font-semibold text-primary-900 font-serif">Create Account</h2>
            <p className="text-primary-600 text-sm mt-1">
              {currentStep === 1 && "Create your account credentials"}
              {currentStep === 2 && "Tell us about yourself"}
              {currentStep === 3 && "Add your location details"}
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-4 animate-slide-up">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Step 1: Account Information */}
            {currentStep === 1 && (
              <div className="space-y-5 animate-slide-up">
                <div>
                  <label className="block text-sm font-medium text-primary-800 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    placeholder="Enter your full name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full p-3 border border-primary-200 rounded-lg bg-primary-50 text-primary-900 placeholder-primary-400 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-primary-800 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    name="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full p-3 border border-primary-200 rounded-lg bg-primary-50 text-primary-900 placeholder-primary-400 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-primary-800 mb-2">
                    Password *
                  </label>
                  <input
                    type="password"
                    name="password"
                    placeholder="Create a password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    className="w-full p-3 border border-primary-200 rounded-lg bg-primary-50 text-primary-900 placeholder-primary-400 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200"
                  />
                  <p className="text-xs text-primary-500 mt-2">Must be at least 6 characters long</p>
                </div>

                <button
                  type="button"
                  onClick={handleNext}
                  className="w-full p-3 bg-button-primary text-primary-50 rounded-lg font-semibold hover:shadow-earth-md hover:brightness-110 transition-all duration-200 shadow-soft-earth"
                >
                  Continue to Personal Info
                </button>
              </div>
            )}

            {/* Step 2: Personal Information */}
            {currentStep === 2 && (
              <div className="space-y-5 animate-slide-up">
                <div>
                  <label className="block text-sm font-medium text-primary-800 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="profile.phone"
                    placeholder="Enter your phone number"
                    value={formData.profile.phone}
                    onChange={handleChange}
                    className="w-full p-3 border border-primary-200 rounded-lg bg-primary-50 text-primary-900 placeholder-primary-400 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200"
                  />
                </div>

                <div className="flex space-x-3">
                  <button
                    type="button"
                    onClick={handleBack}
                    className="flex-1 p-3 border border-primary-300 text-primary-700 rounded-lg font-semibold hover:bg-primary-50 transition-all duration-200"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={handleNext}
                    className="flex-1 p-3 bg-button-primary text-primary-50 rounded-lg font-semibold hover:shadow-earth-md hover:brightness-110 transition-all duration-200 shadow-soft-earth"
                  >
                    Continue to Location
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Location Information */}
            {currentStep === 3 && (
              <div className="space-y-5 animate-slide-up">
                <div>
                  <label className="block text-sm font-medium text-primary-800 mb-2">
                    Ward Number *
                  </label>
                  <select
                    name="address.wardNumber"
                    value={formData.address.wardNumber}
                    onChange={handleChange}
                    required
                    className="w-full p-3 border border-primary-200 rounded-lg bg-primary-50 text-primary-900 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200"
                  >
                    <option value="">Select your ward</option>
                    {wardOptions.map(ward => (
                      <option key={ward} value={ward}>Ward {ward}</option>
                    ))}
                  </select>
                  <p className="text-xs text-primary-500 mt-2">
                    This helps us show you relevant notices for your area
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-primary-800 mb-2">
                    Street Address
                  </label>
                  <input
                    type="text"
                    name="address.street"
                    placeholder="Enter your street address"
                    value={formData.address.street}
                    onChange={handleChange}
                    className="w-full p-3 border border-primary-200 rounded-lg bg-primary-50 text-primary-900 placeholder-primary-400 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-primary-800 mb-2">
                    City
                  </label>
                  <input
                    type="text"
                    name="address.city"
                    placeholder="Enter your city"
                    value={formData.address.city}
                    onChange={handleChange}
                    className="w-full p-3 border border-primary-200 rounded-lg bg-primary-50 text-primary-900 placeholder-primary-400 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-primary-800 mb-2">
                      State
                    </label>
                    <input
                      type="text"
                      name="address.state"
                      placeholder="State"
                      value={formData.address.state}
                      onChange={handleChange}
                      className="w-full p-3 border border-primary-200 rounded-lg bg-primary-50 text-primary-900 placeholder-primary-400 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-primary-800 mb-2">
                      Pincode
                    </label>
                    <input
                      type="text"
                      name="address.pincode"
                      placeholder="Pincode"
                      value={formData.address.pincode}
                      onChange={handleChange}
                      className="w-full p-3 border border-primary-200 rounded-lg bg-primary-50 text-primary-900 placeholder-primary-400 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200"
                    />
                  </div>
                </div>

                <div className="flex space-x-3">
                  <button
                    type="button"
                    onClick={handleBack}
                    disabled={loading}
                    className="flex-1 p-3 border border-primary-300 text-primary-700 rounded-lg font-semibold hover:bg-primary-50 transition-all duration-200 disabled:opacity-50"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 p-3 bg-button-primary text-primary-50 rounded-lg font-semibold hover:shadow-earth-md hover:brightness-110 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-soft-earth"
                  >
                    {loading ? (
                      <div className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-primary-50" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Creating...
                      </div>
                    ) : (
                      "Create Account"
                    )}
                  </button>
                </div>
              </div>
            )}
          </form>

          <p className="text-center text-primary-600 mt-6 text-sm">
            Already have an account?{" "}
            <button 
              onClick={() => navigate("/citizen/login")}
              className="text-accent-teal font-semibold hover:text-accent-teal-dark transition-colors duration-200"
            >
              Sign In
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;