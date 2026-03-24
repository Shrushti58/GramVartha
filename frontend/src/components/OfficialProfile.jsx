import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import * as api from '../services/api';

// ─── Spinner ──────────────────────────────────────────────────────────────────

function IcoSpinner({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className="animate-spin text-primary-500">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeOpacity="0.2" strokeWidth="4" />
      <path d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" fill="currentColor" />
    </svg>
  );
}

// ─── Status config ────────────────────────────────────────────────────────────

const STATUS_CFG = {
  approved: {
    label: 'Approved',
    bg:    'bg-emerald-100 dark:bg-emerald-900/30',
    text:  'text-emerald-700 dark:text-emerald-400',
    dot:   'bg-emerald-500',
    ring:  'ring-emerald-200 dark:ring-emerald-800',
    bar:   'bg-emerald-500',
  },
  pending: {
    label: 'Pending',
    bg:    'bg-amber-100 dark:bg-amber-900/30',
    text:  'text-amber-700 dark:text-amber-400',
    dot:   'bg-amber-400',
    ring:  'ring-amber-200 dark:ring-amber-800',
    bar:   'bg-amber-400',
  },
  rejected: {
    label: 'Rejected',
    bg:    'bg-red-100 dark:bg-red-900/30',
    text:  'text-red-700 dark:text-red-400',
    dot:   'bg-red-400',
    ring:  'ring-red-200 dark:ring-red-800',
    bar:   'bg-red-400',
  },
};

