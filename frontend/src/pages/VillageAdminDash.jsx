import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import * as api from '../services/api';
import WorkGuideAdmin from './Workguideadmin';
import { useTheme } from '../context/ThemeContext';

// ─── Icons ────────────────────────────────────────────────────────────────────

const Icons = {
  home:     <svg fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
  users:    <svg fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>,
  clock:    <svg fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
  doc:      <svg fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>,
  qr:       <svg fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><path d="M14 14h3v3h-3zM17 17h3v3h-3zM14 20h3"/></svg>,
  logout:   <svg fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/></svg>,
  check:    <svg fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>,
  x:        <svg fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  trash:    <svg fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6M14 11v6M9 6V4h6v2"/></svg>,
  edit:     <svg fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
  plus:     <svg fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  chevron:  <svg fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"/></svg>,
  upload:   <svg fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/><path d="M20.39 18.39A5 5 0 0018 9h-1.26A8 8 0 103 16.3"/></svg>,
  link:     <svg fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/></svg>,
  share:    <svg fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>,
  guide:    <svg fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/></svg>,
  sun:      <svg fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>,
  moon:     <svg fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/></svg>,
  location: <svg fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>,
};

function Ico({ name, cls = 'w-4 h-4' }) {
  return (
    <span className={`${cls} inline-flex items-center justify-center flex-shrink-0`}>
      {Icons[name]}
    </span>
  );
}

function fmt(d) {
  if (!d) return '';
  return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

// ─── Status Badge ─────────────────────────────────────────────────────────────

function StatusBadge({ status }) {
  const s = {
    approved: 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 border border-primary-200 dark:border-primary-800',
    pending:  'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800',
    rejected: 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800',
  };
  const d = { approved: 'bg-primary-500', pending: 'bg-amber-500', rejected: 'bg-red-500' };
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${s[status] || s.pending}`}>
      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${d[status] || d.pending}`} />
      {status}
    </span>
  );
}

// ─── Avatar ───────────────────────────────────────────────────────────────────

function Avatar({ name = '', img, size = 'md' }) {
  const sz = { sm: 'w-9 h-9 text-xs', md: 'w-11 h-11 text-sm', lg: 'w-16 h-16 text-xl' }[size];
  const letters = name.split(' ').map(function(w) { return w[0]; }).join('').toUpperCase().slice(0, 2) || '?';
  if (img) return <img src={img} alt={name} className={`${sz} rounded-xl object-cover flex-shrink-0 border-2 border-border dark:border-dark-border`} />;
  return (
    <div className={`${sz} rounded-xl bg-primary-800 dark:bg-primary-900 flex items-center justify-center flex-shrink-0 font-bold text-white border-2 border-primary-700 dark:border-primary-800`}>
      {letters}
    </div>
  );
}

// ─── Info Tile ────────────────────────────────────────────────────────────────

function InfoTile({ label, value }) {
  return (
    <div className="bg-accent-mist dark:bg-dark-surface2 rounded-xl p-3">
      <p className="text-xs text-text-muted dark:text-dark-text-muted mb-1">{label}</p>
      <p className="text-sm font-semibold text-text-primary dark:text-dark-text-primary">{value || 'N/A'}</p>
    </div>
  );
}

// ─── Empty ────────────────────────────────────────────────────────────────────

function Empty({ title, sub, children }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-2 text-center">
      <div className="w-12 h-12 rounded-2xl bg-accent-mist dark:bg-dark-surface2 border border-border dark:border-dark-border flex items-center justify-center mb-1">
        <Ico name="check" cls="w-5 h-5 text-primary-500 dark:text-primary-400" />
      </div>
      <p className="text-sm font-semibold text-text-primary dark:text-dark-text-primary">{title}</p>
      <p className="text-xs text-text-muted dark:text-dark-text-muted">{sub}</p>
      {children}
    </div>
  );
}

// ─── Page Header ──────────────────────────────────────────────────────────────

function PageHeader({ title, sub, action }) {
  return (
    <div className="flex items-start justify-between gap-4 mb-6">
      <div>
        <h2 className="text-2xl font-bold text-text-primary dark:text-dark-text-primary tracking-tight">{title}</h2>
        {sub && <p className="text-sm text-text-muted dark:text-dark-text-muted mt-1">{sub}</p>}
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  );
}

// ─── Theme Toggle ─────────────────────────────────────────────────────────────

function ThemeToggle() {
  const { dark, toggleTheme } = useTheme();
  return (
    <button
      onClick={toggleTheme}
      aria-label="Toggle theme"
      className="p-2 rounded-xl border border-white/20 hover:bg-white/10 text-white/60 hover:text-white transition-all duration-200"
    >
      {dark ? <Ico name="sun" cls="w-4 h-4" /> : <Ico name="moon" cls="w-4 h-4" />}
    </button>
  );
}

// ─── Footer ───────────────────────────────────────────────────────────────────

