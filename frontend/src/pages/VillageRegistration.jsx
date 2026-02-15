import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import * as api from '../services/api';

export default function VillageRegistration() {
  const [formData, setFormData] = useState({
    name: '',
    district: '',
    state: '',
    pincode: '',
    latitude: '',
    longitude: '',
    requesterEmail: '',
    requesterPassword: '',
    confirmPassword: ''
  });
  const [documentFile, setDocumentFile] = useState(null);
  const [documentPreview, setDocumentPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDocumentChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type - images only
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
      if (!allowedTypes.includes(file.type)) {
        toast.error('Please select a valid image file (JPG, PNG only)');
        return;
      }
      
      // Validate file size (5MB max for images)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size should be less than 5MB');
        return;
      }
      
      setDocumentFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setDocumentPreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeDocument = () => {
    setDocumentFile(null);
    setDocumentPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.requesterEmail || !formData.requesterPassword) {
      toast.error('Please fill all required fields');
      return;
    }

    if (!documentFile) {
      toast.error('Please upload a document as proof of village affiliation');
      return;
    }

    if (formData.requesterPassword !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (formData.requesterPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      const { confirmPassword, ...submitData } = formData;
      await api.registerVillage(submitData, documentFile);
      toast.success('Village registration submitted! Awaiting superadmin approval.');
      setTimeout(() => {
        navigate('/');
      }, 2000);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-green-100 to-green-200 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-lg p-8">
        <h1 className="text-3xl font-bold text-green-900 mb-2 text-center">Village Registration</h1>
        <p className="text-green-600 text-center mb-8">Register your village and become its admin</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Village Information Section */}
          <div className="border-b pb-6">
            <h2 className="text-xl font-semibold text-green-800 mb-4">Village Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-green-800 mb-1">
                  Village Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter village name"
                  className="w-full px-4 py-2 border border-green-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-green-800 mb-1">
                  District
                </label>
                <input
                  type="text"
                  name="district"
                  value={formData.district}
                  onChange={handleChange}
                  placeholder="Enter district"
                  className="w-full px-4 py-2 border border-green-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-green-800 mb-1">
                  State
                </label>
                <input
                  type="text"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  placeholder="Enter state"
                  className="w-full px-4 py-2 border border-green-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-green-800 mb-1">
                  Pincode
                </label>
                <input
                  type="text"
                  name="pincode"
                  value={formData.pincode}
                  onChange={handleChange}
                  placeholder="Enter pincode"
                  className="w-full px-4 py-2 border border-green-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-green-800 mb-1">
                  Latitude
                </label>
                <input
                  type="number"
                  name="latitude"
                  value={formData.latitude}
                  onChange={handleChange}
                  placeholder="e.g., 18.5204"
                  step="0.0001"
                  className="w-full px-4 py-2 border border-green-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-green-800 mb-1">
                  Longitude
                </label>
                <input
                  type="number"
                  name="longitude"
                  value={formData.longitude}
                  onChange={handleChange}
                  placeholder="e.g., 73.8567"
                  step="0.0001"
                  className="w-full px-4 py-2 border border-green-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>
          </div>

          {/* Admin Information Section */}
          <div>
            <h2 className="text-xl font-semibold text-green-800 mb-4">Your Admin Account</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-green-800 mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  name="requesterEmail"
                  value={formData.requesterEmail}
                  onChange={handleChange}
                  placeholder="Enter your email"
                  className="w-full px-4 py-2 border border-green-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-green-800 mb-1">
                  Password *
                </label>
                <input
                  type="password"
                  name="requesterPassword"
                  value={formData.requesterPassword}
                  onChange={handleChange}
                  placeholder="Enter password"
                  className="w-full px-4 py-2 border border-green-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-green-800 mb-1">
                  Confirm Password *
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm password"
                  className="w-full px-4 py-2 border border-green-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>
            </div>
          </div>

          {/* Document Upload Section */}
          <div>
            <h2 className="text-xl font-semibold text-green-800 mb-4">Document Proof</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-green-800 mb-2">
                  Upload Document as Proof *
                </label>
                <p className="text-sm text-green-600 mb-3">
                  Please upload an image that proves you are from this village gram panchayat (e.g., photo of Gram Panchayat ID, residence proof, Aadhaar card)
                </p>
                
                {documentPreview ? (
                  <div className="relative">
                    <img
                      src={documentPreview}
                      alt="Document preview"
                      className="max-w-xs max-h-48 border-2 border-green-300 rounded-lg object-contain"
                    />
                    <button
                      type="button"
                      onClick={removeDocument}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 transition-colors"
                      disabled={loading}
                    >
                      ×
                    </button>
                  </div>
                ) : documentFile ? (
                  <div className="flex items-center space-x-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <div>
                      <p className="text-sm font-medium text-green-800">{documentFile.name}</p>
                      <p className="text-xs text-green-600">{(documentFile.size / 1024).toFixed(0)} KB</p>
                    </div>
                    <button
                      type="button"
                      onClick={removeDocument}
                      className="text-red-500 hover:text-red-700"
                      disabled={loading}
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-green-300 bg-green-50 rounded-lg p-6 text-center cursor-pointer hover:border-green-500 hover:bg-green-100 transition-colors"
                  >
                    <svg className="w-12 h-12 text-green-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <p className="text-green-700 font-medium">Click to upload document</p>
                    <p className="text-sm text-green-600 mt-1">Supported formats: JPG, PNG only (Max: 5MB)</p>
                  </div>
                )}
                
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".jpg,.jpeg,.png"
                  onChange={handleDocumentChange}
                  className="hidden"
                  disabled={loading}
                />
                
                <div className="mt-3">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-sm text-green-600 hover:text-green-700 underline"
                    disabled={loading}
                  >
                    {documentFile ? 'Change document' : 'Select document'}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Help Text */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-sm text-green-700">
              <span className="font-semibold">Note:</span> Your registration will be reviewed by the superadmin. Once approved, you'll become the admin of your village.
            </p>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 disabled:bg-green-400 transition"
          >
            {loading ? 'Submitting...' : 'Submit Registration'}
          </button>

          {/* Back Link */}
          <div className="text-center">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="text-green-600 hover:text-green-700 font-medium"
            >
              Back to Home
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
