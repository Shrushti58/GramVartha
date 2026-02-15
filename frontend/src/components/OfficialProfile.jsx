import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import * as api from '../services/api';

export default function OfficialProfile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const response = await api.getOfficialProfile();
      setProfile(response.data);
    } catch (error) {
      toast.error('Failed to load profile');
      if (error.response?.status === 401) {
        navigate('/officials/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

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

    setUploading(true);
    try {
      const response = await api.uploadOfficialProfileImage(file);
      setProfile(prev => ({
        ...prev,
        profileImage: response.data.profileImage
      }));
      toast.success('Profile photo updated successfully!');
    } catch (error) {
      toast.error('Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-md mx-auto">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-primary-500 to-primary-600 px-6 py-4">
            <h1 className="text-xl font-bold text-white text-center">Profile Photo</h1>
          </div>

          <div className="p-6">
            {/* Profile Image Section */}
            <div className="flex flex-col items-center space-y-4">
              <div className="relative">
                <img
                  src={profile?.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile?.name || 'Official')}&size=120&background=6366f1&color=fff`}
                  alt="Profile"
                  className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="absolute bottom-0 right-0 bg-primary-500 text-white p-3 rounded-full hover:bg-primary-600 transition-colors disabled:opacity-50 shadow-lg"
                >
                  {uploading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  )}
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </div>

              <div className="text-center">
                <h2 className="text-lg font-semibold text-gray-900">{profile?.name}</h2>
                <p className="text-gray-600">{profile?.email}</p>
                <p className="text-sm text-gray-500 mt-1">
                  Status: <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    profile?.status === 'approved' ? 'bg-green-100 text-green-800' :
                    profile?.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {profile?.status}
                  </span>
                </p>
              </div>

              <div className="text-center text-sm text-gray-600">
                <p>Click the + button to upload a new profile photo</p>
                <p className="mt-1">Supported formats: JPG, PNG, JPEG (Max 5MB)</p>
              </div>

              <button
                onClick={() => navigate('/officials/dashboard')}
                className="w-full px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}