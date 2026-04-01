import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import ComplaintsDashboard from "../pages/Complaintsdashboard";
import { useTheme } from "../context/ThemeContext";
import { useTranslation } from "react-i18next";

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// ─── Enhanced Skeleton Components ────────────────────────────────────────────────

function SkeletonStats() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="bg-white dark:bg-dark-surface border border-border dark:border-dark-border rounded-2xl p-5 shadow-soft">
          <div className="w-9 h-9 rounded-xl bg-primary-200 dark:bg-primary-800 animate-pulse mb-4" />
          <div className="w-16 h-8 bg-primary-200 dark:bg-primary-800 rounded-lg animate-pulse mb-1.5" />
          <div className="w-20 h-3 bg-primary-100 dark:bg-primary-800/50 rounded animate-pulse" />
        </div>
      ))}
    </div>
  );
}

function SkeletonFilterTabs() {
  return (
    <div className="flex items-center justify-between gap-4 mb-5 flex-wrap">
      <div className="flex items-center gap-2 bg-white dark:bg-dark-surface border border-border dark:border-dark-border rounded-xl p-1">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="w-20 h-8 bg-primary-200 dark:bg-primary-800 rounded-lg animate-pulse" />
        ))}
      </div>
      <div className="w-32 h-10 bg-primary-200 dark:bg-primary-800 rounded-xl animate-pulse" />
    </div>
  );
}

function SkeletonNoticeCard() {
  return (
    <div className="bg-white dark:bg-dark-surface border border-border dark:border-dark-border rounded-2xl p-5 animate-pulse">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-16 h-5 bg-primary-200 dark:bg-primary-800 rounded-full" />
            <div className="w-12 h-5 bg-primary-200 dark:bg-primary-800 rounded-full" />
          </div>
          <div className="w-3/4 h-5 bg-primary-200 dark:bg-primary-800 rounded-lg mb-2" />
          <div className="w-full h-8 bg-primary-100 dark:bg-primary-800/50 rounded-lg mb-2" />
          <div className="w-32 h-3 bg-primary-100 dark:bg-primary-800/50 rounded" />
        </div>
        <div className="flex flex-col gap-2">
          <div className="w-16 h-7 bg-primary-200 dark:bg-primary-800 rounded-xl" />
          <div className="w-16 h-7 bg-primary-200 dark:bg-primary-800 rounded-xl" />
        </div>
      </div>
    </div>
  );
}

function SkeletonNoticeList() {
  return (
    <div className="space-y-3">
      {[1, 2, 3, 4, 5].map((i) => (
        <SkeletonNoticeCard key={i} />
      ))}
    </div>
  );
}

