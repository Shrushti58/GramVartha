import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from 'react-toastify';
import * as api from '../services/api';

export default function OfficialRegister() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    village: "",
  });
  const [villages, setVillages] = useState([]);
  const [selectedVillage, setSelectedVillage] = useState(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadVillages();
  }, []);

  const loadVillages = async () => {
    try {
      const res = await api.getAllVillages();
      setVillages(res.data);
    } catch (err) {
      toast.error('Failed to load villages');
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleVillageChange = async (e) => {
    const villageId = e.target.value;
    setFormData({ ...formData, village: villageId });

    if (villageId) {
      const village = villages.find(v => v._id === villageId);
      setSelectedVillage(village);

      // Auto-detect location if village doesn't have coordinates
      if (village && (!village.latitude || !village.longitude)) {
        await detectLocation(village);
      }
    } else {
      setSelectedVillage(null);
    }
  };

  const detectLocation = async (village) => {
    setLocationLoading(true);
    try {
      if (!navigator.geolocation) {
        toast.error('Geolocation is not supported by this browser');
        return;
      }

      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000
        });
      });

      const { latitude, longitude } = position.coords;

      // Update village with detected coordinates
      await api.updateVillageCoordinates(village._id, {
        latitude,
        longitude
      });

      toast.success(`Location detected: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`);
      
      // Refresh villages list to show updated coordinates
      loadVillages();
    } catch (error) {
      console.error('Error getting location:', error);
      toast.error('Failed to detect location. Please ensure location permissions are enabled.');
    } finally {
      setLocationLoading(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please select a valid image file');
        return;
      }
      
      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size should be less than 5MB');
        return;
      }
      
      setProfileImage(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setProfileImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const res = await api.officialRegister(formData, profileImage);
      toast.success(res.data.message);
      
      // Redirect to login after successful registration
      setTimeout(() => {
        navigate("/officials/login");
      }, 2000);
    } catch (err) {
      toast.error(err.response?.data?.message || "Something went wrong!");
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
            <label htmlFor="village" className="block text-sm font-medium text-primary-800 mb-2">
              Village *
            </label>
            <select
              name="village"
              value={formData.village}
              onChange={handleVillageChange}
              className="w-full p-3 border border-primary-200 rounded-lg bg-primary-50 text-primary-900 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200"
              required
              disabled={loading}
            >
              <option value="">Select your village</option>
              {villages.map(village => (
                <option key={village._id} value={village._id}>
                  {village.name} - {village.district}, {village.state}
                </option>
              ))}
            </select>
            {selectedVillage && (
              <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-700">
                  <strong>Selected Village:</strong> {selectedVillage.name}
                </p>
                {selectedVillage.latitude && selectedVillage.longitude ? (
                  <p className="text-sm text-blue-600">
                    📍 Location: {selectedVillage.latitude.toFixed(6)}, {selectedVillage.longitude.toFixed(6)}
                  </p>
                ) : (
                  <div className="flex items-center mt-1">
                    {locationLoading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span className="text-sm text-blue-600">Detecting location...</span>
                      </>
                    ) : (
                      <span className="text-sm text-amber-600">⚠️ Location not set - will auto-detect when selected</span>
                    )}
                  </div>
                )}
              </div>
            )}
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

          <div>
            <label htmlFor="profileImage" className="block text-sm font-medium text-primary-800 mb-2">
              Profile Photo
            </label>
            <div className="space-y-3">
              {imagePreview ? (
                <div className="relative">
                  <img
                    src={imagePreview}
                    alt="Profile preview"
                    className="w-24 h-24 rounded-full object-cover border-2 border-primary-300 mx-auto"
                  />
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 transition-colors"
                    disabled={loading}
                  >
                    ×
                  </button>
                </div>
              ) : (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="w-24 h-24 rounded-full border-2 border-dashed border-primary-300 bg-primary-50 mx-auto flex items-center justify-center cursor-pointer hover:border-primary-500 hover:bg-primary-100 transition-colors"
                >
                  <svg className="w-8 h-8 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                id="profileImage"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
                disabled={loading}
              />
              <div className="text-center">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-sm text-primary-600 hover:text-primary-800 underline"
                  disabled={loading}
                >
                  {imagePreview ? 'Change photo' : 'Upload profile photo'}
                </button>
              </div>
              <p className="text-xs text-primary-500 text-center">Max size: 5MB. Supported formats: JPG, PNG, GIF</p>
            </div>
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