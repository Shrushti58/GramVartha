import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  MagnifyingGlassIcon,
  PaperClipIcon,
  CalendarIcon,
  UserIcon,
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
  ExclamationCircleIcon,
  HomeIcon,
  ChartBarIcon,
  CogIcon,
  DocumentCheckIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import {
  BookmarkIcon as BookmarkSolidIcon,
  EyeIcon as EyeSolidIcon,
} from "@heroicons/react/20/solid";

const CitizenDashboard = () => {
  const [user, setUser] = useState(null);
  const [notices, setNotices] = useState([]);
  const [allNotices, setAllNotices] = useState([]);
  const [activeFilter, setActiveFilter] = useState("all");
  const [activeTab, setActiveTab] = useState("ward");
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [bookmarkedNotices, setBookmarkedNotices] = useState(new Set());
  const [selectedAttachment, setSelectedAttachment] = useState(null);
  const [fileLoading, setFileLoading] = useState(false);
  const [viewTracking, setViewTracking] = useState(new Set());
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const navigate = useNavigate();

  // Categories matching your backend schema
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

  // Stats state
  const [stats, setStats] = useState({
    newNotices: 0,
    unreadNotifications: 0,
    wardNotices: 0,
    urgentNotices: 0,
    totalNotices: 0,
  });

  const API_BASE_URL = "http://localhost:3000";

  // Cookie utility functions
  const setCookie = (name, value, days = 365) => {
    const date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    const expires = "expires=" + date.toUTCString();
    document.cookie =
      name + "=" + value + ";" + expires + ";path=/;SameSite=Lax";
  };

  const getCookie = (name) => {
    const nameEQ = name + "=";
    const ca = document.cookie.split(";");
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) === " ") c = c.substring(1, c.length);
      if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
  };

  // Get or create visitor ID
  const getVisitorId = () => {
    let visitorId = getCookie("notice_visitor_id");
    if (!visitorId) {
      visitorId =
        "visitor_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9);
      setCookie("notice_visitor_id", visitorId);
    }
    return visitorId;
  };

  // Logout function
  const handleLogout = async () => {
    try {
      // Call backend logout endpoint if needed
      await fetch(`${process.env.REACT_APP_API_URL}/citizen/logout`, {
        method: "POST",
        credentials: "include",
      });
    } catch (error) {
      console.log(
        "Logout API call failed, proceeding with client-side cleanup"
      );
    } finally {
      // Clear all client-side storage
      localStorage.clear();
      sessionStorage.clear();

      // Clear cookies
      document.cookie.split(";").forEach(function (c) {
        document.cookie = c
          .replace(/^ +/, "")
          .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
      });

      // Redirect to login page
      navigate("/");
    }
  };

  const confirmLogout = () => {
    setShowLogoutConfirm(true);
  };

  const cancelLogout = () => {
    setShowLogoutConfirm(false);
  };

  useEffect(() => {
    fetchDashboardData();

    // Load bookmarks from localStorage
    const savedBookmarks = localStorage.getItem("bookmarkedNotices");
    if (savedBookmarks) {
      setBookmarkedNotices(new Set(JSON.parse(savedBookmarks)));
    }
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch citizen data, ward notices, and all notices in parallel
      const [citizenResponse, wardNoticesResponse, allNoticesResponse] =
        await Promise.all([
          fetch(`${process.env.REACT_APP_API_URL}/citizen/profile`, {
            credentials: "include",
          }),
          fetch(`${process.env.REACT_APP_API_URL}/notice/citizen/notices`, {
            credentials: "include",
          }),
          fetch(`${process.env.REACT_APP_API_URL}/notice/fetch`),
        ]);

      if (
        !citizenResponse.ok ||
        !wardNoticesResponse.ok ||
        !allNoticesResponse.ok
      ) {
        throw new Error("Failed to fetch dashboard data");
      }

      const citizenData = await citizenResponse.json();
      const wardNoticesData = await wardNoticesResponse.json();
      const allNoticesData = await allNoticesResponse.json();

      const wardNoticesArray = Array.isArray(wardNoticesData.notices)
        ? wardNoticesData.notices
        : [];
      const allNoticesArray = Array.isArray(allNoticesData.notices)
        ? allNoticesData.notices
        : Array.isArray(allNoticesData)
        ? allNoticesData
        : [];

      setUser(citizenData);
      setNotices(wardNoticesArray);
      setAllNotices(allNoticesArray);

      calculateStats(wardNoticesArray, allNoticesArray, citizenData);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      setDemoData();
    } finally {
      setLoading(false);
    }
  };

  // Calculate ward-specific notices
  const calculateStats = (wardNoticesData, allNoticesData, userData) => {
    const userWard = userData.address?.wardNumber?.toString();

    // Calculate ward-specific notices
    const wardSpecificNotices = allNoticesData.filter((notice) => {
      const isWardSpecific = notice.targetAudience === "ward_specific";
      const hasTargetWards =
        notice.targetWards && Array.isArray(notice.targetWards);
      const includesUserWard =
        hasTargetWards &&
        notice.targetWards.some((ward) => ward.toString() === userWard);

      return isWardSpecific && includesUserWard;
    });

    // New notices (from last 7 days)
    const newNotices = allNoticesData.filter((notice) => {
      const noticeDate = new Date(notice.publishDate || notice.createdAt);
      const daysDiff = (new Date() - noticeDate) / (1000 * 60 * 60 * 24);
      return daysDiff <= 7;
    }).length;

    // Urgent notices
    const urgentNotices = allNoticesData.filter(
      (notice) => notice.priority === "high"
    ).length;

    // Unread notifications
    const unreadNotifications = allNoticesData.filter((notice) => {
      const hasViewed = localStorage.getItem(`viewed_${notice._id}`);
      return !hasViewed;
    }).length;

    setStats({
      newNotices,
      unreadNotifications: Math.min(unreadNotifications, 99),
      wardNotices: wardSpecificNotices.length,
      urgentNotices,
      totalNotices: allNoticesData.length,
    });
  };

  // Demo data fallback
  const setDemoData = () => {
    const demoData = {
      user: {
        id: 1,
        name: "Rajesh Kumar",
        email: "rajesh.kumar@example.com",
        phone: "+91 9876543210",
        address: {
          wardNumber: "5",
          houseNumber: "B-12",
        },
        joinDate: "2024-01-15",
      },
      notices: [
        {
          _id: 1,
          title: "Water Supply Interruption - Ward 5",
          description:
            "There will be no water supply on 15th December from 9 AM to 5 PM due to pipeline maintenance work. Residents of Ward 5 are requested to store water in advance.",
          category: "urgent",
          priority: "high",
          targetAudience: "ward_specific",
          targetWards: ["5"],
          createdBy: { name: "Sanjay Sharma" },
          publishDate: "2024-12-10T08:00:00Z",
          fileUrl: null,
          views: 45,
          isPinned: true,
          createdAt: "2024-12-10T08:00:00Z",
        },
        {
          _id: 2,
          title: "Ward 5 Development Meeting",
          description:
            "Monthly development meeting for Ward 5 residents on 20th December at 5 PM in the community hall.",
          category: "meeting",
          priority: "medium",
          targetAudience: "ward_specific",
          targetWards: ["5"],
          createdBy: { name: "Priya Singh" },
          publishDate: "2024-12-08T10:30:00Z",
          fileUrl: null,
          views: 120,
          isPinned: false,
          createdAt: "2024-12-08T10:30:00Z",
        },
      ],
      allNotices: [
        {
          _id: 1,
          title: "Water Supply Interruption - Ward 5",
          description:
            "There will be no water supply on 15th December from 9 AM to 5 PM due to pipeline maintenance work. Residents of Ward 5 are requested to store water in advance.",
          category: "urgent",
          priority: "high",
          targetAudience: "ward_specific",
          targetWards: ["5"],
          createdBy: { name: "Sanjay Sharma" },
          publishDate: "2024-12-10T08:00:00Z",
          fileUrl: null,
          views: 45,
          isPinned: true,
          createdAt: "2024-12-10T08:00:00Z",
        },
        {
          _id: 2,
          title: "Ward 5 Development Meeting",
          description:
            "Monthly development meeting for Ward 5 residents on 20th December at 5 PM in the community hall.",
          category: "meeting",
          priority: "medium",
          targetAudience: "ward_specific",
          targetWards: ["5"],
          createdBy: { name: "Priya Singh" },
          publishDate: "2024-12-08T10:30:00Z",
          fileUrl: null,
          views: 120,
          isPinned: false,
          createdAt: "2024-12-08T10:30:00Z",
        },
        {
          _id: 3,
          title: "Property Tax Payment Deadline Extended",
          description:
            "The last date for property tax payment has been extended to 31st December 2024. All residents are requested to pay their taxes before the deadline.",
          category: "tax_billing",
          priority: "medium",
          targetAudience: "all",
          targetWards: [],
          createdBy: { name: "Tax Department" },
          publishDate: "2024-12-08T10:30:00Z",
          fileUrl: null,
          views: 234,
          isPinned: false,
          createdAt: "2024-12-08T10:30:00Z",
        },
        {
          _id: 4,
          title: "New School Building Inauguration",
          description:
            "The new school building will be inaugurated on 25th December by the District Collector. All residents are invited.",
          category: "development",
          priority: "medium",
          targetAudience: "all",
          targetWards: [],
          createdBy: { name: "Education Department" },
          publishDate: "2024-12-05T14:20:00Z",
          fileUrl: null,
          views: 189,
          isPinned: true,
          createdAt: "2024-12-05T14:20:00Z",
        },
      ],
    };

    setUser(demoData.user);
    setNotices(demoData.notices);
    setAllNotices(demoData.allNotices);
    calculateStats(demoData.notices, demoData.allNotices, demoData.user);
  };

  // Track view count in database
  const trackView = async (noticeId) => {
    if (viewTracking.has(noticeId)) {
      console.log("⏳ Already tracking view for notice:", noticeId);
      return;
    }

    setViewTracking((prev) => new Set(prev).add(noticeId));

    const visitorId = getVisitorId();
    console.log(`📊 Tracking view: Notice ${noticeId}, Visitor ${visitorId}`);

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/notice/${noticeId}/view`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ visitorId }),
      });

      if (response.ok) {
        const result = await response.json();
        console.log("✅ View count updated:", result.views);

        setNotices((prevNotices) =>
          prevNotices.map((notice) =>
            notice._id === noticeId
              ? { ...notice, views: result.views }
              : notice
          )
        );

        setAllNotices((prevNotices) =>
          prevNotices.map((notice) =>
            notice._id === noticeId
              ? { ...notice, views: result.views }
              : notice
          )
        );

        localStorage.setItem(`viewed_${noticeId}`, "true");

        return result.views;
      } else {
        throw new Error("Failed to track view");
      }
    } catch (error) {
      console.error("Error tracking view:", error);
      const incrementLocally = (notices) =>
        notices.map((notice) =>
          notice._id === noticeId
            ? { ...notice, views: (notice.views || 0) + 1 }
            : notice
        );

      setNotices(incrementLocally);
      setAllNotices(incrementLocally);

      console.log("🔄 Using local view count increment as fallback");
      return null;
    } finally {
      setTimeout(() => {
        setViewTracking((prev) => {
          const newSet = new Set(prev);
          newSet.delete(noticeId);
          return newSet;
        });
      }, 3000);
    }
  };

  // Enhanced filtering and sorting
  const sortedAndFilteredNotices = useMemo(() => {
    const currentNotices = activeTab === "ward" ? notices : allNotices;
    const noticesArray = Array.isArray(currentNotices) ? currentNotices : [];

    let filtered = noticesArray.filter((notice) => {
      if (!notice) return false;

      const matchesSearch =
        notice.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        notice.description?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCategory =
        selectedCategory === "all" || notice.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });

    // Sort by newest first
    return filtered.sort((a, b) => {
      return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
    });
  }, [notices, allNotices, activeTab, searchTerm, selectedCategory]);

  // Search suggestions
  const handleSearchChange = (value) => {
    setSearchTerm(value);
  };

  // Bookmark functionality
  const toggleBookmark = (noticeId, e) => {
    e.stopPropagation();
    e.preventDefault();
    setBookmarkedNotices((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(noticeId)) {
        newSet.delete(noticeId);
      } else {
        newSet.add(noticeId);
      }
      localStorage.setItem("bookmarkedNotices", JSON.stringify([...newSet]));
      return newSet;
    });
  };

  // Share functionality
  const handleShare = async (notice, e) => {
    e.stopPropagation();
    const shareData = {
      title: notice.title,
      text: notice.description,
      url: `${window.location.origin}/notice/${notice._id}`,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.log("Error sharing:", err);
      }
    } else {
      navigator.clipboard.writeText(shareData.url);
      alert("Notice link copied to clipboard!");
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
    const publicId = pathParts
      .slice(publicIdStartIndex)
      .join("/")
      .split(".")[0];
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
      await trackView(noticeId);

      if (isImage(fileUrl)) {
        setSelectedAttachment({
          type: "image",
          url: fileUrl,
          filename: filename || "image",
        });
      } else if (getFileExtension(fileUrl) === "pdf") {
        setSelectedAttachment({
          type: "pdf",
          url: fileUrl,
          filename: filename || "document.pdf",
        });
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
    return (
      categories.find((cat) => cat.id === categoryId) ||
      categories.find((cat) => cat.id === "general")
    );
  };

  // Format view count
  const formatViews = (views) => {
    if (!views) return "0";
    if (views < 1000) return views.toString();
    if (views < 1000000) return `${(views / 1000).toFixed(1)}k`;
    return `${(views / 1000000).toFixed(1)}M`;
  };

  // Get category count
  const getCategoryCount = (categoryId) => {
    const currentNotices = activeTab === "ward" ? notices : allNotices;
    if (categoryId === "all") return currentNotices.length;
    return currentNotices.filter((notice) => notice.category === categoryId)
      .length;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4 font-sans">
        <div className="text-center animate-fade-in">
          <div className="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h3 className="text-xl font-semibold text-text-primary mb-2 font-sans">
            Loading Dashboard
          </h3>
          <p className="text-text-muted font-sans">
            Please wait while we fetch your information...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section with Logout */}
        <div className="mb-8 animate-slide-up">
          <div className="bg-surface rounded-2xl p-6 shadow-soft-earth border border-primary-100">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
              {/* Welcome Section */}
              <div className="flex items-center gap-4">
                <div className="bg-gradient-to-r from-primary-500 to-accent-teal p-3 rounded-xl shadow-soft-earth">
                  <UserIcon className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-serif font-bold text-text-primary mb-1">
                    Citizen Dashboard
                  </h1>
                  <p className="text-text-muted font-sans">
                    Welcome back,{" "}
                    <span className="text-primary-600 font-semibold">
                      {user?.name}
                    </span>
                    <span className="mx-2">•</span>
                    Ward{" "}
                    <span className="text-accent-teal font-semibold">
                      {user?.address?.wardNumber}
                    </span>
                  </p>
                </div>
              </div>

              {/* Profile & Logout */}
              <div className="flex items-center gap-3">
                {/* Profile Badge */}
                <div className="flex items-center gap-2 bg-primary-50 px-3 py-2 rounded-lg border border-primary-100">
                  <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-semibold">
                      {user?.name?.charAt(0)?.toUpperCase() || "U"}
                    </span>
                  </div>
                  <span className="text-sm font-medium text-text-primary font-sans hidden sm:block">
                    {user?.name}
                  </span>
                </div>

                {/* Logout Button */}
                <button
                  onClick={confirmLogout}
                  className="flex items-center gap-2 px-3 py-2 bg-red-500 text-white hover:bg-red-600 rounded-lg transition-all duration-200 font-medium font-sans shadow-soft-earth hover:shadow-earth-md group"
                  title="Logout"
                >
                  <svg
                    className="w-4 h-4 group-hover:scale-110 transition-transform"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                    />
                  </svg>
                  <span className="hidden sm:block">Logout</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-surface rounded-2xl p-6 shadow-soft-earth border border-primary-100 hover:shadow-earth-md transition-all">
            <div className="flex items-center">
              <div className="bg-primary-100 rounded-xl p-3 mr-4">
                <DocumentTextIcon className="h-6 w-6 text-primary-600" />
              </div>
              <div>
                <p className="text-text-muted text-sm font-sans">New Notices</p>
                <p className="text-2xl font-bold text-text-primary font-serif">
                  {stats.newNotices}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-surface rounded-2xl p-6 shadow-soft-earth border border-primary-100 hover:shadow-earth-md transition-all">
            <div className="flex items-center">
              <div className="bg-red-100 rounded-xl p-3 mr-4">
                <ExclamationCircleIcon className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <p className="text-text-muted text-sm font-sans">
                  Urgent Notices
                </p>
                <p className="text-2xl font-bold text-text-primary font-serif">
                  {stats.urgentNotices}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-surface rounded-2xl p-6 shadow-soft-earth border border-primary-100 hover:shadow-earth-md transition-all">
            <div className="flex items-center">
              <div className="bg-accent-berry bg-opacity-20 rounded-xl p-3 mr-4">
                <ExclamationCircleIcon className="h-6 w-6 text-accent-berry" />
              </div>
              <div>
                <p className="text-text-muted text-sm font-sans">Unread</p>
                <p className="text-2xl font-bold text-text-primary font-serif">
                  {stats.unreadNotifications}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-surface rounded-2xl p-6 shadow-soft-earth border border-primary-100 hover:shadow-earth-md transition-all">
            <div className="flex items-center">
              <div className="bg-accent-teal bg-opacity-20 rounded-xl p-3 mr-4">
                <HomeIcon className="h-6 w-6 text-accent-teal" />
              </div>
              <div>
                <p className="text-text-muted text-sm font-sans">
                  Ward Notices
                </p>
                <p className="text-2xl font-bold text-text-primary font-serif">
                  {stats.wardNotices}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left Column - Notices */}
          <div className="lg:col-span-3">
            <div className="bg-surface rounded-2xl shadow-soft-earth border border-primary-100 mb-6 overflow-hidden">
              {/* Search and Filter Section */}
              <div className="p-6 border-b border-primary-100">
                <div className="flex flex-col lg:flex-row gap-4 mb-4">
                  {/* Search Input */}
                  <div className="relative flex-1">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
                      <MagnifyingGlassIcon className="h-5 w-5 text-text-muted" />
                    </div>
                    <input
                      type="text"
                      placeholder="Search notices..."
                      className="block w-full pl-10 pr-4 py-3 border border-primary-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-primary-50 font-sans transition-all"
                      value={searchTerm}
                      onChange={(e) => handleSearchChange(e.target.value)}
                    />
                  </div>

                  {/* Filter Toggle */}
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="lg:hidden flex items-center justify-center px-4 py-3 bg-primary-100 text-text-secondary rounded-lg hover:bg-primary-200 transition-all font-sans"
                  >
                    <FunnelIcon className="h-5 w-5 mr-2" />
                    Filters
                  </button>
                </div>

                {/* Tab Navigation */}
                <div className="flex space-x-4 mb-4">
                  <button
                    onClick={() => setActiveTab("ward")}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors font-sans flex items-center ${
                      activeTab === "ward"
                        ? "bg-button-primary text-primary-50 shadow-soft-earth"
                        : "bg-primary-100 text-text-muted hover:bg-primary-200"
                    }`}
                  >
                    <HomeIcon className="h-4 w-4 mr-2" />
                    Ward Notices ({notices.length})
                  </button>
                  <button
                    onClick={() => setActiveTab("all")}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors font-sans flex items-center ${
                      activeTab === "all"
                        ? "bg-button-primary text-primary-50 shadow-soft-earth"
                        : "bg-primary-100 text-text-muted hover:bg-primary-200"
                    }`}
                  >
                    <DocumentTextIcon className="h-4 w-4 mr-2" />
                    All Notices ({allNotices.length})
                  </button>
                </div>

                {/* Category Filters */}
                <div
                  className={`${
                    showFilters ? "block" : "hidden lg:block"
                  } animate-slide-up`}
                >
                  <div className="mb-4">
                    <h3 className="text-sm font-medium text-text-secondary mb-3 font-sans">
                      Filter by Category:
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {categories.map((category) => {
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
                </div>
              </div>

              {/* Tab Content Header */}
              <div className="p-4 bg-primary-50 border-b border-primary-100">
                {activeTab === "ward" ? (
                  <div className="flex items-center">
                    <HomeIcon className="h-5 w-5 text-accent-teal mr-3" />
                    <div>
                      <h4 className="font-semibold text-text-primary font-sans">
                        Ward {user?.address?.wardNumber} Specific Notices
                      </h4>
                      <p className="text-text-secondary text-sm font-sans">
                        Notices specifically targeted for your ward residents
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center">
                    <DocumentTextIcon className="h-5 w-5 text-primary-600 mr-3" />
                    <div>
                      <h4 className="font-semibold text-text-primary font-sans">
                        All Gram Panchayat Notices
                      </h4>
                      <p className="text-text-secondary text-sm font-sans">
                        General notices for all residents
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Notices Grid */}
              <div className="p-6">
                {sortedAndFilteredNotices.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <DocumentTextIcon className="h-10 w-10 text-text-muted" />
                    </div>
                    <h3 className="text-xl font-semibold text-text-primary mb-2 font-serif">
                      No notices found
                    </h3>
                    <p className="text-text-secondary font-sans">
                      {searchTerm || selectedCategory !== "all"
                        ? "Try adjusting your search or filter criteria."
                        : "No notices available at the moment."}
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {sortedAndFilteredNotices.map((notice) => {
                      const fileUrl = notice.fileUrl;
                      const previewUrl = getCloudinaryPreviewUrl(fileUrl);
                      const isFileAnImage = isImage(fileUrl);
                      const isFileADocument = isDocument(fileUrl);
                      const isBookmarked = bookmarkedNotices.has(notice._id);
                      const categoryInfo = getCategoryInfo(notice.category);
                      const views = notice.views || 0;
                      const isWardNotice =
                        notice.targetAudience === "ward_specific";

                      return (
                        <div
                          key={notice._id}
                          className="bg-surface rounded-xl shadow-soft-earth hover:shadow-earth-md transition-all overflow-hidden group border border-primary-100 cursor-pointer"
                          onClick={async (e) => {
                            // Don't trigger if clicking on buttons inside
                            if (e.target.closest("button")) return;

                            console.log("🖱️ Notice card clicked:", notice._id);

                            // Track view when notice card is clicked
                            await trackView(notice._id);

                            // Navigate to details
                            handleDetails(notice._id);
                          }}
                        >
                          {/* Preview Section */}
                          <div className="relative aspect-video bg-primary-100 overflow-hidden">
                            {/* Clickable Image/Preview Area */}
                            <div
                              className="w-full h-full cursor-pointer"
                              onClick={(e) => {
                                e.stopPropagation();
                                fileUrl &&
                                  handleFileView(
                                    fileUrl,
                                    notice.title,
                                    notice._id,
                                    e
                                  );
                              }}
                            >
                              {fileUrl ? (
                                isFileAnImage || isFileADocument ? (
                                  <img
                                    src={isFileAnImage ? fileUrl : previewUrl}
                                    alt="Notice preview"
                                    className="w-full h-full object-cover transition-transform group-hover:scale-105"
                                    loading="lazy"
                                    onError={(e) => {
                                      e.target.style.display = "none";
                                    }}
                                  />
                                ) : null
                              ) : null}

                              {/* Fallback when no image or image fails to load */}
                              <div
                                className={`absolute inset-0 flex items-center justify-center p-6 ${
                                  fileUrl && (isFileAnImage || isFileADocument)
                                    ? "hidden"
                                    : "flex"
                                }`}
                              >
                                <div className="text-center">
                                  <div className="w-16 h-16 bg-primary-200 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <DocumentTextIcon className="h-8 w-8 text-text-secondary" />
                                  </div>
                                  <p className="text-sm font-semibold text-text-secondary font-sans">
                                    {fileUrl
                                      ? "File Attachment"
                                      : "Text Notice"}
                                  </p>
                                  <p className="text-xs text-text-muted mt-1 font-sans">
                                    {fileUrl
                                      ? getFileExtension(
                                          fileUrl
                                        )?.toUpperCase() || "FILE"
                                      : "No attachments"}
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
                                title={
                                  isBookmarked
                                    ? "Remove bookmark"
                                    : "Bookmark this notice"
                                }
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

                            {/* Ward Badge */}
                            {isWardNotice && (
                              <div className="absolute bottom-3 left-3">
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-accent-teal text-white font-sans">
                                  <HomeIcon className="h-3 w-3 mr-1" />
                                  Your Ward
                                </span>
                              </div>
                            )}

                            {/* Hover Overlay - Only on the image area */}
                            {fileUrl && (
                              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100 pointer-events-none">
                                <div className="flex gap-3 pointer-events-auto">
                                  <button
                                    onClick={(e) =>
                                      handleFileView(
                                        fileUrl,
                                        notice.title,
                                        notice._id,
                                        e
                                      )
                                    }
                                    className="bg-surface text-text-secondary rounded-full p-3 hover:scale-110 transition-transform shadow-soft-earth"
                                    title="View file"
                                  >
                                    <EyeIcon className="w-5 h-5" />
                                  </button>
                                  <button
                                    onClick={(e) =>
                                      handleFileDownload(
                                        fileUrl,
                                        notice.title,
                                        e
                                      )
                                    }
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
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDetails(notice._id);
                                }}
                                className="flex-1 inline-flex items-center justify-center px-4 py-2 bg-button-primary text-white rounded-lg hover:opacity-90 transition-all font-medium text-sm font-sans shadow-soft-earth"
                              >
                                <EyeIcon className="w-4 h-4 mr-2" />
                                View Details
                              </button>
                            </div>

                            {/* Meta Information */}
                            <div className="flex items-center justify-between pt-4 border-t border-primary-100">
                              <div className="flex items-center text-sm text-text-muted font-sans">
                                <CalendarIcon className="w-4 h-4 mr-1" />
                                <time dateTime={notice.createdAt}>
                                  {new Date(
                                    notice.createdAt
                                  ).toLocaleDateString("en-US", {
                                    month: "short",
                                    day: "numeric",
                                    year: "numeric",
                                  })}
                                </time>
                              </div>

                              {notice.createdBy?.name && (
                                <div className="flex items-center text-sm text-text-muted font-sans">
                                  <UserIcon className="w-4 h-4 mr-1" />
                                  <span className="truncate max-w-20">
                                    {notice.createdBy.name}
                                  </span>
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
            </div>
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Enhanced Quick Actions */}
            <div className="bg-surface rounded-2xl p-6 shadow-soft-earth border border-primary-100">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-serif font-bold text-text-primary flex items-center">
                  <ChartBarIcon className="h-5 w-5 mr-2 text-primary-600" />
                  Quick Actions
                </h3>
                <span className="text-xs font-medium bg-primary-100 text-primary-600 px-2 py-1 rounded-full font-sans">
                  Features Coming Soon
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Certificate Application */}
                <div className="group relative">
                  <div className="bg-gradient-to-br from-primary-50 to-primary-100 border border-primary-200 rounded-xl p-4 transition-all duration-300 group-hover:shadow-soft-earth group-hover:border-primary-300 group-hover:scale-[1.02]">
                    <div className="flex items-start justify-between mb-3">
                      <div className="bg-white p-2 rounded-lg shadow-soft-earth border border-primary-100">
                        <DocumentCheckIcon className="h-5 w-5 text-primary-600" />
                      </div>
                      <span className="text-xs font-medium bg-amber-100 text-amber-700 px-2 py-1 rounded-full font-sans">
                        Soon
                      </span>
                    </div>
                    <h4 className="text-sm font-semibold text-text-primary mb-1 font-sans">
                      Apply for Certificate
                    </h4>
                    <p className="text-xs text-text-muted font-sans leading-relaxed">
                      Birth, income, residence and other official certificates
                    </p>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-r from-primary-500/5 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                </div>

                {/* Tax Payment */}
                <div className="group relative">
                  <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 border border-emerald-200 rounded-xl p-4 transition-all duration-300 group-hover:shadow-soft-earth group-hover:border-emerald-300 group-hover:scale-[1.02]">
                    <div className="flex items-start justify-between mb-3">
                      <div className="bg-white p-2 rounded-lg shadow-soft-earth border border-emerald-100">
                        <CurrencyDollarIcon className="h-5 w-5 text-emerald-600" />
                      </div>
                      <span className="text-xs font-medium bg-amber-100 text-amber-700 px-2 py-1 rounded-full font-sans">
                        Soon
                      </span>
                    </div>
                    <h4 className="text-sm font-semibold text-text-primary mb-1 font-sans">
                      Pay Taxes & Bills
                    </h4>
                    <p className="text-xs text-text-muted font-sans leading-relaxed">
                      Property tax, water bill, and other municipal payments
                    </p>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                </div>

                {/* Grievance */}
                <div className="group relative">
                  <div className="bg-gradient-to-br from-rose-50 to-rose-100 border border-rose-200 rounded-xl p-4 transition-all duration-300 group-hover:shadow-soft-earth group-hover:border-rose-300 group-hover:scale-[1.02]">
                    <div className="flex items-start justify-between mb-3">
                      <div className="bg-white p-2 rounded-lg shadow-soft-earth border border-rose-100">
                        <ExclamationCircleIcon className="h-5 w-5 text-rose-600" />
                      </div>
                      <span className="text-xs font-medium bg-amber-100 text-amber-700 px-2 py-1 rounded-full font-sans">
                        Soon
                      </span>
                    </div>
                    <h4 className="text-sm font-semibold text-text-primary mb-1 font-sans">
                      Submit Grievance
                    </h4>
                    <p className="text-xs text-text-muted font-sans leading-relaxed">
                      Report issues and track complaint resolution status
                    </p>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-r from-rose-500/5 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                </div>

                {/* Settings */}
                <div className="group relative">
                  <div className="bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200 rounded-xl p-4 transition-all duration-300 group-hover:shadow-soft-earth group-hover:border-slate-300 group-hover:scale-[1.02]">
                    <div className="flex items-start justify-between mb-3">
                      <div className="bg-white p-2 rounded-lg shadow-soft-earth border border-slate-100">
                        <CogIcon className="h-5 w-5 text-slate-600" />
                      </div>
                      <span className="text-xs font-medium bg-amber-100 text-amber-700 px-2 py-1 rounded-full font-sans">
                        Soon
                      </span>
                    </div>
                    <h4 className="text-sm font-semibold text-text-primary mb-1 font-sans">
                      Account Settings
                    </h4>
                    <p className="text-xs text-text-muted font-sans leading-relaxed">
                      Manage profile, notifications, and privacy preferences
                    </p>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-r from-slate-500/5 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                </div>
              </div>

              {/* Progress Indicator */}
              <div className="mt-6 pt-4 border-t border-primary-100">
                <div className="flex items-center justify-between text-xs text-text-muted font-sans mb-2">
                  <span>Feature Development Progress</span>
                  <span className="font-medium text-primary-600">25%</span>
                </div>
                <div className="w-full bg-primary-100 rounded-full h-2">
                  <div className="bg-gradient-to-r from-primary-500 to-accent-teal h-2 rounded-full w-1/4 transition-all duration-1000 ease-out"></div>
                </div>
                <p className="text-xs text-text-muted mt-2 font-sans text-center">
                  We're working hard to bring you these features soon!
                </p>
              </div>
            </div>

            {/* Ward Information */}
            <div className="bg-surface rounded-2xl p-6 shadow-soft-earth border border-primary-100">
              <h3 className="text-xl font-serif font-bold text-text-primary mb-4 flex items-center">
                <HomeIcon className="h-5 w-5 mr-2" />
                Your Ward Info
              </h3>
              <div className="space-y-3 font-sans">
                <div className="flex justify-between items-center">
                  <span className="text-text-muted">Ward Number:</span>
                  <span className="text-2xl font-bold text-accent-teal font-serif">
                    #{user?.address?.wardNumber}
                  </span>
                </div>
                <div className="bg-primary-50 rounded-lg p-3">
                  <p className="text-sm text-text-secondary">
                    You have <strong>{stats.wardNotices}</strong> notices
                    specific to your ward
                  </p>
                </div>
                <button className="w-full mt-2 bg-accent-teal bg-opacity-10 text-accent-teal hover:bg-accent-teal hover:text-white py-2 rounded-lg font-medium transition-colors font-sans">
                  View Ward Details
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-75 animate-fade-in">
          <div className="bg-surface rounded-2xl p-6 max-w-md w-full shadow-soft-earth border border-primary-100">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-text-primary mb-2 font-sans">
                Confirm Logout
              </h3>
              <p className="text-text-secondary mb-6 font-sans">
                Are you sure you want to logout? You'll need to sign in again to
                access your dashboard.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={cancelLogout}
                  className="flex-1 px-4 py-2 bg-primary-100 text-text-secondary hover:bg-primary-200 rounded-lg transition-all font-medium font-sans"
                >
                  Cancel
                </button>
                <button
                  onClick={handleLogout}
                  className="flex-1 px-4 py-2 bg-red-500 text-white hover:bg-red-600 rounded-lg transition-all font-medium font-sans shadow-soft-earth"
                >
                  Yes, Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* File Preview Modal */}
      {selectedAttachment && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-75 animate-fade-in"
          onClick={() => setSelectedAttachment(null)}
        >
          <div
            className="relative max-w-3xl w-full max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
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
                <p className="text-text-primary text-lg mb-2 font-sans">
                  {selectedAttachment.filename}
                </p>
                <button
                  onClick={() =>
                    handleFileDownload(
                      selectedAttachment.url,
                      selectedAttachment.filename
                    )
                  }
                  className="px-6 py-2 bg-button-primary text-white rounded-lg hover:opacity-90 transition-all font-sans shadow-soft-earth flex items-center"
                >
                  <ArrowDownTrayIcon className="w-4 h-4 mr-2" />
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

export default CitizenDashboard;
