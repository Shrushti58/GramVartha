import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import ComplaintsDashboard from "../pages/Complaintsdashboard";
import { useTheme } from "../context/ThemeContext";

// ─── Constants ────────────────────────────────────────────────────────────────

const categories = [
  { value: "development",   label: "Development"   },
  { value: "health",        label: "Health"        },
  { value: "education",     label: "Education"     },
  { value: "agriculture",   label: "Agriculture"   },
  { value: "employment",    label: "Employment"    },
  { value: "social_welfare",label: "Social Welfare"},
  { value: "tax_billing",   label: "Tax & Billing" },
  { value: "election",      label: "Election"      },
  { value: "urgent",        label: "Urgent"        },
  { value: "general",       label: "General"       },
];

const priorities = [
  { value: "low",    label: "Low"    },
  { value: "medium", label: "Medium" },
  { value: "high",   label: "High"   },
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
  return (
    <div className="bg-white dark:bg-dark-surface border border-red-200 dark:border-red-800 rounded-2xl overflow-hidden mb-4">
      <div className="px-6 py-4 border-b border-red-100 dark:border-red-900/30 bg-red-50/60 dark:bg-red-900/10 flex items-center justify-between">
        <p className="text-sm font-bold text-red-700 dark:text-red-400">Delete this notice?</p>
        <button onClick={onCancel} className="p-1.5 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 text-red-400 transition-all">
          <IcoX />
        </button>
      </div>
      <div className="p-5 flex items-center justify-between gap-4">
        <p className="text-sm text-text-muted dark:text-dark-text-muted">
          This cannot be undone. Citizens will no longer see this notice.
        </p>
        <div className="flex gap-3 flex-shrink-0">
          <button onClick={onCancel} className="px-4 py-2 border border-border dark:border-dark-border text-text-secondary dark:text-dark-text-secondary text-sm font-semibold rounded-xl hover:bg-accent-mist dark:hover:bg-dark-surface2 transition-all">
            Cancel
          </button>
          <button onClick={onConfirm} className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-sm font-semibold rounded-xl transition-all">
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── QR Section (inline) ─────────────────────────────────────────────────────

function QRSection({ village, onDownload, loading, onClose }) {
  return (
    <div className="bg-white dark:bg-dark-surface border border-border dark:border-dark-border rounded-2xl overflow-hidden mb-4">
      <div className="flex items-center justify-between px-6 py-4 border-b border-border dark:border-dark-border bg-accent-mist dark:bg-dark-surface2">
        <h3 className="text-sm font-bold text-text-primary dark:text-dark-text-primary">Village QR Code</h3>
        <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-border dark:hover:bg-dark-border text-text-muted dark:text-dark-text-muted transition-all">
          <IcoX />
        </button>
      </div>
      <div className="p-6">
        {!village ? (
          <p className="text-sm text-text-muted dark:text-dark-text-muted text-center py-4">No village linked to your account.</p>
        ) : (
          <div className="flex items-center justify-between gap-4 bg-accent-mist dark:bg-dark-surface2 border border-border dark:border-dark-border rounded-2xl p-5">
            <div>
              <p className="text-base font-bold text-text-primary dark:text-dark-text-primary">{village.name}</p>
              <p className="text-xs text-text-muted dark:text-dark-text-muted mt-0.5">{village.district}, {village.state}</p>
              <p className={`text-xs font-semibold mt-2 ${village.qrCode && village.qrCode.imageUrl ? 'text-primary-600 dark:text-primary-400' : 'text-text-muted dark:text-dark-text-muted'}`}>
                {village.qrCode && village.qrCode.imageUrl ? 'QR ready to download' : 'Not generated yet'}
              </p>
            </div>
            <button
              onClick={function() { onDownload(village); }}
              disabled={loading}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary-600 hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-400 text-white text-sm font-semibold rounded-xl transition-all shadow-soft disabled:opacity-60 flex-shrink-0"
            >
              {loading ? <IcoSpinner /> : null}
              {loading ? 'Please wait...' : 'Download QR'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── File Viewer (inline expandable) ─────────────────────────────────────────

function FileViewer({ notice, onClose }) {
  const ext = notice.fileUrl ? notice.fileUrl.split('.').pop().toLowerCase() : '';
  const isImage = ['jpg','jpeg','png','gif','webp'].includes(ext);
  const isPdf = ext === 'pdf';
  return (
    <div className="bg-white dark:bg-dark-surface border border-border dark:border-dark-border rounded-2xl overflow-hidden mb-4">
      <div className="flex items-center justify-between px-6 py-4 border-b border-border dark:border-dark-border bg-accent-mist dark:bg-dark-surface2">
        <div className="flex-1 min-w-0 pr-4">
          <p className="text-sm font-bold text-text-primary dark:text-dark-text-primary truncate">{notice.title}</p>
          <p className="text-xs text-text-muted dark:text-dark-text-muted mt-0.5">Attachment</p>
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
          Download File
        </a>
      </div>
    </div>
  );
}

// ─── Notice Form (inline) ─────────────────────────────────────────────────────

function NoticeForm({ initial, onSave, onCancel, saving, onDelete }) {
  const [title, setTitle]           = useState(initial ? initial.title : '');
  const [description, setDescription] = useState(initial ? (initial.description || '') : '');
  const [category, setCategory]     = useState(initial ? (initial.category || 'general') : 'general');
  const [priority, setPriority]     = useState(initial ? (initial.priority || 'medium') : 'medium');
  const [isPinned, setIsPinned]     = useState(initial ? (initial.isPinned || false) : false);
  const [file, setFile]             = useState(null);

  function handleSubmit(e) {
    e.preventDefault();
    if (!title.trim() || !description.trim()) { toast.error('Fill in title and description'); return; }
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
          {initial ? 'Edit Notice' : 'Publish New Notice'}
        </h3>
        <button type="button" onClick={onCancel} className="p-1.5 rounded-lg hover:bg-border dark:hover:bg-dark-border text-text-muted dark:text-dark-text-muted transition-all">
          <IcoX />
        </button>
      </div>
      <form onSubmit={handleSubmit} className="p-6 space-y-4">
        <div>
          <label className="block text-xs font-semibold text-text-secondary dark:text-dark-text-secondary mb-1.5">Title *</label>
          <input type="text" value={title} onChange={function(e) { setTitle(e.target.value); }} placeholder="Notice title" required className={inp} />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-text-secondary dark:text-dark-text-secondary mb-1.5">Category</label>
            <select value={category} onChange={function(e) { setCategory(e.target.value); }} className={inp}>
              {categories.map(function(c) { return <option key={c.value} value={c.value}>{c.label}</option>; })}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-text-secondary dark:text-dark-text-secondary mb-1.5">Priority</label>
            <select value={priority} onChange={function(e) { setPriority(e.target.value); }} className={inp}>
              {priorities.map(function(p) { return <option key={p.value} value={p.value}>{p.label}</option>; })}
            </select>
          </div>
        </div>

        <div
          onClick={function() { setIsPinned(function(p) { return !p; }); }}
          className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-all ${isPinned ? 'bg-accent-mist dark:bg-dark-surface2 border-primary-200 dark:border-primary-700' : 'bg-accent-mist/50 dark:bg-dark-surface2/50 border-border dark:border-dark-border'}`}
        >
          <div className={`w-10 h-[22px] rounded-full relative flex-shrink-0 transition-all ${isPinned ? 'bg-primary-600 dark:bg-primary-500' : 'bg-border dark:bg-dark-border'}`}>
            <div className={`w-4 h-4 bg-white rounded-full absolute top-[3px] shadow-sm transition-all ${isPinned ? 'left-[22px]' : 'left-[3px]'}`} />
          </div>
          <div>
            <p className="text-sm font-semibold text-text-primary dark:text-dark-text-primary">Pin to top</p>
            <p className="text-xs text-text-muted dark:text-dark-text-muted">Show first in the notice board</p>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-text-secondary dark:text-dark-text-secondary mb-1.5">Description *</label>
          <textarea value={description} onChange={function(e) { setDescription(e.target.value); }} placeholder="Write the notice details here..." rows={4} required className={`${inp} resize-none`} />
        </div>

        <div>
          <label className="block text-xs font-semibold text-text-secondary dark:text-dark-text-secondary mb-1.5">Attachment (optional)</label>
          <label htmlFor="notice-file" className="flex items-center gap-3 w-full px-4 py-3 rounded-xl border border-dashed border-border dark:border-dark-border bg-accent-mist dark:bg-dark-surface2 hover:border-primary-400 cursor-pointer transition-all group">
            <svg className="w-5 h-5 text-text-muted dark:text-dark-text-muted group-hover:text-primary-600 dark:group-hover:text-primary-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/>
              <path d="M20.39 18.39A5 5 0 0018 9h-1.26A8 8 0 103 16.3"/>
            </svg>
            <span className={`text-sm ${file ? 'text-text-primary dark:text-dark-text-primary font-medium' : 'text-text-muted dark:text-dark-text-muted'}`}>
              {file ? file.name : 'PDF or Image, max 5MB'}
            </span>
            <input id="notice-file" type="file" className="hidden" accept=".pdf,.doc,.docx,.jpg,.jpeg,.png" onChange={function(e) { setFile(e.target.files[0]); }} />
          </label>
        </div>

        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onCancel} className="flex-1 py-2.5 border border-border dark:border-dark-border text-text-secondary dark:text-dark-text-secondary text-sm font-semibold rounded-xl hover:bg-accent-mist dark:hover:bg-dark-surface2 transition-all">
            Cancel
          </button>
          <button type="submit" disabled={saving || !title.trim() || !description.trim()} className="flex-1 py-2.5 bg-primary-600 hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-400 text-white text-sm font-semibold rounded-xl transition-all shadow-soft disabled:opacity-60 flex items-center justify-center gap-2">
            {saving ? <IcoSpinner /> : null}
            {saving ? 'Saving...' : initial ? 'Update Notice' : 'Publish Notice'}
          </button>
        </div>

        {initial && (
          <button type="button" onClick={onDelete}
            className="w-full py-2.5 border border-border dark:border-dark-border hover:border-red-300 dark:hover:border-red-700 text-text-secondary dark:text-dark-text-secondary hover:text-red-500 text-sm font-semibold rounded-xl transition-all">
            Delete this notice
          </button>
        )}
      </form>
    </div>
  );
}

// ─── Notice Card ──────────────────────────────────────────────────────────────

function NoticeCard({ notice, onEdit, onDelete, onView }) {
  const isUrgent = notice.priority === 'high' || notice.category === 'urgent';
  const isActive = notice.status === 'published';
  const catCls = catColor[notice.category] || catColor.general;
  const catLabel = categories.find(function(c) { return c.value === notice.category; });
  const label = catLabel ? catLabel.label : 'General';

  return (
    <div className={`bg-white dark:bg-dark-surface border rounded-2xl p-5 transition-all duration-200 hover:shadow-medium dark:hover:shadow-dark-medium hover:-translate-y-0.5 ${
      isUrgent ? 'border-red-200 dark:border-red-800' : 'border-border dark:border-dark-border hover:border-primary-200 dark:hover:border-primary-800'
    } ${!isActive ? 'opacity-60' : ''}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-2">
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${catCls}`}>{label}</span>
            {notice.isPinned && (
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400">Pinned</span>
            )}
            {isUrgent && (
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400">Urgent</span>
            )}
            {notice.fileUrl && (
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400">File</span>
            )}
          </div>
          <p className="text-sm font-bold text-text-primary dark:text-dark-text-primary mb-1 leading-snug">{notice.title}</p>
          <p className="text-xs text-text-secondary dark:text-dark-text-secondary leading-relaxed line-clamp-2">{notice.description}</p>
          <p className="text-xs text-text-muted dark:text-dark-text-muted mt-2">
            {notice.createdAt ? new Date(notice.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : ''}
            {notice.views !== undefined ? ` · ${notice.views} views` : ''}
          </p>
        </div>
        <div className="flex flex-col gap-2 flex-shrink-0">
          <button onClick={function() { onEdit(notice); }}
            className="px-3 py-1.5 text-xs font-semibold bg-accent-mist dark:bg-dark-surface2 hover:bg-primary-100 dark:hover:bg-primary-900/30 text-primary-600 dark:text-primary-400 rounded-xl border border-border dark:border-dark-border hover:border-primary-200 dark:hover:border-primary-700 transition-all">
            Edit
          </button>
          {notice.fileUrl && (
            <button onClick={function() { onView(notice); }}
              className="px-3 py-1.5 text-xs font-semibold bg-accent-mist dark:bg-dark-surface2 text-text-secondary dark:text-dark-text-secondary rounded-xl border border-border dark:border-dark-border hover:border-primary-200 transition-all">
              View
            </button>
          )}
          <button onClick={function() { onDelete(notice._id); }}
            className="px-3 py-1.5 text-xs font-semibold bg-red-50 dark:bg-red-900/20 text-red-500 dark:text-red-400 rounded-xl border border-red-100 dark:border-red-800 hover:bg-red-100 transition-all">
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Footer ───────────────────────────────────────────────────────────────────

function Footer({ village, noticeCount }) {
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
              <p className="text-xs text-primary-300">Officials Portal</p>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-2">
            <span className="w-2 h-2 bg-primary-400 rounded-full animate-pulse flex-shrink-0" />
            <span className="text-xs text-white/60 font-medium whitespace-nowrap">
              {village ? village.name : 'Village'} · {noticeCount} notices
            </span>
          </div>
          <p className="text-xs text-white/30 whitespace-nowrap">© {new Date().getFullYear()} GramVartha. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ══════════════════════════════════════════════════════════════════════════════

const PAGE_TABS = [
  { key: 'notices',    label: 'Notices',    icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
  { key: 'complaints', label: 'Complaints', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
];

const FILTER_TABS = [
  { key: 'all',    label: 'All'    },
  { key: 'active', label: 'Active' },
  { key: 'pinned', label: 'Pinned' },
  { key: 'urgent', label: 'Urgent' },
];

export default function OfficialsDashboard() {
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

  useEffect(function() { fetchNotices(); }, []);

  async function fetchNotices() {
    try {
      setLoading(true);
      const profileRes = await axios.get('http://localhost:3000/officials/profile', { withCredentials: true });
      const villageId = profileRes.data && profileRes.data.village
        ? (profileRes.data.village._id || profileRes.data.village)
        : null;
      if (!villageId) { toast.error('No village linked to your account'); setNotices([]); return; }
      setOfficialVillageId(villageId);
      const noticesRes = await axios.get(`http://localhost:3000/notice/village/${villageId}`, { withCredentials: true });
      setNotices(Array.isArray(noticesRes.data && noticesRes.data.notices) ? noticesRes.data.notices : []);
    } catch(e) { toast.error('Failed to load notices'); setNotices([]); }
    finally { setLoading(false); }
  }

  async function fetchOfficialProfile() {
    try {
      const res = await axios.get('http://localhost:3000/officials/profile', { withCredentials: true });
      if (res.data && res.data.village) {
        const vid = res.data.village._id || res.data.village;
        setOfficialVillage(res.data.village);
        try {
          const qrRes = await axios.get(`http://localhost:3000/villages/${vid}/qrcode`, { withCredentials: true });
          if (qrRes.data && qrRes.data.village) {
            setOfficialVillage(function(prev) { return Object.assign({}, prev, { qrCode: qrRes.data.village.qrCode }); });
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
      await axios.post('http://localhost:3000/notice/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' }, withCredentials: true });
      toast.success(noticeForm && noticeForm !== 'new' ? 'Notice updated!' : 'Notice published!');
      setNoticeForm(null);
      fetchNotices();
    } catch(err) {
      toast.error(err.response && err.response.data && err.response.data.message ? err.response.data.message : 'Failed to save notice');
    } finally { setSaving(false); }
  }

  async function handleDelete(id) {
    try {
      await axios.delete(`http://localhost:3000/notice/delete/${id}`, { withCredentials: true });
      toast.success('Notice deleted');
      setDeleteTarget(null);
      setNoticeForm(null);
      fetchNotices();
    } catch(e) { toast.error('Failed to delete notice'); }
  }

  async function generateAndShareQr(village) {
    try {
      setQrLoading(true);
      const res = await axios.post(`http://localhost:3000/villages/${village._id}/qrcode/generate`, {}, { withCredentials: true });
      const imageUrl = res.data && res.data.village && res.data.village.qrCode
        ? res.data.village.qrCode.imageUrl
        : (res.data && res.data.downloadUrl ? res.data.downloadUrl : null);
      const qrUrl = imageUrl || `${window.location.origin}/qr-notices/${village._id}`;
      if (navigator.share && navigator.canShare && imageUrl) {
        try {
          const blob = await (await fetch(imageUrl)).blob();
          const f = new File([blob], `${(village.name || 'village').replace(/\s+/g, '_')}.png`, { type: blob.type });
          if (navigator.canShare({ files: [f] })) { await navigator.share({ files: [f], title: village.name, text: qrUrl }); toast.success('Shared!'); return; }
        } catch(e) {}
      }
      const finalUrl = imageUrl ? imageUrl : await (await import('qrcode')).default.toDataURL(qrUrl, { margin: 1, width: 400 });
      const a = document.createElement('a'); a.href = finalUrl; a.download = `${(village.name || 'village').replace(/\s+/g, '_')}.png`;
      document.body.appendChild(a); a.click(); a.remove();
      toast.success('QR downloaded!');
    } catch(err) {
      toast.error(err.response && err.response.data && err.response.data.message ? err.response.data.message : 'Failed to generate QR');
    } finally { setQrLoading(false); }
  }

  async function handleLogout() {
    try {
      await axios.post('http://localhost:3000/officials/logout', {}, { withCredentials: true });
      toast.info('Logged out'); navigate('/');
    } catch(e) { toast.error('Error logging out'); }
  }

  const isActive = function(n) { return n && n.status === 'published'; };

  const stats = {
    total:  notices.length,
    active: notices.filter(isActive).length,
    pinned: notices.filter(function(n) { return n && n.isPinned; }).length,
    urgent: notices.filter(function(n) { return n && (n.priority === 'high' || n.category === 'urgent'); }).length,
  };

  const filtered = notices.filter(function(n) {
    if (activeTab === 'active') return isActive(n);
    if (activeTab === 'pinned') return n && n.isPinned;
    if (activeTab === 'urgent') return n && (n.priority === 'high' || n.category === 'urgent');
    return true;
  });

  const statCards = [
    { label: 'Total Notices', value: stats.total,  iconCls: 'text-primary-600 dark:text-primary-400', bgCls: 'bg-primary-100 dark:bg-primary-900/40',
      icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
    { label: 'Active',        value: stats.active, iconCls: 'text-sky-600 dark:text-sky-400',         bgCls: 'bg-sky-100 dark:bg-sky-900/30',
      icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' },
    { label: 'Pinned',        value: stats.pinned, iconCls: 'text-amber-600 dark:text-amber-400',     bgCls: 'bg-amber-100 dark:bg-amber-900/30',
      icon: 'M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z' },
    { label: 'Urgent',        value: stats.urgent, iconCls: 'text-red-600 dark:text-red-400',         bgCls: 'bg-red-100 dark:bg-red-900/30',
      icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z' },
  ];

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
                <p className="text-xs text-white/40 mt-0.5">Officials Portal</p>
              </div>
            </div>

            {/* Page tabs */}
            <div className="flex items-center gap-1 bg-white/5 rounded-xl p-1">
              {PAGE_TABS.map(function(t) {
                return (
                  <button key={t.key} onClick={function() { setActivePage(t.key); }}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all duration-150 ${
                      activePage === t.key ? 'bg-white text-primary-900 shadow-sm' : 'text-white/60 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d={t.icon} />
                    </svg>
                    {t.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <button
              onClick={async function() { await fetchOfficialProfile(); setShowQr(true); }}
              className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl border border-white/20 hover:bg-white/10 text-white/60 hover:text-white text-xs font-medium transition-all"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
                <rect x="3" y="14" width="7" height="7"/><path d="M14 14h3v3h-3zM17 17h3v3h-3zM14 20h3"/>
              </svg>
              Village QR
            </button>
            <button
              onClick={function() { navigate('/officials/profile'); }}
              className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl border border-white/20 hover:bg-white/10 text-white/60 hover:text-white text-xs font-medium transition-all"
            >
              Profile
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-white/20 hover:bg-red-900/40 hover:border-red-700 text-white/60 hover:text-red-300 text-xs font-medium transition-all"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/>
              </svg>
              <span className="hidden sm:block">Logout</span>
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
            <h1 className="text-3xl font-bold text-text-primary dark:text-dark-text-primary tracking-tight">Community Notices</h1>
            <p className="text-sm text-text-muted dark:text-dark-text-muted mt-1">Manage and publish announcements for your village</p>
          </div>

          {/* Inline panels */}
          {showQr && (
            <QRSection
              village={officialVillage}
              onDownload={generateAndShareQr}
              loading={qrLoading}
              onClose={function() { setShowQr(false); }}
            />
          )}

          {deleteTarget && (
            <DeleteConfirm
              onConfirm={function() { handleDelete(deleteTarget); }}
              onCancel={function() { setDeleteTarget(null); }}
            />
          )}

          {viewNotice && (
            <FileViewer
              notice={viewNotice}
              onClose={function() { setViewNotice(null); }}
            />
          )}

          {noticeForm !== null && (
            <NoticeForm
              initial={noticeForm === 'new' ? null : noticeForm}
              onSave={handleSave}
              onCancel={function() { setNoticeForm(null); }}
              saving={saving}
              onDelete={noticeForm !== 'new' ? function() { setDeleteTarget(noticeForm._id); setNoticeForm(null); } : null}
            />
          )}

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {statCards.map(function(s) {
              return (
                <div key={s.label} className="bg-white dark:bg-dark-surface border border-border dark:border-dark-border rounded-2xl p-5 shadow-soft">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-4 ${s.bgCls}`}>
                    <svg className={`w-4 h-4 ${s.iconCls}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d={s.icon} />
                    </svg>
                  </div>
                  <p className="text-3xl font-bold text-text-primary dark:text-dark-text-primary">{s.value}</p>
                  <p className="text-xs text-text-muted dark:text-dark-text-muted mt-1.5 font-medium">{s.label}</p>
                </div>
              );
            })}
          </div>

          {/* Filter tabs + New button */}
          <div className="flex items-center justify-between gap-4 mb-5 flex-wrap">
            <div className="flex items-center gap-2 bg-white dark:bg-dark-surface border border-border dark:border-dark-border rounded-xl p-1">
              {FILTER_TABS.map(function(t) {
                const count = t.key === 'all' ? stats.total : t.key === 'active' ? stats.active : t.key === 'pinned' ? stats.pinned : stats.urgent;
                return (
                  <button key={t.key} onClick={function() { setActiveTab(t.key); }}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition-all duration-150 ${
                      activeTab === t.key
                        ? 'bg-primary-600 dark:bg-primary-700 text-white shadow-soft'
                        : 'text-text-muted dark:text-dark-text-muted hover:text-text-primary dark:hover:text-dark-text-primary'
                    }`}
                  >
                    {t.label}
                    <span className={`text-[10px] font-bold min-w-[16px] h-4 px-1 flex items-center justify-center rounded-full ${
                      activeTab === t.key ? 'bg-white/20 text-white' : 'bg-accent-mist dark:bg-dark-surface2 text-text-muted dark:text-dark-text-muted'
                    }`}>{count}</span>
                  </button>
                );
              })}
            </div>
            {noticeForm === null && (
              <button onClick={function() { setNoticeForm('new'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                className="inline-flex items-center gap-2 text-sm font-semibold px-5 py-2.5 bg-primary-600 hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-400 text-white rounded-xl transition-all shadow-soft">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
                New Notice
              </button>
            )}
          </div>

          {/* Notice list */}
          {loading ? (
            <div className="bg-white dark:bg-dark-surface border border-border dark:border-dark-border rounded-2xl flex items-center justify-center py-20 gap-3">
              <IcoSpinner />
              <p className="text-sm text-text-muted dark:text-dark-text-muted">Loading notices...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="bg-white dark:bg-dark-surface border border-border dark:border-dark-border rounded-2xl flex flex-col items-center justify-center py-16 gap-3 text-center">
              <div className="w-12 h-12 rounded-2xl bg-accent-mist dark:bg-dark-surface2 border border-border dark:border-dark-border flex items-center justify-center mb-1">
                <svg className="w-5 h-5 text-primary-500 dark:text-primary-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                </svg>
              </div>
              <p className="text-sm font-semibold text-text-primary dark:text-dark-text-primary">No notices yet</p>
              <p className="text-xs text-text-muted dark:text-dark-text-muted">Create the first notice for your village</p>
              <button onClick={function() { setNoticeForm('new'); }}
                className="mt-2 px-5 py-2.5 bg-primary-600 hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-400 text-white text-sm font-semibold rounded-xl transition-all shadow-soft">
                Publish First Notice
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map(function(notice) {
                return (
                  <NoticeCard
                    key={notice._id}
                    notice={notice}
                    onEdit={function(n) { setNoticeForm(n); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                    onDelete={function(id) { setDeleteTarget(id); }}
                    onView={function(n) { setViewNotice(n); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  />
                );
              })}
            </div>
          )}
        </main>
      )}

      {/* ── Footer ── */}
      <Footer village={officialVillage} noticeCount={notices.length} />

    </div>
  );
}