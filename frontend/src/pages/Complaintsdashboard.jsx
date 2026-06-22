import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// ─── Constants ────────────────────────────────────────────────────────────────

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
    dot: "bg-amber-500",
  },
  "in-progress": {
    labelKey: "complaints.status.in_progress",
    bg: "bg-blue-100 dark:bg-blue-900/30",
    text: "text-blue-700 dark:text-blue-400",
    dot: "bg-blue-500",
  },
  resolved: {
    labelKey: "complaints.status.resolved",
    bg: "bg-green-100 dark:bg-green-900/30",
    text: "text-green-700 dark:text-green-400",
    dot: "bg-green-500",
  },
  rejected: {
    labelKey: "complaints.status.rejected",
    bg: "bg-red-100 dark:bg-red-900/30",
    text: "text-red-700 dark:text-red-400",
    dot: "bg-red-500",
  },
};

const TYPE_CFG = {
  issue: {
    labelKey: "complaints.type.issue",
    bg: "bg-red-100 dark:bg-red-900/30",
    text: "text-red-700 dark:text-red-400",
  },
  suggestion: {
    labelKey: "complaints.type.suggestion",
    bg: "bg-purple-100 dark:bg-purple-900/30",
    text: "text-purple-700 dark:text-purple-400",
  },
};

const fraudColor = (s) =>
  s > 60 ? "text-red-600 dark:text-red-400" : s > 30 ? "text-amber-600 dark:text-amber-400" : "text-green-600 dark:text-green-400";

const fraudBg = (s) =>
  s > 60
    ? "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800"
    : s > 30
      ? "bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800"
      : "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800";

const toJpg = (url) => {
  if (!url || !url.includes("res.cloudinary.com")) return url;
  return url
    .replace(/\/upload\/(v\d+\/)/, "/upload/f_jpg,q_auto/$1")
    .replace(/\/upload\/(?!v\d)/, "/upload/f_jpg,q_auto/");
};

// ─── Spinner ──────────────────────────────────────────────────────────────────

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

// ─── Skeleton ─────────────────────────────────────────────────────────────────

const CardSkeleton = () => (
  <div className="bg-white dark:bg-dark-surface border border-border dark:border-dark-border rounded-xl p-4 animate-pulse">
    <div className="flex gap-4">
      <div className="w-24 h-24 bg-gray-200 dark:bg-gray-700 rounded-lg flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="flex gap-2">
          <div className="h-6 w-16 bg-gray-200 dark:bg-gray-700 rounded" />
          <div className="h-6 w-16 bg-gray-200 dark:bg-gray-700 rounded" />
        </div>
        <div className="h-4 w-3/4 bg-gray-200 dark:bg-gray-700 rounded" />
        <div className="h-3 w-full bg-gray-200 dark:bg-gray-700 rounded" />
        <div className="h-3 w-2/3 bg-gray-200 dark:bg-gray-700 rounded" />
      </div>
    </div>
  </div>
);

function StatCardSkeleton() {
  return (
    <div className="bg-white dark:bg-dark-surface border border-border dark:border-dark-border rounded-xl sm:rounded-2xl p-3 sm:p-5 shadow-soft animate-pulse">
      <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-xl bg-gray-200 dark:bg-gray-700 mb-2 sm:mb-4" />
      <div className="h-6 sm:h-8 w-12 sm:w-16 bg-gray-200 dark:bg-gray-700 rounded mb-1 sm:mb-2" />
      <div className="h-2.5 sm:h-3 w-14 sm:w-20 bg-gray-200 dark:bg-gray-700 rounded" />
    </div>
  );
}

// ─── Badges ──────────────────────────────────────────────────────────────────

const StatusBadge = ({ status }) => {
  const { t } = useTranslation();
  const cfg = STATUS_CFG[status];
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${cfg.bg} ${cfg.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {t(cfg.labelKey)}
    </span>
  );
};

const TypeBadge = ({ type }) => {
  const { t } = useTranslation();
  const cfg = TYPE_CFG[type];
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${cfg.bg} ${cfg.text}`}>
      {t(cfg.labelKey)}
    </span>
  );
};

// ─── Fraud Score ─────────────────────────────────────────────────────────────

const FraudScore = ({ score }) => {
  const { t } = useTranslation();
  return (
    <div className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${fraudBg(score)}`}>
      <span className={`font-bold ${fraudColor(score)}`}>{score}%</span>
      <span className="text-text-muted dark:text-dark-text-muted">{t('complaints.fraud')}</span>
    </div>
  );
};