function Footer({ village, officials, notices, pending }) {
  return (
    <footer className="w-full mt-auto">
      <svg viewBox="0 0 1440 80" xmlns="http://www.w3.org/2000/svg" className="w-full block -mb-1">
        <path
          d="M0,40 C180,80 360,0 540,40 C720,80 900,0 1080,40 C1260,80 1380,20 1440,40 L1440,80 L0,80 Z"
          className="fill-primary-800 dark:fill-primary-900"
        />
      </svg>
      <div className="bg-primary-800 dark:bg-primary-900">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 py-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-white/10 border border-white/20 flex items-center justify-center overflow-hidden flex-shrink-0">
              <img src="/gramvarthalogo.png" alt="GramVartha" className="w-full h-full object-contain" />
            </div>
            <div>
              <p className="text-sm font-bold text-white">GramVartha</p>
              <p className="text-xs text-primary-300">{village ? village.name : 'Village'} Admin Panel</p>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-2">
            <span className="w-2 h-2 bg-primary-400 rounded-full animate-pulse flex-shrink-0" />
            <span className="text-xs text-white/60 font-medium whitespace-nowrap">
              {officials.length} officials · {notices.length} notices · {pending.length} pending
            </span>
          </div>
          <p className="text-xs text-white/30 whitespace-nowrap">© {new Date().getFullYear()} GramVartha. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

// ─── Notice Form ──────────────────────────────────────────────────────────────

const inp = "w-full px-4 py-3 rounded-xl border border-border dark:border-dark-border bg-white dark:bg-dark-surface2 text-sm text-text-primary dark:text-dark-text-primary placeholder-text-muted dark:placeholder-dark-text-muted outline-none transition-all duration-200 focus:border-primary-500 dark:focus:border-primary-400 focus:ring-2 focus:ring-primary-500/10";

function NoticeForm({ initial, onSave, onCancel, saving }) {
  const blank = { title: '', description: '', category: 'general', priority: 'medium', status: 'published', isPinned: false };
  const [form, setForm] = useState(initial || blank);
  const [file, setFile] = useState(null);

  function set(key, val) { setForm(function(p) { return Object.assign({}, p, { [key]: val }); }); }

  function handleSubmit(e) {
    e.preventDefault();
    const fd = new FormData();
    Object.entries(form).forEach(function(kv) { fd.append(kv[0], kv[1]); });
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
          <Ico name="x" cls="w-4 h-4" />
        </button>
      </div>
      <form onSubmit={handleSubmit} className="p-6 space-y-4">
        <div>
          <label className="block text-xs font-semibold text-text-secondary dark:text-dark-text-secondary mb-1.5">Title *</label>
          <input value={form.title} onChange={function(e) { set('title', e.target.value); }} placeholder="Notice title" required className={inp} />
        </div>
        <div>
          <label className="block text-xs font-semibold text-text-secondary dark:text-dark-text-secondary mb-1.5">Description *</label>
          <textarea value={form.description} onChange={function(e) { set('description', e.target.value); }} placeholder="Full notice content..." rows={4} required className={`${inp} resize-none`} />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-semibold text-text-secondary dark:text-dark-text-secondary mb-1.5">Category</label>
            <select value={form.category} onChange={function(e) { set('category', e.target.value); }} className={inp}>
              <option value="general">General</option>
              <option value="development">Development</option>
              <option value="health">Health</option>
              <option value="education">Education</option>
              <option value="agriculture">Agriculture</option>
              <option value="employment">Employment</option>
              <option value="social_welfare">Social Welfare</option>
              <option value="tax_billing">Tax & Billing</option>
              <option value="election">Election</option>
              <option value="meeting">Meetings</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-text-secondary dark:text-dark-text-secondary mb-1.5">Priority</label>
            <select value={form.priority} onChange={function(e) { set('priority', e.target.value); }} className={inp}>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-text-secondary dark:text-dark-text-secondary mb-1.5">Status</label>
            <select value={form.status} onChange={function(e) { set('status', e.target.value); }} className={inp}>
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="archived">Archived</option>
            </select>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <input id="pin-notice" type="checkbox" checked={form.isPinned} onChange={function(e) { set('isPinned', e.target.checked); }} className="accent-primary-600 w-4 h-4" />
          <label htmlFor="pin-notice" className="text-sm text-text-secondary dark:text-dark-text-secondary cursor-pointer">Pin this notice</label>
        </div>
        <div>
          <label className="block text-xs font-semibold text-text-secondary dark:text-dark-text-secondary mb-1.5">Attachment (optional)</label>
          <label htmlFor="nfile" className="flex items-center gap-3 w-full px-4 py-3 rounded-xl border border-dashed border-border dark:border-dark-border bg-accent-mist dark:bg-dark-surface2 hover:border-primary-400 cursor-pointer transition-all group">
            <Ico name="upload" cls="w-5 h-5 text-text-muted group-hover:text-primary-600 dark:group-hover:text-primary-400" />
            <span className={`text-sm ${file ? 'text-text-primary dark:text-dark-text-primary font-medium' : 'text-text-muted dark:text-dark-text-muted'}`}>
              {file ? file.name : 'Click to attach a file'}
            </span>
            <input id="nfile" type="file" className="hidden" onChange={function(e) { setFile(e.target.files[0]); }} />
          </label>
        </div>
        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onCancel} className="flex-1 py-2.5 border border-border dark:border-dark-border text-text-secondary dark:text-dark-text-secondary text-sm font-semibold rounded-xl hover:bg-accent-mist dark:hover:bg-dark-surface2 transition-all">
            Cancel
          </button>
          <button type="submit" disabled={saving} className="flex-1 py-2.5 bg-primary-600 hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-400 text-white text-sm font-semibold rounded-xl transition-all shadow-soft disabled:opacity-60 flex items-center justify-center gap-2">
            {saving ? (
              <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
            ) : (
              <Ico name={initial ? 'edit' : 'plus'} cls="w-4 h-4" />
            )}
            {saving ? 'Saving...' : initial ? 'Save Changes' : 'Publish Notice'}
          </button>
        </div>
      </form>
    </div>
  );
}

// ─── Notice Card ──────────────────────────────────────────────────────────────

function NoticeCard({ notice, onDelete, onEdit }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="bg-white dark:bg-dark-surface border border-border dark:border-dark-border rounded-2xl overflow-hidden hover:border-primary-200 dark:hover:border-primary-800 transition-all duration-200">
      <button onClick={function() { setOpen(function(p) { return !p; }); }} className="w-full flex items-center gap-4 p-5 text-left hover:bg-accent-mist dark:hover:bg-dark-surface2 transition-colors duration-200">
        <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/40 rounded-xl flex items-center justify-center flex-shrink-0">
          <Ico name="doc" cls="w-5 h-5 text-primary-600 dark:text-primary-400" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm font-bold text-text-primary dark:text-dark-text-primary truncate">{notice.title || 'Untitled'}</p>
            {notice.isPinned && (
              <span className="text-xs bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 border border-primary-200 dark:border-primary-800 px-2 py-0.5 rounded-full font-semibold flex-shrink-0">Pinned</span>
            )}
          </div>
          <p className="text-xs text-text-muted dark:text-dark-text-muted mt-0.5">{fmt(notice.createdAt)}</p>
        </div>
        <div className={`transition-transform duration-200 flex-shrink-0 ${open ? 'rotate-90' : ''}`}>
          <Ico name="chevron" cls="w-4 h-4 text-text-muted dark:text-dark-text-muted" />
        </div>
      </button>
      {open && (
        <div className="border-t border-border dark:border-dark-border p-5 space-y-4 bg-accent-mist dark:bg-dark-surface2">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <InfoTile label="Category" value={notice.category} />
            <InfoTile label="Priority" value={notice.priority} />
            <InfoTile label="Status" value={notice.status} />
          </div>
          {(notice.description || notice.summary || notice.content) && (
            <div className="bg-white dark:bg-dark-surface rounded-xl p-4">
              <p className="text-xs text-text-muted dark:text-dark-text-muted mb-2">Content</p>
              <p className="text-sm text-text-secondary dark:text-dark-text-secondary leading-relaxed whitespace-pre-wrap">
                {notice.description || notice.summary || notice.content}
              </p>
            </div>
          )}
          {notice.fileUrl && (
            <a href={notice.fileUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-sm font-medium text-primary-600 dark:text-primary-400 hover:underline">
              <Ico name="link" cls="w-4 h-4" /> View Attachment
            </a>
          )}
          <div className="flex gap-3 pt-1">
            <button onClick={function() { onEdit(notice); }} className="inline-flex items-center gap-2 text-sm font-semibold px-5 py-2.5 bg-primary-600 hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-400 text-white rounded-xl transition-all shadow-soft">
              <Ico name="edit" cls="w-4 h-4" /> Edit
            </button>
            <button onClick={function() { onDelete(notice._id); }} className="inline-flex items-center gap-2 text-sm font-semibold px-5 py-2.5 border border-border dark:border-dark-border hover:border-red-300 dark:hover:border-red-700 text-text-secondary dark:text-dark-text-secondary hover:text-red-500 rounded-xl transition-all">
              <Ico name="trash" cls="w-4 h-4" /> Delete
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Official Card ────────────────────────────────────────────────────────────

function OfficialCard({ official, isPending, onApprove, onReject, onDelete }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="bg-white dark:bg-dark-surface border border-border dark:border-dark-border rounded-2xl overflow-hidden hover:border-primary-200 dark:hover:border-primary-800 transition-all duration-200">
      <button onClick={function() { setOpen(function(p) { return !p; }); }} className="w-full flex items-center gap-4 p-5 text-left hover:bg-accent-mist dark:hover:bg-dark-surface2 transition-colors duration-200">
        <Avatar name={official.name} img={official.profileImage} size="md" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm font-bold text-text-primary dark:text-dark-text-primary truncate">{official.name}</p>
            <StatusBadge status={isPending ? 'pending' : (official.status || 'pending')} />
          </div>
          <p className="text-xs text-text-muted dark:text-dark-text-muted mt-0.5 truncate">{official.email}</p>
        </div>
        <div className={`transition-transform duration-200 flex-shrink-0 ${open ? 'rotate-90' : ''}`}>
          <Ico name="chevron" cls="w-4 h-4 text-text-muted dark:text-dark-text-muted" />
        </div>
      </button>
      {open && (
        <div className="border-t border-border dark:border-dark-border p-5 space-y-4 bg-accent-mist dark:bg-dark-surface2">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {official.phone && <InfoTile label="Phone" value={official.phone} />}
            {official.createdAt && <InfoTile label="Joined" value={fmt(official.createdAt)} />}
            {official.village && official.village.name && <InfoTile label="Village" value={official.village.name} />}
          </div>
          {official.documentProof && (
            <div>
              <p className="text-xs font-semibold text-text-muted dark:text-dark-text-muted mb-2">Document Proof</p>
              <img src={official.documentProof} alt="Doc" className="w-full max-h-52 object-contain rounded-xl border border-border dark:border-dark-border bg-white dark:bg-dark-surface" />
            </div>
          )}
          <div className="flex gap-3 pt-1">
            {isPending ? (
              <div className="flex gap-3 w-full">
                <button onClick={function() { onApprove(official._id); }} className="flex-1 inline-flex items-center justify-center gap-2 text-sm font-semibold px-5 py-2.5 bg-primary-600 hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-400 text-white rounded-xl transition-all shadow-soft">
                  <Ico name="check" cls="w-4 h-4" /> Approve
                </button>
                <button onClick={function() { onReject(official._id); }} className="inline-flex items-center gap-2 text-sm font-semibold px-5 py-2.5 border border-border dark:border-dark-border hover:border-red-300 dark:hover:border-red-700 text-text-secondary dark:text-dark-text-secondary hover:text-red-500 rounded-xl transition-all">
                  <Ico name="x" cls="w-4 h-4" /> Reject
                </button>
              </div>
            ) : (
              <button onClick={function() { onDelete(official._id); }} className="inline-flex items-center gap-2 text-sm font-semibold px-5 py-2.5 border border-border dark:border-dark-border hover:border-red-300 dark:hover:border-red-700 text-text-secondary dark:text-dark-text-secondary hover:text-red-500 rounded-xl transition-all">
                <Ico name="trash" cls="w-4 h-4" /> Remove Official
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// TABS CONFIG
// ══════════════════════════════════════════════════════════════════════════════

const TABS = [
  { key: 'overview',  label: 'Overview',   icon: 'home',  countKey: null        },
  { key: 'pending',   label: 'Pending',    icon: 'clock', countKey: 'pending'   },
  { key: 'officials', label: 'Officials',  icon: 'users', countKey: 'officials' },
  { key: 'notices',   label: 'Notices',    icon: 'doc',   countKey: 'notices'   },
  { key: 'qr',        label: 'QR Code',    icon: 'qr',    countKey: null        },
  { key: 'workguide', label: 'Work Guide', icon: 'guide', countKey: null        },
];

// ══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ══════════════════════════════════════════════════════════════════════════════

export default function VillageAdminDashboard() {
  const navigate = useNavigate();
  const [adminData, setAdminData]   = useState(null);
  const [pending, setPending]       = useState([]);
  const [officials, setOfficials]   = useState([]);
  const [notices, setNotices]       = useState([]);
  const [tab, setTab]               = useState('overview');
  const [loading, setLoading]       = useState(true);
  const [villageId, setVillageId]   = useState(null);
  const [qrData, setQrData]         = useState(null);
  const [noticeForm, setNoticeForm] = useState(null);
  const [saving, setSaving]         = useState(false);

  useEffect(function() { load(); }, []);

  async function load() {
    setLoading(true);
    try {
      const ar = await api.getAdminProfile();
      setAdminData(ar.data);
      const vid = ar.data && ar.data.village ? (ar.data.village._id || ar.data.village) : null;
      setVillageId(vid);
      const [pr, or] = await Promise.all([api.getPendingOfficials(), api.getAllOfficials()]);
      setPending(pr.data);
      setOfficials(or.data);
      if (vid) {
        const nr = await api.getNoticesByVillage(vid);
        setNotices(nr.data && nr.data.notices ? nr.data.notices : []);
        try { const qr = await api.getVillageQRCode(vid); setQrData(qr.data.village.qrCode || null); } catch(e) {}
      }
    } catch(e) { toast.error('Failed to load dashboard'); }
    finally { setLoading(false); }
  }

  async function approve(id) {
    try {
      await api.approveOfficial(id);
      const obj = pending.find(function(o) { return o._id === id; });
      setPending(function(p) { return p.filter(function(o) { return o._id !== id; }); });
      setOfficials(function(list) {
        if (list.some(function(x) { return x._id === id; })) {
          return list.map(function(x) { return x._id === id ? Object.assign({}, x, { status: 'approved' }) : x; });
        }
        return obj ? [...list, Object.assign({}, obj, { status: 'approved' })] : list;
      });
      toast.success('Official approved');
    } catch(e) { toast.error('Failed to approve'); }
  }

  async function reject(id) {
    try {
      await api.rejectOfficial(id);
      setPending(function(p) { return p.filter(function(o) { return o._id !== id; }); });
      setOfficials(function(list) { return list.filter(function(x) { return x._id !== id; }); });
      toast.success('Official rejected');
    } catch(e) { toast.error('Failed to reject'); }
  }

  async function delOfficial(id) {
    if (!confirm('Remove this official?')) return;
    try {
      await api.deleteOfficial(id);
      setOfficials(function(list) { return list.filter(function(x) { return x._id !== id; }); });
      toast.success('Removed');
    } catch(e) { toast.error('Failed'); }
  }

  async function delNotice(id) {
    if (!confirm('Delete this notice?')) return;
    try {
      await api.deleteNotice(id);
      setNotices(function(list) { return list.filter(function(x) { return x._id !== id; }); });
      toast.success('Notice deleted');
    } catch(e) { toast.error('Failed'); }
  }

  async function saveNotice(fd) {
    setSaving(true);
    try {
      if (noticeForm === 'new') {
        const res = await api.uploadNotice(fd);
        setNotices(function(list) { return [res.data, ...list]; });
        toast.success('Notice published');
      } else {
        await api.updateNotice(noticeForm._id, fd);
        setNotices(function(list) {
          return list.map(function(x) {
            return x._id === noticeForm._id
              ? Object.assign({}, x, { title: fd.get('title'), description: fd.get('description'), updatedAt: new Date().toISOString() })
              : x;
          });
        });
        toast.success('Notice updated');
      }
      setNoticeForm(null);
    } catch(e) {
      toast.error(e.response && e.response.data && e.response.data.message ? e.response.data.message : 'Failed');
    } finally { setSaving(false); }
  }

  async function generateQr() {
    try { const r = await api.generateVillageQRCode(villageId); setQrData(r.data.village.qrCode); toast.success('QR generated'); }
    catch(e) { toast.error('Failed to generate QR'); }
  }

  async function shareQr() {
    const url = qrData && qrData.imageUrl ? qrData.imageUrl : null;
    if (!url) return;
    try {
      if (navigator.share) await navigator.share({ title: 'Village QR', url: url });
      else { await navigator.clipboard.writeText(url); toast.success('Link copied'); }
    } catch(e) {}
  }

  async function logout() {
    try { await api.adminLogout(); navigate('/'); } catch(e) {}
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background dark:bg-dark-background font-sans">
        <div className="flex flex-col items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-primary-800 flex items-center justify-center shadow-large">
            <svg className="animate-spin w-6 h-6 text-white" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          </div>
          <p className="text-sm text-text-muted dark:text-dark-text-muted font-medium">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const village    = adminData && adminData.village ? adminData.village : null;
  const hour       = new Date().getHours();
  const greeting   = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const adminName  = adminData && adminData.name ? adminData.name.split(' ')[0] : 'Admin';
  const counts     = { pending: pending.length, officials: officials.length, notices: notices.length };

  return (
    <div className="min-h-screen bg-background dark:bg-dark-background font-sans transition-colors duration-300 flex flex-col">

      {/* ── Fixed Nav ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-primary-900 transition-colors duration-300 shadow-large">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 h-16 flex items-center justify-between gap-4">

          <Link to="/" className="flex items-center gap-2.5 flex-shrink-0">
            <div className="w-8 h-8 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center overflow-hidden">
              <img src="/gramvarthalogo.png" alt="GramVartha" className="w-full h-full object-contain" />
            </div>
            <div className="hidden sm:block">
              <p className="text-sm font-bold text-white leading-none">GramVartha</p>
              <p className="text-xs text-white/40 mt-0.5">{village ? village.name : 'Admin Portal'}</p>
            </div>
          </Link>

          <div className="hidden md:flex items-center gap-1 bg-white/5 rounded-xl p-1">
            {TABS.map(function(t) {
              const count = t.countKey ? counts[t.countKey] : 0;
              return (
                <button key={t.key} onClick={function() { setTab(t.key); }}
                  className={`relative flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all duration-150 ${
                    tab === t.key ? 'bg-white text-primary-900 shadow-sm' : 'text-white/60 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <Ico name={t.icon} cls="w-3.5 h-3.5" />
                  {t.label}
                  {count > 0 && (
                    <span className={`text-[9px] font-bold min-w-[15px] h-3.5 px-1 flex items-center justify-center rounded-full ${
                      tab === t.key ? 'bg-primary-900 text-white' : 'bg-primary-400/30 text-white'
                    }`}>{count > 99 ? '99+' : count}</span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <button onClick={logout} className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-white/20 hover:bg-white/10 text-white/60 hover:text-white text-xs font-medium transition-all">
              <Ico name="logout" cls="w-4 h-4" />
              <span className="hidden sm:block">Logout</span>
            </button>
          </div>
        </div>

        {/* Mobile tab bar */}
        <div className="md:hidden border-t border-white/10 flex overflow-x-auto">
          {TABS.map(function(t) {
            const count = t.countKey ? counts[t.countKey] : 0;
            return (
              <button key={t.key} onClick={function() { setTab(t.key); }}
                className={`flex-shrink-0 flex flex-col items-center gap-1 px-3 py-2.5 relative transition-all text-xs font-medium ${
                  tab === t.key ? 'text-white' : 'text-white/40'
                }`}
              >
                <Ico name={t.icon} cls="w-4 h-4" />
                {t.label}
                {tab === t.key && <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-primary-400 rounded-full" />}
                {count > 0 && <span className="absolute top-1 right-1 w-3.5 h-3.5 bg-amber-400 text-white text-[9px] font-bold rounded-full flex items-center justify-center">{count}</span>}
              </button>
            );
          })}
        </div>
      </nav>

      {/* ── Nav spacer: 64px nav + 52px mobile tabs on small, just 64px on md+ ── */}
      <div className="h-[116px] md:h-16 flex-shrink-0" />

      {/* ── Main ── */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-5 sm:px-8 py-8">

        {/* OVERVIEW */}
        {tab === 'overview' && (
          <div className="space-y-6">
            <div className="relative rounded-2xl overflow-hidden bg-primary-800 dark:bg-primary-900 p-8">
              <div className="absolute top-0 right-0 w-72 h-72 bg-primary-600/20 rounded-full blur-3xl pointer-events-none" />
              <div className="relative z-10 flex items-start justify-between gap-6">
                <div>
                  <div className="inline-flex items-center gap-2 bg-white/10 border border-white/15 rounded-full px-3 py-1.5 mb-5">
                    <span className="w-1.5 h-1.5 bg-primary-400 rounded-full animate-pulse" />
                    <span className="text-xs text-white/70 font-medium">Village Admin Portal</span>
                  </div>
                  <p className="text-white/60 text-sm mb-1">{greeting}</p>
                  <h1 className="text-3xl font-bold text-white tracking-tight">{adminName}</h1>
                  {village && (
                    <p className="text-white/50 text-sm mt-3 flex items-center gap-1.5">
                      <Ico name="location" cls="w-3.5 h-3.5" />
                      {village.name}{village.district ? `, ${village.district}` : ''}
                    </p>
                  )}
                </div>
                {pending.length > 0 && (
                  <button onClick={function() { setTab('pending'); }} className="flex-shrink-0 bg-amber-400 hover:bg-amber-500 text-amber-900 rounded-2xl px-6 py-4 text-center transition-all shadow-large hover:-translate-y-0.5">
                    <p className="text-3xl font-bold leading-none">{pending.length}</p>
                    <p className="text-xs font-semibold mt-1">pending</p>
                  </button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: 'Total Officials', val: officials.length, icon: 'users', key: 'officials', warn: false },
                { label: 'Pending Review',  val: pending.length,   icon: 'clock', key: 'pending',   warn: pending.length > 0 },
                { label: 'Active Notices',  val: notices.length,   icon: 'doc',   key: 'notices',   warn: false },
                { label: 'Approved',        val: officials.filter(function(o) { return o.status === 'approved'; }).length, icon: 'check', key: 'officials', warn: false },
              ].map(function(s) {
                return (
                  <button key={s.label} onClick={function() { setTab(s.key); }}
                    className={`bg-white dark:bg-dark-surface border rounded-2xl p-5 text-left hover:shadow-medium dark:hover:shadow-dark-medium hover:-translate-y-0.5 transition-all duration-200 ${
                      s.warn ? 'border-amber-200 dark:border-amber-800' : 'border-border dark:border-dark-border hover:border-primary-200 dark:hover:border-primary-700'
                    }`}
                  >
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-4 ${s.warn ? 'bg-amber-100 dark:bg-amber-900/30' : 'bg-accent-mist dark:bg-dark-surface2'}`}>
                      <Ico name={s.icon} cls={`w-4 h-4 ${s.warn ? 'text-amber-600 dark:text-amber-400' : 'text-primary-600 dark:text-primary-400'}`} />
                    </div>
                    <p className={`text-3xl font-bold ${s.warn ? 'text-amber-500 dark:text-amber-400' : 'text-text-primary dark:text-dark-text-primary'}`}>{s.val}</p>
                    <p className="text-xs text-text-muted dark:text-dark-text-muted mt-1.5 font-medium">{s.label}</p>
                  </button>
                );
              })}
            </div>

            {pending.length > 0 && (
              <div className="bg-white dark:bg-dark-surface border border-amber-200 dark:border-amber-800 rounded-2xl overflow-hidden">
                <div className="flex items-center justify-between px-6 py-4 border-b border-amber-100 dark:border-amber-900/30 bg-amber-50/60 dark:bg-amber-900/10">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-amber-400 rounded-full animate-pulse" />
                    <p className="text-sm font-bold text-text-primary dark:text-dark-text-primary">Needs your approval</p>
                  </div>
                  <button onClick={function() { setTab('pending'); }} className="text-xs font-semibold text-primary-600 dark:text-primary-400 hover:underline">See all</button>
                </div>
                <div className="divide-y divide-border dark:divide-dark-border">
                  {pending.slice(0, 3).map(function(o) {
                    return (
                      <div key={o._id} className="flex items-center gap-4 px-6 py-4 hover:bg-accent-mist dark:hover:bg-dark-surface2 transition-all">
                        <Avatar name={o.name} img={o.profileImage} size="sm" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-text-primary dark:text-dark-text-primary truncate">{o.name}</p>
                          <p className="text-xs text-text-muted dark:text-dark-text-muted truncate">{o.email}</p>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <button onClick={function() { approve(o._id); }} className="flex items-center gap-1.5 px-4 py-2 bg-primary-600 hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-400 text-white text-xs font-semibold rounded-xl transition-all shadow-soft">
                            <Ico name="check" cls="w-3 h-3" /> Approve
                          </button>
                          <button onClick={function() { reject(o._id); }} className="w-8 h-8 rounded-xl border border-border dark:border-dark-border hover:border-red-300 flex items-center justify-center text-text-muted dark:text-dark-text-muted hover:text-red-500 transition-all">
                            <Ico name="x" cls="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="bg-white dark:bg-dark-surface border border-border dark:border-dark-border rounded-2xl overflow-hidden">
              <div className="flex items-center justify-between px-6 py-4 border-b border-border dark:border-dark-border">
                <p className="text-sm font-bold text-text-primary dark:text-dark-text-primary">Recent Notices</p>
                <div className="flex items-center gap-3">
                  <button onClick={function() { setNoticeForm('new'); setTab('notices'); }}
                    className="flex items-center gap-1.5 text-xs font-semibold text-primary-600 dark:text-primary-400 bg-accent-mist dark:bg-dark-surface2 border border-border dark:border-dark-border px-3 py-1.5 rounded-xl hover:bg-primary-100 dark:hover:bg-primary-900/30 transition-all">
                    <Ico name="plus" cls="w-3 h-3" /> New
                  </button>
                  <button onClick={function() { setTab('notices'); }} className="text-xs text-text-muted dark:text-dark-text-muted hover:text-primary-600 dark:hover:text-primary-400 font-medium transition-colors">All</button>
                </div>
              </div>
              {notices.length === 0 ? (
                <div className="px-6 py-12 text-center">
                  <p className="text-sm text-text-muted dark:text-dark-text-muted">No notices yet.</p>
                  <button onClick={function() { setNoticeForm('new'); setTab('notices'); }} className="mt-2 text-sm font-semibold text-primary-600 dark:text-primary-400 hover:underline">
                    Publish your first notice
                  </button>
                </div>
              ) : (
                <div className="divide-y divide-border dark:divide-dark-border">
                  {notices.slice(0, 4).map(function(n) {
                    return (
                      <button key={n._id} onClick={function() { setTab('notices'); }}
                        className="w-full flex items-center gap-4 px-6 py-4 hover:bg-accent-mist dark:hover:bg-dark-surface2 text-left transition-all group">
                        <div className="w-9 h-9 rounded-xl bg-accent-mist dark:bg-dark-surface2 group-hover:bg-primary-100 dark:group-hover:bg-primary-900/40 flex items-center justify-center flex-shrink-0 transition-all">
                          <Ico name="doc" cls="w-4 h-4 text-primary-600 dark:text-primary-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-text-primary dark:text-dark-text-primary truncate">{n.title || 'Untitled'}</p>
                          <p className="text-xs text-text-muted dark:text-dark-text-muted mt-0.5">{fmt(n.createdAt)}</p>
                        </div>
                        <Ico name="chevron" cls="w-4 h-4 text-text-muted dark:text-dark-text-muted flex-shrink-0" />
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* PENDING */}
        {tab === 'pending' && (
          <div>
            <PageHeader title="Pending Approvals" sub={`${pending.length} official${pending.length !== 1 ? 's' : ''} waiting for review`} />
            {pending.length === 0 ? (
              <Empty title="All caught up!" sub="No pending approvals right now." />
            ) : (
              <div className="space-y-3">
                {pending.map(function(o) {
                  return <OfficialCard key={o._id} official={o} isPending={true} onApprove={approve} onReject={reject} onDelete={delOfficial} />;
                })}
              </div>
            )}
          </div>
        )}

        {/* OFFICIALS */}
        {tab === 'officials' && (
          <div>
            <PageHeader title="Officials" sub={`${officials.length} registered official${officials.length !== 1 ? 's' : ''}`} />
            {officials.length === 0 ? (
              <Empty title="No officials yet" sub="Approved officials will appear here." />
            ) : (
              <div className="space-y-3">
                {officials.map(function(o) {
                  return <OfficialCard key={o._id} official={o} isPending={false} onApprove={approve} onReject={reject} onDelete={delOfficial} />;
                })}
              </div>
            )}
          </div>
        )}

        {/* NOTICES */}
        {tab === 'notices' && (
          <div>
            <PageHeader
              title="Notices"
              sub={`${notices.length} published notice${notices.length !== 1 ? 's' : ''}`}
              action={noticeForm === null ? (
                <button onClick={function() { setNoticeForm('new'); }}
                  className="inline-flex items-center gap-2 text-sm font-semibold px-5 py-2.5 bg-primary-600 hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-400 text-white rounded-xl transition-all shadow-soft">
                  <Ico name="plus" cls="w-4 h-4" /> New Notice
                </button>
              ) : null}
            />
            {noticeForm !== null && (
              <NoticeForm
                initial={noticeForm === 'new' ? null : noticeForm}
                onSave={saveNotice}
                onCancel={function() { setNoticeForm(null); }}
                saving={saving}
              />
            )}
            {notices.length === 0 && noticeForm === null ? (
              <Empty title="No notices yet" sub="Publish your first notice to inform citizens.">
                <button onClick={function() { setNoticeForm('new'); }}
                  className="mt-3 px-5 py-2.5 bg-primary-600 hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-400 text-white text-sm font-semibold rounded-xl transition-all shadow-soft">
                  Publish Notice
                </button>
              </Empty>
            ) : (
              <div className="space-y-3">
                {notices.map(function(n) {
                  return (
                    <NoticeCard key={n._id} notice={n} onDelete={delNotice}
                      onEdit={function(notice) { setNoticeForm(notice); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                    />
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* QR CODE */}
        {tab === 'qr' && (
          <div>
            <PageHeader title="QR Code" sub="Citizens scan this to access village notices instantly" />
            <div className="bg-white dark:bg-dark-surface border border-border dark:border-dark-border rounded-2xl overflow-hidden">
              <div className="p-6 border-b border-border dark:border-dark-border flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-text-primary dark:text-dark-text-primary">Village QR Code</h3>
                  <p className="text-xs text-text-muted dark:text-dark-text-muted mt-0.5">Share with citizens for instant notice access</p>
                </div>
                <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/40 rounded-xl flex items-center justify-center">
                  <Ico name="qr" cls="w-5 h-5 text-primary-600 dark:text-primary-400" />
                </div>
              </div>
              <div className="p-6">
                {qrData && qrData.imageUrl ? (
                  <div className="flex flex-col sm:flex-row items-center gap-8">
                    <div className="p-5 bg-accent-mist dark:bg-dark-surface2 border border-border dark:border-dark-border rounded-2xl flex-shrink-0">
                      <img src={qrData.imageUrl} alt="QR Code" className="w-40 h-40 object-contain" />
                    </div>
                    <div className="flex-1 space-y-3 w-full">
                      <div className="grid grid-cols-2 gap-3">
                        <InfoTile label="Village" value={village ? village.name : 'N/A'} />
                        {qrData.generatedAt && <InfoTile label="Generated" value={fmt(qrData.generatedAt)} />}
                      </div>
                      <div className="flex gap-3 pt-2">
                        <a href={qrData.imageUrl} target="_blank" rel="noopener noreferrer"
                          className="flex-1 text-center text-sm font-semibold px-4 py-2.5 border border-border dark:border-dark-border hover:border-primary-300 dark:hover:border-primary-700 text-text-secondary dark:text-dark-text-secondary rounded-xl transition-all">
                          Open Full
                        </a>
                        <button onClick={shareQr}
                          className="flex-1 inline-flex items-center justify-center gap-2 text-sm font-semibold px-4 py-2.5 bg-primary-600 hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-400 text-white rounded-xl transition-all shadow-soft">
                          <Ico name="share" cls="w-4 h-4" /> Share
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center py-10 gap-4">
                    <div className="w-20 h-20 rounded-2xl bg-accent-mist dark:bg-dark-surface2 border border-border dark:border-dark-border flex items-center justify-center">
                      <Ico name="qr" cls="w-10 h-10 text-text-muted dark:text-dark-text-muted" />
                    </div>
                    <p className="text-sm text-text-muted dark:text-dark-text-muted text-center max-w-xs">
                      Generate a QR code so citizens can scan and access village notices.
                    </p>
                    <button onClick={generateQr}
                      className="inline-flex items-center gap-2 text-sm font-semibold px-6 py-3 bg-primary-600 hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-400 text-white rounded-xl transition-all shadow-soft">
                      <Ico name="qr" cls="w-4 h-4" /> Generate QR Code
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* WORK GUIDE */}
        {tab === 'workguide' && (
          <div>
            <PageHeader title="Work Guide" sub="Step by step guide for managing your village" />
            <WorkGuideAdmin villageId={villageId} />
          </div>
        )}

      </main>

      {/* ── Footer always at bottom ── */}
      <Footer village={village} officials={officials} notices={notices} pending={pending} />

    </div>
  );
}