function SkeletonDashboard() {
  return (
    <div className="min-h-screen bg-background dark:bg-dark-background font-sans transition-colors duration-300 flex flex-col">
      {/* Navbar skeleton */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-primary-900 shadow-large">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-white/20 animate-pulse" />
              <div className="hidden sm:block space-y-1">
                <div className="w-24 h-3 bg-white/20 rounded animate-pulse" />
                <div className="w-16 h-2 bg-white/10 rounded animate-pulse" />
              </div>
            </div>
            <div className="flex items-center gap-1 bg-white/5 rounded-xl p-1">
              <div className="w-20 h-8 bg-white/20 rounded-lg animate-pulse" />
              <div className="w-20 h-8 bg-white/20 rounded-lg animate-pulse" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-white/20 rounded-xl animate-pulse" />
            <div className="w-8 h-8 bg-white/20 rounded-xl animate-pulse" />
            <div className="w-8 h-8 bg-white/20 rounded-xl animate-pulse" />
          </div>
        </div>
      </nav>

      <div className="h-16 flex-shrink-0" />

      <main className="flex-1 max-w-7xl mx-auto w-full px-5 sm:px-8 py-8">
        {/* Page header skeleton */}
        <div className="mb-8">
          <div className="w-64 h-8 bg-primary-200 dark:bg-primary-800 rounded-lg animate-pulse mb-2" />
          <div className="w-96 h-4 bg-primary-100 dark:bg-primary-800/50 rounded animate-pulse" />
        </div>

        <SkeletonStats />
        <SkeletonFilterTabs />
        <SkeletonNoticeList />
      </main>

      {/* Footer skeleton */}
      <footer className="w-full mt-auto">
        <svg viewBox="0 0 1440 80" xmlns="http://www.w3.org/2000/svg" className="w-full block -mb-1">
          <path d="M0,40 C180,80 360,0 540,40 C720,80 900,0 1080,40 C1260,80 1380,20 1440,40 L1440,80 L0,80 Z" className="fill-primary-800 dark:fill-primary-900" />
        </svg>
        <div className="bg-primary-800 dark:bg-primary-900">
          <div className="max-w-7xl mx-auto px-6 sm:px-8 py-8 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-white/10 border border-white/20 animate-pulse" />
              <div>
                <div className="w-24 h-4 bg-white/20 rounded animate-pulse mb-1" />
                <div className="w-16 h-3 bg-white/10 rounded animate-pulse" />
              </div>
            </div>
            <div className="w-32 h-8 bg-white/10 rounded-full animate-pulse" />
            <div className="w-48 h-3 bg-white/10 rounded animate-pulse" />
          </div>
        </div>
      </footer>
    </div>
  );
}

// ─── Constants with translation keys ────────────────────────────────────────────────

const categories = [
  { value: "development",   labelKey: "officials.categories.development" },
  { value: "health",        labelKey: "officials.categories.health" },
  { value: "education",     labelKey: "officials.categories.education" },
  { value: "agriculture",   labelKey: "officials.categories.agriculture" },
  { value: "employment",    labelKey: "officials.categories.employment" },
  { value: "social_welfare",labelKey: "officials.categories.social_welfare" },
  { value: "tax_billing",   labelKey: "officials.categories.tax_billing" },
  { value: "election",      labelKey: "officials.categories.election" },
  { value: "urgent",        labelKey: "officials.categories.urgent" },
  { value: "general",       labelKey: "officials.categories.general" },
];

const priorities = [
  { value: "low",    labelKey: "officials.priorities.low" },
  { value: "medium", labelKey: "officials.priorities.medium" },
  { value: "high",   labelKey: "officials.priorities.high" },
];

const catColor = {
  development:   "text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30",
  health:        "text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/30",
  education:     "text-violet-600 dark:text-violet-400 bg-violet-100 dark:bg-violet-900/30",
  agriculture:   "text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/30",
  employment:    "text-indigo-600 dark:text-indigo-400 bg-indigo-100 dark:bg-indigo-900/30",
  social_welfare:"text-pink-600 dark:text-pink-400 bg-pink-100 dark:bg-pink-900/30",
  tax_billing:   "text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30",
  election:      "text-orange-600 dark:text-orange-400 bg-orange-100 dark:bg-orange-900/30",
  urgent:        "text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30",
  general:       "text-text-muted dark:text-dark-text-muted bg-accent-mist dark:bg-dark-surface2",
};

// ─── Shared input ─────────────────────────────────────────────────────────────

const inp = "w-full px-4 py-3 rounded-xl border border-border dark:border-dark-border bg-white dark:bg-dark-surface2 text-sm text-text-primary dark:text-dark-text-primary placeholder-text-muted dark:placeholder-dark-text-muted outline-none transition-all duration-200 focus:border-primary-500 dark:focus:border-primary-400 focus:ring-2 focus:ring-primary-500/10";

// ─── Icons ────────────────────────────────────────────────────────────────────

function IcoSpinner() {
  return (
    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
    </svg>
  );
}

function IcoX() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  );
}

function ThemeToggle() {
  const { dark, toggleTheme } = useTheme();
  return (
    <button
      onClick={toggleTheme}
      aria-label="Toggle theme"
      className="p-2 rounded-xl border border-border dark:border-dark-border hover:bg-accent-mist dark:hover:bg-dark-surface2 text-text-muted dark:text-dark-text-muted hover:text-primary-600 dark:hover:text-primary-400 transition-all duration-200"
    >
      {dark ? (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
          <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
        </svg>
      ) : (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/>
        </svg>
      )}
    </button>
  );
}

// ─── Delete Confirm (inline) ──────────────────────────────────────────────────

