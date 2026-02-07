import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeftIcon,
  DocumentTextIcon,
  CalendarIcon,
  UserIcon,
  EyeIcon,
  TagIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowDownTrayIcon,
  UsersIcon,
  HeartIcon,
  MapPinIcon
} from "@heroicons/react/24/outline";
import {
  StarIcon as StarSolidIcon,
  EyeSlashIcon
} from "@heroicons/react/24/solid";

const NoticeDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [notice, setNotice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [fileLoading, setFileLoading] = useState(false);

  // 🌐 Fetch Notice Details
  useEffect(() => {
    const fetchNotice = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${import.meta.env.VITE_API_URL}/notice/generateDetails/${id}`);
        if (!res.ok) throw new Error("Failed to load notice details");
        const data = await res.json();
        setNotice(data.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchNotice();
  }, [id]);

  // 🧰 Utility Functions
  const getFileExtension = (name) =>
    typeof name === "string" && name.includes(".")
      ? name.split(".").pop().toLowerCase()
      : null;

  const isPDF = (f) => getFileExtension(f) === "pdf";

  const getFileIcon = (file) => {
    return "📄"; // PDF icon
  };

  const getFileTypeDescription = (file) => {
    return "PDF Document";
  };

  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case "high": return "bg-red-100 text-red-800 border-red-200";
      case "medium": return "bg-amber-100 text-amber-800 border-amber-200";
      case "low": return "bg-accent-olive bg-opacity-20 text-accent-olive border-accent-olive border-opacity-30";
      default: return "bg-primary-100 text-primary-800 border-primary-200";
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "published": return "bg-accent-teal bg-opacity-20 text-accent-teal-dark border-accent-teal border-opacity-30";
      case "draft": return "bg-primary-100 text-primary-800 border-primary-200";
      case "archived": return "bg-primary-200 text-primary-700 border-primary-300";
      case "expired": return "bg-red-100 text-red-800 border-red-200";
      default: return "bg-primary-100 text-primary-800 border-primary-200";
    }
  };

  const getCategoryColor = (category) => {
    const colors = {
      health: "bg-accent-berry bg-opacity-20 text-accent-berry border-accent-berry border-opacity-30",
      announcement: "bg-accent-teal bg-opacity-20 text-accent-teal-dark border-accent-teal border-opacity-30",
      event: "bg-primary-400 bg-opacity-20 text-primary-600 border-primary-400 border-opacity-30",
      alert: "bg-amber-100 text-amber-800 border-amber-200",
      update: "bg-accent-olive bg-opacity-20 text-accent-olive border-accent-olive border-opacity-30",
      general: "bg-primary-100 text-primary-800 border-primary-200"
    };
    return colors[category?.toLowerCase()] || colors.general;
  };

  const getCategoryIcon = (category) => {
    switch (category?.toLowerCase()) {
      case "health": return <HeartIcon className="w-4 h-4" />;
      default: return <TagIcon className="w-4 h-4" />;
    }
  };

  const handleDownload = async (url, filename) => {
    try {
      setFileLoading(true);
      const res = await fetch(url);
      const blob = await res.blob();
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);
    } catch {
      alert("Error downloading file. Please try again.");
    } finally {
      setFileLoading(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return "Unknown size";
    if (bytes < 1024) return bytes + " bytes";
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB";
    else return (bytes / 1048576).toFixed(1) + " MB";
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const getRelativeTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
    return `${Math.ceil(diffDays / 30)} months ago`;
  };

  // 🌀 Loading State
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-earth-gradient">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-4 border-primary-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-text-primary text-lg font-medium">Loading notice details...</p>
        </div>
      </div>
    );
  }

  // ❌ Error State
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-earth-gradient">
        <div className="text-center max-w-md p-6 bg-surface rounded-2xl shadow-soft-earth border border-primary-200">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <XCircleIcon className="w-8 h-8 text-red-600" />
          </div>
          <h3 className="text-xl font-bold mb-2 text-text-primary">Error Loading Notice</h3>
          <p className="text-red-600 mb-4 font-medium">{error}</p>
          <button
            onClick={() => navigate(-1)}
            className="bg-button-primary text-white px-6 py-2 rounded-lg hover:opacity-90 transition-all font-medium"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // ⚠️ No Data
  if (!notice) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-earth-gradient">
        <div className="text-center max-w-md p-6 bg-surface rounded-2xl shadow-soft-earth">
          <EyeSlashIcon className="w-16 h-16 text-text-muted mx-auto mb-4" />
          <h3 className="text-xl font-bold mb-2 text-text-primary">Notice Not Found</h3>
          <p className="text-text-secondary mb-4">The requested notice could not be found.</p>
          <button
            onClick={() => navigate(-1)}
            className="bg-button-primary text-white px-6 py-2 rounded-lg hover:opacity-90 transition-all font-medium"
          >
            Back to Notices
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-earth-gradient py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header with Back Button */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-3 text-primary-600 hover:text-primary-700 font-medium transition-colors group"
          >
            <ArrowLeftIcon className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            Back to Notices
          </button>
          
          {/* Status Badges */}
          <div className="flex items-center gap-3">
            {notice.isPinned && (
              <span className="flex items-center gap-1 bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-sm font-medium border border-amber-200">
                <StarSolidIcon className="w-4 h-4" />
                Pinned
              </span>
            )}
            <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(notice.status)}`}>
              {notice.status || "Unknown"}
            </span>
          </div>
        </div>

        {/* Main Card */}
        <div className="bg-surface rounded-2xl shadow-soft-earth border border-primary-100 overflow-hidden animate-fade-in">
          {/* Header Section */}
          <div className="bg-button-primary text-white px-6 py-8">
            <div className="flex items-center gap-3 mb-4 flex-wrap">
              <span className={`px-3 py-1 rounded-full text-sm font-medium border flex items-center gap-2 ${getCategoryColor(notice.category)}`}>
                {getCategoryIcon(notice.category)}
                {notice.category ? notice.category.charAt(0).toUpperCase() + notice.category.slice(1) : "General"}
              </span>
              <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getPriorityColor(notice.priority)}`}>
                {notice.priority ? notice.priority.charAt(0).toUpperCase() + notice.priority.slice(1) : "Standard"} Priority
              </span>
            </div>
            
            <h1 className="text-3xl font-serif font-bold mb-4 leading-tight">
              {notice.title}
            </h1>
            
            <div className="flex flex-wrap gap-4 text-primary-100 text-sm">
              <div className="flex items-center gap-2">
                <UserIcon className="w-4 h-4" />
                <span className="font-medium">{notice.createdBy?.name || "Unknown Author"}</span>
              </div>
              <div className="flex items-center gap-2">
                <CalendarIcon className="w-4 h-4" />
                Published: {formatDate(notice.publishDate)}
                <span className="text-primary-200">({getRelativeTime(notice.publishDate)})</span>
              </div>
              {notice.expiryDate && (
                <div className="flex items-center gap-2">
                  <ClockIcon className="w-4 h-4" />
                  Expires: {formatDate(notice.expiryDate)}
                </div>
              )}
            </div>
          </div>

          {/* Body Content */}
          <div className="p-6 space-y-6">
            {/* Description */}
            <section>
              <h2 className="text-xl font-serif font-bold mb-3 text-text-primary flex items-center gap-2">
                <DocumentTextIcon className="w-5 h-5 text-primary-500" />
                Notice Description
              </h2>
              <div className="bg-primary-50 rounded-lg p-4 border border-primary-200">
                <p className="text-text-secondary leading-relaxed whitespace-pre-wrap">
                  {notice.description}
                </p>
              </div>
            </section>

            {/* Key Information Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Audience & Wards */}
              <div className="bg-primary-50 rounded-lg p-4 border border-primary-200">
                <h3 className="font-semibold text-text-primary mb-2 flex items-center gap-2">
                  <UsersIcon className="w-4 h-4 text-primary-500" />
                  Target Information
                </h3>
                <div className="space-y-2">
                  <div>
                    <span className="text-sm text-text-muted">Audience: </span>
                    <span className="font-medium text-text-primary">
                      {notice.targetAudience === "all" ? "All Citizens" : notice.targetAudience}
                    </span>
                  </div>
                  {notice.targetWards && notice.targetWards.length > 0 ? (
                    <div>
                      <span className="text-sm text-text-muted">Wards: </span>
                      <span className="font-medium text-text-primary">
                        {notice.targetWards.join(", ")}
                      </span>
                    </div>
                  ) : (
                    <div>
                      <span className="text-sm text-text-muted">Wards: </span>
                      <span className="font-medium text-text-primary">All Wards</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Stats Card */}
              <div className="bg-accent-teal bg-opacity-10 rounded-lg p-4 border border-accent-teal border-opacity-20">
                <h3 className="font-semibold text-text-primary mb-3 flex items-center gap-2">
                  <EyeIcon className="w-4 h-4 text-accent-teal" />
                  Engagement Stats
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-accent-teal-dark">{notice.views}</div>
                    <div className="text-xs text-accent-teal">Total Views</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-accent-teal-dark">{notice.uniqueViews}</div>
                    <div className="text-xs text-accent-teal">Unique Views</div>
                  </div>
                </div>
                {notice.lastViewedAt && (
                  <div className="mt-2 text-xs text-accent-teal">
                    Last viewed: {getRelativeTime(notice.lastViewedAt)}
                  </div>
                )}
              </div>
            </div>

            {/* Tags */}
            {notice.tags && notice.tags.length > 0 && (
              <section>
                <h3 className="font-semibold text-text-primary mb-2 flex items-center gap-2">
                  <TagIcon className="w-4 h-4 text-text-muted" />
                  Tags
                </h3>
                <div className="flex flex-wrap gap-2">
                  {notice.tags.map((tag, index) => (
                    <span 
                      key={index}
                      className="bg-primary-100 text-primary-700 px-3 py-1 rounded-full text-sm border border-primary-300"
                    >
                      {tag.replace(/"/g, '')}
                    </span>
                  ))}
                </div>
              </section>
            )}

            {/* File Attachment */}
            {notice.fileUrl && (
              <section className="border-t border-primary-200 pt-6">
                <h2 className="text-xl font-serif font-bold mb-4 text-text-primary">Attachment</h2>
                <div className="bg-primary-50 rounded-xl border-2 border-dashed border-primary-300 p-6">
                  <div className="flex flex-col lg:flex-row gap-6 items-center">
                    {/* File Icon */}
                    <div className="flex-shrink-0">
                      <div className="w-20 h-24 bg-surface rounded-lg shadow-soft-earth border border-primary-200 flex items-center justify-center">
                        <span className="text-3xl">{getFileIcon(notice.fileName)}</span>
                      </div>
                    </div>

                    {/* File Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-bold text-text-primary mb-2 truncate">
                        {notice.fileName}
                      </h3>
                      
                      <div className="space-y-1 text-sm text-text-muted mb-4">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">Type:</span>
                          <span>{getFileTypeDescription(notice.fileName)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">Size:</span>
                          <span>{formatFileSize(notice.fileSize)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">Uploaded:</span>
                          <span>{getRelativeTime(notice.createdAt)}</span>
                        </div>
                      </div>

                      <button
                        onClick={() => handleDownload(notice.fileUrl, notice.fileName)}
                        disabled={fileLoading}
                        className="flex items-center gap-2 px-6 py-3 bg-button-primary text-white rounded-lg hover:opacity-90 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed shadow-soft-earth"
                      >
                        <ArrowDownTrayIcon className="w-4 h-4" />
                        {fileLoading ? "Downloading..." : "Download PDF"}
                      </button>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* Status Information */}
            <section className="border-t border-primary-200 pt-6">
              <h2 className="text-xl font-serif font-bold mb-4 text-text-primary">Status Information</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-surface rounded-lg p-4 border border-primary-200 shadow-soft-earth">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircleIcon className={`w-5 h-5 ${notice.computed?.isActive ? 'text-accent-teal' : 'text-text-muted'}`} />
                    <span className="font-semibold text-text-primary">Status</span>
                  </div>
                  <p className={`text-lg font-bold ${notice.computed?.isActive ? 'text-accent-teal-dark' : 'text-red-600'}`}>
                    {notice.computed?.isActive ? 'Active' : 'Inactive'}
                  </p>
                </div>

                <div className="bg-surface rounded-lg p-4 border border-primary-200 shadow-soft-earth">
                  <div className="flex items-center gap-2 mb-2">
                    <CalendarIcon className="w-5 h-5 text-primary-500" />
                    <span className="font-semibold text-text-primary">Days Published</span>
                  </div>
                  <p className="text-lg font-bold text-primary-600">
                    {notice.computed?.daysSincePublication || 0} days
                  </p>
                </div>

                <div className="bg-surface rounded-lg p-4 border border-primary-200 shadow-soft-earth">
                  <div className="flex items-center gap-2 mb-2">
                    <ClockIcon className="w-5 h-5 text-amber-600" />
                    <span className="font-semibold text-text-primary">Days Until Expiry</span>
                  </div>
                  <p className={`text-lg font-bold ${(notice.computed?.daysUntilExpiry || 0) <= 3 ? 'text-red-600' : 'text-amber-600'}`}>
                    {notice.computed?.daysUntilExpiry || 0} days
                  </p>
                </div>

                <div className="bg-surface rounded-lg p-4 border border-primary-200 shadow-soft-earth">
                  <div className="flex items-center gap-2 mb-2">
                    <ExclamationTriangleIcon className="w-5 h-5 text-accent-berry" />
                    <span className="font-semibold text-text-primary">Expiry Status</span>
                  </div>
                  <p className={`text-lg font-bold ${notice.computed?.isExpiringSoon ? 'text-red-600' : 'text-accent-teal-dark'}`}>
                    {notice.computed?.isExpiringSoon ? 'Expiring Soon' : 'Active'}
                  </p>
                </div>
              </div>
            </section>
          </div>

          {/* Footer */}
          <div className="border-t border-primary-200 bg-primary-50 px-6 py-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-sm text-text-muted">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  <UserIcon className="w-4 h-4" />
                  <span>Created by <strong className="text-text-primary">{notice.createdBy?.name}</strong></span>
                </div>
                <div className="flex items-center gap-1">
                  <CalendarIcon className="w-4 h-4" />
                  <span>Created {formatDate(notice.createdAt)}</span>
                </div>
              </div>
              <div className="text-xs text-text-muted">
                Notice ID: {notice.id}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NoticeDetails;