import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";

// Get API URL from environment variables
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// ─── Constants with translation keys ────────────────────────────────────────────────

const FILTER_TABS = [
  { key: "all", labelKey: "complaints.filters.all" },
  { key: "pending", labelKey: "complaints.filters.pending" },
  { key: "in-progress", labelKey: "complaints.filters.in_progress" },
  { key: "resolved", labelKey: "complaints.filters.resolved" },
  { key: "rejected", labelKey: "complaints.filters.rejected" },
];

const STATUS_CFG = {
  pending: {
    labelKey: "complaints.status.pending",
    bg: "bg-amber-100 dark:bg-amber-900/30",
    text: "text-amber-700 dark:text-amber-400",
    border: "border-l-amber-500",
    dot: "bg-amber-500",
    accent: "from-amber-50/20 dark:from-amber-950/10",
  },
  "in-progress": {
    labelKey: "complaints.status.in_progress",
    bg: "bg-blue-100 dark:bg-blue-900/30",
    text: "text-blue-700 dark:text-blue-400",
    border: "border-l-blue-500",
    dot: "bg-blue-500",
    accent: "from-blue-50/20 dark:from-blue-950/10",
  },
  resolved: {
    labelKey: "complaints.status.resolved",
    bg: "bg-green-100 dark:bg-green-900/30",
    text: "text-green-700 dark:text-green-400",
    border: "border-l-green-500",
    dot: "bg-green-500",
    accent: "from-green-50/20 dark:from-green-950/10",
  },
  rejected: {
    labelKey: "complaints.status.rejected",
    bg: "bg-red-100 dark:bg-red-900/30",
    text: "text-red-700 dark:text-red-400",
    border: "border-l-red-500",
    dot: "bg-red-500",
    accent: "from-red-50/20 dark:from-red-950/10",
  },
};

const TYPE_CFG = {
  issue: {
    labelKey: "complaints.type.issue",
    bg: "bg-red-100 dark:bg-red-900/30",
    text: "text-red-700 dark:text-red-400",
    icon: "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z",
  },
  suggestion: {
    labelKey: "complaints.type.suggestion",
    bg: "bg-purple-100 dark:bg-purple-900/30",
    text: "text-purple-700 dark:text-purple-400",
    icon: "M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z",
  },
};

const fraudBg = (s) =>
  s > 60
    ? "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800"
    : s > 30
      ? "bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800"
      : "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const toJpg = (url) => {
  if (!url || !url.includes("res.cloudinary.com")) return url;
  return url
    .replace(/\/upload\/(v\d+\/)/, "/upload/f_jpg,q_auto/$1")
    .replace(/\/upload\/(?!v\d)/, "/upload/f_jpg,q_auto/");
};

const fraudColor = (s) =>
  s > 60 ? "text-red-500" : s > 30 ? "text-amber-500" : "text-green-500";
const fraudBarColor = (s) =>
  s > 60 ? "bg-red-400" : s > 30 ? "bg-amber-400" : "bg-green-500";

// ─── Spinner ──────────────────────────────────────────────────────────────────

function IcoSpinner({ size = 18 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className="animate-spin text-primary-500"
    >
      <circle
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeOpacity="0.2"
        strokeWidth="4"
      />
      <path
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
        fill="currentColor"
      />
    </svg>
  );
}

// ─── Skeleton Components ──────────────────────────────────────────────────────

function StatCardSkeleton() {
  return (
    <div className="bg-white dark:bg-dark-surface border border-border dark:border-dark-border rounded-xl sm:rounded-2xl p-3 sm:p-5 shadow-soft animate-pulse">
      <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-xl bg-gray-200 dark:bg-gray-700 mb-2 sm:mb-4" />
      <div className="h-6 sm:h-8 w-12 sm:w-16 bg-gray-200 dark:bg-gray-700 rounded mb-1 sm:mb-2" />
      <div className="h-2.5 sm:h-3 w-14 sm:w-20 bg-gray-200 dark:bg-gray-700 rounded" />
    </div>
  );
}

function FilterTabSkeleton() {
  return (
    <div className="flex items-center gap-1 sm:gap-2 bg-white dark:bg-dark-surface border border-border dark:border-dark-border rounded-xl p-1 overflow-x-auto">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="h-8 w-14 sm:w-16 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse flex-shrink-0" />
      ))}
    </div>
  );
}

function TypeFilterSkeleton() {
  return (
    <div className="flex items-center gap-1 sm:gap-2 bg-white dark:bg-dark-surface border border-border dark:border-dark-border rounded-xl p-1">
      {[1, 2, 3].map((i) => (
        <div key={i} className="h-8 w-14 sm:w-20 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
      ))}
    </div>
  );
}

