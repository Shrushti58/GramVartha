import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import * as api from '../services/api';
import { useTheme } from '../context/ThemeContext';

const TABS = [
  { key: 'villages',     label: 'Pending Villages', countKey: 'pendingVillages' },
  { key: 'admins',       label: 'Pending Admins',   countKey: 'pendingAdmins'   },
  { key: 'all-villages', label: 'All Villages',      countKey: null              },
];

function Spinner() {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-3">
      <div className="w-9 h-9 border-2 border-primary-200 dark:border-primary-800 border-t-primary-600 dark:border-t-primary-400 rounded-full animate-spin" />
      <p className="text-sm text-text-muted dark:text-dark-text-muted font-medium">Loading data...</p>
    </div>
  );
}

function Empty() {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-3">
      <div className="w-14 h-14 bg-accent-mist dark:bg-dark-surface2 rounded-2xl flex items-center justify-center">
        <svg className="w-7 h-7 text-primary-400 dark:text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <p className="text-sm font-semibold text-text-primary dark:text-dark-text-primary">All clear</p>
      <p className="text-xs text-text-muted dark:text-dark-text-muted">Nothing pending here</p>
    </div>
  );
}

function StatusBadge({ status }) {
  const map = {
    approved: 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 border border-primary-200 dark:border-primary-800',
    pending:  'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800',
    rejected: 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800',
  };
  const dot = {
    approved: 'bg-primary-500',
    pending:  'bg-amber-500',
    rejected: 'bg-red-500',
  };
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full capitalize ${map[status] || map.pending}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dot[status] || dot.pending}`} />
      {status}
    </span>
  );
}

function DocPreview({ url }) {
  return (
    <div className="border-t border-border dark:border-dark-border bg-accent-mist dark:bg-dark-surface2 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-primary-100 dark:bg-primary-900/40 rounded-lg flex items-center justify-center">
            <svg className="w-4 h-4 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <p className="text-xs font-semibold text-text-primary dark:text-dark-text-primary">
            Registration Document
          </p>
        </div>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors duration-200"
        >
          Open full size
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </a>
      </div>
      <img
        src={url}
        alt="Document"
        className="w-full max-h-96 object-contain rounded-xl border border-border dark:border-dark-border bg-white dark:bg-dark-surface shadow-soft"
      />
    </div>
  );
}

function VillageCard({ village, onApprove, onReject }) {
  const [showDoc, setShowDoc] = useState(false);
  return (
    <div className="bg-white dark:bg-dark-surface border border-border dark:border-dark-border rounded-2xl overflow-hidden hover:border-primary-200 dark:hover:border-primary-800 hover:shadow-medium dark:hover:shadow-dark-medium transition-all duration-200">
      <div className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-11 h-11 bg-primary-100 dark:bg-primary-900/40 rounded-xl flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div>
              <h3 className="text-base font-bold text-text-primary dark:text-dark-text-primary">
                {village.name}
              </h3>
              <p className="text-sm text-text-secondary dark:text-dark-text-secondary mt-0.5">
                {village.district}, {village.state}
              </p>
              <div className="flex items-center gap-1.5 mt-2">
                <svg className="w-3.5 h-3.5 text-text-muted dark:text-dark-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <p className="text-xs text-text-muted dark:text-dark-text-muted">
                  {village.requestedBy ? village.requestedBy.email : 'Unknown'}
                </p>
              </div>
            </div>
          </div>
          <span className="bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800 text-xs font-semibold px-3 py-1.5 rounded-full flex-shrink-0">
            Pending Review
          </span>
        </div>
        <div className="flex items-center gap-2 mt-5 pt-5 border-t border-border dark:border-dark-border">
          <button
            onClick={function() { onApprove(village._id); }}
            className="inline-flex items-center gap-2 text-sm font-semibold px-5 py-2.5 bg-primary-600 hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-400 text-white rounded-xl transition-all duration-200 shadow-soft"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Approve
          </button>
          <button
            onClick={function() { onReject(village._id); }}
            className="inline-flex items-center gap-2 text-sm font-semibold px-5 py-2.5 border border-border dark:border-dark-border hover:border-red-300 dark:hover:border-red-700 text-text-secondary dark:text-dark-text-secondary hover:text-red-600 dark:hover:text-red-400 rounded-xl transition-all duration-200"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            Reject
          </button>
          {village.documentUrl && (
            <button
              onClick={function() { setShowDoc(function(p) { return !p; }); }}
              className="inline-flex items-center gap-2 text-sm font-medium px-4 py-2.5 border border-border dark:border-dark-border hover:border-primary-300 dark:hover:border-primary-700 text-text-muted dark:text-dark-text-muted hover:text-primary-600 dark:hover:text-primary-400 rounded-xl transition-all duration-200 ml-auto"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              {showDoc ? 'Hide Document' : 'View Document'}
            </button>
          )}
        </div>
      </div>
      {showDoc && village.documentUrl && (
        <DocPreview url={village.documentUrl} />
      )}
    </div>
  );
}

function AdminCard({ admin, onApprove }) {
  return (
    <div className="bg-white dark:bg-dark-surface border border-border dark:border-dark-border rounded-2xl p-6 hover:border-primary-200 dark:hover:border-primary-800 hover:shadow-medium dark:hover:shadow-dark-medium transition-all duration-200">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-11 h-11 bg-sky-100 dark:bg-sky-900/30 rounded-xl flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 text-sky-600 dark:text-sky-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <div>
            <h3 className="text-base font-bold text-text-primary dark:text-dark-text-primary">
              {admin.email}
            </h3>
            <p className="text-sm text-text-secondary dark:text-dark-text-secondary mt-0.5">
              Village: {admin.village ? admin.village.name : 'N/A'}
            </p>
            <div className="mt-2">
              <StatusBadge status={admin.status} />
            </div>
          </div>
        </div>
        {admin.status === 'pending' && (
          <button
            onClick={function() { onApprove(admin._id); }}
            className="inline-flex items-center gap-2 text-sm font-semibold px-5 py-2.5 bg-primary-600 hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-400 text-white rounded-xl transition-all duration-200 shadow-soft flex-shrink-0"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Approve
          </button>
        )}
      </div>
    </div>
  );
}

function VillageRow({ village }) {
  const formattedDate = village.createdAt
    ? new Date(village.createdAt).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    : 'N/A';

  return (
    <div className="bg-white dark:bg-dark-surface border border-border dark:border-dark-border rounded-2xl p-6 hover:border-primary-200 dark:hover:border-primary-800 hover:shadow-medium dark:hover:shadow-dark-medium transition-all duration-200">
      <div className="flex items-start justify-between gap-4 mb-5">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-accent-mist dark:bg-dark-surface2 rounded-xl flex items-center justify-center flex-shrink-0">
            <svg className="w-6 h-6 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <div>
            <h3 className="text-base font-bold text-text-primary dark:text-dark-text-primary">
              {village.name}
            </h3>
            <p className="text-sm text-text-secondary dark:text-dark-text-secondary mt-0.5">
              {village.district}, {village.state}
            </p>
          </div>
        </div>
        <StatusBadge status={village.status} />
      </div>
      <div className="border-t border-border dark:border-dark-border mb-5" />
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-accent-mist dark:bg-dark-surface2 rounded-xl p-3">
          <p className="text-xs text-text-muted dark:text-dark-text-muted mb-1">District</p>
          <p className="text-sm font-semibold text-text-primary dark:text-dark-text-primary">
            {village.district || 'N/A'}
          </p>
        </div>
        <div className="bg-accent-mist dark:bg-dark-surface2 rounded-xl p-3">
          <p className="text-xs text-text-muted dark:text-dark-text-muted mb-1">State</p>
          <p className="text-sm font-semibold text-text-primary dark:text-dark-text-primary">
            {village.state || 'N/A'}
          </p>
        </div>
        <div className="bg-accent-mist dark:bg-dark-surface2 rounded-xl p-3">
          <p className="text-xs text-text-muted dark:text-dark-text-muted mb-1">Registered On</p>
          <p className="text-sm font-semibold text-text-primary dark:text-dark-text-primary">
            {formattedDate}
          </p>
        </div>
        <div className="bg-accent-mist dark:bg-dark-surface2 rounded-xl p-3">
          <p className="text-xs text-text-muted dark:text-dark-text-muted mb-1">Village ID</p>
          <p className="text-sm font-semibold text-text-primary dark:text-dark-text-primary font-mono tracking-wide">
            {village._id ? village._id.slice(-8).toUpperCase() : 'N/A'}
          </p>
        </div>
      </div>
    </div>
  );
}

function ThemeToggle() {
  const { dark, toggleTheme } = useTheme();
  return (
    <button
      onClick={toggleTheme}
      aria-label="Toggle theme"
      className="p-2.5 rounded-xl border border-border dark:border-dark-border hover:bg-accent-mist dark:hover:bg-dark-surface2 text-text-muted dark:text-dark-text-muted hover:text-primary-600 dark:hover:text-primary-400 transition-all duration-200"
    >
      {dark ? (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m8.66-9h-1M4.34 12h-1m15.07-6.07-.7.7M6.34 17.66l-.7.7m12.02 0-.7-.7M6.34 6.34l-.7-.7M12 7a5 5 0 100 10A5 5 0 0012 7z" />
        </svg>
      ) : (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
        </svg>
      )}
    </button>
  );
}

export default function SuperadminDashboard() {
  const navigate = useNavigate();
  const [adminRole, setAdminRole]             = useState(null);
  const [pendingVillages, setPendingVillages] = useState([]);
  const [pendingAdmins, setPendingAdmins]     = useState([]);
  const [villages, setVillages]               = useState([]);
  const [activeTab, setActiveTab]             = useState('villages');
  const [loading, setLoading]                 = useState(false);

  useEffect(function() {
    checkAdminRole();
    loadData();
  }, []);

  async function checkAdminRole() {
    try {
      const res = await api.getAdminProfile();
      if (res.data.role !== 'superadmin') { navigate('/admin/login'); }
      setAdminRole(res.data.role);
    } catch(e) {
      navigate('/admin/login');
    }
  }

  async function loadData() {
    setLoading(true);
    try {
      const [vRes, aRes, avRes] = await Promise.all([
        api.getPendingVillages(),
        api.getPendingAdmins(),
        api.getAllVillages(),
      ]);
      setPendingVillages(vRes.data);
      setPendingAdmins(aRes.data);
      setVillages(avRes.data);
    } catch(e) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  }

  async function handleApproveVillage(id) {
    try {
      await api.approveVillage(id);
      toast.success('Village approved');
      setPendingVillages(function(p) { return p.filter(function(v) { return v._id !== id; }); });
      loadData();
    } catch(e) {
      toast.error('Failed to approve village');
    }
  }

  async function handleRejectVillage(id) {
    try {
      await api.rejectVillage(id);
      toast.success('Village rejected');
      setPendingVillages(function(p) { return p.filter(function(v) { return v._id !== id; }); });
    } catch(e) {
      toast.error('Failed to reject village');
    }
  }

  async function handleApproveAdmin(id) {
    try {
      await api.approveAdmin(id);
      toast.success('Admin approved');
      setPendingAdmins(function(p) { return p.filter(function(a) { return a._id !== id; }); });
    } catch(e) {
      toast.error('Failed to approve admin');
    }
  }

  async function handleLogout() {
    try {
      await api.adminLogout();
      navigate('/');
    } catch(e) {
      console.error(e);
    }
  }

  if (adminRole !== 'superadmin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background dark:bg-dark-background font-sans">
        <p className="text-text-muted dark:text-dark-text-muted">Unauthorized</p>
      </div>
    );
  }

  const totalPending = pendingVillages.length + pendingAdmins.length;

  return (
    <div className="min-h-screen bg-background dark:bg-dark-background font-sans transition-colors duration-300">

      {/* ── Top Nav ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 dark:bg-dark-surface/95 backdrop-blur-md border-b border-border dark:border-dark-border transition-colors duration-300">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">

          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary-100 dark:bg-primary-900/40 border border-primary-200 dark:border-primary-800 flex items-center justify-center overflow-hidden">
              <img src="/gramvarthalogo.png" alt="GramVartha" className="w-full h-full object-contain" />
            </div>
            <div>
              <p className="text-sm font-bold text-text-primary dark:text-dark-text-primary leading-none">
                GramVartha
              </p>
              <p className="text-xs text-text-muted dark:text-dark-text-muted mt-0.5">
                Superadmin Panel
              </p>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="hidden md:flex items-center gap-5">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-primary-500 animate-pulse" />
                <p className="text-xs font-medium text-text-muted dark:text-dark-text-muted">
                  Platform Live
                </p>
              </div>
              <div className="w-px h-4 bg-border dark:bg-dark-border" />
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 bg-primary-100 dark:bg-primary-900/40 rounded-lg flex items-center justify-center">
                  <svg className="w-3.5 h-3.5 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <p className="text-xs font-semibold text-text-primary dark:text-dark-text-primary">
                  {villages.length} Villages
                </p>
              </div>
              <div className="w-px h-4 bg-border dark:bg-dark-border" />
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 bg-amber-100 dark:bg-amber-900/30 rounded-lg flex items-center justify-center">
                  <svg className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-xs font-semibold text-text-primary dark:text-dark-text-primary">
                  {totalPending} Pending
                </p>
              </div>
            </div>

            <div className="w-px h-4 bg-border dark:bg-dark-border hidden md:block" />

            <div className="flex items-center gap-2">
              <ThemeToggle />
              <button
                onClick={handleLogout}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-border dark:border-dark-border text-sm font-medium text-text-secondary dark:text-dark-text-secondary hover:bg-red-50 dark:hover:bg-red-950/30 hover:text-red-600 dark:hover:text-red-400 hover:border-red-200 dark:hover:border-red-800 transition-all duration-200"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Nav spacer */}
      <div className="h-[73px]" />

      {/* ── Page Content ── */}
      <div className="max-w-6xl mx-auto px-6 py-10">

        {/* Header */}
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 text-xs font-semibold px-3 py-1.5 rounded-full mb-3">
            <span className="w-1.5 h-1.5 rounded-full bg-primary-500 animate-pulse" />
            Superadmin Access
          </div>
          <h1 className="text-4xl font-bold text-text-primary dark:text-dark-text-primary tracking-tight">
            Control Panel
          </h1>
          <p className="text-text-muted dark:text-dark-text-muted text-sm mt-1">
            Manage village registrations, admin approvals and platform oversight.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-primary-800 dark:bg-primary-900 rounded-2xl p-6 shadow-large">
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-primary-300">Total Villages</p>
              <div className="w-9 h-9 bg-white/10 rounded-xl flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
            </div>
            <p className="text-5xl font-bold text-white">{villages.length}</p>
            <p className="text-primary-300 text-xs mt-2">Registered on platform</p>
          </div>
          <div className="bg-white dark:bg-dark-surface border border-border dark:border-dark-border rounded-2xl p-6 shadow-soft">
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-text-muted dark:text-dark-text-muted">Pending Villages</p>
              <div className="w-9 h-9 bg-amber-100 dark:bg-amber-900/30 rounded-xl flex items-center justify-center">
                <svg className="w-4 h-4 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <p className="text-5xl font-bold text-amber-500 dark:text-amber-400">{pendingVillages.length}</p>
            <p className="text-text-muted dark:text-dark-text-muted text-xs mt-2">Awaiting approval</p>
          </div>
          <div className="bg-white dark:bg-dark-surface border border-border dark:border-dark-border rounded-2xl p-6 shadow-soft">
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-text-muted dark:text-dark-text-muted">Pending Admins</p>
              <div className="w-9 h-9 bg-sky-100 dark:bg-sky-900/30 rounded-xl flex items-center justify-center">
                <svg className="w-4 h-4 text-sky-600 dark:text-sky-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
            </div>
            <p className="text-5xl font-bold text-sky-500 dark:text-sky-400">{pendingAdmins.length}</p>
            <p className="text-text-muted dark:text-dark-text-muted text-xs mt-2">Awaiting verification</p>
          </div>
        </div>

        {/* Tab Pills */}
        <div className="flex items-center gap-2 mb-6 flex-wrap">
          {TABS.map(function(tab) {
            const count = tab.countKey === 'pendingVillages'
              ? pendingVillages.length
              : tab.countKey === 'pendingAdmins'
              ? pendingAdmins.length
              : null;
            return (
              <button
                key={tab.key}
                onClick={function() { setActiveTab(tab.key); }}
                className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  activeTab === tab.key
                    ? 'bg-primary-600 dark:bg-primary-700 text-white shadow-medium'
                    : 'bg-white dark:bg-dark-surface border border-border dark:border-dark-border text-text-secondary dark:text-dark-text-secondary hover:border-primary-300 dark:hover:border-primary-700 hover:text-primary-600 dark:hover:text-primary-400'
                }`}
              >
                {tab.label}
                {count !== null && count > 0 && (
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                    activeTab === tab.key
                      ? 'bg-white/20 text-white'
                      : 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400'
                  }`}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div>
          {loading && <Spinner />}

          {!loading && activeTab === 'villages' && (
            <div className="space-y-4">
              {pendingVillages.length === 0 && <Empty />}
              {pendingVillages.map(function(village) {
                return (
                  <VillageCard
                    key={village._id}
                    village={village}
                    onApprove={handleApproveVillage}
                    onReject={handleRejectVillage}
                  />
                );
              })}
            </div>
          )}

          {!loading && activeTab === 'admins' && (
            <div className="space-y-4">
              {pendingAdmins.length === 0 && <Empty />}
              {pendingAdmins.map(function(admin) {
                return (
                  <AdminCard
                    key={admin._id}
                    admin={admin}
                    onApprove={handleApproveAdmin}
                  />
                );
              })}
            </div>
          )}

          {!loading && activeTab === 'all-villages' && (
            <div className="space-y-3">
              {villages.length === 0 && <Empty />}
              {villages.map(function(village) {
                return (
                  <VillageRow
                    key={village._id}
                    village={village}
                  />
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ── Footer ── */}
      <div className="mt-16">
        <div className="overflow-hidden leading-none">
          <svg viewBox="0 0 1440 80" xmlns="http://www.w3.org/2000/svg" className="w-full block">
            <path
              d="M0,40 C180,80 360,0 540,40 C720,80 900,0 1080,40 C1260,80 1380,20 1440,40 L1440,80 L0,80 Z"
              className="fill-primary-800 dark:fill-primary-900"
            />
          </svg>
        </div>
        <div className="bg-primary-800 dark:bg-primary-900 px-6 py-8">
          <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-white/10 border border-white/20 flex items-center justify-center overflow-hidden">
                <img src="/gramvarthalogo.png" alt="GramVartha" className="w-full h-full object-contain" />
              </div>
              <div>
                <p className="text-sm font-bold text-white">GramVartha</p>
                <p className="text-xs text-primary-300">Superadmin Control Panel</p>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-2">
              <span className="w-2 h-2 bg-primary-400 rounded-full animate-pulse" />
              <span className="text-xs text-white/60 font-medium">
                {villages.length} villages · {totalPending} pending actions
              </span>
            </div>
            <p className="text-xs text-white/30">
              © {new Date().getFullYear()} GramVartha. All rights reserved.
            </p>
          </div>
        </div>
      </div>

    </div>
  );
}