function DeleteConfirm({ onConfirm, onCancel }) {
  const { t } = useTranslation();
  
  return (
    <div className="bg-white dark:bg-dark-surface border border-red-200 dark:border-red-800 rounded-2xl overflow-hidden mb-4">
      <div className="px-6 py-4 border-b border-red-100 dark:border-red-900/30 bg-red-50/60 dark:bg-red-900/10 flex items-center justify-between">
        <p className="text-sm font-bold text-red-700 dark:text-red-400">{t('officials.delete_confirm.title')}</p>
        <button onClick={onCancel} className="p-1.5 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 text-red-400 transition-all">
          <IcoX />
        </button>
      </div>
      <div className="p-5 flex items-center justify-between gap-4">
        <p className="text-sm text-text-muted dark:text-dark-text-muted">
          {t('officials.delete_confirm.message')}
        </p>
        <div className="flex gap-3 flex-shrink-0">
          <button onClick={onCancel} className="px-4 py-2 border border-border dark:border-dark-border text-text-secondary dark:text-dark-text-secondary text-sm font-semibold rounded-xl hover:bg-accent-mist dark:hover:bg-dark-surface2 transition-all">
            {t('officials.delete_confirm.cancel')}
          </button>
          <button onClick={onConfirm} className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-sm font-semibold rounded-xl transition-all">
            {t('officials.delete_confirm.delete')}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── QR Section (inline) ─────────────────────────────────────────────────────

function QRSection({ village, onDownload, loading, onClose }) {
  const { t } = useTranslation();
  
  return (
    <div className="bg-white dark:bg-dark-surface border border-border dark:border-dark-border rounded-2xl overflow-hidden mb-4">
      <div className="flex items-center justify-between px-6 py-4 border-b border-border dark:border-dark-border bg-accent-mist dark:bg-dark-surface2">
        <h3 className="text-sm font-bold text-text-primary dark:text-dark-text-primary">{t('officials.qr.title')}</h3>
        <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-border dark:hover:bg-dark-border text-text-muted dark:text-dark-text-muted transition-all">
          <IcoX />
        </button>
      </div>
      <div className="p-6">
        {!village ? (
          <p className="text-sm text-text-muted dark:text-dark-text-muted text-center py-4">{t('officials.qr.no_village')}</p>
        ) : (
          <div className="flex items-center justify-between gap-4 bg-accent-mist dark:bg-dark-surface2 border border-border dark:border-dark-border rounded-2xl p-5">
            <div>
              <p className="text-base font-bold text-text-primary dark:text-dark-text-primary">{village.name}</p>
              <p className="text-xs text-text-muted dark:text-dark-text-muted mt-0.5">{village.district}, {village.state}</p>
              <p className={`text-xs font-semibold mt-2 ${village.qrCode && village.qrCode.imageUrl ? 'text-primary-600 dark:text-primary-400' : 'text-text-muted dark:text-dark-text-muted'}`}>
                {village.qrCode && village.qrCode.imageUrl ? t('officials.qr.ready') : t('officials.qr.not_generated')}
              </p>
            </div>
            <button
              onClick={() => onDownload(village)}
              disabled={loading}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary-600 hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-400 text-white text-sm font-semibold rounded-xl transition-all shadow-soft disabled:opacity-60 flex-shrink-0"
            >
              {loading && <IcoSpinner />}
              {loading ? t('officials.qr.waiting') : t('officials.qr.download')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── File Viewer (inline expandable) ─────────────────────────────────────────

function FileViewer({ notice, onClose }) {
  const { t } = useTranslation();
  const ext = notice.fileUrl ? notice.fileUrl.split('.').pop().toLowerCase() : '';
  const isImage = ['jpg','jpeg','png','gif','webp'].includes(ext);
  const isPdf = ext === 'pdf';
  
  return (
    <div className="bg-white dark:bg-dark-surface border border-border dark:border-dark-border rounded-2xl overflow-hidden mb-4">
      <div className="flex items-center justify-between px-6 py-4 border-b border-border dark:border-dark-border bg-accent-mist dark:bg-dark-surface2">
        <div className="flex-1 min-w-0 pr-4">
          <p className="text-sm font-bold text-text-primary dark:text-dark-text-primary truncate">{notice.title}</p>
          <p className="text-xs text-text-muted dark:text-dark-text-muted mt-0.5">{t('officials.file_viewer.attachment')}</p>
        </div>
        <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-border dark:hover:bg-dark-border text-text-muted dark:text-dark-text-muted transition-all flex-shrink-0">
          <IcoX />
        </button>
      </div>
      <div className="p-6 space-y-4">
        <div className="bg-accent-mist dark:bg-dark-surface2 rounded-xl p-4">
          <p className="text-sm text-text-secondary dark:text-dark-text-secondary leading-relaxed">{notice.description}</p>
        </div>
        {isImage && (
          <img src={notice.fileUrl} alt="Attachment" className="w-full max-h-80 object-contain rounded-xl border border-border dark:border-dark-border bg-white dark:bg-dark-surface" />
        )}
        {isPdf && (
          <iframe src={notice.fileUrl} className="w-full h-72 rounded-xl border border-border dark:border-dark-border" title="PDF" />
        )}
        <a href={notice.fileUrl} target="_blank" rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-sm font-semibold px-5 py-2.5 bg-primary-600 hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-400 text-white rounded-xl transition-all shadow-soft">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
          </svg>
          {t('officials.file_viewer.download')}
        </a>
      </div>
    </div>
  );
}

// ─── Notice Form (inline) ─────────────────────────────────────────────────────

function NoticeForm({ initial, onSave, onCancel, saving, onDelete }) {
  const { t } = useTranslation();
  const [title, setTitle]           = useState(initial ? initial.title : '');
  const [description, setDescription] = useState(initial ? (initial.description || '') : '');
  const [category, setCategory]     = useState(initial ? (initial.category || 'general') : 'general');
  const [priority, setPriority]     = useState(initial ? (initial.priority || 'medium') : 'medium');
  const [isPinned, setIsPinned]     = useState(initial ? (initial.isPinned || false) : false);
  const [file, setFile]             = useState(null);

  function handleSubmit(e) {
    e.preventDefault();
    if (!title.trim() || !description.trim()) { 
      toast.error(t('officials.notice_form.fill_required')); 
      return; 
    }
    const fd = new FormData();
    fd.append('title', title.trim());
    fd.append('description', description.trim());
    fd.append('category', category);
    fd.append('priority', priority);
    fd.append('isPinned', isPinned);
    if (file) fd.append('file', file);
    onSave(fd);
  }

  return (
    <div className="bg-white dark:bg-dark-surface border border-border dark:border-dark-border rounded-2xl overflow-hidden mb-4">
      <div className="flex items-center justify-between px-6 py-4 border-b border-border dark:border-dark-border bg-accent-mist dark:bg-dark-surface2">
        <h3 className="text-sm font-bold text-text-primary dark:text-dark-text-primary">
          {initial ? t('officials.notice_form.edit_title') : t('officials.notice_form.new_title')}
        </h3>
        <button type="button" onClick={onCancel} className="p-1.5 rounded-lg hover:bg-border dark:hover:bg-dark-border text-text-muted dark:text-dark-text-muted transition-all">
          <IcoX />
        </button>
      </div>
      <form onSubmit={handleSubmit} className="p-6 space-y-4">
        <div>
          <label className="block text-xs font-semibold text-text-secondary dark:text-dark-text-secondary mb-1.5">{t('officials.notice_form.title')} *</label>
          <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder={t('officials.notice_form.title_placeholder')} required className={inp} />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-text-secondary dark:text-dark-text-secondary mb-1.5">{t('officials.notice_form.category')}</label>
            <select value={category} onChange={(e) => setCategory(e.target.value)} className={inp}>
              {categories.map((cat) => <option key={cat.value} value={cat.value}>{t(cat.labelKey)}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-text-secondary dark:text-dark-text-secondary mb-1.5">{t('officials.notice_form.priority')}</label>
            <select value={priority} onChange={(e) => setPriority(e.target.value)} className={inp}>
              {priorities.map((pri) => <option key={pri.value} value={pri.value}>{t(pri.labelKey)}</option>)}
            </select>
          </div>
        </div>

        <div
          onClick={() => setIsPinned(!isPinned)}
          className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-all ${isPinned ? 'bg-accent-mist dark:bg-dark-surface2 border-primary-200 dark:border-primary-700' : 'bg-accent-mist/50 dark:bg-dark-surface2/50 border-border dark:border-dark-border'}`}
        >
          <div className={`w-10 h-[22px] rounded-full relative flex-shrink-0 transition-all ${isPinned ? 'bg-primary-600 dark:bg-primary-500' : 'bg-border dark:bg-dark-border'}`}>
            <div className={`w-4 h-4 bg-white rounded-full absolute top-[3px] shadow-sm transition-all ${isPinned ? 'left-[22px]' : 'left-[3px]'}`} />
          </div>
          <div>
            <p className="text-sm font-semibold text-text-primary dark:text-dark-text-primary">{t('officials.notice_form.pin_to_top')}</p>
            <p className="text-xs text-text-muted dark:text-dark-text-muted">{t('officials.notice_form.pin_description')}</p>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-text-secondary dark:text-dark-text-secondary mb-1.5">{t('officials.notice_form.description')} *</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder={t('officials.notice_form.description_placeholder')} rows={4} required className={`${inp} resize-none`} />
        </div>

        <div>
          <label className="block text-xs font-semibold text-text-secondary dark:text-dark-text-secondary mb-1.5">{t('officials.notice_form.attachment')}</label>
          <label htmlFor="notice-file" className="flex items-center gap-3 w-full px-4 py-3 rounded-xl border border-dashed border-border dark:border-dark-border bg-accent-mist dark:bg-dark-surface2 hover:border-primary-400 cursor-pointer transition-all group">
            <svg className="w-5 h-5 text-text-muted dark:text-dark-text-muted group-hover:text-primary-600 dark:group-hover:text-primary-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/>
              <path d="M20.39 18.39A5 5 0 0018 9h-1.26A8 8 0 103 16.3"/>
            </svg>
            <span className={`text-sm ${file ? 'text-text-primary dark:text-dark-text-primary font-medium' : 'text-text-muted dark:text-dark-text-muted'}`}>
              {file ? file.name : t('officials.notice_form.attachment_placeholder')}
            </span>
            <input id="notice-file" type="file" className="hidden" accept=".pdf,.doc,.docx,.jpg,.jpeg,.png" onChange={(e) => setFile(e.target.files[0])} />
          </label>
        </div>

        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onCancel} className="flex-1 py-2.5 border border-border dark:border-dark-border text-text-secondary dark:text-dark-text-secondary text-sm font-semibold rounded-xl hover:bg-accent-mist dark:hover:bg-dark-surface2 transition-all">
            {t('officials.notice_form.cancel')}
          </button>
          <button type="submit" disabled={saving || !title.trim() || !description.trim()} className="flex-1 py-2.5 bg-primary-600 hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-400 text-white text-sm font-semibold rounded-xl transition-all shadow-soft disabled:opacity-60 flex items-center justify-center gap-2">
            {saving && <IcoSpinner />}
            {saving ? t('officials.notice_form.saving') : initial ? t('officials.notice_form.update') : t('officials.notice_form.publish')}
          </button>
        </div>

        {initial && (
          <button type="button" onClick={onDelete}
            className="w-full py-2.5 border border-border dark:border-dark-border hover:border-red-300 dark:hover:border-red-700 text-text-secondary dark:text-dark-text-secondary hover:text-red-500 text-sm font-semibold rounded-xl transition-all">
            {t('officials.notice_form.delete')}
          </button>
        )}
      </form>
    </div>
  );
}

// ─── Notice Card ──────────────────────────────────────────────────────────────

function NoticeCard({ notice, onEdit, onDelete, onView }) {
  const { t } = useTranslation();
  const isUrgent = notice.priority === 'high' || notice.category === 'urgent';
  const isActive = notice.status === 'published';
  const catCls = catColor[notice.category] || catColor.general;
  const catLabel = categories.find((c) => c.value === notice.category);
  const label = catLabel ? t(catLabel.labelKey) : t('officials.categories.general');

  return (
    <div className={`bg-white dark:bg-dark-surface border rounded-2xl p-5 transition-all duration-200 hover:shadow-medium dark:hover:shadow-dark-medium hover:-translate-y-0.5 ${
      isUrgent ? 'border-red-200 dark:border-red-800' : 'border-border dark:border-dark-border hover:border-primary-200 dark:hover:border-primary-800'
    } ${!isActive ? 'opacity-60' : ''}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-2">
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${catCls}`}>{label}</span>
            {notice.isPinned && (
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400">{t('officials.notice_card.pinned')}</span>
            )}
            {isUrgent && (
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400">{t('officials.notice_card.urgent')}</span>
            )}
            {notice.fileUrl && (
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400">{t('officials.notice_card.file')}</span>
            )}
          </div>
          <p className="text-sm font-bold text-text-primary dark:text-dark-text-primary mb-1 leading-snug">{notice.title}</p>
          <p className="text-xs text-text-secondary dark:text-dark-text-secondary leading-relaxed line-clamp-2">{notice.description}</p>
          <p className="text-xs text-text-muted dark:text-dark-text-muted mt-2">
            {notice.createdAt ? new Date(notice.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : ''}
            {notice.views !== undefined ? ` · ${notice.views} ${t('officials.notice_card.views')}` : ''}
          </p>
        </div>
        <div className="flex flex-col gap-2 flex-shrink-0">
          <button onClick={() => onEdit(notice)}
            className="px-3 py-1.5 text-xs font-semibold bg-accent-mist dark:bg-dark-surface2 hover:bg-primary-100 dark:hover:bg-primary-900/30 text-primary-600 dark:text-primary-400 rounded-xl border border-border dark:border-dark-border hover:border-primary-200 dark:hover:border-primary-700 transition-all">
            {t('officials.notice_card.edit')}
          </button>
          {notice.fileUrl && (
            <button onClick={() => onView(notice)}
              className="px-3 py-1.5 text-xs font-semibold bg-accent-mist dark:bg-dark-surface2 text-text-secondary dark:text-dark-text-secondary rounded-xl border border-border dark:border-dark-border hover:border-primary-200 transition-all">
              {t('officials.notice_card.view')}
            </button>
          )}
          <button onClick={() => onDelete(notice._id)}
            className="px-3 py-1.5 text-xs font-semibold bg-red-50 dark:bg-red-900/20 text-red-500 dark:text-red-400 rounded-xl border border-red-100 dark:border-red-800 hover:bg-red-100 transition-all">
            {t('officials.notice_card.delete')}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Footer ───────────────────────────────────────────────────────────────────

function Footer({ village, noticeCount }) {
  const { t } = useTranslation();
  
  return (
    <footer className="w-full mt-auto">
      <svg viewBox="0 0 1440 80" xmlns="http://www.w3.org/2000/svg" className="w-full block -mb-1">
        <path d="M0,40 C180,80 360,0 540,40 C720,80 900,0 1080,40 C1260,80 1380,20 1440,40 L1440,80 L0,80 Z" className="fill-primary-800 dark:fill-primary-900" />
      </svg>
      <div className="bg-primary-800 dark:bg-primary-900">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 py-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-white/10 border border-white/20 flex items-center justify-center overflow-hidden flex-shrink-0">
              <img src="/gramvarthalogo.png" alt="GramVartha" className="w-full h-full object-contain" />
            </div>
            <div>
              <p className="text-sm font-bold text-white">GramVartha</p>
              <p className="text-xs text-primary-300">{t('officials.footer.portal')}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-2">
            <span className="w-2 h-2 bg-primary-400 rounded-full animate-pulse flex-shrink-0" />
            <span className="text-xs text-white/60 font-medium whitespace-nowrap">
              {village ? village.name : t('officials.footer.village')} · {noticeCount} {t('officials.footer.notices')}
            </span>
          </div>
          <p className="text-xs text-white/30 whitespace-nowrap">© {new Date().getFullYear()} GramVartha. {t('officials.footer.rights')}</p>
        </div>
      </div>
    </footer>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ══════════════════════════════════════════════════════════════════════════════

const PAGE_TABS = [
  { key: 'notices',    labelKey: 'officials.tabs.notices', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
  { key: 'complaints', labelKey: 'officials.tabs.complaints', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
];

const FILTER_TABS = [
  { key: 'all',    labelKey: 'officials.filters.all' },
  { key: 'active', labelKey: 'officials.filters.active' },
  { key: 'pinned', labelKey: 'officials.filters.pinned' },
  { key: 'urgent', labelKey: 'officials.filters.urgent' },
];

export default function OfficialsDashboard() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [notices, setNotices]               = useState([]);
  const [loading, setLoading]               = useState(true);
  const [saving, setSaving]                 = useState(false);
  const [officialVillageId, setOfficialVillageId] = useState(null);
  const [officialVillage, setOfficialVillage]     = useState(null);
  const [activeTab, setActiveTab]           = useState('all');
  const [activePage, setActivePage]         = useState('notices');
  const [noticeForm, setNoticeForm]         = useState(null);
  const [deleteTarget, setDeleteTarget]     = useState(null);
  const [viewNotice, setViewNotice]         = useState(null);
  const [showQr, setShowQr]                 = useState(false);
  const [qrLoading, setQrLoading]           = useState(false);

  useEffect(() => { 
    fetchNotices(); 
    fetchOfficialProfile();
  }, []);

  async function fetchNotices() {
    try {
      setLoading(true);
      const profileRes = await axios.get(`${API_BASE_URL}/officials/profile`, { withCredentials: true });
      const villageId = profileRes.data && profileRes.data.village
        ? (profileRes.data.village._id || profileRes.data.village)
        : null;
      if (!villageId) { 
        toast.error(t('officials.errors.no_village')); 
        setNotices([]); 
        return; 
      }
      setOfficialVillageId(villageId);
      const noticesRes = await axios.get(`${API_BASE_URL}/notice/village/${villageId}`, { withCredentials: true });
      setNotices(Array.isArray(noticesRes.data && noticesRes.data.notices) ? noticesRes.data.notices : []);
    } catch(e) { 
      toast.error(t('officials.errors.load_failed')); 
      setNotices([]); 
    } finally { 
      setLoading(false); 
    }
  }

  async function fetchOfficialProfile() {
    try {
      const res = await axios.get(`${API_BASE_URL}/officials/profile`, { withCredentials: true });
      if (res.data && res.data.village) {
        const vid = res.data.village._id || res.data.village;
        setOfficialVillage(res.data.village);
        try {
          const qrRes = await axios.get(`${API_BASE_URL}/villages/${vid}/qrcode`, { withCredentials: true });
          if (qrRes.data && qrRes.data.village) {
            setOfficialVillage(prev => ({ ...prev, qrCode: qrRes.data.village.qrCode }));
          }
        } catch(e) {}
      }
    } catch(e) {}
  }

  async function handleSave(fd) {
    setSaving(true);
    if (noticeForm && noticeForm !== 'new') {
      fd.append('noticeId', noticeForm._id);
    } else {
      if (officialVillageId) fd.append('village', officialVillageId);
    }
    try {
      await axios.post(`${API_BASE_URL}/notice/upload`, fd, { 
        headers: { 'Content-Type': 'multipart/form-data' }, 
        withCredentials: true 
      });
      toast.success(noticeForm && noticeForm !== 'new' ? t('officials.success.updated') : t('officials.success.published'));
      setNoticeForm(null);
      fetchNotices();
    } catch(err) {
      toast.error(err.response && err.response.data && err.response.data.message ? err.response.data.message : t('officials.errors.save_failed'));
    } finally { 
      setSaving(false); 
    }
  }

  async function handleDelete(id) {
    try {
      await axios.delete(`${API_BASE_URL}/notice/delete/${id}`, { withCredentials: true });
      toast.success(t('officials.success.deleted'));
      setDeleteTarget(null);
      setNoticeForm(null);
      fetchNotices();
    } catch(e) { 
      toast.error(t('officials.errors.delete_failed')); 
    }
  }

  async function generateAndShareQr(village) {
    try {
      setQrLoading(true);
      const res = await axios.post(`${API_BASE_URL}/villages/${village._id}/qrcode/generate`, {}, { withCredentials: true });
      const imageUrl = res.data && res.data.village && res.data.village.qrCode
        ? res.data.village.qrCode.imageUrl
        : (res.data && res.data.downloadUrl ? res.data.downloadUrl : null);
      const qrUrl = imageUrl || `${window.location.origin}/qr-notices/${village._id}`;
      if (navigator.share && navigator.canShare && imageUrl) {
        try {
          const blob = await (await fetch(imageUrl)).blob();
          const f = new File([blob], `${(village.name || 'village').replace(/\s+/g, '_')}.png`, { type: blob.type });
          if (navigator.canShare({ files: [f] })) { 
            await navigator.share({ files: [f], title: village.name, text: qrUrl }); 
            toast.success(t('officials.success.shared')); 
            return; 
          }
        } catch(e) {}
      }
      const finalUrl = imageUrl ? imageUrl : await (await import('qrcode')).default.toDataURL(qrUrl, { margin: 1, width: 400 });
      const a = document.createElement('a'); 
      a.href = finalUrl; 
      a.download = `${(village.name || 'village').replace(/\s+/g, '_')}.png`;
      document.body.appendChild(a); 
      a.click(); 
      a.remove();
      toast.success(t('officials.success.downloaded'));
    } catch(err) {
      toast.error(err.response && err.response.data && err.response.data.message ? err.response.data.message : t('officials.errors.qr_failed'));
    } finally { 
      setQrLoading(false); 
    }
  }

  async function handleLogout() {
    try {
      await axios.post(`${API_BASE_URL}/officials/logout`, {}, { withCredentials: true });
      toast.info(t('officials.success.logged_out')); 
      navigate('/');
    } catch(e) { 
      toast.error(t('officials.errors.logout_failed')); 
    }
  }

  const isActive = (n) => n && n.status === 'published';

  const stats = {
    total:  notices.length,
    active: notices.filter(isActive).length,
    pinned: notices.filter(n => n && n.isPinned).length,
    urgent: notices.filter(n => n && (n.priority === 'high' || n.category === 'urgent')).length,
  };

  const filtered = notices.filter(n => {
    if (activeTab === 'active') return isActive(n);
    if (activeTab === 'pinned') return n && n.isPinned;
    if (activeTab === 'urgent') return n && (n.priority === 'high' || n.category === 'urgent');
    return true;
  });

  const statCards = [
    { labelKey: 'officials.stats.total', value: stats.total, iconCls: 'text-primary-600 dark:text-primary-400', bgCls: 'bg-primary-100 dark:bg-primary-900/40',
      icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
    { labelKey: 'officials.stats.active', value: stats.active, iconCls: 'text-sky-600 dark:text-sky-400', bgCls: 'bg-sky-100 dark:bg-sky-900/30',
      icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' },
    { labelKey: 'officials.stats.pinned', value: stats.pinned, iconCls: 'text-amber-600 dark:text-amber-400', bgCls: 'bg-amber-100 dark:bg-amber-900/30',
      icon: 'M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z' },
    { labelKey: 'officials.stats.urgent', value: stats.urgent, iconCls: 'text-red-600 dark:text-red-400', bgCls: 'bg-red-100 dark:bg-red-900/30',
      icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z' },
  ];

  // Show skeleton while loading
  if (loading) {
    return <SkeletonDashboard />;
  }

  return (
    <div className="min-h-screen bg-background dark:bg-dark-background font-sans transition-colors duration-300 flex flex-col">

      {/* ── Nav ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-primary-900 shadow-large transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 h-16 flex items-center justify-between gap-4">

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center overflow-hidden flex-shrink-0">
                <img src="/gramvarthalogo.png" alt="GramVartha" className="w-full h-full object-contain" />
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-bold text-white leading-none">GramVartha</p>
                <p className="text-xs text-white/40 mt-0.5">{t('officials.nav.portal')}</p>
              </div>
            </div>

            {/* Page tabs */}
            <div className="flex items-center gap-1 bg-white/5 rounded-xl p-1">
              {PAGE_TABS.map((tab) => (
                <button key={tab.key} onClick={() => setActivePage(tab.key)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all duration-150 ${
                    activePage === tab.key ? 'bg-white text-primary-900 shadow-sm' : 'text-white/60 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d={tab.icon} />
                  </svg>
                  {t(tab.labelKey)}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <button
              onClick={async () => { await fetchOfficialProfile(); setShowQr(true); }}
              className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl border border-white/20 hover:bg-white/10 text-white/60 hover:text-white text-xs font-medium transition-all"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
                <rect x="3" y="14" width="7" height="7"/><path d="M14 14h3v3h-3zM17 17h3v3h-3zM14 20h3"/>
              </svg>
              {t('officials.nav.village_qr')}
            </button>
            <button
              onClick={() => navigate('/officials/profile')}
              className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl border border-white/20 hover:bg-white/10 text-white/60 hover:text-white text-xs font-medium transition-all"
            >
              {t('officials.nav.profile')}
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-white/20 hover:bg-red-900/40 hover:border-red-700 text-white/60 hover:text-red-300 text-xs font-medium transition-all"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/>
              </svg>
              <span className="hidden sm:block">{t('officials.nav.logout')}</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Nav spacer */}
      <div className="h-16 flex-shrink-0" />

      {/* ── Complaints page ── */}
      {activePage === 'complaints' && (
        <div className="flex-1">
          <ComplaintsDashboard />
        </div>
      )}

      {/* ── Notices page ── */}
      {activePage === 'notices' && (
        <main className="flex-1 max-w-7xl mx-auto w-full px-5 sm:px-8 py-8">

          {/* Page header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-text-primary dark:text-dark-text-primary tracking-tight">{t('officials.notices.title')}</h1>
            <p className="text-sm text-text-muted dark:text-dark-text-muted mt-1">{t('officials.notices.subtitle')}</p>
          </div>

          {/* Inline panels */}
          {showQr && (
            <QRSection
              village={officialVillage}
              onDownload={generateAndShareQr}
              loading={qrLoading}
              onClose={() => setShowQr(false)}
            />
          )}

          {deleteTarget && (
            <DeleteConfirm
              onConfirm={() => handleDelete(deleteTarget)}
              onCancel={() => setDeleteTarget(null)}
            />
          )}

          {viewNotice && (
            <FileViewer
              notice={viewNotice}
              onClose={() => setViewNotice(null)}
            />
          )}

          {noticeForm !== null && (
            <NoticeForm
              initial={noticeForm === 'new' ? null : noticeForm}
              onSave={handleSave}
              onCancel={() => setNoticeForm(null)}
              saving={saving}
              onDelete={noticeForm !== 'new' ? () => { setDeleteTarget(noticeForm._id); setNoticeForm(null); } : null}
            />
          )}

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {statCards.map((stat) => (
              <div key={stat.labelKey} className="bg-white dark:bg-dark-surface border border-border dark:border-dark-border rounded-2xl p-5 shadow-soft">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-4 ${stat.bgCls}`}>
                  <svg className={`w-4 h-4 ${stat.iconCls}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d={stat.icon} />
                  </svg>
                </div>
                <p className="text-3xl font-bold text-text-primary dark:text-dark-text-primary">{stat.value}</p>
                <p className="text-xs text-text-muted dark:text-dark-text-muted mt-1.5 font-medium">{t(stat.labelKey)}</p>
              </div>
            ))}
          </div>

          {/* Filter tabs + New button */}
          <div className="flex items-center justify-between gap-4 mb-5 flex-wrap">
            <div className="flex items-center gap-2 bg-white dark:bg-dark-surface border border-border dark:border-dark-border rounded-xl p-1">
              {FILTER_TABS.map((filter) => {
                const count = filter.key === 'all' ? stats.total : filter.key === 'active' ? stats.active : filter.key === 'pinned' ? stats.pinned : stats.urgent;
                return (
                  <button key={filter.key} onClick={() => setActiveTab(filter.key)}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition-all duration-150 ${
                      activeTab === filter.key
                        ? 'bg-primary-600 dark:bg-primary-700 text-white shadow-soft'
                        : 'text-text-muted dark:text-dark-text-muted hover:text-text-primary dark:hover:text-dark-text-primary'
                    }`}
                  >
                    {t(filter.labelKey)}
                    <span className={`text-[10px] font-bold min-w-[16px] h-4 px-1 flex items-center justify-center rounded-full ${
                      activeTab === filter.key ? 'bg-white/20 text-white' : 'bg-accent-mist dark:bg-dark-surface2 text-text-muted dark:text-dark-text-muted'
                    }`}>{count}</span>
                  </button>
                );
              })}
            </div>
            {noticeForm === null && (
              <button onClick={() => { setNoticeForm('new'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                className="inline-flex items-center gap-2 text-sm font-semibold px-5 py-2.5 bg-primary-600 hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-400 text-white rounded-xl transition-all shadow-soft">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
                {t('officials.notices.new_notice')}
              </button>
            )}
          </div>

          {/* Notice list */}
          {filtered.length === 0 ? (
            <div className="bg-white dark:bg-dark-surface border border-border dark:border-dark-border rounded-2xl flex flex-col items-center justify-center py-16 gap-3 text-center">
              <div className="w-12 h-12 rounded-2xl bg-accent-mist dark:bg-dark-surface2 border border-border dark:border-dark-border flex items-center justify-center mb-1">
                <svg className="w-5 h-5 text-primary-500 dark:text-primary-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                </svg>
              </div>
              <p className="text-sm font-semibold text-text-primary dark:text-dark-text-primary">{t('officials.notices.no_notices')}</p>
              <p className="text-xs text-text-muted dark:text-dark-text-muted">{t('officials.notices.no_notices_desc')}</p>
              <button onClick={() => setNoticeForm('new')}
                className="mt-2 px-5 py-2.5 bg-primary-600 hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-400 text-white text-sm font-semibold rounded-xl transition-all shadow-soft">
                {t('officials.notices.publish_first')}
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map((notice) => (
                <NoticeCard
                  key={notice._id}
                  notice={notice}
                  onEdit={(n) => { setNoticeForm(n); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  onDelete={(id) => setDeleteTarget(id)}
                  onView={(n) => { setViewNotice(n); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                />
              ))}
            </div>
          )}
        </main>
      )}

      {/* ── Footer ── */}
      <Footer village={officialVillage} noticeCount={notices.length} />

    </div>
  );
}