function ComplaintCardSkeleton() {
  return (
    <div className="bg-white dark:bg-dark-surface border border-border dark:border-dark-border rounded-xl sm:rounded-2xl overflow-hidden animate-pulse">
      <div className="flex flex-col sm:flex-row items-stretch gap-0 min-h-[70px] sm:min-h-[96px]">
        <div className="w-full sm:w-28 md:w-36 h-32 sm:h-auto flex-shrink-0 bg-gray-200 dark:bg-gray-700" />
        <div className="flex-1 px-3 sm:px-4 py-2.5 sm:py-3.5">
          <div className="flex items-start justify-between gap-2 mb-1.5 sm:mb-2">
            <div className="flex items-center gap-1.5 flex-wrap">
              <div className="h-5 w-10 sm:w-12 bg-gray-200 dark:bg-gray-700 rounded-md" />
              <div className="h-5 w-14 sm:w-16 bg-gray-200 dark:bg-gray-700 rounded-md" />
            </div>
            <div className="w-3.5 h-3.5 sm:w-4 sm:h-4 bg-gray-200 dark:bg-gray-700 rounded flex-shrink-0" />
          </div>
          <div className="h-4 sm:h-5 w-3/4 bg-gray-200 dark:bg-gray-700 rounded mb-1.5 sm:mb-2" />
          <div className="h-3 sm:h-4 w-full bg-gray-200 dark:bg-gray-700 rounded mb-1" />
          <div className="h-3 sm:h-4 w-2/3 bg-gray-200 dark:bg-gray-700 rounded mb-1.5 sm:mb-2.5" />
          <div className="flex flex-col xs:flex-row items-start xs:items-center justify-between gap-1.5 xs:gap-2">
            <div className="h-2.5 sm:h-3 w-20 sm:w-32 bg-gray-200 dark:bg-gray-700 rounded" />
            <div className="h-5 sm:h-6 w-14 sm:w-16 bg-gray-200 dark:bg-gray-700 rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Image Lightbox ───────────────────────────────────────────────────────────

function Lightbox({ src, alt, onClose }) {
  const { t } = useTranslation();
  
  useEffect(() => {
    const handler = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handler);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-3 sm:p-4"
      onClick={onClose}
    >
      <div
        className="relative max-w-4xl w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute -top-8 sm:-top-10 right-0 text-white/80 hover:text-white transition-colors flex items-center gap-1 text-xs sm:text-sm font-medium"
        >
          <svg
            className="w-4 h-4 sm:w-5 sm:h-5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
          <span className="hidden sm:inline">{t('complaints.lightbox.close')}</span>
        </button>
        <img
          src={src}
          alt={alt}
          className="w-full max-h-[60vh] sm:max-h-[80vh] object-contain rounded-xl sm:rounded-2xl shadow-2xl"
          style={{ background: "rgba(0,0,0,0.3)" }}
        />
        <p className="text-center text-white/50 text-[10px] sm:text-xs mt-2 sm:mt-3 px-2">{alt}</p>
      </div>
    </div>
  );
}

// ─── Complaint Image ──────────────────────────────────────────────────────────

function ComplaintImage({ src, alt, className = "", height = "h-40 sm:h-52" }) {
  const { t } = useTranslation();
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const jpgSrc = toJpg(src);

  if (!src) return null;

  return (
    <>
      <div
        className={`relative group overflow-hidden rounded-xl border border-border dark:border-dark-border ${height} ${className}`}
      >
        <img
          src={jpgSrc}
          alt={alt}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
        <button
          onClick={(e) => {
            e.stopPropagation();
            setLightboxOpen(true);
          }}
          className="absolute inset-0 flex items-end justify-end p-2 sm:p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
        >
          <span className="flex items-center gap-1 bg-black/60 backdrop-blur-sm text-white text-[10px] sm:text-[11px] font-semibold px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg">
            <svg
              className="w-3 h-3 sm:w-3.5 sm:h-3.5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
              />
            </svg>
            <span className="hidden sm:inline">{t('complaints.image.view_full')}</span>
          </span>
        </button>
      </div>

      {lightboxOpen && (
        <Lightbox
          src={jpgSrc}
          alt={alt}
          onClose={() => setLightboxOpen(false)}
        />
      )}
    </>
  );
}

// ─── Upload Zone ──────────────────────────────────────────────────────────────

function UploadZone({ file, onChange }) {
  const { t } = useTranslation();
  
  return (
    <label className="flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 bg-accent-mist dark:bg-dark-surface2 border border-dashed border-border dark:border-dark-border rounded-xl cursor-pointer hover:border-primary-400 transition-colors">
      <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-white dark:bg-dark-surface flex items-center justify-center flex-shrink-0">
        <svg
          className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary-500"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[11px] sm:text-xs font-semibold text-text-primary dark:text-dark-text-primary truncate">
          {file ? file.name : t('complaints.upload.attach_photo')}
        </p>
        <p className="text-[10px] sm:text-[11px] text-text-muted dark:text-dark-text-muted truncate">
          {t('complaints.upload.file_requirements')}
        </p>
      </div>
      <input
        type="file"
        accept=".jpg,.jpeg,.png"
        className="hidden"
        onChange={(e) => onChange(e.target.files[0] || null)}
      />
    </label>
  );
}

// ─── Inline Detail ────────────────────────────────────────────────────────────

function InlineDetail({
  complaint,
  onStatusUpdate,
  onResolve,
  updatingStatus,
  resolving,
}) {
  const { t } = useTranslation();
  const [newStatus, setNewStatus] = useState(complaint.status);
  const [showResolveForm, setShowResolveForm] = useState(false);
  const [resolutionFile, setResolutionFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  const fs = complaint.aiVerification?.fraudScore ?? 0;

  useEffect(() => {
    setNewStatus(complaint.status);
    setShowResolveForm(false);
    setResolutionFile(null);
  }, [complaint._id]);

  useEffect(() => {
    if (!resolutionFile) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(resolutionFile);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [resolutionFile]);

  const SectionLabel = ({ children }) => (
    <p className="text-[10px] font-bold uppercase tracking-widest text-text-muted dark:text-dark-text-muted mb-2">
      {children}
    </p>
  );

  const statusOptions = [
    { value: "pending", labelKey: "complaints.status.pending" },
    { value: "in-progress", labelKey: "complaints.status.in_progress" },
    { value: "rejected", labelKey: "complaints.status.rejected" },
  ];

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      className="mt-4 pt-4 border-t border-border dark:border-dark-border flex flex-col gap-4 sm:gap-5"
    >
      {/* AI Verification */}
      {complaint.aiVerification && (
        <div>
          <SectionLabel>{t('complaints.detail.ai_verification')}</SectionLabel>
          <div className="grid grid-cols-2 gap-2 sm:gap-3 mb-3">
            <div className="bg-accent-mist dark:bg-dark-surface2 rounded-xl p-3 flex flex-col items-center gap-1">
              <span
                className={`text-lg font-bold ${complaint.aiVerification.isValidIssue ? "text-green-600 dark:text-green-400" : "text-red-500"}`}
              >
                {complaint.aiVerification.isValidIssue ? "✓" : "✗"}
              </span>
              <span className="text-[11px] text-text-muted dark:text-dark-text-muted text-center">
                {t('complaints.detail.valid_issue')}
              </span>
            </div>
            <div className="bg-accent-mist dark:bg-dark-surface2 rounded-xl p-3 flex flex-col items-center gap-1">
              <span className={`text-lg font-bold ${fraudColor(fs)}`}>
                {fs}%
              </span>
              <span className="text-[11px] text-text-muted dark:text-dark-text-muted text-center">
                {t('complaints.detail.fraud_score')}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 mb-3">
            <div className="flex-1 h-1.5 bg-border dark:bg-dark-border rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${fraudBarColor(fs)}`}
                style={{ width: `${Math.min(fs, 100)}%` }}
              />
            </div>
          </div>
          <div className="bg-accent-mist dark:bg-dark-surface2 rounded-xl px-3 py-2.5 mb-2">
            <p className="text-xs text-text-secondary dark:text-dark-text-secondary leading-relaxed">
              {complaint.aiVerification.remarks}
            </p>
          </div>
          {complaint.aiVerification.labels?.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {complaint.aiVerification.labels.slice(0, 8).map((l, i) => (
                <span
                  key={i}
                  className="text-[10px] px-2 py-0.5 rounded-md bg-accent-mist dark:bg-dark-surface2 text-text-muted dark:text-dark-text-muted"
                >
                  {l}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Resolution verification */}
      {complaint.resolutionVerification && (
        <div>
          <SectionLabel>{t('complaints.detail.resolution_verification')}</SectionLabel>
          <div className="flex items-center justify-between bg-accent-mist dark:bg-dark-surface2 rounded-xl px-3 py-2.5 mb-2">
            <span className="text-xs text-text-muted dark:text-dark-text-muted">
              {t('complaints.detail.score')}
            </span>
            <span
              className={`text-xl font-bold ${complaint.resolutionVerification.score >= 70 ? "text-green-600 dark:text-green-400" : "text-red-500"}`}
            >
              {complaint.resolutionVerification.score}
              <span className="text-xs font-normal text-text-muted dark:text-dark-text-muted">
                /100
              </span>
            </span>
          </div>
          <div className="bg-accent-mist dark:bg-dark-surface2 rounded-xl px-3 py-2.5">
            <p className="text-xs text-text-secondary dark:text-dark-text-secondary leading-relaxed">
              {complaint.resolutionVerification.remarks}
            </p>
          </div>
          {complaint.resolvedImageUrl && (
            <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-2">
              {complaint.imageUrl && (
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-text-muted dark:text-dark-text-muted mb-1.5">
                    {t('complaints.detail.before')}
                  </p>
                  <ComplaintImage
                    src={complaint.imageUrl}
                    alt="Before"
                    height="h-28 sm:h-32"
                  />
                </div>
              )}
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-text-muted dark:text-dark-text-muted mb-1.5">
                  {t('complaints.detail.after')}
                </p>
                <ComplaintImage
                  src={complaint.resolvedImageUrl}
                  alt="After resolution"
                  height="h-28 sm:h-32"
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Location */}
      {complaint.location?.lat && (
        <div>
          <SectionLabel>{t('complaints.detail.location')}</SectionLabel>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-3 bg-accent-mist dark:bg-dark-surface2 rounded-xl px-3 py-2.5">
            <span className="text-xs font-mono font-semibold text-text-primary dark:text-dark-text-primary break-all">
              {complaint.location.lat.toFixed(6)}, {complaint.location.lng.toFixed(6)}
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                window.dispatchEvent(
                  new CustomEvent("open-map", {
                    detail: {
                      lat: complaint.location.lat,
                      lng: complaint.location.lng,
                    },
                  }),
                );
              }}
              className="text-xs font-semibold text-primary-600 dark:text-primary-400 flex items-center gap-1 hover:underline whitespace-nowrap"
            >
              {t('complaints.detail.view_on_map')}
              <svg
                className="w-3 h-3"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Actions */}
      {complaint.status !== "resolved" ? (
        <div>
          <SectionLabel>{t('complaints.detail.update_status')}</SectionLabel>
          <div className="flex flex-col sm:flex-row gap-2 mb-3">
            <select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              className="flex-1 text-xs px-3 py-2.5 sm:py-2 rounded-xl border border-border dark:border-dark-border bg-white dark:bg-dark-surface text-text-primary dark:text-dark-text-primary outline-none focus:border-primary-400 transition-colors"
            >
              {statusOptions.map((s) => (
                <option key={s.value} value={s.value}>
                  {t(s.labelKey)}
                </option>
              ))}
            </select>
            <button
              onClick={() => onStatusUpdate(newStatus)}
              disabled={updatingStatus || newStatus === complaint.status}
              className="px-4 py-2.5 sm:py-2 rounded-xl text-xs font-semibold text-white bg-primary-600 hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-400 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-1.5 shadow-soft"
            >
              {updatingStatus && <IcoSpinner size={12} />}
              {t('complaints.detail.save')}
            </button>
          </div>

          {complaint.type === "issue" && (
            <>
              <button
                onClick={() => {
                  setShowResolveForm((p) => !p);
                  setResolutionFile(null);
                }}
                className="w-full py-2.5 rounded-xl text-xs font-semibold border border-border dark:border-dark-border bg-accent-mist dark:bg-dark-surface2 text-text-primary dark:text-dark-text-primary hover:border-primary-400 transition-all"
              >
                {showResolveForm ? t('complaints.detail.cancel') : t('complaints.detail.mark_resolved')}
              </button>

              {showResolveForm && (
                <div className="mt-3 flex flex-col gap-3">
                  <p className="text-xs text-text-muted dark:text-dark-text-muted leading-relaxed">
                    {t('complaints.detail.resolution_instruction')}
                  </p>
                  <UploadZone
                    file={resolutionFile}
                    onChange={setResolutionFile}
                  />
                  {previewUrl && (
                    <ComplaintImage
                      src={previewUrl}
                      alt="Resolution preview"
                      height="h-32 sm:h-40"
                    />
                  )}
                  <button
                    onClick={() => onResolve(resolutionFile)}
                    disabled={resolving || !resolutionFile}
                    className="w-full py-2.5 rounded-xl text-xs font-semibold text-white bg-primary-600 hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-400 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 shadow-soft"
                  >
                    {resolving ? (
                      <>
                        <IcoSpinner size={13} />
                        <span className="hidden sm:inline">{t('complaints.detail.verifying_ai')}</span>
                        <span className="sm:hidden">{t('complaints.detail.verifying')}</span>
                      </>
                    ) : (
                      t('complaints.detail.submit_resolution')
                    )}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      ) : (
        <div className="flex items-center gap-2 sm:gap-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl px-3 sm:px-4 py-2.5 sm:py-3">
          <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-green-500 flex items-center justify-center flex-shrink-0">
            <svg
              className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-white"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <div>
            <p className="text-xs sm:text-sm font-semibold text-green-800 dark:text-green-300">
              {t('complaints.detail.resolved')}
            </p>
            <p className="text-[10px] sm:text-[11px] text-green-700 dark:text-green-400">
              {t('complaints.detail.closed')}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Pill Badge ──────────────────────────────────────────────────────────────

function Pill({ bg, text, icon, children }) {
  return (
    <span
      className={`inline-flex items-center gap-0.5 sm:gap-1 text-[10px] sm:text-[11px] font-semibold px-1.5 sm:px-2 py-0.5 rounded-md ${bg} ${text}`}
    >
      {icon && (
        <svg
          className="w-2.5 h-2.5 sm:w-3 sm:h-3 flex-shrink-0"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d={icon} />
        </svg>
      )}
      {children}
    </span>
  );
}

// ─── Fraud Gauge ──────────────────────────────────────────────────────────────

function FraudGauge({ score }) {
  const { t } = useTranslation();
  
  return (
    <div
      className={`flex items-center gap-1 sm:gap-2 px-1.5 sm:px-2.5 py-1 sm:py-1.5 rounded-lg border text-[10px] sm:text-xs ${fraudBg(score)}`}
    >
      <div className="relative w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0">
        <svg viewBox="0 0 20 20" className="w-4 h-4 sm:w-5 sm:h-5 -rotate-90">
          <circle
            cx="10"
            cy="10"
            r="7"
            fill="none"
            stroke="currentColor"
            strokeOpacity="0.15"
            strokeWidth="3"
          />
          <circle
            cx="10"
            cy="10"
            r="7"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray={`${(score / 100) * 44} 44`}
            className={fraudColor(score)}
          />
        </svg>
      </div>
      <span className={`font-bold tabular-nums ${fraudColor(score)}`}>
        {score}%
      </span>
      <span className="text-text-muted dark:text-dark-text-muted font-medium hidden xs:inline">
        {t('complaints.fraud')}
      </span>
    </div>
  );
}

// ─── Complaint Card ───────────────────────────────────────────────────────────

function ComplaintCard({
  complaint,
  expanded,
  onToggle,
  onStatusUpdate,
  onResolve,
  updatingStatus,
  resolving,
}) {
  const { t } = useTranslation();
  const typeCfg = TYPE_CFG[complaint.type] || TYPE_CFG.issue;
  const statusCfg = STATUS_CFG[complaint.status] || STATUS_CFG.pending;
  const fraudScore = complaint.aiVerification?.fraudScore ?? 0;
  const hasImage = !!complaint.imageUrl;

  return (
    <div
      onClick={onToggle}
      className={`
        group relative bg-white dark:bg-dark-surface
        border border-border dark:border-dark-border
        border-l-4 ${statusCfg.border}
        rounded-xl sm:rounded-2xl overflow-hidden cursor-pointer
        transition-all duration-200 shadow-soft
        active:scale-[0.99] touch-manipulation
        ${
          expanded
            ? "ring-1 ring-primary-300 dark:ring-primary-700 shadow-md"
            : "hover:shadow-md hover:-translate-y-px"
        }
      `}
    >
      <div
        className={`absolute inset-0 bg-gradient-to-r ${statusCfg.accent} to-transparent pointer-events-none`}
      />

      {!expanded && (
        <div className="relative flex flex-col sm:flex-row items-stretch gap-0 min-h-[70px] sm:min-h-[96px]">
          {hasImage && (
            <div className="w-full sm:w-28 md:w-36 h-32 sm:h-auto flex-shrink-0 overflow-hidden">
              <img
                src={toJpg(complaint.imageUrl)}
                alt="Complaint"
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                loading="lazy"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          )}

          <div
            className={`flex-1 flex flex-col justify-between px-3 sm:px-4 py-2.5 sm:py-3.5 min-w-0 ${!hasImage ? "sm:pl-5" : ""}`}
          >
            <div className="flex items-start justify-between gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
              <div className="flex items-center gap-1 sm:gap-1.5 flex-wrap">
                <Pill bg={typeCfg.bg} text={typeCfg.text} icon={typeCfg.icon}>
                  {t(typeCfg.labelKey)}
                </Pill>
                <Pill bg={statusCfg.bg} text={statusCfg.text}>
                  <span
                    className={`w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full ${statusCfg.dot} mr-0.5 inline-block`}
                  />
                  <span className="hidden xs:inline">{t(statusCfg.labelKey)}</span>
                </Pill>
                {fraudScore > 60 && (
                  <Pill
                    bg="bg-red-100 dark:bg-red-900/30"
                    text="text-red-700 dark:text-red-400"
                  >
                    ⚠ <span className="hidden xs:inline">{t('complaints.high_risk')}</span>
                  </Pill>
                )}
              </div>
              <svg
                className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-text-muted dark:text-dark-text-muted flex-shrink-0 mt-0.5 transition-transform duration-200"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </div>

            <p className="text-sm sm:text-base font-bold text-text-primary dark:text-dark-text-primary leading-snug mb-0.5 sm:mb-1 line-clamp-1">
              {complaint.title}
            </p>

            <p className="text-xs sm:text-[13px] text-text-secondary dark:text-dark-text-secondary leading-relaxed line-clamp-2 mb-1.5 sm:mb-2.5">
              {complaint.description}
            </p>

            <div className="flex flex-col xs:flex-row items-start xs:items-center justify-between gap-1.5 xs:gap-2 flex-wrap">
              <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px] text-text-muted dark:text-dark-text-muted flex-wrap">
                <svg
                  className="w-2.5 h-2.5 sm:w-3 sm:h-3 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <span className="whitespace-nowrap">
                  {new Date(complaint.createdAt).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </span>
                {complaint.location?.lat && (
                  <>
                    <span className="opacity-40 hidden sm:inline">·</span>
                    <span className="hidden sm:inline">
                      {complaint.location.lat.toFixed(3)}°
                    </span>
                  </>
                )}
              </div>

              {complaint.aiVerification && <FraudGauge score={fraudScore} />}
            </div>
          </div>
        </div>
      )}

      {expanded && (
        <div className="relative" onClick={(e) => e.stopPropagation()}>
          {hasImage && (
            <div className="relative w-full h-48 sm:h-52 overflow-hidden group">
              <img
                src={toJpg(complaint.imageUrl)}
                alt="Complaint photo"
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
              <button
                onClick={() => {
                  // Open lightbox for expanded image
                  const event = new CustomEvent("open-lightbox", {
                    detail: { src: complaint.imageUrl, alt: "Complaint photo" }
                  });
                  window.dispatchEvent(event);
                }}
                className="absolute bottom-2 right-2 sm:bottom-3 sm:right-3 flex items-center gap-1 bg-black/60 backdrop-blur-sm text-white text-[10px] sm:text-[11px] font-semibold px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity touch-manipulation"
              >
                <svg
                  className="w-3 h-3 sm:w-3.5 sm:h-3.5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
                  />
                </svg>
                <span className="hidden sm:inline">{t('complaints.image.view_full')}</span>
              </button>
            </div>
          )}

          <div className="px-3 sm:px-5 py-3 sm:py-5">
            <div className="flex items-start justify-between gap-2 sm:gap-3 mb-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1 flex-wrap mb-2">
                  <Pill bg={typeCfg.bg} text={typeCfg.text} icon={typeCfg.icon}>
                    {t(typeCfg.labelKey)}
                  </Pill>
                  <Pill bg={statusCfg.bg} text={statusCfg.text}>
                    <span
                      className={`w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full ${statusCfg.dot} mr-0.5 inline-block`}
                    />
                    {t(statusCfg.labelKey)}
                  </Pill>
                  {fraudScore > 60 && (
                    <Pill
                      bg="bg-red-100 dark:bg-red-900/30"
                      text="text-red-700 dark:text-red-400"
                    >
                      ⚠ {t('complaints.high_risk')}
                    </Pill>
                  )}
                </div>
                <h3 className="text-sm sm:text-base font-bold text-text-primary dark:text-dark-text-primary leading-snug">
                  {complaint.title}
                </h3>
              </div>
              <button
                onClick={onToggle}
                className="mt-1 w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-accent-mist dark:bg-dark-surface2 flex items-center justify-center flex-shrink-0 hover:bg-border dark:hover:bg-dark-border transition-colors touch-manipulation"
              >
                <svg
                  className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-text-muted dark:text-dark-text-muted rotate-180"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
            </div>

            <p className="text-sm text-text-secondary dark:text-dark-text-secondary leading-relaxed mb-4">
              {complaint.description}
            </p>

            <div className="flex flex-col xs:flex-row items-start xs:items-center gap-2 flex-wrap mb-4 pb-4 border-b border-border dark:border-dark-border">
              <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px] text-text-muted dark:text-dark-text-muted">
                <svg
                  className="w-3 h-3 sm:w-3.5 sm:h-3.5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                {new Date(complaint.createdAt).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </div>
              {complaint.aiVerification && <FraudGauge score={fraudScore} />}
            </div>

            <InlineDetail
              complaint={complaint}
              onStatusUpdate={onStatusUpdate}
              onResolve={onResolve}
              updatingStatus={updatingStatus}
              resolving={resolving}
            />
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────

export default function ComplaintsDashboard() {
  const { t } = useTranslation();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [initialLoading, setInitialLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [expandedId, setExpandedId] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [resolving, setResolving] = useState(false);

  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE_URL}/complaints`, {
        withCredentials: true,
      });
      setComplaints(Array.isArray(res.data) ? res.data : []);
    } catch {
      toast.error(t('complaints.errors.load_failed'));
      setComplaints([]);
    } finally {
      setLoading(false);
      setInitialLoading(false);
    }
  };

  const handleToggle = useCallback((id) => {
    setExpandedId((prev) => (prev === id ? null : id));
  }, []);

  const handleStatusUpdate = useCallback(
    async (newStatus) => {
      if (!expandedId || !newStatus) return;
      try {
        setUpdatingStatus(true);
        await axios.patch(
          `${API_BASE_URL}/complaints/${expandedId}/status`,
          { status: newStatus },
          { withCredentials: true },
        );
        toast.success(t('complaints.success.status_updated'));
        setComplaints((prev) =>
          prev.map((c) =>
            c._id === expandedId ? { ...c, status: newStatus } : c,
          ),
        );
      } catch (err) {
        toast.error(err.response?.data?.message || t('complaints.errors.update_failed'));
      } finally {
        setUpdatingStatus(false);
      }
    },
    [expandedId, t],
  );

  const handleResolve = useCallback(
    async (file) => {
      if (!expandedId || !file) {
        toast.error(t('complaints.errors.photo_required'));
        return;
      }
      try {
        setResolving(true);
        const fd = new FormData();
        fd.append("image", file);
        const res = await axios.patch(
          `${API_BASE_URL}/complaints/${expandedId}/resolve`,
          fd,
          {
            headers: { "Content-Type": "multipart/form-data" },
            withCredentials: true,
          },
        );
        toast.success(t('complaints.success.resolved'));
        setComplaints((prev) =>
          prev.map((c) => (c._id === res.data._id ? res.data : c)),
        );
      } catch (err) {
        toast.error(
          err.response?.data?.message || t('complaints.errors.resolve_failed'),
        );
      } finally {
        setResolving(false);
      }
    },
    [expandedId, t],
  );

  const stats = {
    total: complaints.length,
    pending: complaints.filter((c) => c.status === "pending").length,
    inProgress: complaints.filter((c) => c.status === "in-progress").length,
    resolved: complaints.filter((c) => c.status === "resolved").length,
    rejected: complaints.filter((c) => c.status === "rejected").length,
  };

  const filtered = complaints.filter((c) => {
    const tabOk = activeTab === "all" || c.status === activeTab;
    const typeOk = typeFilter === "all" || c.type === typeFilter;
    return tabOk && typeOk;
  });

  const tabCount = (key) =>
    ({
      all: stats.total,
      pending: stats.pending,
      "in-progress": stats.inProgress,
      resolved: stats.resolved,
      rejected: stats.rejected,
    })[key] ?? 0;

  const STAT_CARDS = [
    {
      labelKey: "complaints.stats.total",
      value: stats.total,
      bgCls: "bg-green-100 dark:bg-green-900/30",
      iconCls: "text-green-600 dark:text-green-400",
      icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2",
    },
    {
      labelKey: "complaints.stats.pending",
      value: stats.pending,
      bgCls: "bg-amber-100 dark:bg-amber-900/30",
      iconCls: "text-amber-600 dark:text-amber-400",
      icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z",
    },
    {
      labelKey: "complaints.stats.in_progress",
      value: stats.inProgress,
      bgCls: "bg-blue-100 dark:bg-blue-900/30",
      iconCls: "text-blue-600 dark:text-blue-400",
      icon: "M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15",
    },
    {
      labelKey: "complaints.stats.resolved",
      value: stats.resolved,
      bgCls: "bg-green-100 dark:bg-green-900/30",
      iconCls: "text-green-600 dark:text-green-400",
      icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z",
    },
    {
      labelKey: "complaints.stats.rejected",
      value: stats.rejected,
      bgCls: "bg-red-100 dark:bg-red-900/30",
      iconCls: "text-red-600 dark:text-red-400",
      icon: "M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z",
    },
  ];

  const isInitialLoading = initialLoading;

  return (
    <main className="flex-1 max-w-7xl mx-auto w-full px-3 sm:px-6 md:px-8 py-3 sm:py-6 md:py-8">
      {/* Page header */}
      <div className="mb-5 sm:mb-8">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-text-primary dark:text-dark-text-primary tracking-tight">
          {t('complaints.title')}
        </h1>
        <p className="text-xs sm:text-sm text-text-muted dark:text-dark-text-muted mt-0.5 sm:mt-1">
          {t('complaints.subtitle')}
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-3 md:gap-4 mb-5 sm:mb-8">
        {isInitialLoading ? (
          <>
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
          </>
        ) : (
          STAT_CARDS.map((s) => (
            <div
              key={s.labelKey}
              className="bg-white dark:bg-dark-surface border border-border dark:border-dark-border rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-5 shadow-soft"
            >
              <div
                className={`w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 rounded-xl flex items-center justify-center mb-1.5 sm:mb-3 md:mb-4 ${s.bgCls}`}
              >
                <svg
                  className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${s.iconCls}`}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d={s.icon} />
                </svg>
              </div>
              <p className="text-lg sm:text-2xl md:text-3xl font-bold text-text-primary dark:text-dark-text-primary">
                {s.value}
              </p>
              <p className="text-[10px] sm:text-xs text-text-muted dark:text-dark-text-muted mt-0.5 sm:mt-1 font-medium">
                {t(s.labelKey)}
              </p>
            </div>
          ))
        )}
      </div>

      {/* Filter tabs */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4 mb-4 sm:mb-5">
        {isInitialLoading ? (
          <FilterTabSkeleton />
        ) : (
          <div className="flex items-center gap-1 sm:gap-2 bg-white dark:bg-dark-surface border border-border dark:border-dark-border rounded-xl p-1 overflow-x-auto scrollbar-hide">
            {FILTER_TABS.map((filter) => (
              <button
                key={filter.key}
                onClick={() => setActiveTab(filter.key)}
                className={`flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-lg text-[10px] sm:text-xs font-semibold transition-all duration-150 whitespace-nowrap touch-manipulation ${
                  activeTab === filter.key
                    ? "bg-primary-600 dark:bg-primary-700 text-white shadow-soft"
                    : "text-text-muted dark:text-dark-text-muted hover:text-text-primary dark:hover:text-dark-text-primary"
                }`}
              >
                <span className="hidden xs:inline">{t(filter.labelKey)}</span>
                <span className="xs:hidden">
                  {filter.key === "all" && "All"}
                  {filter.key === "pending" && "Pending"}
                  {filter.key === "in-progress" && "In Prog"}
                  {filter.key === "resolved" && "Resolved"}
                  {filter.key === "rejected" && "Rejected"}
                </span>
                <span
                  className={`text-[9px] sm:text-[10px] font-bold min-w-[14px] sm:min-w-[16px] h-3.5 sm:h-4 px-0.5 sm:px-1 flex items-center justify-center rounded-full ${
                    activeTab === filter.key
                      ? "bg-white/20 text-white"
                      : "bg-accent-mist dark:bg-dark-surface2 text-text-muted dark:text-dark-text-muted"
                  }`}
                >
                  {tabCount(filter.key)}
                </span>
              </button>
            ))}
          </div>
        )}

        {isInitialLoading ? (
          <TypeFilterSkeleton />
        ) : (
          <div className="flex items-center gap-1 sm:gap-2 bg-white dark:bg-dark-surface border border-border dark:border-dark-border rounded-xl p-1 self-start sm:self-auto overflow-x-auto">
            {[
              { key: "all", labelKey: "complaints.type.all", shortKey: "All" },
              { key: "issue", labelKey: "complaints.type.issue", shortKey: "Issues" },
              { key: "suggestion", labelKey: "complaints.type.suggestion", shortKey: "Suggest" },
            ].map((type) => (
              <button
                key={type.key}
                onClick={() => setTypeFilter(type.key)}
                className={`px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-lg text-[10px] sm:text-xs font-semibold capitalize transition-all duration-150 touch-manipulation whitespace-nowrap ${
                  typeFilter === type.key
                    ? "bg-primary-600 dark:bg-primary-700 text-white shadow-soft"
                    : "text-text-muted dark:text-dark-text-muted hover:text-text-primary dark:hover:text-dark-text-primary"
                }`}
              >
                <span className="hidden xs:inline">{t(type.labelKey)}</span>
                <span className="xs:hidden">{type.shortKey}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Cards list */}
      {loading ? (
        <div className="space-y-2 sm:space-y-3">
          <ComplaintCardSkeleton />
          <ComplaintCardSkeleton />
          <ComplaintCardSkeleton />
          <ComplaintCardSkeleton />
          <ComplaintCardSkeleton />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white dark:bg-dark-surface border border-border dark:border-dark-border rounded-xl sm:rounded-2xl flex flex-col items-center justify-center py-10 sm:py-16 gap-2 sm:gap-3 text-center px-4">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-accent-mist dark:bg-dark-surface2 border border-border dark:border-dark-border flex items-center justify-center mb-0.5 sm:mb-1">
            <svg
              className="w-4 h-4 sm:w-5 sm:h-5 text-primary-500 dark:text-primary-400"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
          </div>
          <p className="text-sm sm:text-base font-semibold text-text-primary dark:text-dark-text-primary">
            {t('complaints.empty.title')}
          </p>
          <p className="text-xs sm:text-sm text-text-muted dark:text-dark-text-muted max-w-xs">
            {t('complaints.empty.message')}
          </p>
        </div>
      ) : (
        <div className="space-y-2 sm:space-y-3">
          {filtered.map((c) => (
            <ComplaintCard
              key={c._id}
              complaint={c}
              expanded={expandedId === c._id}
              onToggle={() => handleToggle(c._id)}
              onStatusUpdate={handleStatusUpdate}
              onResolve={handleResolve}
              updatingStatus={updatingStatus}
              resolving={resolving}
            />
          ))}
        </div>
      )}
    </main>
  );
}