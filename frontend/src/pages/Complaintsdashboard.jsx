import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { toast } from "react-toastify";

// ─── Constants ────────────────────────────────────────────────────────────────

const FILTER_TABS = [
  { key: "all",          label: "All" },
  { key: "pending",      label: "Pending" },
  { key: "in-progress",  label: "In Progress" },
  { key: "resolved",     label: "Resolved" },
  { key: "rejected",     label: "Rejected" },
];

const STATUS_CFG = {
  pending:       { label: "Pending",     bg: "bg-amber-100 dark:bg-amber-900/30",   text: "text-amber-700 dark:text-amber-400" },
  "in-progress": { label: "In Progress", bg: "bg-blue-100 dark:bg-blue-900/30",     text: "text-blue-700 dark:text-blue-400" },
  resolved:      { label: "Resolved",    bg: "bg-green-100 dark:bg-green-900/30",   text: "text-green-700 dark:text-green-400" },
  rejected:      { label: "Rejected",    bg: "bg-red-100 dark:bg-red-900/30",       text: "text-red-700 dark:text-red-400" },
};

const TYPE_CFG = {
  issue:      { label: "Issue",      bg: "bg-red-100 dark:bg-red-900/30",       text: "text-red-700 dark:text-red-400" },
  suggestion: { label: "Suggestion", bg: "bg-purple-100 dark:bg-purple-900/30", text: "text-purple-700 dark:text-purple-400" },
};

const fraudBg       = (s) => s > 60 ? "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800" : s > 30 ? "bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800" : "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800";
 

// ─── Helpers ──────────────────────────────────────────────────────────────────

const toJpg = (url) => {
  if (!url || !url.includes("res.cloudinary.com")) return url;
  return url
    .replace(/\/upload\/(v\d+\/)/, "/upload/f_jpg,q_auto/$1")
    .replace(/\/upload\/(?!v\d)/, "/upload/f_jpg,q_auto/");
};

const fraudColor    = (s) => s > 60 ? "text-red-500" : s > 30 ? "text-amber-500" : "text-green-500";
const fraudBarColor = (s) => s > 60 ? "bg-red-400"   : s > 30 ? "bg-amber-400"   : "bg-green-500";

// ─── Spinner ──────────────────────────────────────────────────────────────────

function IcoSpinner({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className="animate-spin text-primary-500">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeOpacity="0.2" strokeWidth="4" />
      <path d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" fill="currentColor" />
    </svg>
  );
}

// ─── Image Lightbox (in-page, no redirect) ────────────────────────────────────

function Lightbox({ src, alt, onClose }) {
  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handler);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative max-w-4xl w-full mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute -top-10 right-0 text-white/80 hover:text-white transition-colors flex items-center gap-1.5 text-sm font-medium"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
          Close
        </button>
        <img
          src={src}
          alt={alt}
          className="w-full max-h-[80vh] object-contain rounded-2xl shadow-2xl"
          style={{ background: "rgba(0,0,0,0.3)" }}
        />
        <p className="text-center text-white/50 text-xs mt-3">{alt}</p>
      </div>
    </div>
  );
}

// ─── Complaint Image with expand button ──────────────────────────────────────

function ComplaintImage({ src, alt, className = "", height = "h-52" }) {
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
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
        {/* Expand button */}
        <button
          onClick={(e) => { e.stopPropagation(); setLightboxOpen(true); }}
          className="absolute inset-0 flex items-end justify-end p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
        >
          <span className="flex items-center gap-1.5 bg-black/60 backdrop-blur-sm text-white text-[11px] font-semibold px-3 py-1.5 rounded-lg">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
            </svg>
            View full image
          </span>
        </button>
      </div>

      {lightboxOpen && (
        <Lightbox src={jpgSrc} alt={alt} onClose={() => setLightboxOpen(false)} />
      )}
    </>
  );
}