function StatusBadge({ status, size = 'md' }) {
  const cfg = STATUS_CFG[status] || STATUS_CFG.pending;
  const pad = size === 'lg' ? 'px-3.5 py-1.5 text-xs' : 'px-2.5 py-1 text-[11px]';
  return (
    <span className={`inline-flex items-center gap-1.5 font-semibold rounded-lg ${pad} ${cfg.bg} ${cfg.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}

// ─── Field row with icon ──────────────────────────────────────────────────────

function FieldRow({ icon, label, children }) {
  return (
    <div className="group flex items-start gap-4 py-4 border-b border-border dark:border-dark-border last:border-0">
      <div className="mt-0.5 w-8 h-8 rounded-lg bg-accent-mist dark:bg-dark-surface2 flex items-center justify-center flex-shrink-0 text-primary-500 group-hover:bg-primary-50 dark:group-hover:bg-primary-900/20 transition-colors">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] font-bold uppercase tracking-widest text-text-muted dark:text-dark-text-muted mb-0.5">
          {label}
        </p>
        <div className="text-sm font-semibold text-text-primary dark:text-dark-text-primary">
          {children}
        </div>
      </div>
    </div>
  );
}

// ─── Icons ────────────────────────────────────────────────────────────────────

const Icons = {
  user: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  ),
  email: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  ),
  status: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  ),
  department: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
    </svg>
  ),
  role: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  ),
  phone: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
    </svg>
  ),
  calendar: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  ),
  camera: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  back: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
    </svg>
  ),
};

// ─── Upload button ────────────────────────────────────────────────────────────

function UploadZone({ uploading, onClick }) {
  return (
    <button
      onClick={onClick}
      disabled={uploading}
      className="flex items-center gap-3 w-full px-4 py-3 rounded-xl border border-dashed border-border dark:border-dark-border bg-accent-mist dark:bg-dark-surface2 hover:border-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/10 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed group"
    >
      <div className="w-8 h-8 rounded-lg bg-white dark:bg-dark-surface shadow-sm flex items-center justify-center flex-shrink-0 text-primary-500 group-hover:scale-110 transition-transform duration-200">
        {uploading ? <IcoSpinner size={16} /> : Icons.camera}
      </div>
      <div className="text-left">
        <p className="text-xs font-semibold text-text-primary dark:text-dark-text-primary leading-tight">
          {uploading ? 'Uploading…' : 'Change profile photo'}
        </p>
        <p className="text-[10px] text-text-muted dark:text-dark-text-muted mt-0.5">
          JPG, PNG · Max 5 MB
        </p>
      </div>
    </button>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function OfficialProfile() {
  const [profile, setProfile]     = useState(null);
  const [loading, setLoading]     = useState(true);
  const [uploading, setUploading] = useState(false);
  const fileInputRef              = useRef(null);
  const navigate                  = useNavigate();

  useEffect(() => { loadProfile(); }, []);

  const loadProfile = async () => {
    try {
      const response = await api.getOfficialProfile();
      setProfile(response.data);
    } catch (error) {
      toast.error('Failed to load profile');
      if (error.response?.status === 401) navigate('/officials/login');
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { toast.error('Please select a valid image file'); return; }
    if (file.size > 5 * 1024 * 1024) { toast.error('Image size should be less than 5MB'); return; }
    setUploading(true);
    try {
      const response = await api.uploadOfficialProfileImage(file);
      setProfile(prev => ({ ...prev, profileImage: response.data.profileImage }));
      toast.success('Profile photo updated!');
    } catch {
      toast.error('Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  // ── Loading ────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <main className="flex-1 max-w-7xl mx-auto w-full px-5 sm:px-8 py-8">
        <div className="bg-white dark:bg-dark-surface border border-border dark:border-dark-border rounded-2xl flex items-center justify-center py-24 gap-3">
          <IcoSpinner />
          <p className="text-sm text-text-muted dark:text-dark-text-muted">Loading profile…</p>
        </div>
      </main>
    );
  }

  // ── Helpers ────────────────────────────────────────────────────────────────

  const avatarSrc =
    profile?.profileImage ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(profile?.name || 'Official')}&size=160&background=6366f1&color=fff&bold=true`;

  const statusCfg = STATUS_CFG[profile?.status] || STATUS_CFG.pending;

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <main className="flex-1 max-w-7xl mx-auto w-full px-5 sm:px-8 py-8">

      {/* ── Page header ─────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-text-primary dark:text-dark-text-primary tracking-tight">
            My Profile
          </h1>
          <p className="text-sm text-text-muted dark:text-dark-text-muted mt-1">
            Manage your official account and profile photo
          </p>
        </div>
        <button
          onClick={() => navigate('/officials/dashboard')}
          className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-text-muted dark:text-dark-text-muted border border-border dark:border-dark-border hover:bg-accent-mist dark:hover:bg-dark-surface2 hover:text-text-primary dark:hover:text-dark-text-primary transition-all"
        >
          {Icons.back}
          Dashboard
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* ── Left column ──────────────────────────────────────────────────── */}
        <div className="lg:col-span-4 flex flex-col gap-6">

          {/* Identity card */}
          <div className="bg-white dark:bg-dark-surface border border-border dark:border-dark-border rounded-2xl shadow-soft overflow-hidden">
            {/* Gradient banner with decorative circles */}
            <div className="relative h-24 bg-gradient-to-br from-primary-500 via-primary-600 to-primary-700 dark:from-primary-600 dark:via-primary-700 dark:to-primary-800 overflow-hidden">
              {/* Decorative blobs */}
              <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full bg-white/10" />
              <div className="absolute -bottom-8 -left-4 w-20 h-20 rounded-full bg-white/10" />
              <div className="absolute top-4 left-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-white/5" />
            </div>

            <div className="px-6 pb-6">
              {/* Avatar — overlapping the banner */}
              <div className="relative -mt-12 mb-4 flex justify-center">
                <div className="relative">
                  <div className={`w-24 h-24 rounded-2xl ring-4 ring-white dark:ring-dark-surface overflow-hidden shadow-lg`}>
                    <img
                      src={avatarSrc}
                      alt={profile?.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  {/* Pulse status dot */}
                  <span className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-white dark:border-dark-surface ${statusCfg.dot} shadow-sm`} />
                </div>
              </div>

              {/* Name + email */}
              <div className="text-center mb-4">
                <h2 className="text-lg font-bold text-text-primary dark:text-dark-text-primary leading-tight">
                  {profile?.name}
                </h2>
                {profile?.role && (
                  <p className="text-xs font-medium text-text-muted dark:text-dark-text-muted mt-0.5 capitalize">
                    {profile.role}
                  </p>
                )}
                <p className="text-[11px] text-text-muted dark:text-dark-text-muted mt-1 break-all font-mono">
                  {profile?.email}
                </p>
              </div>

              {/* Status pill */}
              <div className="flex justify-center mb-5">
                <StatusBadge status={profile?.status} size="lg" />
              </div>

              {/* Upload zone */}
              <UploadZone uploading={uploading} onClick={() => fileInputRef.current?.click()} />
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </div>
          </div>

          {/* Quick-stats strip (if department or createdAt exists) */}
          {(profile?.department || profile?.createdAt) && (
            <div className="bg-white dark:bg-dark-surface border border-border dark:border-dark-border rounded-2xl shadow-soft p-5 flex gap-4 divide-x divide-border dark:divide-dark-border">
              {profile?.department && (
                <div className="flex-1 text-center">
                  <p className="text-[9px] font-bold uppercase tracking-widest text-text-muted dark:text-dark-text-muted mb-1">
                    Department
                  </p>
                  <p className="text-sm font-bold text-text-primary dark:text-dark-text-primary leading-tight">
                    {profile.department}
                  </p>
                </div>
              )}
              {profile?.createdAt && (
                <div className="flex-1 text-center pl-4">
                  <p className="text-[9px] font-bold uppercase tracking-widest text-text-muted dark:text-dark-text-muted mb-1">
                    Member Since
                  </p>
                  <p className="text-sm font-bold text-text-primary dark:text-dark-text-primary leading-tight">
                    {new Date(profile.createdAt).toLocaleDateString('en-IN', {
                      month: 'short', year: 'numeric',
                    })}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── Right column: Account details ────────────────────────────────── */}
        <div className="lg:col-span-8 bg-white dark:bg-dark-surface border border-border dark:border-dark-border rounded-2xl shadow-soft overflow-hidden">

          {/* Card header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-border dark:border-dark-border">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-text-muted dark:text-dark-text-muted">
                Account Details
              </p>
              <p className="text-base font-bold text-text-primary dark:text-dark-text-primary mt-0.5">
                Personal Information
              </p>
            </div>
            {/* Subtle status indicator strip */}
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${statusCfg.bg}`}>
              <span className={`w-2 h-2 rounded-full ${statusCfg.dot}`} />
              <span className={`text-xs font-semibold ${statusCfg.text}`}>{statusCfg.label}</span>
            </div>
          </div>

          {/* Field rows */}
          <div className="px-6 divide-y divide-border dark:divide-dark-border">
            <FieldRow icon={Icons.user} label="Full Name">
              {profile?.name}
            </FieldRow>

            <FieldRow icon={Icons.email} label="Email Address">
              <span className="font-mono text-xs tracking-tight">{profile?.email}</span>
            </FieldRow>

            <FieldRow icon={Icons.status} label="Account Status">
              <StatusBadge status={profile?.status} />
            </FieldRow>

            {profile?.department && (
              <FieldRow icon={Icons.department} label="Department">
                {profile.department}
              </FieldRow>
            )}

            {profile?.role && (
              <FieldRow icon={Icons.role} label="Role">
                <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 capitalize">
                  {profile.role}
                </span>
              </FieldRow>
            )}

            {profile?.phone && (
              <FieldRow icon={Icons.phone} label="Phone">
                <span className="font-mono text-xs">{profile.phone}</span>
              </FieldRow>
            )}

            {profile?.createdAt && (
              <FieldRow icon={Icons.calendar} label="Member Since">
                {new Date(profile.createdAt).toLocaleDateString('en-IN', {
                  day: 'numeric', month: 'long', year: 'numeric',
                })}
              </FieldRow>
            )}
          </div>

          {/* Card footer */}
          <div className="px-6 py-5 mt-2 border-t border-border dark:border-dark-border flex items-center justify-between">
            <p className="text-[11px] text-text-muted dark:text-dark-text-muted">
              Contact your administrator to update account details.
            </p>
            <button
              onClick={() => navigate('/officials/dashboard')}
              className="sm:hidden flex items-center gap-1.5 text-xs font-semibold text-text-muted dark:text-dark-text-muted hover:text-text-primary dark:hover:text-dark-text-primary transition-colors"
            >
              {Icons.back}
              Dashboard
            </button>
          </div>
        </div>

      </div>
    </main>
  );
}