// ─── Complaint Card ───────────────────────────────────────────────────────────

const ComplaintCard = ({ 
  complaint, 
  expanded, 
  onToggle, 
  onStatusUpdate, 
  onResolve, 
  loading 
}) => {
  const { t } = useTranslation();
  const [newStatus, setNewStatus] = useState(complaint.status);
  const [showResolve, setShowResolve] = useState(false);
  const [file, setFile] = useState(null);

  const fraudScore = complaint.aiVerification?.fraudScore || 0;
  const hasImage = !!complaint.imageUrl;
  const isIssue = complaint.type === "issue";
  const isHighRisk = fraudScore > 60;

  const handleStatusChange = async () => {
    if (newStatus === complaint.status) return;
    await onStatusUpdate(newStatus);
  };

  return (
    <div className="bg-white dark:bg-dark-surface border border-border dark:border-dark-border rounded-xl overflow-hidden shadow-soft hover:shadow-md transition-shadow">
      {/* Header - always visible */}
      <div 
        className="flex items-start gap-3 p-4 cursor-pointer hover:bg-accent-mist dark:hover:bg-dark-surface2 transition-colors"
        onClick={onToggle}
      >
        {hasImage && (
          <img 
            src={toJpg(complaint.imageUrl)} 
            alt=""
            className="w-16 h-16 rounded-lg object-cover flex-shrink-0 border border-border dark:border-dark-border"
          />
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-1 flex-wrap">
            <TypeBadge type={complaint.type} />
            <StatusBadge status={complaint.status} />
            {isHighRisk && (
              <span className="text-xs bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 px-2 py-0.5 rounded-full">
                ⚠ {t('complaints.high_risk')}
              </span>
            )}
          </div>
          <h3 className="font-semibold text-text-primary dark:text-dark-text-primary text-sm">
            {complaint.title}
          </h3>
          <p className="text-sm text-text-secondary dark:text-dark-text-secondary line-clamp-1">
            {complaint.description}
          </p>
          <div className="flex items-center gap-3 mt-1 text-xs text-text-muted dark:text-dark-text-muted">
            <span>
              {new Date(complaint.createdAt).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'short',
                year: 'numeric'
              })}
            </span>
            {complaint.location?.lat && (
              <span>
                📍 {complaint.location.lat.toFixed(4)}, {complaint.location.lng.toFixed(4)}
              </span>
            )}
          </div>
        </div>
        <svg 
          className={`w-5 h-5 text-text-muted dark:text-dark-text-muted transition-transform flex-shrink-0 mt-1 ${expanded ? 'rotate-180' : ''}`}
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </div>

      {/* Expanded content */}
      {expanded && (
        <div className="border-t border-border dark:border-dark-border p-4 space-y-4">
          {/* Image */}
          {hasImage && (
            <div className="rounded-lg overflow-hidden border border-border dark:border-dark-border">
              <img 
                src={toJpg(complaint.imageUrl)} 
                alt={complaint.title}
                className="w-full max-h-64 object-cover"
              />
            </div>
          )}

          {/* Description */}
          <div>
            <h4 className="text-xs font-medium text-text-muted dark:text-dark-text-muted uppercase tracking-wider mb-1">
              {t('complaints.detail.description')}
            </h4>
            <p className="text-sm text-text-secondary dark:text-dark-text-secondary">
              {complaint.description}
            </p>
          </div>

          {/* AI Verification */}
          {complaint.aiVerification && (
            <div className="bg-accent-mist dark:bg-dark-surface2 rounded-lg p-3 space-y-2">
              <h4 className="text-xs font-medium text-text-muted dark:text-dark-text-muted uppercase tracking-wider">
                {t('complaints.detail.ai_verification')}
              </h4>
              <div className="flex flex-wrap gap-4 text-sm">
                <div>
                  <span className="text-text-muted dark:text-dark-text-muted">{t('complaints.detail.valid_issue')}: </span>
                  <span className={complaint.aiVerification.isValidIssue ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
                    {complaint.aiVerification.isValidIssue ? '✅' : '❌'}
                  </span>
                </div>
                <div>
                  <span className="text-text-muted dark:text-dark-text-muted">{t('complaints.detail.fraud_score')}: </span>
                  <FraudScore score={fraudScore} />
                </div>
              </div>
              <p className="text-xs text-text-secondary dark:text-dark-text-secondary">
                {complaint.aiVerification.remarks}
              </p>
              {complaint.aiVerification.labels?.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {complaint.aiVerification.labels.slice(0, 6).map((label, i) => (
                    <span key={i} className="text-xs bg-white dark:bg-dark-surface px-2 py-0.5 rounded-full text-text-muted dark:text-dark-text-muted border border-border dark:border-dark-border">
                      #{label}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Location */}
          {complaint.location?.lat && (
            <div className="flex items-center justify-between text-sm bg-accent-mist dark:bg-dark-surface2 px-3 py-2 rounded-lg">
              <span className="text-text-muted dark:text-dark-text-muted">{t('complaints.detail.location')}</span>
              <span className="font-mono text-text-primary dark:text-dark-text-primary">
                {complaint.location.lat.toFixed(6)}, {complaint.location.lng.toFixed(6)}
              </span>
            </div>
          )}

          {/* Actions */}
          {complaint.status !== 'resolved' ? (
            <div className="space-y-2">
              <div className="flex gap-2">
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="flex-1 px-3 py-2 text-sm border border-border dark:border-dark-border rounded-lg bg-white dark:bg-dark-surface text-text-primary dark:text-dark-text-primary focus:ring-2 focus:ring-primary-400 outline-none"
                >
                  <option value="pending">{t('complaints.status.pending')}</option>
                  <option value="in-progress">{t('complaints.status.in_progress')}</option>
                  <option value="rejected">{t('complaints.status.rejected')}</option>
                </select>
                <button
                  onClick={handleStatusChange}
                  disabled={loading || newStatus === complaint.status}
                  className="px-4 py-2 text-sm font-semibold text-white bg-primary-600 hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-400 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                >
                  {loading && <Spinner size={14} />}
                  {t('complaints.detail.save')}
                </button>
              </div>

              {isIssue && (
                <>
                  <button
                    onClick={() => setShowResolve(!showResolve)}
                    className="w-full px-4 py-2 text-sm font-semibold text-text-primary dark:text-dark-text-primary bg-accent-mist dark:bg-dark-surface2 hover:bg-border dark:hover:bg-dark-border rounded-lg transition-colors"
                  >
                    {showResolve ? t('complaints.detail.cancel') : t('complaints.detail.mark_resolved')}
                  </button>

                  {showResolve && (
                    <div className="space-y-2 bg-accent-mist dark:bg-dark-surface2 p-3 rounded-lg">
                      <p className="text-xs text-text-muted dark:text-dark-text-muted">
                        {t('complaints.detail.resolution_instruction')}
                      </p>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setFile(e.target.files[0])}
                        className="w-full text-sm text-text-primary dark:text-dark-text-primary file:mr-2 file:py-1.5 file:px-3 file:text-sm file:font-semibold file:bg-primary-50 dark:file:bg-primary-900/30 file:text-primary-700 dark:file:text-primary-400 file:border file:border-border dark:file:border-dark-border file:rounded-lg hover:file:bg-primary-100 dark:hover:file:bg-primary-900/50"
                      />
                      <button
                        onClick={() => onResolve(file)}
                        disabled={!file || loading}
                        className="w-full px-4 py-2 text-sm font-semibold text-white bg-primary-600 hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-400 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                      >
                        {loading && <Spinner size={14} />}
                        {t('complaints.detail.submit_resolution')}
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2 text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 px-4 py-3 rounded-lg">
              <span>✅</span>
              <span className="text-sm font-medium">{t('complaints.detail.resolved')}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ─── Stats ────────────────────────────────────────────────────────────────────

const Stats = ({ stats }) => {
  const { t } = useTranslation();

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

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-3 md:gap-4">
      {STAT_CARDS.map((s) => (
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
      ))}
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

export default function ComplaintsDashboard() {
  const { t } = useTranslation();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [initialLoading, setInitialLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [expandedId, setExpandedId] = useState(null);
  const [updating, setUpdating] = useState(false);

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE_URL}/complaints`, { withCredentials: true });
      setComplaints(Array.isArray(res.data) ? res.data : []);
    } catch {
      toast.error(t('complaints.errors.load_failed'));
      setComplaints([]);
    } finally {
      setLoading(false);
      setInitialLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  const handleStatusUpdate = async (id, status) => {
    try {
      setUpdating(true);
      await axios.patch(
        `${API_BASE_URL}/complaints/${id}/status`,
        { status },
        { withCredentials: true }
      );
      toast.success(t('complaints.success.status_updated'));
      await fetchComplaints();
      setExpandedId(null);
    } catch {
      toast.error(t('complaints.errors.update_failed'));
    } finally {
      setUpdating(false);
    }
  };

  const handleResolve = async (id, file) => {
    if (!file) {
      toast.error(t('complaints.errors.photo_required'));
      return;
    }
    try {
      setUpdating(true);
      const fd = new FormData();
      fd.append('image', file);
      await axios.patch(
        `${API_BASE_URL}/complaints/${id}/resolve`,
        fd,
        { withCredentials: true }
      );
      toast.success(t('complaints.success.resolved'));
      await fetchComplaints();
      setExpandedId(null);
    } catch {
      toast.error(t('complaints.errors.resolve_failed'));
    } finally {
      setUpdating(false);
    }
  };

  const stats = {
    total: complaints.length,
    pending: complaints.filter(c => c.status === 'pending').length,
    inProgress: complaints.filter(c => c.status === 'in-progress').length,
    resolved: complaints.filter(c => c.status === 'resolved').length,
    rejected: complaints.filter(c => c.status === 'rejected').length,
  };

  const filtered = complaints.filter(c => {
    const tabMatch = activeTab === 'all' || c.status === activeTab;
    const typeMatch = typeFilter === 'all' || c.type === typeFilter;
    return tabMatch && typeMatch;
  });

  const getTabCount = (key) => {
    const map = { 
      all: stats.total, 
      pending: stats.pending, 
      'in-progress': stats.inProgress, 
      resolved: stats.resolved, 
      rejected: stats.rejected 
    };
    return map[key] || 0;
  };

  const isInitialLoading = initialLoading;

  return (
    <div className="max-w-7xl mx-auto p-4 space-y-4">
      {/* Header */}
      <div className="mb-5 sm:mb-8">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-text-primary dark:text-dark-text-primary tracking-tight">
          {t('complaints.title')}
        </h1>
        <p className="text-xs sm:text-sm text-text-muted dark:text-dark-text-muted mt-0.5 sm:mt-1">
          {t('complaints.subtitle')}
        </p>
      </div>

      {/* Stats */}
      {isInitialLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-3 md:gap-4 mb-5 sm:mb-8">
          <StatCardSkeleton />
          <StatCardSkeleton />
          <StatCardSkeleton />
          <StatCardSkeleton />
          <StatCardSkeleton />
        </div>
      ) : (
        <Stats stats={stats} />
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-4">
        {FILTER_TABS.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold rounded-full transition-all ${
              activeTab === tab.key
                ? 'bg-primary-600 text-white shadow-soft'
                : 'bg-white dark:bg-dark-surface text-text-muted dark:text-dark-text-muted hover:text-text-primary dark:hover:text-dark-text-primary border border-border dark:border-dark-border'
            }`}
          >
            {t(tab.labelKey)}
            <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full ${
              activeTab === tab.key
                ? 'bg-white/20 text-white'
                : 'bg-accent-mist dark:bg-dark-surface2 text-text-muted dark:text-dark-text-muted'
            }`}>
              {getTabCount(tab.key)}
            </span>
          </button>
        ))}
        
        <div className="flex gap-1 ml-auto">
          {[
            { key: 'all', label: t('complaints.type.all') },
            { key: 'issue', label: t('complaints.type.issue') },
            { key: 'suggestion', label: t('complaints.type.suggestion') }
          ].map(type => (
            <button
              key={type.key}
              onClick={() => setTypeFilter(type.key)}
              className={`px-3 py-1.5 text-sm font-semibold rounded-full transition-all ${
                typeFilter === type.key
                  ? 'bg-primary-600 text-white shadow-soft'
                  : 'bg-white dark:bg-dark-surface text-text-muted dark:text-dark-text-muted hover:text-text-primary dark:hover:text-dark-text-primary border border-border dark:border-dark-border'
              }`}
            >
              {type.label}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div className="space-y-3">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white dark:bg-dark-surface border border-border dark:border-dark-border rounded-xl flex flex-col items-center justify-center py-12 gap-2 text-center">
          <div className="text-4xl">📭</div>
          <p className="text-sm font-semibold text-text-primary dark:text-dark-text-primary">
            {t('complaints.empty.title')}
          </p>
          <p className="text-sm text-text-muted dark:text-dark-text-muted">
            {t('complaints.empty.message')}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(complaint => (
            <ComplaintCard
              key={complaint._id}
              complaint={complaint}
              expanded={expandedId === complaint._id}
              onToggle={() => setExpandedId(expandedId === complaint._id ? null : complaint._id)}
              onStatusUpdate={(status) => handleStatusUpdate(complaint._id, status)}
              onResolve={(file) => handleResolve(complaint._id, file)}
              loading={updating}
            />
          ))}
        </div>
      )}
    </div>
  );
}