// ─── Upload zone ──────────────────────────────────────────────────────────────

function UploadZone({ file, onChange }) {
  return (
    <label className="flex items-center gap-3 p-3 bg-accent-mist dark:bg-dark-surface2 border border-dashed border-border dark:border-dark-border rounded-xl cursor-pointer hover:border-primary-400 transition-colors">
      <div className="w-8 h-8 rounded-lg bg-white dark:bg-dark-surface flex items-center justify-center flex-shrink-0">
        <svg className="w-4 h-4 text-primary-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      </div>
      <div>
        <p className="text-xs font-semibold text-text-primary dark:text-dark-text-primary">
          {file ? file.name : "Attach resolution photo"}
        </p>
        <p className="text-[11px] text-text-muted dark:text-dark-text-muted">JPG or PNG · max 5 MB</p>
      </div>
      <input type="file" accept=".jpg,.jpeg,.png" className="hidden"
        onChange={(e) => onChange(e.target.files[0] || null)} />
    </label>
  );
}

// ─── Inline expanded detail ───────────────────────────────────────────────────

function InlineDetail({ complaint, onStatusUpdate, onResolve, updatingStatus, resolving }) {
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
    if (!resolutionFile) { setPreviewUrl(null); return; }
    const url = URL.createObjectURL(resolutionFile);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [resolutionFile]);

  const SectionLabel = ({ children }) => (
    <p className="text-[10px] font-bold uppercase tracking-widest text-text-muted dark:text-dark-text-muted mb-2">
      {children}
    </p>
  );

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      className="mt-4 pt-4 border-t border-border dark:border-dark-border flex flex-col gap-5"
    >
      {/* AI Verification */}
      {complaint.aiVerification && (
        <div>
          <SectionLabel>AI Verification</SectionLabel>
          <div className="flex gap-3 mb-3">
            <div className="flex-1 bg-accent-mist dark:bg-dark-surface2 rounded-xl p-3 flex flex-col items-center gap-1">
              <span className={`text-lg font-bold ${complaint.aiVerification.isValidIssue ? "text-green-600 dark:text-green-400" : "text-red-500"}`}>
                {complaint.aiVerification.isValidIssue ? "✓" : "✗"}
              </span>
              <span className="text-[11px] text-text-muted dark:text-dark-text-muted">Valid issue</span>
            </div>
            <div className="flex-1 bg-accent-mist dark:bg-dark-surface2 rounded-xl p-3 flex flex-col items-center gap-1">
              <span className={`text-lg font-bold ${fraudColor(fs)}`}>{fs}%</span>
              <span className="text-[11px] text-text-muted dark:text-dark-text-muted">Fraud score</span>
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
                <span key={i} className="text-[10px] px-2 py-0.5 rounded-md bg-accent-mist dark:bg-dark-surface2 text-text-muted dark:text-dark-text-muted">
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
          <SectionLabel>Resolution Verification</SectionLabel>
          <div className="flex items-center justify-between bg-accent-mist dark:bg-dark-surface2 rounded-xl px-3 py-2.5 mb-2">
            <span className="text-xs text-text-muted dark:text-dark-text-muted">Score</span>
            <span className={`text-xl font-bold ${complaint.resolutionVerification.score >= 70 ? "text-green-600 dark:text-green-400" : "text-red-500"}`}>
              {complaint.resolutionVerification.score}
              <span className="text-xs font-normal text-text-muted dark:text-dark-text-muted">/100</span>
            </span>
          </div>
          <div className="bg-accent-mist dark:bg-dark-surface2 rounded-xl px-3 py-2.5">
            <p className="text-xs text-text-secondary dark:text-dark-text-secondary leading-relaxed">
              {complaint.resolutionVerification.remarks}
            </p>
          </div>
          {/* Before / After comparison */}
          {complaint.resolvedImageUrl && (
            <div className="mt-3 grid grid-cols-2 gap-2">
              {complaint.imageUrl && (
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-text-muted dark:text-dark-text-muted mb-1.5">Before</p>
                  <ComplaintImage src={complaint.imageUrl} alt="Before" height="h-32" />
                </div>
              )}
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-text-muted dark:text-dark-text-muted mb-1.5">After</p>
                <ComplaintImage src={complaint.resolvedImageUrl} alt="After resolution" height="h-32" />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Location */}
      {complaint.location?.lat && (
        <div>
          <SectionLabel>Location</SectionLabel>
          <div className="flex items-center justify-between bg-accent-mist dark:bg-dark-surface2 rounded-xl px-3 py-2.5">
            <span className="text-xs font-mono font-semibold text-text-primary dark:text-dark-text-primary">
              {complaint.location.lat.toFixed(6)}, {complaint.location.lng.toFixed(6)}
            </span>
            {/* Inline map embed instead of redirect */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                // Open map in a sandboxed iframe modal within the page
                window.dispatchEvent(new CustomEvent("open-map", {
                  detail: { lat: complaint.location.lat, lng: complaint.location.lng }
                }));
              }}
              className="text-xs font-semibold text-primary-600 dark:text-primary-400 flex items-center gap-1 hover:underline"
            >
              View on Map
              <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Actions */}
      {complaint.status !== "resolved" ? (
        <div>
          <SectionLabel>Update Status</SectionLabel>
          <div className="flex gap-2 mb-3">
            <select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              className="flex-1 text-xs px-3 py-2 rounded-xl border border-border dark:border-dark-border bg-white dark:bg-dark-surface text-text-primary dark:text-dark-text-primary outline-none focus:border-primary-400 transition-colors"
            >
              {["pending", "in-progress", "rejected"].map((s) => (
                <option key={s} value={s}>{STATUS_CFG[s]?.label || s}</option>
              ))}
            </select>
            <button
              onClick={() => onStatusUpdate(newStatus)}
              disabled={updatingStatus || newStatus === complaint.status}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-primary-600 hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-400 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-1.5 shadow-soft"
            >
              {updatingStatus && <IcoSpinner size={12} />}
              Save
            </button>
          </div>

          {complaint.type === "issue" && (
            <>
              <button
                onClick={() => { setShowResolveForm((p) => !p); setResolutionFile(null); }}
                className="w-full py-2.5 rounded-xl text-xs font-semibold border border-border dark:border-dark-border bg-accent-mist dark:bg-dark-surface2 text-text-primary dark:text-dark-text-primary hover:border-primary-400 transition-all"
              >
                {showResolveForm ? "Cancel" : "Mark as Resolved →"}
              </button>

              {showResolveForm && (
                <div className="mt-3 flex flex-col gap-3">
                  <p className="text-xs text-text-muted dark:text-dark-text-muted leading-relaxed">
                    Upload a photo proving the issue is fixed. AI will verify it.
                  </p>
                  <UploadZone file={resolutionFile} onChange={setResolutionFile} />
                  {previewUrl && (
                    <ComplaintImage src={previewUrl} alt="Resolution preview" height="h-40" />
                  )}
                  <button
                    onClick={() => onResolve(resolutionFile)}
                    disabled={resolving || !resolutionFile}
                    className="w-full py-2.5 rounded-xl text-xs font-semibold text-white bg-primary-600 hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-400 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 shadow-soft"
                  >
                    {resolving ? <><IcoSpinner size={13} />Verifying with AI…</> : "Submit Resolution"}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      ) : (
        <div className="flex items-center gap-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl px-4 py-3">
          <div className="w-7 h-7 rounded-lg bg-green-500 flex items-center justify-center flex-shrink-0">
            <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div>
            <p className="text-xs font-semibold text-green-800 dark:text-green-300">Resolved</p>
            <p className="text-[11px] text-green-700 dark:text-green-400">This complaint has been closed</p>
          </div>
        </div>
      )}
    </div>
  );
}
// ─── Pill badge ───────────────────────────────────────────────────────────────
 
function Pill({ bg, text, icon, children }) {
  return (
    <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-md ${bg} ${text}`}>
      {icon && (
        <svg className="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d={icon} />
        </svg>
      )}
      {children}
    </span>
  );
}
// ─── Fraud gauge ──────────────────────────────────────────────────────────────
 
function FraudGauge({ score }) {
  return (
    <div className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg border text-xs ${fraudBg(score)}`}>
      <div className="relative w-5 h-5 flex-shrink-0">
        <svg viewBox="0 0 20 20" className="w-5 h-5 -rotate-90">
          <circle cx="10" cy="10" r="7" fill="none" stroke="currentColor" strokeOpacity="0.15" strokeWidth="3" />
          <circle
            cx="10" cy="10" r="7"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray={`${(score / 100) * 44} 44`}
            className={fraudColor(score)}
          />
        </svg>
      </div>
      <span className={`font-bold tabular-nums ${fraudColor(score)}`}>{score}%</span>
      <span className="text-text-muted dark:text-dark-text-muted font-medium">fraud</span>
    </div>
  );
}

// ─── Complaint card ───────────────────────────────────────────────────────────

// ─── Complaint Card ───────────────────────────────────────────────────────────
 
function ComplaintCard({ complaint, expanded, onToggle, onStatusUpdate, onResolve, updatingStatus, resolving }) {
  const typeCfg   = TYPE_CFG[complaint.type]     || TYPE_CFG.issue;
  const statusCfg = STATUS_CFG[complaint.status] || STATUS_CFG.pending;
  const fraudScore = complaint.aiVerification?.fraudScore ?? 0;
  const hasImage   = !!complaint.imageUrl;
 
  return (
    <div
      onClick={onToggle}
      className={`
        group relative bg-white dark:bg-dark-surface
        border border-border dark:border-dark-border
        border-l-4 ${statusCfg.border}
        rounded-2xl overflow-hidden cursor-pointer
        transition-all duration-200 shadow-soft
        ${expanded
          ? "ring-1 ring-primary-300 dark:ring-primary-700 shadow-md"
          : "hover:shadow-md hover:-translate-y-px"
        }
      `}
    >
      {/* Subtle status-tinted background wash */}
      <div className={`absolute inset-0 bg-gradient-to-r ${statusCfg.accent} to-transparent pointer-events-none`} />
 
      {/* ── Collapsed layout: side-by-side ─────────────────────────────────── */}
      {!expanded && (
        <div className="relative flex items-stretch gap-0 min-h-[96px]">
 
          {/* Thumbnail */}
          {hasImage && (
            <div className="w-28 sm:w-36 flex-shrink-0 overflow-hidden">
              <img
                src={toJpg(complaint.imageUrl)}
                alt="Complaint"
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                loading="lazy"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          )}
 
          {/* Content */}
          <div className={`flex-1 flex flex-col justify-between px-4 py-3.5 min-w-0 ${!hasImage ? "pl-5" : ""}`}>
            {/* Top row: badges + chevron */}
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex items-center gap-1.5 flex-wrap">
                <Pill bg={typeCfg.bg} text={typeCfg.text} icon={typeCfg.icon}>
                  {typeCfg.label}
                </Pill>
                <Pill bg={statusCfg.bg} text={statusCfg.text}>
                  <span className={`w-1.5 h-1.5 rounded-full ${statusCfg.dot} mr-0.5 inline-block`} />
                  {statusCfg.label}
                </Pill>
                {fraudScore > 60 && (
                  <Pill bg="bg-red-100 dark:bg-red-900/30" text="text-red-700 dark:text-red-400">
                    ⚠ High Risk
                  </Pill>
                )}
              </div>
              <svg
                className="w-4 h-4 text-text-muted dark:text-dark-text-muted flex-shrink-0 mt-0.5 transition-transform duration-200"
                fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
 
            {/* Title */}
            <p className="text-sm font-bold text-text-primary dark:text-dark-text-primary leading-snug mb-1 line-clamp-1">
              {complaint.title}
            </p>
 
            {/* Description */}
            <p className="text-[13px] text-text-secondary dark:text-dark-text-secondary leading-relaxed line-clamp-2 mb-2.5">
              {complaint.description}
            </p>
 
            {/* Bottom row: date + location + fraud */}
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-1.5 text-[11px] text-text-muted dark:text-dark-text-muted">
                {/* Calendar icon */}
                <svg className="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span>
                  {new Date(complaint.createdAt).toLocaleDateString("en-IN", {
                    day: "numeric", month: "short", year: "numeric",
                  })}
                </span>
                {complaint.location?.lat && (
                  <>
                    <span className="opacity-40">·</span>
                    <svg className="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a2 2 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    </svg>
                    <span className="font-mono">{complaint.location.lat.toFixed(3)}°</span>
                  </>
                )}
              </div>
 
              {complaint.aiVerification && (
                <FraudGauge score={fraudScore} />
              )}
            </div>
          </div>
        </div>
      )}
 
      {/* ── Expanded layout ─────────────────────────────────────────────────── */}
      {expanded && (
        <div className="relative" onClick={(e) => e.stopPropagation()}>
 
          {/* Hero image when expanded */}
          {hasImage && (
            <ComplaintImageExpanded src={complaint.imageUrl} alt="Complaint photo" />
          )}
 
          <div className="px-5 py-5">
            {/* Header row */}
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap mb-2">
                  <Pill bg={typeCfg.bg} text={typeCfg.text} icon={typeCfg.icon}>
                    {typeCfg.label}
                  </Pill>
                  <Pill bg={statusCfg.bg} text={statusCfg.text}>
                    <span className={`w-1.5 h-1.5 rounded-full ${statusCfg.dot} mr-0.5 inline-block`} />
                    {statusCfg.label}
                  </Pill>
                  {fraudScore > 60 && (
                    <Pill bg="bg-red-100 dark:bg-red-900/30" text="text-red-700 dark:text-red-400">
                      ⚠ High Risk
                    </Pill>
                  )}
                </div>
                <h3 className="text-base font-bold text-text-primary dark:text-dark-text-primary leading-snug">
                  {complaint.title}
                </h3>
              </div>
              {/* Collapse chevron */}
              <button
                onClick={onToggle}
                className="mt-1 w-7 h-7 rounded-lg bg-accent-mist dark:bg-dark-surface2 flex items-center justify-center flex-shrink-0 hover:bg-border dark:hover:bg-dark-border transition-colors"
              >
                <svg className="w-4 h-4 text-text-muted dark:text-dark-text-muted rotate-180" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>
 
            {/* Description */}
            <p className="text-sm text-text-secondary dark:text-dark-text-secondary leading-relaxed mb-4">
              {complaint.description}
            </p>
 
            {/* Meta strip */}
            <div className="flex items-center gap-3 flex-wrap mb-5 pb-5 border-b border-border dark:border-dark-border">
              <div className="flex items-center gap-1.5 text-[11px] text-text-muted dark:text-dark-text-muted">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {new Date(complaint.createdAt).toLocaleDateString("en-IN", {
                  day: "numeric", month: "long", year: "numeric",
                })}
              </div>
              {complaint.aiVerification && <FraudGauge score={fraudScore} />}
            </div>
 
            {/* Inline Detail sections (AI verification, actions, etc.) */}
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
 
// ─── Expanded hero image with lightbox trigger ────────────────────────────────
 
function ComplaintImageExpanded({ src, alt }) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const jpgSrc = toJpg(src);
 
  return (
    <>
      <div className="relative w-full h-52 overflow-hidden group">
        <img
          src={jpgSrc}
          alt={alt}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
        <button
          onClick={() => setLightboxOpen(true)}
          className="absolute bottom-3 right-3 flex items-center gap-1.5 bg-black/60 backdrop-blur-sm text-white text-[11px] font-semibold px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
          </svg>
          View full
        </button>
      </div>
      {lightboxOpen && (
        <Lightbox src={jpgSrc} alt={alt} onClose={() => setLightboxOpen(false)} />
      )}
    </>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────

export default function ComplaintsDashboard() {
  const [complaints, setComplaints]         = useState([]);
  const [loading, setLoading]               = useState(true);
  const [activeTab, setActiveTab]           = useState("all");
  const [typeFilter, setTypeFilter]         = useState("all");
  const [expandedId, setExpandedId]         = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [resolving, setResolving]           = useState(false);

  useEffect(() => { fetchComplaints(); }, []);

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      const res = await axios.get("http://localhost:3000/complaints", { withCredentials: true });
      setComplaints(Array.isArray(res.data) ? res.data : []);
    } catch {
      toast.error("Failed to load complaints");
      setComplaints([]);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = useCallback((id) => {
    setExpandedId((prev) => (prev === id ? null : id));
  }, []);

  const handleStatusUpdate = useCallback(async (newStatus) => {
    if (!expandedId || !newStatus) return;
    try {
      setUpdatingStatus(true);
      await axios.patch(
        `http://localhost:3000/complaints/${expandedId}/status`,
        { status: newStatus },
        { withCredentials: true }
      );
      toast.success("Status updated");
      setComplaints((prev) =>
        prev.map((c) => (c._id === expandedId ? { ...c, status: newStatus } : c))
      );
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update status");
    } finally {
      setUpdatingStatus(false);
    }
  }, [expandedId]);

  const handleResolve = useCallback(async (file) => {
    if (!expandedId || !file) { toast.error("Please attach a resolution photo"); return; }
    try {
      setResolving(true);
      const fd = new FormData();
      fd.append("image", file);
      const res = await axios.patch(
        `http://localhost:3000/complaints/${expandedId}/resolve`,
        fd,
        { headers: { "Content-Type": "multipart/form-data" }, withCredentials: true }
      );
      toast.success("Complaint marked as resolved");
      setComplaints((prev) =>
        prev.map((c) => (c._id === res.data._id ? res.data : c))
      );
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to resolve complaint");
    } finally {
      setResolving(false);
    }
  }, [expandedId]);

  // ── Derived ────────────────────────────────────────────────────────────────

  const stats = {
    total:      complaints.length,
    pending:    complaints.filter((c) => c.status === "pending").length,
    inProgress: complaints.filter((c) => c.status === "in-progress").length,
    resolved:   complaints.filter((c) => c.status === "resolved").length,
    rejected:   complaints.filter((c) => c.status === "rejected").length,
  };

  const filtered = complaints.filter((c) => {
    const tabOk  = activeTab === "all" || c.status === activeTab;
    const typeOk = typeFilter === "all" || c.type === typeFilter;
    return tabOk && typeOk;
  });

  const tabCount = (key) => ({
    all: stats.total, pending: stats.pending,
    "in-progress": stats.inProgress, resolved: stats.resolved, rejected: stats.rejected,
  }[key] ?? 0);

  const STAT_CARDS = [
    { label: "Total Complaints", value: stats.total,      bgCls: "bg-green-100 dark:bg-green-900/30",  iconCls: "text-green-600 dark:text-green-400",  icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" },
    { label: "Pending",          value: stats.pending,    bgCls: "bg-amber-100 dark:bg-amber-900/30",  iconCls: "text-amber-600 dark:text-amber-400",  icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" },
    { label: "In Progress",      value: stats.inProgress, bgCls: "bg-blue-100 dark:bg-blue-900/30",    iconCls: "text-blue-600 dark:text-blue-400",    icon: "M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" },
    { label: "Resolved",         value: stats.resolved,   bgCls: "bg-green-100 dark:bg-green-900/30",  iconCls: "text-green-600 dark:text-green-400",  icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" },
    { label: "Rejected",         value: stats.rejected,   bgCls: "bg-red-100 dark:bg-red-900/30",      iconCls: "text-red-600 dark:text-red-400",      icon: "M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" },
  ];

  return (
    <main className="flex-1 max-w-7xl mx-auto w-full px-5 sm:px-8 py-8">

      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-text-primary dark:text-dark-text-primary tracking-tight">
          Complaints
        </h1>
        <p className="text-sm text-text-muted dark:text-dark-text-muted mt-1">
          Review, track and resolve citizen complaints
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        {STAT_CARDS.map((s) => (
          <div key={s.label} className="bg-white dark:bg-dark-surface border border-border dark:border-dark-border rounded-2xl p-5 shadow-soft">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-4 ${s.bgCls}`}>
              <svg className={`w-4 h-4 ${s.iconCls}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d={s.icon} />
              </svg>
            </div>
            <p className="text-3xl font-bold text-text-primary dark:text-dark-text-primary">{s.value}</p>
            <p className="text-xs text-text-muted dark:text-dark-text-muted mt-1.5 font-medium">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filter tabs + type filter */}
      <div className="flex items-center justify-between gap-4 mb-5 flex-wrap">
        <div className="flex items-center gap-2 bg-white dark:bg-dark-surface border border-border dark:border-dark-border rounded-xl p-1">
          {FILTER_TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition-all duration-150 ${
                activeTab === t.key
                  ? "bg-primary-600 dark:bg-primary-700 text-white shadow-soft"
                  : "text-text-muted dark:text-dark-text-muted hover:text-text-primary dark:hover:text-dark-text-primary"
              }`}
            >
              {t.label}
              <span className={`text-[10px] font-bold min-w-[16px] h-4 px-1 flex items-center justify-center rounded-full ${
                activeTab === t.key
                  ? "bg-white/20 text-white"
                  : "bg-accent-mist dark:bg-dark-surface2 text-text-muted dark:text-dark-text-muted"
              }`}>
                {tabCount(t.key)}
              </span>
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 bg-white dark:bg-dark-surface border border-border dark:border-dark-border rounded-xl p-1">
          {["all", "issue", "suggestion"].map((t) => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className={`px-4 py-2 rounded-lg text-xs font-semibold capitalize transition-all duration-150 ${
                typeFilter === t
                  ? "bg-primary-600 dark:bg-primary-700 text-white shadow-soft"
                  : "text-text-muted dark:text-dark-text-muted hover:text-text-primary dark:hover:text-dark-text-primary"
              }`}
            >
              {t === "all" ? "All Types" : t}
            </button>
          ))}
        </div>
      </div>

      {/* Cards list */}
      {loading ? (
        <div className="bg-white dark:bg-dark-surface border border-border dark:border-dark-border rounded-2xl flex items-center justify-center py-20 gap-3">
          <IcoSpinner />
          <p className="text-sm text-text-muted dark:text-dark-text-muted">Loading complaints...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white dark:bg-dark-surface border border-border dark:border-dark-border rounded-2xl flex flex-col items-center justify-center py-16 gap-3 text-center">
          <div className="w-12 h-12 rounded-2xl bg-accent-mist dark:bg-dark-surface2 border border-border dark:border-dark-border flex items-center justify-center mb-1">
            <svg className="w-5 h-5 text-primary-500 dark:text-primary-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <p className="text-sm font-semibold text-text-primary dark:text-dark-text-primary">No complaints found</p>
          <p className="text-xs text-text-muted dark:text-dark-text-muted">Try changing your filters</p>
        </div>
      ) : (
        <div className="space-y-3">
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