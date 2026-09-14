import React, { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import * as api from '../services/api';
import { useTheme } from '../context/ThemeContext';
import { useTranslation } from 'react-i18next';

const STEPS = [
  { id: 1, labelKey: 'village.register.steps.village_info' },
  { id: 2, labelKey: 'village.register.steps.admin_account' },
  { id: 3, labelKey: 'village.register.steps.document_proof' },
];

export default function VillageRegistration() {
  const { dark } = useTheme();
  const { t } = useTranslation();
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
      toast.error(t('village.register.errors.geolocation_unsupported'));
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
        toast.success(t('village.register.location_detected'));
      },
      (err) => {
        setLocating(false);
        toast.error(t('village.register.errors.location_failed'));
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleDocumentChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!['image/jpeg', 'image/jpg', 'image/png'].includes(file.type)) {
      toast.error(t('village.register.errors.invalid_file_type'));
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error(t('village.register.errors.file_too_large'));
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
        toast.error(t('village.register.errors.coordinates_required'));
        return false;
      }
    }
    if (step === 2) {
      if (!formData.requesterEmail || !formData.requesterPassword || !formData.confirmPassword) {
        toast.error(t('village.register.errors.fields_required'));
        return false;
      }
      if (formData.requesterPassword !== formData.confirmPassword) {
        toast.error(t('village.register.errors.password_mismatch'));
        return false;
      }
      if (formData.requesterPassword.length < 6) {
        toast.error(t('village.register.errors.password_length'));
        return false;
      }
    }
    return true;
  };

  const handleNext = () => { if (validateStep()) setStep(s => s + 1); };
  const handleBack = () => setStep(s => s - 1);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!documentFile) { 
      toast.error(t('village.register.errors.document_required')); 
      return; 
    }
    setLoading(true);
    try {
      const { confirmPassword, ...submitData } = formData;
      await api.registerVillage(submitData, documentFile);
      toast.success(t('village.register.success_message'));
      setTimeout(() => navigate('/'), 2000);
    } catch (err) {
      toast.error(err.response?.data?.message || t('village.register.errors.registration_failed'));
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full px-3.5 py-2.5 rounded-xl border " +
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
    "block text-[11px] font-semibold uppercase tracking-wider " +
    "text-text-secondary dark:text-dark-text-muted mb-1";

  const EyeIcon = ({ open }) => open ? (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
    </svg>
  ) : (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  );

  return (
    <div className="min-h-screen w-full bg-accent-mist dark:bg-dark-background font-sans text-text-primary dark:text-dark-text-primary">
      <div className="min-h-screen max-w-[1450px] mx-auto grid grid-cols-1 lg:grid-cols-[0.75fr_1.25fr] items-center gap-8 lg:gap-14 px-5 sm:px-8 lg:px-12 py-8 lg:py-10">

        {/* Left — same editorial layout as OfficialRegister */}
        <section className="hidden lg:flex flex-col justify-center pr-4">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-text-muted dark:text-dark-text-muted mb-5">
            {t('village.register.title')}
          </p>

          <h1 className="text-5xl xl:text-6xl font-extrabold tracking-[-0.055em] leading-[0.95]">
            <span className="block">{t('village.register.heading_join', 'Bring your')}</span>
            <span className="relative inline-block font-extrabold italic text-primary-600 dark:text-primary-400 tracking-[-0.07em]">
              Panchayat
              <svg
                className="absolute left-0 -bottom-2 w-[220px] h-4 pointer-events-none"
                viewBox="0 0 220 18"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M4 13C45 19 112 5 216 11"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
              </svg>
            </span>
            <span className="block mt-3">{t('village.register.heading_to', 'to')}</span>
            <span className="block text-primary-600 dark:text-primary-400 tracking-[-0.07em]">
              GramVartha.
            </span>
          </h1>

          <p className="mt-8 max-w-md text-sm leading-7 text-text-secondary dark:text-dark-text-muted">
            {t('village.register.desktop_description', 'Register your village with GramVartha and bring essential digital communication to your Gram Panchayat.')}
          </p>

          <div className="mt-8 flex items-center gap-3 text-xs text-text-muted dark:text-dark-text-muted">
            <span className="w-8 h-px bg-border dark:bg-dark-border" />
            {t('village.register.review_note', 'Your registration will be reviewed before approval.')}
          </div>
        </section>

        {/* Mobile heading */}
        <section className="lg:hidden pt-2">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-text-muted dark:text-dark-text-muted mb-3">
            GramVartha
          </p>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-[-0.05em] leading-[0.95]">
            <span>{t('village.register.heading_join', 'Bring your')} </span>
            <span className="relative inline-block italic text-primary-600 dark:text-primary-400">
              Panchayat
              <svg className="absolute left-0 -bottom-1 w-[135px] h-3" viewBox="0 0 220 18" fill="none">
                <path d="M4 13C45 19 112 5 216 11" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
              </svg>
            </span>
            <span> {t('village.register.heading_to', 'to')} </span>
            <span className="text-primary-600 dark:text-primary-400">GramVartha.</span>
          </h1>
        </section>

        {/* Right — same card language as OfficialRegister */}
        <div className="w-full max-w-2xl lg:max-w-xl xl:max-w-2xl mx-auto bg-white dark:bg-dark-surface border border-border dark:border-dark-border rounded-2xl sm:rounded-3xl shadow-sm p-4 sm:p-5 md:p-6">

          <div className="flex items-center justify-between gap-3 mb-5">
            <div>
              <p className="text-[10px] sm:text-xs font-semibold text-text-muted dark:text-dark-text-muted uppercase tracking-wider">
                GramVartha
              </p>
              <h2 className="text-sm sm:text-base font-bold leading-tight">
                {t('village.register.title')}
              </h2>
            </div>
            <div className="inline-flex items-center gap-1.5 bg-primary-50 dark:bg-primary-900/40 border border-primary-200 dark:border-primary-700 text-primary-700 dark:text-primary-300 px-2.5 py-1 rounded-full text-[10px] sm:text-xs font-medium">
              <span className="w-1.5 h-1.5 bg-primary-500 dark:bg-primary-400 rounded-full animate-pulse" />
              {t('village.register.badge')}
            </div>
          </div>

          <div className="h-px bg-border dark:bg-dark-border mb-5" />

          {/* Compact progress — visually aligned with OfficialRegister */}
          <div className="mb-5">
            <div className="flex gap-1.5 mb-3">
              {STEPS.map((s) => (
                <div
                  key={s.id}
                  className={`h-1 flex-1 rounded-full transition-colors duration-200 ${
                    step >= s.id
                      ? 'bg-primary-500 dark:bg-primary-400'
                      : 'bg-border dark:bg-dark-border'
                  }`}
                />
              ))}
            </div>
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-primary-600 dark:text-primary-400">
                  {t('village.register.step')} {step} {t('village.register.of')} {STEPS.length}
                </p>
                <h3 className="text-base sm:text-lg font-semibold mt-0.5">
                  {step === 1 && t('village.register.steps.village_info')}
                  {step === 2 && t('village.register.steps.admin_account')}
                  {step === 3 && t('village.register.steps.document_proof')}
                </h3>
              </div>
            </div>
            <p className="text-[10px] sm:text-xs text-text-muted dark:text-dark-text-muted mt-1">
              {step === 1 && t('village.register.step_descriptions.village_info')}
              {step === 2 && t('village.register.step_descriptions.admin_account')}
              {step === 3 && t('village.register.step_descriptions.document_proof')}
            </p>
          </div>

          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label className={labelClass}>{t('village.register.village_name')} <span className="text-primary-500">*</span></label>
                <input type="text" name="name" value={formData.name} onChange={handleChange}
                  placeholder={t('village.register.village_name_placeholder')} className={inputClass} />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>{t('village.register.district')}</label>
                  <input type="text" name="district" value={formData.district} onChange={handleChange}
                    placeholder={t('village.register.district_placeholder')} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>{t('village.register.state')}</label>
                  <input type="text" name="state" value={formData.state} onChange={handleChange}
                    placeholder={t('village.register.state_placeholder')} className={inputClass} />
                </div>
              </div>

              <div>
                <label className={labelClass}>{t('village.register.pincode')}</label>
                <input type="text" name="pincode" value={formData.pincode} onChange={handleChange}
                  placeholder={t('village.register.pincode_placeholder')} className={inputClass} />
              </div>

              <div>
                <div className="flex items-center justify-between gap-3 mb-1.5">
                  <label className={labelClass + " mb-0"}>{t('village.register.coordinates')} <span className="text-primary-500">*</span></label>
                  <button type="button" onClick={handleDetectLocation} disabled={locating}
                    className="text-[10px] sm:text-xs font-medium text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors disabled:opacity-60">
                    {locating ? t('village.register.detecting') : t('village.register.auto_detect')}
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <input type="number" name="latitude" value={formData.latitude} onChange={handleChange}
                    placeholder={t('village.register.latitude_placeholder')} step="0.0001" className={inputClass} />
                  <input type="number" name="longitude" value={formData.longitude} onChange={handleChange}
                    placeholder={t('village.register.longitude_placeholder')} step="0.0001" className={inputClass} />
                </div>
              </div>

              <button type="button" onClick={handleNext}
                className="w-full flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600 text-white font-semibold text-sm px-6 py-3 rounded-xl transition-all duration-200 mt-2">
                {t('village.register.continue')}
                <span>→</span>
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div>
                <label className={labelClass}>{t('village.register.email')} <span className="text-primary-500">*</span></label>
                <input type="email" name="requesterEmail" value={formData.requesterEmail} onChange={handleChange}
                  placeholder={t('village.register.email_placeholder')} className={inputClass} />
              </div>

              <div>
                <label className={labelClass}>{t('village.register.password')} <span className="text-primary-500">*</span></label>
                <div className="relative">
                  <input type={showPassword ? "text" : "password"} name="requesterPassword"
                    value={formData.requesterPassword} onChange={handleChange}
                    placeholder={t('village.register.password_placeholder')} className={inputClass + " pr-9"} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} tabIndex={-1}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-text-light dark:text-dark-text-muted hover:text-primary-600 dark:hover:text-primary-400">
                    <EyeIcon open={showPassword} />
                  </button>
                </div>
              </div>

              <div>
                <label className={labelClass}>{t('village.register.confirm_password')} <span className="text-primary-500">*</span></label>
                <div className="relative">
                  <input type={showConfirmPassword ? "text" : "password"} name="confirmPassword"
                    value={formData.confirmPassword} onChange={handleChange}
                    placeholder={t('village.register.confirm_placeholder')} className={inputClass + " pr-9"} />
                  <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} tabIndex={-1}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-text-light dark:text-dark-text-muted hover:text-primary-600 dark:hover:text-primary-400">
                    <EyeIcon open={showConfirmPassword} />
                  </button>
                </div>
              </div>

              <div className="flex gap-3 mt-2">
                <button type="button" onClick={handleBack}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-3 border border-border dark:border-dark-border text-text-secondary dark:text-dark-text-muted hover:border-primary-300 dark:hover:border-primary-600 text-sm font-semibold rounded-xl transition-all">
                  ← {t('village.register.back')}
                </button>
                <button type="button" onClick={handleNext}
                  className="flex-1 flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600 text-white text-sm font-semibold rounded-xl transition-all">
                  {t('village.register.continue')} →
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <p className="text-[11px] sm:text-xs text-text-muted dark:text-dark-text-muted leading-relaxed">
                {t('village.register.document_description')}
              </p>

              {documentPreview ? (
                <div className="relative inline-block">
                  <img src={documentPreview} alt={t('village.register.preview')}
                    className="max-w-full max-h-32 rounded-xl border border-border dark:border-dark-border object-contain" />
                  <button type="button" onClick={removeDocument} disabled={loading}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                    ×
                  </button>
                </div>
              ) : (
                <div onClick={() => fileInputRef.current?.click()}
                  className="border border-dashed border-border dark:border-dark-border hover:border-primary-400 dark:hover:border-primary-500 rounded-xl p-5 text-center cursor-pointer transition-all bg-gray-50/60 dark:bg-dark-surface2/60">
                  <div className="w-9 h-9 rounded-xl bg-primary-50 dark:bg-primary-900/30 border border-primary-100 dark:border-primary-800 flex items-center justify-center mx-auto mb-2">
                    <span className="text-primary-600 dark:text-primary-400">↑</span>
                  </div>
                  <p className="text-sm font-semibold">{t('village.register.click_to_upload')}</p>
                  <p className="text-[10px] sm:text-xs text-text-muted dark:text-dark-text-muted mt-0.5">{t('village.register.file_requirements')}</p>
                </div>
              )}

              {documentFile && (
                <div className="flex items-center justify-between gap-3 px-3 py-2 rounded-xl bg-gray-50 dark:bg-dark-surface2 border border-border dark:border-dark-border">
                  <span className="text-xs font-medium truncate">{documentFile.name}</span>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span className="text-[10px] text-text-muted dark:text-dark-text-muted">{(documentFile.size / 1024).toFixed(0)} KB</span>
                    <button type="button" onClick={() => fileInputRef.current?.click()} disabled={loading}
                      className="text-xs font-semibold text-primary-600 dark:text-primary-400">
                      {t('village.register.change')}
                    </button>
                  </div>
                </div>
              )}

              <input ref={fileInputRef} type="file" accept=".jpg,.jpeg,.png" onChange={handleDocumentChange}
                className="hidden" disabled={loading} />

              <div className="flex items-start gap-2 px-3 py-2 rounded-xl bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-700 text-[10px] sm:text-xs text-primary-700 dark:text-primary-300">
                <span className="font-bold">i</span>
                {t('village.register.review_note')}
              </div>

              <div className="flex gap-3">
                <button type="button" onClick={handleBack} disabled={loading}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-3 border border-border dark:border-dark-border text-text-secondary dark:text-dark-text-muted hover:border-primary-300 dark:hover:border-primary-600 text-sm font-semibold rounded-xl transition-all">
                  ← {t('village.register.back')}
                </button>
                <button type="submit" disabled={loading}
                  className="flex-1 flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600 text-white text-sm font-semibold rounded-xl transition-all disabled:opacity-50">
                  {loading ? t('village.register.submitting') : <>{t('village.register.submit')} →</>}
                </button>
              </div>
            </form>
          )}

          <div className="flex items-center justify-between gap-3 mt-6 pt-4 border-t border-border dark:border-dark-border">
            <Link to="/" className="text-xs text-text-muted dark:text-dark-text-muted hover:text-text-primary dark:hover:text-dark-text-primary transition-colors">
              ← {t('village.register.back_home')}
            </Link>
            <span className="text-[10px] sm:text-xs text-text-light dark:text-dark-text-muted">
              {t('village.register.secure_access')}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

