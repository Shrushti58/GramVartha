import React, { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import * as api from '../services/api';
import { useTheme } from '../context/ThemeContext';

const STEPS = [
  { id: 1, label: 'Village Info' },
  { id: 2, label: 'Admin Account' },
  { id: 3, label: 'Document Proof' },
];

export default function VillageRegistration() {
  const { dark } = useTheme();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '', district: '', state: '', pincode: '',
    latitude: '', longitude: '',
    requesterEmail: '', requesterPassword: '', confirmPassword: ''
  });
  const [documentFile, setDocumentFile] = useState(null);
  const [documentPreview, setDocumentPreview] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [locating, setLocating] = useState(false);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser');
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setFormData(prev => ({
          ...prev,
          latitude: pos.coords.latitude.toFixed(4),
          longitude: pos.coords.longitude.toFixed(4),
        }));
        setLocating(false);
        toast.success('Location detected successfully!');
      },
      (err) => {
        setLocating(false);
        toast.error('Unable to detect location. Please enter manually.');
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleDocumentChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!['image/jpeg', 'image/jpg', 'image/png'].includes(file.type)) {
      toast.error('Please select a valid image file (JPG, PNG only)');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB');
      return;
    }
    setDocumentFile(file);
    const reader = new FileReader();
    reader.onload = (e) => setDocumentPreview(e.target.result);
    reader.readAsDataURL(file);
  };

  const removeDocument = () => {
    setDocumentFile(null);
    setDocumentPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const validateStep = () => {
    if (step === 1) {
      if (!formData.name || !formData.latitude || !formData.longitude) {
        toast.error('Please fill all required fields including coordinates');
        return false;
      }
    }
    if (step === 2) {
      if (!formData.requesterEmail || !formData.requesterPassword || !formData.confirmPassword) {
        toast.error('Please fill all required fields');
        return false;
      }
      if (formData.requesterPassword !== formData.confirmPassword) {
        toast.error('Passwords do not match');
        return false;
      }
      if (formData.requesterPassword.length < 6) {
        toast.error('Password must be at least 6 characters');
        return false;
      }
    }
    return true;
  };

  const handleNext = () => { if (validateStep()) setStep(s => s + 1); };
  const handleBack = () => setStep(s => s - 1);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!documentFile) { toast.error('Please upload a document'); return; }
    setLoading(true);
    try {
      const { confirmPassword, ...submitData } = formData;
      await api.registerVillage(submitData, documentFile);
      toast.success('Village registration submitted! Awaiting superadmin approval.');
      setTimeout(() => navigate('/'), 2000);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full px-4 py-3 rounded-xl border " +
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

  const EyeIcon = ({ open }) => open ? (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
    </svg>
  ) : (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  );

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
            <pattern id="mesh-village" patternUnits="userSpaceOnUse" width="40" height="40">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-primary-300 dark:text-primary-700" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#mesh-village)" />
        </svg>
        
        {/* Radial Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-radial from-transparent via-transparent to-accent-mist/50 dark:to-dark-background/50" />
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-10 left-10 w-24 h-24 border border-primary-200/50 dark:border-primary-700/30 rounded-full opacity-30 animate-pulse-slow" />
      <div className="absolute bottom-10 right-10 w-32 h-32 border border-primary-300/40 dark:border-primary-600/20 rounded-full opacity-30 animate-pulse-slow animation-delay-1000" />
      
      {/* Card */}
      <div className="relative z-10 w-full max-w-2xl mx-4 bg-white/95 dark:bg-dark-surface/95 backdrop-blur-sm border border-border dark:border-dark-border rounded-3xl shadow-2xl dark:shadow-dark-2xl p-7 animate-fade-in-up">
        
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
                Village Registration
              </h1>
            </div>
          </div>
          <div className="inline-flex items-center gap-1.5 bg-primary-100/80 dark:bg-primary-900/60 backdrop-blur-sm border border-primary-200 dark:border-primary-700 text-primary-700 dark:text-primary-300 px-3 py-1.5 rounded-full text-xs font-medium shadow-sm">
            <span className="w-1.5 h-1.5 bg-primary-500 dark:bg-primary-400 rounded-full animate-pulse" />
            Village Portal
          </div>
        </div>

        {/* Divider with Gradient */}
        <div className="h-px bg-gradient-to-r from-transparent via-border dark:via-dark-border to-transparent mb-6" />

        {/* Step Indicators */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            {STEPS.map((s, i) => (
              <React.Fragment key={s.id}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all flex-shrink-0 ${
                  step > s.id 
                    ? 'bg-primary-500 text-white' 
                    : step === s.id 
                    ? 'bg-primary-600 dark:bg-primary-500 text-white' 
                    : 'bg-border dark:bg-dark-border text-text-muted dark:text-dark-text-muted'
                }`}>
                  {step > s.id ? '✓' : s.id}
                </div>
                {i < STEPS.length - 1 && (
                  <div className={`flex-1 h-px transition-all ${step > s.id ? 'bg-primary-400' : 'bg-border dark:bg-dark-border'}`} />
                )}
              </React.Fragment>
            ))}
          </div>
          <p className="text-xs font-semibold text-primary-600 dark:text-primary-400 uppercase tracking-wider mb-0.5">
            Step {step} of {STEPS.length}
          </p>
          <h2 className="text-lg font-semibold text-text-primary dark:text-dark-text-primary">
            {step === 1 && 'Village Information'}
            {step === 2 && 'Admin Account'}
            {step === 3 && 'Document Proof'}
          </h2>
          <p className="text-xs text-text-muted dark:text-dark-text-muted mt-1">
            {step === 1 && 'Tell us about your village and its location'}
            {step === 2 && 'Set up your admin credentials'}
            {step === 3 && 'Upload proof of your village affiliation'}
          </p>
        </div>

        {/* Step Content */}
        {step === 1 && (
          <div className="space-y-4">
            <div>
              <label className={labelClass}>
                Village Name <span className="text-primary-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. Shirpur"
                className={inputClass}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>District</label>
                <input
                  type="text"
                  name="district"
                  value={formData.district}
                  onChange={handleChange}
                  placeholder="e.g. Nashik"
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>State</label>
                <input
                  type="text"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  placeholder="e.g. Maharashtra"
                  className={inputClass}
                />
              </div>
            </div>
            
            <div>
              <label className={labelClass}>Pincode</label>
              <input
                type="text"
                name="pincode"
                value={formData.pincode}
                onChange={handleChange}
                placeholder="e.g. 422001"
                className={inputClass}
              />
            </div>
            
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary dark:text-dark-text-muted">
                  Coordinates <span className="text-primary-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={handleDetectLocation}
                  disabled={locating}
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 bg-primary-50 dark:bg-primary-900/30 hover:bg-primary-100 dark:hover:bg-primary-900/50 border border-primary-200 dark:border-primary-700 px-2.5 py-1 rounded-lg transition-all disabled:opacity-60"
                >
                  {locating ? (
                    <>
                      <svg className="animate-spin w-3 h-3" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Detecting...
                    </>
                  ) : (
                    <>
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      Auto-detect
                    </>
                  )}
                </button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="number"
                  name="latitude"
                  value={formData.latitude}
                  onChange={handleChange}
                  placeholder="Latitude (18.5204)"
                  step="0.0001"
                  className={inputClass}
                />
                <input
                  type="number"
                  name="longitude"
                  value={formData.longitude}
                  onChange={handleChange}
                  placeholder="Longitude (73.8567)"
                  step="0.0001"
                  className={inputClass}
                />
              </div>
            </div>
            
            <button
              onClick={handleNext}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-700 hover:to-primary-600 dark:from-primary-500 dark:to-primary-600 dark:hover:from-primary-600 dark:hover:to-primary-700 text-white font-semibold text-sm px-6 py-3 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl hover:-translate-y-0.5 mt-2 relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              Continue
              <svg className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <div>
              <label className={labelClass}>
                Email Address <span className="text-primary-500">*</span>
              </label>
              <input
                type="email"
                name="requesterEmail"
                value={formData.requesterEmail}
                onChange={handleChange}
                placeholder="admin@gramvartha.in"
                className={inputClass}
              />
            </div>
            
            <div>
              <label className={labelClass}>
                Password <span className="text-primary-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="requesterPassword"
                  value={formData.requesterPassword}
                  onChange={handleChange}
                  placeholder="Create a strong password"
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
            
            <div>
              <label className={labelClass}>
                Confirm Password <span className="text-primary-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Re-enter your password"
                  className={inputClass + " pr-10"}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-light dark:text-dark-text-muted hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                  tabIndex={-1}
                >
                  <EyeIcon open={showConfirmPassword} />
                </button>
              </div>
            </div>
            
            <div className="flex gap-3 mt-2">
              <button
                onClick={handleBack}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 border border-border dark:border-dark-border text-text-secondary dark:text-dark-text-muted hover:border-primary-300 dark:hover:border-primary-600 hover:text-text-primary dark:hover:text-dark-text-primary text-sm font-semibold rounded-xl transition-all duration-200"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back
              </button>
              <button
                onClick={handleNext}
                className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-700 hover:to-primary-600 dark:from-primary-500 dark:to-primary-600 dark:hover:from-primary-600 dark:hover:to-primary-700 text-white font-semibold text-sm px-6 py-3 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl hover:-translate-y-0.5 relative overflow-hidden group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                Continue
                <svg className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <p className="text-xs text-text-muted dark:text-dark-text-muted leading-relaxed">
              Upload an image proving your village affiliation — e.g. Gram Panchayat ID, Aadhaar card, or residence proof.
            </p>

            {documentPreview ? (
              <div className="relative inline-block">
                <img
                  src={documentPreview}
                  alt="Preview"
                  className="max-w-full max-h-36 rounded-xl border border-border dark:border-dark-border object-contain"
                />
                <button
                  type="button"
                  onClick={removeDocument}
                  disabled={loading}
                  className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs transition-colors"
                >
                  ×
                </button>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-border dark:border-dark-border hover:border-primary-400 dark:hover:border-primary-500 bg-gray-50 dark:bg-dark-surface2 hover:bg-primary-50/50 dark:hover:bg-primary-900/20 rounded-xl p-6 text-center cursor-pointer transition-all duration-200"
              >
                <div className="w-10 h-10 rounded-xl bg-primary-50 dark:bg-primary-900/30 border border-primary-100 dark:border-primary-800 flex items-center justify-center mx-auto mb-2">
                  <svg className="w-5 h-5 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                </div>
                <p className="text-sm font-semibold text-text-primary dark:text-dark-text-primary">Click to upload</p>
                <p className="text-xs text-text-muted dark:text-dark-text-muted mt-0.5">JPG, PNG only · Max 5MB</p>
              </div>
            )}

            {documentFile && (
              <div className="flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-gray-50 dark:bg-dark-surface2 border border-border dark:border-dark-border text-sm">
                <span className="text-text-primary dark:text-dark-text-primary font-medium truncate max-w-[200px] text-xs">
                  {documentFile.name}
                </span>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <span className="text-text-muted dark:text-dark-text-muted text-xs">
                    {(documentFile.size / 1024).toFixed(0)} KB
                  </span>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 text-xs font-medium"
                    disabled={loading}
                  >
                    Change
                  </button>
                </div>
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

            <div className="flex items-start gap-2.5 px-3.5 py-2.5 rounded-xl bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-700 text-xs text-primary-700 dark:text-primary-300">
              <svg className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Your registration will be reviewed by the superadmin. Once approved, you'll become the admin of your village.
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleBack}
                disabled={loading}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 border border-border dark:border-dark-border text-text-secondary dark:text-dark-text-muted hover:border-primary-300 dark:hover:border-primary-600 hover:text-text-primary dark:hover:text-dark-text-primary text-sm font-semibold rounded-xl transition-all duration-200"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-700 hover:to-primary-600 dark:from-primary-500 dark:to-primary-600 dark:hover:from-primary-600 dark:hover:to-primary-700 text-white font-semibold text-sm px-6 py-3 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:translate-y-0 relative overflow-hidden group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                {loading ? (
                  <>
                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Submitting...
                  </>
                ) : (
                  <>
                    Submit
                    <svg className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between mt-6 pt-4 border-t border-border dark:border-dark-border">
          <div className="flex items-center gap-2 text-xs text-text-light dark:text-dark-text-muted">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            Secure, encrypted access
          </div>
          <Link
            to="/"
            className="flex items-center gap-1 text-xs text-text-muted dark:text-dark-text-muted hover:text-text-primary dark:hover:text-dark-text-primary transition-colors duration-200"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to homepage
          </Link>
        </div>
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
}