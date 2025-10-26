import React, { useEffect, useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import {
  MagnifyingGlassIcon,
  PaperClipIcon,
  CalendarIcon,
  UserIcon,
  XMarkIcon,
  DocumentTextIcon,
  ArrowDownTrayIcon,
  EyeIcon,
  FunnelIcon,
  ShareIcon,
  BookmarkIcon,
  BuildingOfficeIcon,
  HeartIcon,
  AcademicCapIcon,
  TruckIcon,
  BriefcaseIcon,
  UsersIcon,
  CurrencyDollarIcon,
  ClipboardDocumentListIcon,
  FireIcon,
  ExclamationCircleIcon,
} from "@heroicons/react/24/outline";
import { SparklesIcon, BookmarkIcon as BookmarkSolidIcon, EyeIcon as EyeSolidIcon } from "@heroicons/react/20/solid";

const Notices = () => {
  const { t } = useTranslation();
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedAttachment, setSelectedAttachment] = useState(null);
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [fileLoading, setFileLoading] = useState(false);
  
  // New state variables
  const [sortBy, setSortBy] = useState("newest");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [bookmarkedNotices, setBookmarkedNotices] = useState(new Set());
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const navigate = useNavigate();

  // Categories matching your backend schema with icons
  const categories = [
    { 
      id: "all", 
      name: "All Categories", 
      icon: ClipboardDocumentListIcon,
      color: "primary",
    },
    { 
      id: "development", 
      name: "Development", 
      icon: BuildingOfficeIcon,
      color: "blue",
    },
    { 
      id: "health", 
      name: "Health", 
      icon: HeartIcon,
      color: "red",
    },
    { 
      id: "education", 
      name: "Education", 
      icon: AcademicCapIcon,
      color: "purple",
    },
    { 
      id: "agriculture", 
      name: "Agriculture", 
      icon: TruckIcon,
      color: "green",
    },
    { 
      id: "employment", 
      name: "Employment", 
      icon: BriefcaseIcon,
      color: "yellow",
    },
    { 
      id: "social_welfare", 
      name: "Social Welfare", 
      icon: UsersIcon,
      color: "pink",
    },
    { 
      id: "tax_billing", 
      name: "Tax & Billing", 
      icon: CurrencyDollarIcon,
      color: "emerald",
    },
    { 
      id: "election", 
      name: "Election", 
      icon: UsersIcon,
      color: "orange",
    },
    { 
      id: "meeting", 
      name: "Meetings", 
      icon: UsersIcon,
      color: "indigo",
    },
    { 
      id: "general", 
      name: "General", 
      icon: DocumentTextIcon,
      color: "gray",
    },
  ];

  // Sort options with views
  const sortOptions = [
    { value: "newest", label: "Newest First" },
    { value: "oldest", label: "Oldest First" },
    { value: "popular", label: "Most Popular" },
    { value: "title-asc", label: "Title A-Z" },
    { value: "title-desc", label: "Title Z-A" },
  ];

  // Cookie utility functions
  const setCookie = (name, value, days = 365) => {
    const date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    const expires = "expires=" + date.toUTCString();
    document.cookie = name + "=" + value + ";" + expires + ";path=/;SameSite=Lax";
  };

  const getCookie = (name) => {
    const nameEQ = name + "=";
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) === ' ') c = c.substring(1, c.length);
      if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
  };

  // Get or create visitor ID
  const getVisitorId = () => {
    let visitorId = getCookie('notice_visitor_id');
    if (!visitorId) {
      visitorId = 'visitor_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      setCookie('notice_visitor_id', visitorId);
    }
    return visitorId;
  };

  // Get category count
  const getCategoryCount = (categoryId) => {
    if (categoryId === "all") return notices.length;
    return notices.filter(notice => notice.category === categoryId).length;
  };

  useEffect(() => {
    const fetchNotices = async () => {
      try {
        setLoading(true);
        const response = await fetch("http://localhost:3000/notice/fetch");
        if (!response.ok) {
          throw new Error("Failed to fetch notices");
        }
        const data = await response.json();
        
        // Initialize visitor ID
        getVisitorId();
        
        setNotices(data);
      } catch (err) {
        console.error("Error fetching notices:", err);
        setError("Cannot connect to server. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    // Load bookmarks from localStorage
    const savedBookmarks = localStorage.getItem('bookmarkedNotices');
    if (savedBookmarks) {
      setBookmarkedNotices(new Set(JSON.parse(savedBookmarks)));
    }

    fetchNotices();
  }, []);

  // Track view count in database
  const trackView = async (noticeId) => {
    const visitorId = getVisitorId();
    
    try {
      const response = await fetch(`http://localhost:3000/notice/${noticeId}/view`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ visitorId })
      });
      
      if (response.ok) {
        const result = await response.json();
        
        // Update local state with new view count from database
        setNotices(prevNotices => 
          prevNotices.map(notice => 
            notice._id === noticeId 
              ? { ...notice, views: result.views }
              : notice
          )
        );
        
        return result.views;
      } else {
        throw new Error('Failed to track view');
      }
    } catch (error) {
      console.error('Error tracking view:', error);
      // Update locally as fallback (will sync when backend is available)
      setNotices(prevNotices => 
        prevNotices.map(notice => 
          notice._id === noticeId 
            ? { ...notice, views: (notice.views || 0) + 1 }
            : notice
        )
      );
      return null;
    }
  };

  // Enhanced filtering and sorting
  const sortedAndFilteredNotices = useMemo(() => {
    let filtered = notices.filter((notice) => {
      const matchesSearch =
        notice.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        notice.description?.toLowerCase().includes(searchTerm.toLowerCase());

      const hasAttachment = !!notice.fileUrl;
      const matchesCategory = selectedCategory === "all" || notice.category === selectedCategory;

      if (filter === "with-attachments") {
        return matchesSearch && hasAttachment && matchesCategory;
      }
      return matchesSearch && matchesCategory;
    });

    // Sorting with views support
    return filtered.sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.createdAt) - new Date(a.createdAt);
        case "oldest":
          return new Date(a.createdAt) - new Date(b.createdAt);
        case "popular":
          return (b.views || 0) - (a.views || 0);
        case "title-asc":
          return (a.title || "").localeCompare(b.title || "");
        case "title-desc":
          return (b.title || "").localeCompare(a.title || "");
        default:
          return 0;
      }
    });
  }, [notices, searchTerm, filter, selectedCategory, sortBy]);

  // Search suggestions
  const handleSearchChange = (value) => {
    setSearchTerm(value);
    
    if (value.length > 2) {
      const suggestions = notices
        .filter(notice => 
          notice.title?.toLowerCase().includes(value.toLowerCase()) ||
          notice.description?.toLowerCase().includes(value.toLowerCase())
        )
        .slice(0, 5)
        .map(notice => notice.title);
      
      setSearchSuggestions(suggestions);
      setShowSuggestions(true);
    } else {
      setSearchSuggestions([]);
      setShowSuggestions(false);
    }
  };

  // Bookmark functionality
  const toggleBookmark = (noticeId, e) => {
    e.stopPropagation();
    e.preventDefault();
    setBookmarkedNotices(prev => {
      const newSet = new Set(prev);
      if (newSet.has(noticeId)) {
        newSet.delete(noticeId);
      } else {
        newSet.add(noticeId);
      }
      localStorage.setItem('bookmarkedNotices', JSON.stringify([...newSet]));
      return newSet;
    });
  };

  // Share functionality
  const handleShare = async (notice, e) => {
    e.stopPropagation();
    const shareData = {
      title: notice.title,
      text: notice.description,
      url: `${window.location.origin}/notice/${notice._id}`
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      navigator.clipboard.writeText(shareData.url);
      alert('Notice link copied to clipboard!');
    }
  };

  // Handle details with view tracking
  const handleDetails = async (noticeId) => {
    await trackView(noticeId);
    navigate(`/notice-details/${noticeId}`);
  };

  // File handling functions
  const getFileExtension = (filename) => {
    if (typeof filename !== "string" || !filename) return null;
    return filename.split(".").pop().toLowerCase();
  };

  const isImage = (filename) => {
    const imageExtensions = ["jpg", "jpeg", "png", "gif", "webp"];
    const extension = getFileExtension(filename);
    return extension && imageExtensions.includes(extension);
  };

  const isDocument = (filename) => {
    const documentExtensions = ["pdf", "docx", "doc", "pptx"];
    const extension = getFileExtension(filename);
    return extension && documentExtensions.includes(extension);
  };

  const cloudName = "dciadbf71";

  const getCloudinaryPreviewUrl = (fileUrl) => {
    if (!fileUrl) return null;
    const urlParts = fileUrl.split("/upload/");
    if (urlParts.length < 2) return null;
    const pathParts = urlParts[1].split("/");
    let publicIdStartIndex = 0;
    if (pathParts[0].startsWith("v")) publicIdStartIndex = 1;
    const publicId = pathParts.slice(publicIdStartIndex).join("/").split(".")[0];
    const extension = getFileExtension(fileUrl);
    if (!publicId || !extension) return null;
    if (isImage(fileUrl)) {
      return `https://res.cloudinary.com/${cloudName}/image/upload/w_600,h_400,c_fill/${publicId}.${extension}`;
    } else if (isDocument(fileUrl)) {
      return `https://res.cloudinary.com/${cloudName}/image/upload/w_600,h_400,c_fill,pg_1/${publicId}.jpg`;
    }
    return null;
  };

  // Handle file view with view tracking
  const handleFileView = async (fileUrl, filename, noticeId, e) => {
    if (e) e.stopPropagation();
    setFileLoading(true);
    try {
      // Track view when opening file
      await trackView(noticeId);
      
      if (isImage(fileUrl)) {
        setSelectedAttachment({ type: "image", url: fileUrl, filename: filename || "image" });
      } else if (getFileExtension(fileUrl) === "pdf") {
        setSelectedAttachment({ type: "pdf", url: fileUrl, filename: filename || "document.pdf" });
      } else {
        setSelectedAttachment({
          type: "document",
          url: fileUrl,
          filename: filename || "document",
          extension: getFileExtension(fileUrl),
        });
      }
    } catch (error) {
      console.error("Error viewing file:", error);
      handleFileDownload(fileUrl, filename);
    } finally {
      setFileLoading(false);
    }
  };

  const handleFileDownload = async (fileUrl, filename, e) => {
    if (e) e.stopPropagation();
    try {
      setFileLoading(true);
      const response = await fetch(fileUrl);
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      const extension = getFileExtension(fileUrl);
      link.download = filename || `document.${extension}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error("Error downloading file:", error);
      alert("Error downloading file. Please try again.");
    } finally {
      setFileLoading(false);
    }
  };

  // Get category info
  const getCategoryInfo = (categoryId) => {
    return categories.find(cat => cat.id === categoryId) || categories.find(cat => cat.id === "general");
  };

  // Format view count
  const formatViews = (views) => {
    if (!views) return "0";
    if (views < 1000) return views.toString();
    if (views < 1000000) return `${(views / 1000).toFixed(1)}k`;
    return `${(views / 1000000).toFixed(1)}M`;
  };

  // Loading and error states
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4 font-sans">
        <div className="text-center animate-fade-in">
          <div className="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h3 className="text-xl font-semibold text-text-primary mb-2 font-sans">
            Loading Notices
          </h3>
          <p className="text-text-muted font-sans">
            Please wait while we fetch the latest updates...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4 font-sans">
        <div className="bg-surface rounded-xl shadow-soft-earth p-8 max-w-md text-center animate-fade-in">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4">
            <ExclamationCircleIcon className="h-8 w-8 text-red-600" />
          </div>
          <h3 className="text-xl font-semibold text-text-primary mb-2 font-sans">
            Connection Issue
          </h3>
          <p className="text-text-secondary mb-4 font-sans">
            {error}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-button-primary text-white rounded-lg hover:opacity-90 transition-all font-medium font-sans shadow-soft-earth"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
 {/* Header Section - Modern & Bold */}
<div className="mb-16 animate-slide-up">
  <div className="text-center">
    <div className="flex items-center justify-center gap-4 mb-6">
      <div className="h-px w-12 bg-primary-300"></div>
      <span className="text-primary-600 font-semibold tracking-wider text-sm uppercase">Public Portal</span>
      <div className="h-px w-12 bg-primary-300"></div>
    </div>
    <h1 className="text-6xl md:text-7xl font-bold text-text-primary mb-6 font-serif tracking-tight">
      NOTICES
    </h1>
    <p className="text-text-muted text-lg max-w-2xl mx-auto font-medium">
      Your trusted source for official government communications and public announcements
    </p>
  </div>
</div>
        {/* Enhanced Search and Filter Section */}
        <div className="bg-surface rounded-xl shadow-soft-earth p-6 mb-8 animate-fade-in">
          <div className="flex flex-col lg:flex-row gap-4 mb-4">
            {/* Search Input with Suggestions */}
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
                <MagnifyingGlassIcon className="h-5 w-5 text-text-muted" />
              </div>
              <input
                type="text"
                placeholder="Search notices by title or content..."
                className="block w-full pl-10 pr-4 py-3 border border-primary-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-primary-50 font-sans transition-all"
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                onFocus={() => searchSuggestions.length > 0 && setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              />
              
              {/* Search Suggestions */}
              {showSuggestions && searchSuggestions.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-surface border border-primary-200 rounded-lg shadow-earth-lg max-h-60 overflow-auto">
                  {searchSuggestions.map((suggestion, index) => (
                    <div
                      key={index}
                      className="px-4 py-2 hover:bg-primary-50 cursor-pointer border-b border-primary-100 last:border-b-0"
                      onClick={() => {
                        setSearchTerm(suggestion);
                        setShowSuggestions(false);
                      }}
                    >
                      <p className="text-text-secondary font-sans">{suggestion}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Sort Dropdown with Views Option */}
            <div className="flex items-center gap-2">
              <label className="text-sm text-text-secondary font-medium whitespace-nowrap">Sort by:</label>
              <select 
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-primary-50 border border-primary-200 rounded-lg px-3 py-3 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 font-sans min-w-[140px]"
              >
                {sortOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Filter Toggle for Mobile */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="lg:hidden flex items-center justify-center px-4 py-3 bg-primary-100 text-text-secondary rounded-lg hover:bg-primary-200 transition-all font-sans"
            >
              <FunnelIcon className="h-5 w-5 mr-2" />
              Filters
            </button>
          </div>

          {/* Category Filters */}
          <div className={`${showFilters ? "block" : "hidden lg:block"} animate-slide-up`}>
            <div className="mb-4">
              <h3 className="text-sm font-medium text-text-secondary mb-3 font-sans">Filter by Category:</h3>
              <div className="flex flex-wrap gap-2">
                {categories.map(category => {
                  const IconComponent = category.icon;
                  return (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className={`inline-flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-all font-sans ${
                        selectedCategory === category.id
                          ? "bg-button-primary text-white shadow-soft-earth"
                          : "bg-primary-100 text-text-secondary hover:bg-primary-200"
                      }`}
                    >
                      <IconComponent className="h-4 w-4 mr-2" />
                      {category.name}
                      {category.id !== "all" && (
                        <span className="ml-1 text-xs opacity-75">
                          ({getCategoryCount(category.id)})
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quick Filters */}
            <div className="flex gap-2">
              <button
                onClick={() => setFilter("all")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all font-sans ${
                  filter === "all" 
                    ? "bg-button-primary text-white shadow-soft-earth" 
                    : "bg-primary-100 text-text-secondary hover:bg-primary-200"
                }`}
              >
                All Notices
              </button>
              <button
                onClick={() => setFilter("with-attachments")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center font-sans ${
                  filter === "with-attachments" 
                    ? "bg-button-primary text-white shadow-soft-earth" 
                    : "bg-primary-100 text-text-secondary hover:bg-primary-200"
                }`}
              >
                <PaperClipIcon className="h-4 w-4 mr-2" />
                With Files
              </button>
            </div>
          </div>
        </div>

        {/* Results Summary */}
        {(searchTerm || filter !== "all" || selectedCategory !== "all") && (
          <div className="mb-6 text-center animate-fade-in">
            <div className="inline-block bg-surface rounded-xl px-4 py-2 shadow-soft-earth border border-primary-200">
              <p className="text-text-secondary font-medium font-sans">
                Showing {sortedAndFilteredNotices.length} of {notices.length} notices
                {searchTerm && ` for "${searchTerm}"`}
                {selectedCategory !== "all" && ` in ${getCategoryInfo(selectedCategory).name}`}
              </p>
            </div>
          </div>
        )}

        {/* Notice Grid */}
        {sortedAndFilteredNotices.length === 0 ? (
          <div className="text-center py-16 animate-fade-in">
            <div className="bg-surface rounded-xl shadow-soft-earth p-12 max-w-lg mx-auto">
              <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <DocumentTextIcon className="h-10 w-10 text-text-muted" />
              </div>
              <h3 className="text-2xl font-semibold text-text-primary mb-4 font-serif">
                {searchTerm || filter !== "all" || selectedCategory !== "all"
                  ? "No matching notices"
                  : "No notices yet"}
              </h3>
              <p className="text-text-secondary text-lg font-sans">
                {searchTerm || filter !== "all" || selectedCategory !== "all"
                  ? "Try adjusting your search or filter criteria."
                  : "New announcements will appear here when available."}
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {sortedAndFilteredNotices.map((notice) => {
              const fileUrl = notice.fileUrl;
              const previewUrl = getCloudinaryPreviewUrl(fileUrl);
              const isFileAnImage = isImage(fileUrl);
              const isFileADocument = isDocument(fileUrl);
              const isBookmarked = bookmarkedNotices.has(notice._id);
              const categoryInfo = getCategoryInfo(notice.category);
              const views = notice.views || 0;

              return (
                <div 
                  key={notice._id} 
                  className="bg-surface rounded-xl shadow-soft-earth hover:shadow-earth-md transition-all overflow-hidden animate-slide-up group"
                >
                  {/* Preview Section */}
                  <div className="relative aspect-video bg-primary-100 overflow-hidden">
                    {/* Clickable Image/Preview Area */}
                    <div 
                      className="w-full h-full cursor-pointer"
                      onClick={() => fileUrl && handleFileView(fileUrl, notice.title, notice._id)}
                    >
                      {fileUrl ? (
                        isFileAnImage || isFileADocument ? (
                          <img
                            src={isFileAnImage ? fileUrl : previewUrl}
                            alt="Notice preview"
                            className="w-full h-full object-cover transition-transform group-hover:scale-105"
                            loading="lazy"
                            onError={(e) => {
                              e.target.style.display = 'none';
                            }}
                          />
                        ) : null
                      ) : null}
                      
                      {/* Fallback when no image or image fails to load */}
                      <div className={`absolute inset-0 flex items-center justify-center p-6 ${fileUrl && (isFileAnImage || isFileADocument) ? 'hidden' : 'flex'}`}>
                        <div className="text-center">
                          <div className="w-16 h-16 bg-primary-200 rounded-full flex items-center justify-center mx-auto mb-4">
                            <DocumentTextIcon className="h-8 w-8 text-text-secondary" />
                          </div>
                          <p className="text-sm font-semibold text-text-secondary font-sans">
                            {fileUrl ? "File Attachment" : "Text Notice"}
                          </p>
                          <p className="text-xs text-text-muted mt-1 font-sans">
                            {fileUrl ? (getFileExtension(fileUrl)?.toUpperCase() || "FILE") : "No attachments"}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Top Action Buttons */}
                    <div className="absolute top-3 right-3 flex gap-2">
                      {/* Bookmark Button */}
                      <button
                        onClick={(e) => toggleBookmark(notice._id, e)}
                        className="bg-surface bg-opacity-90 p-2 rounded-full hover:bg-opacity-100 transition-all shadow-soft-earth hover:scale-110 z-10"
                        title={isBookmarked ? "Remove bookmark" : "Bookmark this notice"}
                      >
                        {isBookmarked ? (
                          <BookmarkSolidIcon className="w-5 h-5 text-yellow-500" />
                        ) : (
                          <BookmarkIcon className="w-5 h-5 text-text-muted" />
                        )}
                      </button>
                    </div>

                    {/* Category Badge */}
                    <div className="absolute top-3 left-3">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-surface text-text-secondary border border-primary-200 font-sans bg-opacity-90">
                        <categoryInfo.icon className="h-3 w-3 mr-1" />
                        {categoryInfo.name}
                      </span>
                    </div>

                    {/* Views Badge */}
                    <div className="absolute bottom-3 right-3">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-black bg-opacity-70 text-white font-sans">
                        <EyeSolidIcon className="h-3 w-3 mr-1" />
                        {formatViews(views)}
                      </span>
                    </div>

                    {/* Hover Overlay - Only on the image area */}
                    {fileUrl && (
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100 pointer-events-none">
                        <div className="flex gap-3 pointer-events-auto">
                          <button
                            onClick={(e) => handleFileView(fileUrl, notice.title, notice._id, e)}
                            className="bg-surface text-text-secondary rounded-full p-3 hover:scale-110 transition-transform shadow-soft-earth"
                            title="View file"
                          >
                            <EyeIcon className="w-5 h-5" />
                          </button>
                          <button
                            onClick={(e) => handleFileDownload(fileUrl, notice.title, e)}
                            className="bg-surface text-text-secondary rounded-full p-3 hover:scale-110 transition-transform shadow-soft-earth"
                            title="Download file"
                          >
                            <ArrowDownTrayIcon className="w-5 h-5" />
                          </button>
                          <button
                            onClick={(e) => handleShare(notice, e)}
                            className="bg-surface text-text-secondary rounded-full p-3 hover:scale-110 transition-transform shadow-soft-earth"
                            title="Share notice"
                          >
                            <ShareIcon className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Loading Overlay */}
                    {fileLoading && (
                      <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                        <div className="w-8 h-8 border-2 border-surface border-t-transparent rounded-full animate-spin"></div>
                      </div>
                    )}
                  </div>

                  {/* Content Section */}
                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-text-primary line-clamp-2 font-serif mb-3">
                      {notice.title}
                    </h3>
                    
                    <p className="text-text-secondary text-sm mb-4 line-clamp-3 font-sans">
                      {notice.description}
                    </p>

                    {/* Action Buttons */}
                    <div className="flex gap-2 mb-4">
                      <button
                        onClick={() => handleDetails(notice._id)}
                        className="flex-1 inline-flex items-center justify-center px-4 py-2 bg-button-primary text-white rounded-lg hover:opacity-90 transition-all font-medium text-sm font-sans shadow-soft-earth"
                      >
                        View Details
                      </button>
                    </div>

                    {/* Meta Information */}
                    <div className="flex items-center justify-between pt-4 border-t border-primary-100">
                      <div className="flex items-center text-sm text-text-muted font-sans">
                        <CalendarIcon className="w-4 h-4 mr-1" />
                        <time dateTime={notice.createdAt}>
                          {new Date(notice.createdAt).toLocaleDateString("en-US", { 
                            month: "short", 
                            day: "numeric", 
                            year: "numeric" 
                          })}
                        </time>
                      </div>

                      {notice.createdBy?.name && (
                        <div className="flex items-center text-sm text-text-muted font-sans">
                          <UserIcon className="w-4 h-4 mr-1" />
                          <span className="truncate max-w-20">{notice.createdBy.name}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* File Preview Modal */}
      {selectedAttachment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-75 animate-fade-in" onClick={() => setSelectedAttachment(null)}>
          <div className="relative max-w-3xl w-full max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setSelectedAttachment(null)}
              className="absolute top-3 right-3 text-surface bg-primary-800 bg-opacity-50 p-2 rounded-full hover:bg-opacity-75 transition-all z-10"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>

            {selectedAttachment.type === "image" && (
              <img 
                src={selectedAttachment.url} 
                alt={selectedAttachment.filename} 
                className="w-full h-full rounded-xl max-h-[80vh] object-contain bg-surface" 
              />
            )}
            {selectedAttachment.type === "pdf" && (
              <iframe
                src={selectedAttachment.url}
                title={selectedAttachment.filename}
                className="w-full h-[80vh] rounded-xl bg-surface"
                frameBorder="0"
              />
            )}
            {selectedAttachment.type === "document" && (
              <div className="bg-surface rounded-xl p-6 flex flex-col items-center justify-center h-64">
                <DocumentTextIcon className="w-16 h-16 text-text-secondary mb-4" />
                <p className="text-text-primary text-lg mb-2 font-sans">{selectedAttachment.filename}</p>
                <button
                  onClick={() => handleFileDownload(selectedAttachment.url, selectedAttachment.filename)}
                  className="px-6 py-2 bg-button-primary text-white rounded-lg hover:opacity-90 transition-all font-sans shadow-soft-earth"
                >
                  Download
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Notices;