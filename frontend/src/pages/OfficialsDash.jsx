import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import ComplaintsDashboard from "../pages/Complaintsdashboard";
import OfficialSchemes from "../components/OfficialSchemes";
import { useTheme } from "../context/ThemeContext";
import { useTranslation } from "react-i18next";

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// ─── Icons ────────────────────────────────────────────────────────────────────

const Spinner = ({ size = 16 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    className="animate-spin text-primary-500"
  >
    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeOpacity="0.2" strokeWidth="4" />
    <path d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" fill="currentColor" />
  </svg>
);

const ThemeToggle = () => {
  const { dark, toggleTheme } = useTheme();
  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-xl border border-border dark:border-dark-border hover:bg-accent-mist dark:hover:bg-dark-surface2 text-text-muted dark:text-dark-text-muted hover:text-primary-600 transition-colors"
    >
      {dark ? (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/>
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
};

// ─── Notice Card ─────────────────────────────────────────────────────────────

const NoticeCard = ({ notice, onEdit, onDelete, onView }) => {
  const { t } = useTranslation();
  const isUrgent = notice.priority === 'high' || notice.category === 'urgent';

  const getCategoryColor = (category) => {
    const colors = {
      development: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400",
      health: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400",
      education: "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400",
      agriculture: "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400",
      employment: "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400",
      social_welfare: "bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-400",
      tax_billing: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400",
      election: "bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400",
      urgent: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400",
      general: "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-400",
    };
    return colors[category] || colors.general;
  };

  return (
    <div className={`bg-white dark:bg-dark-surface border rounded-xl p-4 shadow-soft hover:shadow-md transition-all ${isUrgent ? 'border-red-200 dark:border-red-800' : 'border-border dark:border-dark-border'}`}>
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap mb-1.5">
            <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${getCategoryColor(notice.category)}`}>
              {notice.category}
            </span>
            {notice.isPinned && (
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400">
                📌 Pinned
              </span>
            )}
            {isUrgent && (
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400">
                ⚠️ Urgent
              </span>
            )}
            {notice.fileUrl && (
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400">
                📎 File
              </span>
            )}
          </div>
          <h3 className="font-semibold text-text-primary dark:text-dark-text-primary text-sm">
            {notice.title}
          </h3>
          <p className="text-sm text-text-secondary dark:text-dark-text-secondary line-clamp-2">
            {notice.description}
          </p>
          <p className="text-xs text-text-muted dark:text-dark-text-muted mt-1">
            {notice.createdAt ? new Date(notice.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : ''}
            {notice.views !== undefined && ` · ${notice.views} views`}
          </p>
        </div>
        <div className="flex flex-row sm:flex-col gap-2 flex-shrink-0">
          <button
            onClick={() => onEdit(notice)}
            className="flex-1 sm:flex-none px-3 py-1.5 text-xs font-semibold bg-accent-mist dark:bg-dark-surface2 hover:bg-primary-100 text-primary-600 dark:text-primary-400 rounded-lg border border-border dark:border-dark-border hover:border-primary-200 transition-colors"
          >
            Edit
          </button>
          {notice.fileUrl && (
            <button
              onClick={() => onView(notice)}
              className="flex-1 sm:flex-none px-3 py-1.5 text-xs font-semibold bg-accent-mist dark:bg-dark-surface2 text-text-secondary dark:text-dark-text-secondary rounded-lg border border-border dark:border-dark-border hover:border-primary-200 transition-colors"
            >
              View
            </button>
          )}
          <button
            onClick={() => onDelete(notice._id)}
            className="flex-1 sm:flex-none px-3 py-1.5 text-xs font-semibold bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg border border-red-200 dark:border-red-800 hover:bg-red-100 transition-colors"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Stats ────────────────────────────────────────────────────────────────────

const Stats = ({ stats }) => {
  const { t } = useTranslation();

  const STAT_CARDS = [
    {
      labelKey: "Total Notices",
      value: stats.total,
      bgCls: "bg-primary-100 dark:bg-primary-900/30",
      iconCls: "text-primary-600 dark:text-primary-400",
      icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
    },
    {
      labelKey: "Active",
      value: stats.active,
      bgCls: "bg-sky-100 dark:bg-sky-900/30",
      iconCls: "text-sky-600 dark:text-sky-400",
      icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z",
    },
    {
      labelKey: "Pinned",
      value: stats.pinned,
      bgCls: "bg-amber-100 dark:bg-amber-900/30",
      iconCls: "text-amber-600 dark:text-amber-400",
      icon: "M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z",
    },
    {
      labelKey: "Urgent",
      value: stats.urgent,
      bgCls: "bg-red-100 dark:bg-red-900/30",
      iconCls: "text-red-600 dark:text-red-400",
      icon: "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z",
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {STAT_CARDS.map((s) => (
        <div
          key={s.labelKey}
          className="bg-white dark:bg-dark-surface border border-border dark:border-dark-border rounded-xl p-4 shadow-soft"
        >
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${s.bgCls}`}>
            <svg className={`w-4 h-4 ${s.iconCls}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d={s.icon} />
            </svg>
          </div>
          <p className="text-2xl font-bold text-text-primary dark:text-dark-text-primary">
            {s.value}
          </p>
          <p className="text-xs text-text-muted dark:text-dark-text-muted mt-0.5 font-medium">
            {s.labelKey}
          </p>
        </div>
      ))}
    </div>
  );
};

// ─── Skeleton ─────────────────────────────────────────────────────────────────

const CardSkeleton = () => (
  <div className="bg-white dark:bg-dark-surface border border-border dark:border-dark-border rounded-xl p-4 animate-pulse">
    <div className="flex justify-between">
      <div className="flex-1">
        <div className="flex gap-2 mb-2">
          <div className="h-6 w-16 bg-gray-200 dark:bg-gray-700 rounded-full" />
          <div className="h-6 w-16 bg-gray-200 dark:bg-gray-700 rounded-full" />
        </div>
        <div className="h-4 w-3/4 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
        <div className="h-3 w-full bg-gray-200 dark:bg-gray-700 rounded mb-1" />
        <div className="h-3 w-2/3 bg-gray-200 dark:bg-gray-700 rounded" />
      </div>
      <div className="flex gap-2">
        <div className="h-8 w-16 bg-gray-200 dark:bg-gray-700 rounded-lg" />
        <div className="h-8 w-16 bg-gray-200 dark:bg-gray-700 rounded-lg" />
      </div>
    </div>
  </div>
);

const StatsSkeleton = () => (
  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
    {[1, 2, 3, 4].map(i => (
      <div key={i} className="bg-white dark:bg-dark-surface border border-border dark:border-dark-border rounded-xl p-4 animate-pulse">
        <div className="w-9 h-9 bg-gray-200 dark:bg-gray-700 rounded-xl mb-3" />
        <div className="h-7 w-12 bg-gray-200 dark:bg-gray-700 rounded mb-1" />
        <div className="h-3 w-16 bg-gray-200 dark:bg-gray-700 rounded" />
      </div>
    ))}
  </div>
);

// ─── Modal Components ────────────────────────────────────────────────────────

const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
        <div className="relative bg-white dark:bg-gray-900 rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl">
          <div className="sticky top-0 bg-white dark:bg-gray-900 flex items-center justify-between border-b border-border dark:border-dark-border px-6 py-4">
            <h3 className="text-xl font-bold text-text-primary dark:text-dark-text-primary">
              {title}
            </h3>
            <button
              onClick={onClose}
              className="p-1 text-text-muted dark:text-dark-text-muted hover:text-text-primary transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="px-6 py-4">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

const ConfirmModal = ({ isOpen, onClose, onConfirm }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Delete Notice">
      <div className="space-y-4">
        <p className="text-sm text-text-secondary dark:text-dark-text-secondary">
          Are you sure you want to delete this notice? This action cannot be undone.
        </p>
        <div className="flex gap-3 pt-2">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-border dark:border-dark-border text-text-secondary dark:text-dark-text-secondary text-sm font-semibold rounded-xl hover:bg-accent-mist transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-xl transition-colors"
          >
            Delete
          </button>
        </div>
      </div>
    </Modal>
  );
};

const NoticeFormModal = ({ isOpen, onClose, initial, onSave, saving }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('general');
  const [priority, setPriority] = useState('medium');
  const [isPinned, setIsPinned] = useState(false);
  const [file, setFile] = useState(null);

  useEffect(() => {
    if (initial) {
      setTitle(initial.title || '');
      setDescription(initial.description || '');
      setCategory(initial.category || 'general');
      setPriority(initial.priority || 'medium');
      setIsPinned(initial.isPinned || false);
      setFile(null);
    } else {
      setTitle('');
      setDescription('');
      setCategory('general');
      setPriority('medium');
      setIsPinned(false);
      setFile(null);
    }
  }, [initial, isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      toast.error('Please fill in all required fields');
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
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={initial ? 'Edit Notice' : 'New Notice'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-text-secondary dark:text-dark-text-secondary mb-1.5">
            Title *
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter notice title"
            className="w-full px-3.5 py-2.5 rounded-xl border border-border dark:border-dark-border bg-white dark:bg-dark-surface2 text-sm text-text-primary dark:text-dark-text-primary placeholder-text-muted outline-none focus:ring-2 focus:ring-primary-400 transition-colors"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-text-secondary dark:text-dark-text-secondary mb-1.5">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-border dark:border-dark-border bg-white dark:bg-dark-surface2 text-sm text-text-primary dark:text-dark-text-primary outline-none focus:ring-2 focus:ring-primary-400 transition-colors"
            >
              <option value="development">Development</option>
              <option value="health">Health</option>
              <option value="education">Education</option>
              <option value="agriculture">Agriculture</option>
              <option value="employment">Employment</option>
              <option value="social_welfare">Social Welfare</option>
              <option value="tax_billing">Tax & Billing</option>
              <option value="election">Election</option>
              <option value="urgent">Urgent</option>
              <option value="general">General</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-text-secondary dark:text-dark-text-secondary mb-1.5">
              Priority
            </label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-border dark:border-dark-border bg-white dark:bg-dark-surface2 text-sm text-text-primary dark:text-dark-text-primary outline-none focus:ring-2 focus:ring-primary-400 transition-colors"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
        </div>

        <div
          onClick={() => setIsPinned(!isPinned)}
          className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
            isPinned ? 'bg-accent-mist dark:bg-dark-surface2 border-primary-200 dark:border-primary-700' : 'border-border dark:border-dark-border'
          }`}
        >
          <div className={`w-9 h-[22px] rounded-full relative flex-shrink-0 transition-all ${isPinned ? 'bg-primary-600' : 'bg-gray-300 dark:bg-gray-600'}`}>
            <div className={`w-4 h-4 bg-white rounded-full absolute top-[3px] shadow-sm transition-all ${isPinned ? 'left-[20px]' : 'left-[3px]'}`} />
          </div>
          <div>
            <p className="text-sm font-semibold text-text-primary dark:text-dark-text-primary">Pin to top</p>
            <p className="text-xs text-text-muted dark:text-dark-text-muted">Make this notice appear at the top</p>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-text-secondary dark:text-dark-text-secondary mb-1.5">
            Description *
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter notice description"
            rows={4}
            className="w-full px-3.5 py-2.5 rounded-xl border border-border dark:border-dark-border bg-white dark:bg-dark-surface2 text-sm text-text-primary dark:text-dark-text-primary placeholder-text-muted outline-none focus:ring-2 focus:ring-primary-400 transition-colors resize-none"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-text-secondary dark:text-dark-text-secondary mb-1.5">
            Attachment
          </label>
          <label className="flex items-center gap-3 w-full px-3.5 py-2.5 rounded-xl border border-dashed border-border dark:border-dark-border bg-accent-mist dark:bg-dark-surface2 hover:border-primary-400 cursor-pointer transition-colors">
            <svg className="w-4 h-4 text-text-muted" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/>
              <path d="M20.39 18.39A5 5 0 0018 9h-1.26A8 8 0 103 16.3"/>
            </svg>
            <span className={`text-sm ${file ? 'text-text-primary font-medium' : 'text-text-muted'}`}>
              {file ? file.name : 'Choose file'}
            </span>
            <input
              type="file"
              className="hidden"
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              onChange={(e) => setFile(e.target.files[0])}
            />
          </label>
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 border border-border dark:border-dark-border text-text-secondary dark:text-dark-text-secondary text-sm font-semibold rounded-xl hover:bg-accent-mist transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving || !title.trim() || !description.trim()}
            className="flex-1 py-2.5 bg-primary-600 hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-400 text-white text-sm font-semibold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {saving && <Spinner size={14} />}
            {saving ? 'Saving...' : initial ? 'Update' : 'Publish'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

// ─── Main Dashboard ──────────────────────────────────────────────────────────

const PAGE_TABS = [
  { key: 'notices', label: 'Notices', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
  { key: 'complaints', label: 'Complaints', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
  { key: 'schemes', label: 'Add Village Scheme', icon: 'M12 6v6m0 0v6m0-6h6m-6 0H6' },
];

const FILTER_TABS = [
  { key: 'all', label: 'All' },
  { key: 'active', label: 'Active' },
  { key: 'pinned', label: 'Pinned' },
  { key: 'urgent', label: 'Urgent' },
];

export default function OfficialsDashboard() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [officialVillageId, setOfficialVillageId] = useState(null);
  const [activeTab, setActiveTab] = useState('all');
  const [activePage, setActivePage] = useState('notices');
  const [noticeForm, setNoticeForm] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [viewNotice, setViewNotice] = useState(null);

  useEffect(() => {
    fetchNotices();
  }, []);

  const fetchNotices = async () => {
    try {
      setLoading(true);
      const profileRes = await axios.get(`${API_BASE_URL}/officials/profile`, { withCredentials: true });
      const villageId = profileRes.data?.village?._id || profileRes.data?.village;
      if (!villageId) {
        toast.error('No village assigned to your profile');
        setNotices([]);
        return;
      }
      setOfficialVillageId(villageId);
      const noticesRes = await axios.get(`${API_BASE_URL}/notice/village/${villageId}`, { withCredentials: true });
      setNotices(Array.isArray(noticesRes.data?.notices) ? noticesRes.data.notices : []);
    } catch {
      toast.error('Failed to load notices');
      setNotices([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (fd) => {
    setSaving(true);
    try {
      if (noticeForm && noticeForm !== 'new') {
        fd.append('noticeId', noticeForm._id);
      } else if (officialVillageId) {
        fd.append('village', officialVillageId);
      }
      const res = await axios.post(`${API_BASE_URL}/notice/upload`, fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
        withCredentials: true
      });
      const savedNotice = res.data?.notice;
      if (savedNotice) {
        setNotices(prev => {
          if (noticeForm && noticeForm !== 'new') {
            return prev.map(n => n._id === savedNotice._id ? savedNotice : n);
          }
          return [savedNotice, ...prev];
        });
      }
      toast.success(noticeForm && noticeForm !== 'new' ? 'Notice updated!' : 'Notice published!');
      setNoticeForm(null);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save notice');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API_BASE_URL}/notice/delete/${id}`, { withCredentials: true });
      toast.success('Notice deleted!');
      setDeleteTarget(null);
      setNotices(prev => prev.filter(n => n._id !== id));
    } catch {
      toast.error('Failed to delete notice');
    }
  };

  const handleLogout = async () => {
    try {
      await axios.post(`${API_BASE_URL}/officials/logout`, {}, { withCredentials: true });
      toast.info('Logged out');
      navigate('/');
    } catch {
      toast.error('Logout failed');
    }
  };

  const isActive = (n) => n?.status === 'published';

  const stats = {
    total: notices.length,
    active: notices.filter(isActive).length,
    pinned: notices.filter(n => n?.isPinned).length,
    urgent: notices.filter(n => n?.priority === 'high' || n?.category === 'urgent').length,
  };

  const filtered = notices.filter(n => {
    if (activeTab === 'active') return isActive(n);
    if (activeTab === 'pinned') return n?.isPinned;
    if (activeTab === 'urgent') return n?.priority === 'high' || n?.category === 'urgent';
    return true;
  });

  const getTabCount = (key) => {
    const map = { all: stats.total, active: stats.active, pinned: stats.pinned, urgent: stats.urgent };
    return map[key] || 0;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background dark:bg-dark-background">
        <div className="h-16 bg-primary-900 animate-pulse" />
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-2" />
          <div className="h-4 w-64 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-8" />
          <StatsSkeleton />
          <div className="flex gap-2 my-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-9 w-20 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" />
            ))}
          </div>
          {[1, 2, 3].map(i => <CardSkeleton key={i} />)}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background dark:bg-dark-background">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-primary-900 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center overflow-hidden">
                <img src="/gramvarthalogo.png" alt="GramVartha" className="w-full h-full object-contain" />
              </div>
              <div>
                <p className="text-sm font-bold text-white">GramVartha</p>
                <p className="text-xs text-white/40">Official Portal</p>
              </div>
            </div>

            <div className="flex items-center gap-1 bg-white/5 rounded-xl p-1">
              {PAGE_TABS.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActivePage(tab.key)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                    activePage === tab.key
                      ? 'bg-white text-primary-900 shadow-sm'
                      : 'text-white/60 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d={tab.icon} />
                  </svg>
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-white/20 hover:bg-red-900/40 hover:border-red-700 text-white/60 hover:text-red-300 text-xs font-medium transition-all"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" />
              </svg>
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="h-16" />

      {/* Complaints Page */}
      {activePage === 'complaints' && (
        <div className="flex-1">
          <ComplaintsDashboard />
        </div>
      )}

      {/* Schemes Page */}
      {activePage === 'schemes' && (
        <div className="flex-1 max-w-7xl mx-auto px-4 py-8">
          <OfficialSchemes />
        </div>
      )}

      {/* Notices Page */}
      {activePage === 'notices' && (
        <main className="max-w-7xl mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-text-primary dark:text-dark-text-primary">
              Notice Board
            </h1>
            <p className="text-sm text-text-muted dark:text-dark-text-muted mt-1">
              Manage and publish notices for your village
            </p>
          </div>

          {/* Stats */}
          <Stats stats={stats} />

          {/* Filters */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 my-5">
            <div className="flex flex-wrap gap-2 bg-white dark:bg-dark-surface border border-border dark:border-dark-border rounded-xl p-1">
              {FILTER_TABS.map((filter) => (
                <button
                  key={filter.key}
                  onClick={() => setActiveTab(filter.key)}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 text-sm font-semibold rounded-lg transition-all ${
                    activeTab === filter.key
                      ? 'bg-primary-600 text-white shadow-soft'
                      : 'text-text-muted dark:text-dark-text-muted hover:text-text-primary'
                  }`}
                >
                  {filter.label}
                  <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full ${
                    activeTab === filter.key
                      ? 'bg-white/20 text-white'
                      : 'bg-accent-mist dark:bg-dark-surface2 text-text-muted dark:text-dark-text-muted'
                  }`}>
                    {getTabCount(filter.key)}
                  </span>
                </button>
              ))}
            </div>

            <button
              onClick={() => setNoticeForm('new')}
              className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-primary-600 hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-400 rounded-xl transition-colors shadow-soft"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              New Notice
            </button>
          </div>

          {/* Notice List */}
          {filtered.length === 0 ? (
            <div className="bg-white dark:bg-dark-surface border border-border dark:border-dark-border rounded-xl flex flex-col items-center justify-center py-16 gap-3 text-center">
              <div className="w-12 h-12 rounded-2xl bg-accent-mist dark:bg-dark-surface2 border border-border dark:border-dark-border flex items-center justify-center">
                <svg className="w-5 h-5 text-primary-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <p className="text-sm font-semibold text-text-primary dark:text-dark-text-primary">
                No notices found
              </p>
              <p className="text-sm text-text-muted dark:text-dark-text-muted">
                Create your first notice to get started
              </p>
              <button
                onClick={() => setNoticeForm('new')}
                className="mt-2 px-5 py-2.5 bg-primary-600 hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-400 text-white text-sm font-semibold rounded-xl transition-colors shadow-soft"
              >
                Create Notice
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map((notice) => (
                <NoticeCard
                  key={notice._id}
                  notice={notice}
                  onEdit={(n) => setNoticeForm(n)}
                  onDelete={(id) => setDeleteTarget(id)}
                  onView={(n) => setViewNotice(n)}
                />
              ))}
            </div>
          )}
        </main>
      )}

      {/* Modals */}
      <NoticeFormModal
        isOpen={noticeForm !== null}
        onClose={() => setNoticeForm(null)}
        initial={noticeForm === 'new' ? null : noticeForm}
        onSave={handleSave}
        saving={saving}
      />

      <ConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => handleDelete(deleteTarget)}
      />

      {/* File Viewer Modal */}
      <Modal
        isOpen={!!viewNotice}
        onClose={() => setViewNotice(null)}
        title={viewNotice?.title || 'View Notice'}
      >
        {viewNotice && (
          <div className="space-y-4">
            <div className="bg-accent-mist dark:bg-dark-surface2 rounded-xl p-4">
              <p className="text-sm text-text-secondary dark:text-dark-text-secondary">
                {viewNotice.description}
              </p>
            </div>
            {viewNotice.fileUrl && (
              <a
                href={viewNotice.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold rounded-xl transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download File
              </a>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}