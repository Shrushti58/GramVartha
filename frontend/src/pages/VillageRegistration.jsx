import React, { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import * as api from '../services/api';

const STEPS = [
  { id: 1, label: 'Village Info' },
  { id: 2, label: 'Admin Account' },
  { id: 3, label: 'Document Proof' },
];

export default function VillageRegistration() {
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

  const inp = "w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-sm text-gray-900 placeholder-gray-300 outline-none transition-all duration-200 focus:border-green-500 focus:ring-4 focus:ring-green-500/10 hover:border-gray-300 disabled:opacity-60";
  const lbl = "block text-sm font-medium text-gray-700 mb-1.5";

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
    <div className="h-screen flex overflow-hidden">

      {/* ── Left Panel ── */}
      <div className="hidden lg:flex lg:w-[52%] relative flex-col justify-between overflow-hidden">
        <img src="/illu1.png" alt="Village" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-br from-[#0d2218]/95 via-[#1a3a2a]/80 to-[#0d2218]/60" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0d2218]/90 via-transparent to-transparent" />
        <div className="absolute inset-0 opacity-[0.04]" style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)`,
          backgroundSize: "40px 40px",
        }} />
        <div className="absolute top-1/4 -left-20 w-72 h-72 bg-green-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Logo */}
        <div className="relative z-10 p-10">
          <Link to="/" className="inline-flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl overflow-hidden bg-white/10 border border-white/20 backdrop-blur-sm flex items-center justify-center">
              <img src="/gramvarthalogo.png" alt="GramVartha" className="w-full h-full object-contain" />
            </div>
            <span className="text-lg font-bold text-white tracking-tight">GramVartha</span>
          </Link>
        </div>

        {/* Copy */}
        <div className="relative z-10 px-10 pb-12 space-y-5">
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/15 backdrop-blur-sm rounded-full px-4 py-2">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <span className="text-xs text-white/70 font-medium tracking-wide">Village Portal</span>
          </div>
          <h2 className="text-4xl xl:text-5xl font-bold text-white leading-[1.1] tracking-tight">
            Register your<br />
            <span className="text-green-400">village today</span>
          </h2>
          <p className="text-white/50 leading-relaxed max-w-sm text-sm">
            Put your village on the map. Share notices, connect with citizens, and manage your gram panchayat digitally.
          </p>

          {/* Step indicators */}
          <div className="pt-2 space-y-3">
            {STEPS.map((s) => (
              <div key={s.id} className={`flex items-center gap-3 transition-all duration-300 ${step === s.id ? 'opacity-100' : step > s.id ? 'opacity-70' : 'opacity-30'}`}>
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all duration-300 flex-shrink-0 ${
                  step > s.id ? 'bg-green-400 border-green-400 text-white'
                  : step === s.id ? 'bg-transparent border-green-400 text-green-400'
                  : 'bg-transparent border-white/30 text-white/40'
                }`}>
                  {step > s.id ? (
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : s.id}
                </div>
                <span className={`text-sm font-medium ${step === s.id ? 'text-white' : 'text-white/50'}`}>{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Right Panel ── */}
      <div className="w-full lg:w-[48%] flex items-center justify-center bg-white px-10 py-8">
        <div className="w-full max-w-[400px]">

          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 mb-6">
            <div className="w-9 h-9 rounded-lg overflow-hidden bg-green-50 border border-green-100">
              <img src="/gramvarthalogo.png" alt="GramVartha" className="w-full h-full object-contain" />
            </div>
            <span className="text-lg font-bold text-gray-900">GramVartha</span>
          </div>

          {/* Step pill + heading */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              {STEPS.map((s, i) => (
                <React.Fragment key={s.id}>
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all flex-shrink-0 ${
                    step > s.id ? 'bg-green-500 text-white' : step === s.id ? 'bg-[#1a3a2a] text-white' : 'bg-gray-100 text-gray-400'
                  }`}>
                    {step > s.id ? '✓' : s.id}
                  </div>
                  {i < STEPS.length - 1 && <div className={`flex-1 h-px transition-all ${step > s.id ? 'bg-green-400' : 'bg-gray-200'}`} />}
                </React.Fragment>
              ))}
            </div>
            <p className="text-xs font-semibold text-green-600 uppercase tracking-widest mb-0.5">Step {step} of {STEPS.length}</p>
            <h1 className="text-xl font-bold text-gray-900">
              {step === 1 && 'Village Information'}
              {step === 2 && 'Admin Account'}
              {step === 3 && 'Document Proof'}
            </h1>
            <p className="text-xs text-gray-400 mt-1">
              {step === 1 && 'Tell us about your village and its location'}
              {step === 2 && 'Set up your admin credentials'}
              {step === 3 && 'Upload proof of your village affiliation'}
            </p>
          </div>

          {/* ── Step 1 ── */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label className={lbl}>Village Name <span className="text-red-400">*</span></label>
                <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="e.g. Shirpur" className={inp} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={lbl}>District</label>
                  <input type="text" name="district" value={formData.district} onChange={handleChange} placeholder="e.g. Nashik" className={inp} />
                </div>
                <div>
                  <label className={lbl}>State</label>
                  <input type="text" name="state" value={formData.state} onChange={handleChange} placeholder="e.g. Maharashtra" className={inp} />
                </div>
              </div>
              <div>
                <label className={lbl}>Pincode</label>
                <input type="text" name="pincode" value={formData.pincode} onChange={handleChange} placeholder="e.g. 422001" className={inp} />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-medium text-gray-600">Coordinates <span className="text-red-400">*</span></label>
                  <button type="button" onClick={handleDetectLocation} disabled={locating}
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-green-600 hover:text-green-700 bg-green-50 hover:bg-green-100 border border-green-200 px-2.5 py-1 rounded-lg transition-all disabled:opacity-60">
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
                  <input type="number" name="latitude" value={formData.latitude} onChange={handleChange} placeholder="Latitude (18.5204)" step="0.0001" className={inp} />
                  <input type="number" name="longitude" value={formData.longitude} onChange={handleChange} placeholder="Longitude (73.8567)" step="0.0001" className={inp} />
                </div>
              </div>
              <button onClick={handleNext}
                className="w-full py-3 px-4 bg-[#1a3a2a] hover:bg-green-800 text-white text-sm font-semibold rounded-xl transition-all duration-200 flex items-center justify-center gap-2 mt-1 shadow-sm hover:shadow-lg hover:shadow-green-900/20">
                Continue
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          )}

          {/* ── Step 2 ── */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <label className={lbl}>Email Address <span className="text-red-400">*</span></label>
                <input type="email" name="requesterEmail" value={formData.requesterEmail} onChange={handleChange} placeholder="admin@gramvartha.in" className={inp} />
              </div>
              <div>
                <label className={lbl}>Password <span className="text-red-400">*</span></label>
                <div className="relative">
                  <input type={showPassword ? "text" : "password"} name="requesterPassword" value={formData.requesterPassword} onChange={handleChange} placeholder="Create a strong password" className={`${inp} pr-10`} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors" tabIndex={-1}>
                    <EyeIcon open={showPassword} />
                  </button>
                </div>
              </div>
              <div>
                <label className={lbl}>Confirm Password <span className="text-red-400">*</span></label>
                <div className="relative">
                  <input type={showConfirmPassword ? "text" : "password"} name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} placeholder="Re-enter your password" className={`${inp} pr-10`} />
                  <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors" tabIndex={-1}>
                    <EyeIcon open={showConfirmPassword} />
                  </button>
                </div>
              </div>
              <div className="flex gap-3 mt-1">
                <button onClick={handleBack} className="flex-1 py-3 px-4 border border-gray-200 text-gray-600 hover:border-gray-300 text-sm font-semibold rounded-xl transition-all flex items-center justify-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Back
                </button>
                <button onClick={handleNext} className="flex-1 py-3 px-4 bg-[#1a3a2a] hover:bg-green-800 text-white text-sm font-semibold rounded-xl transition-all flex items-center justify-center gap-2 shadow-sm hover:shadow-lg hover:shadow-green-900/20">
                  Continue
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          )}

          {/* ── Step 3 ── */}
          {step === 3 && (
            <form onSubmit={handleSubmit} className="space-y-3">
              <p className="text-xs text-gray-400 leading-relaxed">
                Upload an image proving your village affiliation — e.g. Gram Panchayat ID, Aadhaar card, or residence proof.
              </p>

              {documentPreview ? (
                <div className="relative inline-block">
                  <img src={documentPreview} alt="Preview" className="max-w-full max-h-36 rounded-xl border border-gray-200 object-contain" />
                  <button type="button" onClick={removeDocument} disabled={loading}
                    className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs transition-colors">×</button>
                </div>
              ) : (
                <div onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-gray-200 hover:border-green-400 bg-gray-50 hover:bg-green-50/50 rounded-xl p-6 text-center cursor-pointer transition-all duration-200">
                  <div className="w-10 h-10 rounded-xl bg-green-50 border border-green-100 flex items-center justify-center mx-auto mb-2">
                    <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                  </div>
                  <p className="text-sm font-semibold text-gray-700">Click to upload</p>
                  <p className="text-xs text-gray-400 mt-0.5">JPG, PNG only · Max 5MB</p>
                </div>
              )}

              {documentFile && (
                <div className="flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-sm">
                  <span className="text-gray-700 font-medium truncate max-w-[200px] text-xs">{documentFile.name}</span>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span className="text-gray-400 text-xs">{(documentFile.size / 1024).toFixed(0)} KB</span>
                    <button type="button" onClick={() => fileInputRef.current?.click()} className="text-green-600 hover:text-green-700 text-xs font-medium" disabled={loading}>Change</button>
                  </div>
                </div>
              )}

              <input ref={fileInputRef} type="file" accept=".jpg,.jpeg,.png" onChange={handleDocumentChange} className="hidden" disabled={loading} />

              <div className="flex items-start gap-2.5 px-3.5 py-2.5 rounded-xl bg-green-50 border border-green-100 text-xs text-green-700">
                <svg className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Your registration will be reviewed by the superadmin. Once approved, you'll become the admin of your village.
              </div>

              <div className="flex gap-3">
                <button type="button" onClick={handleBack} disabled={loading}
                  className="flex-1 py-3 px-4 border border-gray-200 text-gray-600 hover:border-gray-300 text-sm font-semibold rounded-xl transition-all flex items-center justify-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Back
                </button>
                <button type="submit" disabled={loading}
                  className="flex-1 py-3 px-4 bg-[#1a3a2a] hover:bg-green-800 text-white text-sm font-semibold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-sm hover:shadow-lg hover:shadow-green-900/20">
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
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* Footer */}
          <div className="mt-5 pt-5 border-t border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs text-gray-300">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              Secure, encrypted access
            </div>
            <Link to="/" className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 transition-colors">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to homepage
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}