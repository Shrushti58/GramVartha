import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    profile: { phone: "", dob: "" },
    address: { city: "", state: "", country: "" },
  });
  const [avatar, setAvatar] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [currentStep, setCurrentStep] = useState(1);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith("profile.")) {
      const key = name.split(".")[1];
      setFormData((prev) => ({ ...prev, profile: { ...prev.profile, [key]: value } }));
    } else if (name.startsWith("address.")) {
      const key = name.split(".")[1];
      setFormData((prev) => ({ ...prev, address: { ...prev.address, [key]: value } }));
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
    // Step 2 fields are optional, so no validation needed
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
    setLoading(true);
    setError("");

    try {
      const data = new FormData();
      data.append("name", formData.name);
      data.append("email", formData.email);
      data.append("password", formData.password);
      data.append("profile", JSON.stringify(formData.profile));
      data.append("address", JSON.stringify(formData.address));
      if (avatar) data.append("avatar", avatar);

      const res = await axios.post("http://localhost:3000/citizen/register", data, {
        withCredentials: true,
        headers: { "Content-Type": "multipart/form-data" },
      });

      navigate("/citizen/login");
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Registration failed");
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
                    type="text"
                    name="profile.phone"
                    placeholder="Enter your phone number"
                    value={formData.profile.phone}
                    onChange={handleChange}
                    className="w-full p-3 border border-primary-200 rounded-lg bg-primary-50 text-primary-900 placeholder-primary-400 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-primary-800 mb-2">
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    name="profile.dob"
                    value={formData.profile.dob}
                    onChange={handleChange}
                    className="w-full p-3 border border-primary-200 rounded-lg bg-primary-50 text-primary-900 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-primary-800 mb-2">
                    Profile Photo (Optional)
                  </label>
                  <div className="border-2 border-dashed border-primary-300 rounded-lg p-4 text-center hover:border-accent-teal transition-colors duration-200 bg-primary-50">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setAvatar(e.target.files[0])}
                      className="w-full cursor-pointer"
                    />
                    <p className="text-xs text-primary-500 mt-2">PNG, JPG, JPEG up to 5MB</p>
                    {avatar && (
                      <p className="text-xs text-accent-teal mt-1 font-medium">
                        Selected: {avatar.name}
                      </p>
                    )}
                  </div>
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

                <div>
                  <label className="block text-sm font-medium text-primary-800 mb-2">
                    State/Province
                  </label>
                  <input
                    type="text"
                    name="address.state"
                    placeholder="Enter your state or province"
                    value={formData.address.state}
                    onChange={handleChange}
                    className="w-full p-3 border border-primary-200 rounded-lg bg-primary-50 text-primary-900 placeholder-primary-400 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-primary-800 mb-2">
                    Country
                  </label>
                  <input
                    type="text"
                    name="address.country"
                    placeholder="Enter your country"
                    value={formData.address.country}
                    onChange={handleChange}
                    className="w-full p-3 border border-primary-200 rounded-lg bg-primary-50 text-primary-900 placeholder-primary-400 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200"
                  />
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