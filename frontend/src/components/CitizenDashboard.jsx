// pages/CitizenDashboard.js
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const CitizenDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [notices, setNotices] = useState([]);
  const [activeFilter, setActiveFilter] = useState('all');
  const [stats, setStats] = useState({
    newNotices: 0,
    unreadNotifications: 0,
    wardNotices: 0,
    urgentNotices: 0
  });
  const [loading, setLoading] = useState(true);

  // API base URL
  const API_BASE_URL = 'http://localhost:3000';

  // Get auth token
  const getAuthToken = () => {
    return localStorage.getItem('authToken');
  };

  // Generate visitor ID for view tracking
  const getVisitorId = () => {
    let visitorId = localStorage.getItem('visitorId');
    if (!visitorId) {
      visitorId = 'visitor_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('visitorId', visitorId);
    }
    return visitorId;
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const token = getAuthToken();
      
      if (!token) {
        navigate('/citizen/login');
        return;
      }

      // Fetch real user data
      const userResponse = await axios.get(`${API_BASE_URL}/citizen/profile`, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        withCredentials: true
      });
      
      setUser(userResponse.data);

      // Fetch notices for citizen's ward
      const noticesResponse = await axios.get(`${API_BASE_URL}/notice/citizen/notices`, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        withCredentials: true,
        params: { 
          page: 1, 
          limit: 10,
          category: activeFilter === 'all' ? undefined : activeFilter
        }
      });
      
      const noticesData = noticesResponse.data.notices;
      setNotices(noticesData);

      // Calculate real stats from actual data
      const newNotices = noticesData.filter(notice => {
        const noticeDate = new Date(notice.publishDate || notice.createdAt);
        const daysDiff = (new Date() - noticeDate) / (1000 * 60 * 60 * 24);
        return daysDiff <= 7; // Notices from last 7 days
      }).length;

      const urgentNotices = noticesData.filter(notice => 
        notice.priority === 'high'
      ).length;

      const wardNotices = noticesData.filter(notice => 
        notice.targetAudience === 'ward_specific' && 
        notice.targetWards.includes(userResponse.data.address.wardNumber)
      ).length;

      setStats({
        newNotices,
        unreadNotifications: 0, // You can implement notifications later
        wardNotices,
        urgentNotices
      });

      // Track views for new notices
      noticesData.forEach(notice => {
        const hasViewed = localStorage.getItem(`viewed_${notice._id}`);
        if (!hasViewed) {
          trackNoticeView(notice._id);
        }
      });

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      if (error.response?.status === 401) {
        // Token expired or invalid
        localStorage.removeItem('authToken');
        navigate('/citizen/login');
        return;
      }
      // Fallback to demo data if API fails
      setDemoData();
    } finally {
      setLoading(false);
    }
  };

  // Demo data fallback
  const setDemoData = () => {
    const demoData = {
      _id: "1",
      name: "Rajesh Kumar",
      email: "rajesh.kumar@example.com",
      profile: {
        phone: "+91 9876543210"
      },
      address: {
        wardNumber: "5",
        street: "Main Street",
        city: "Sample City",
        state: "Sample State",
        pincode: "123456"
      },
      createdAt: "2024-01-15T00:00:00.000Z"
    };
    
    const demoNotices = [
      {
        _id: 1,
        title: "Water Supply Interruption - Ward 5",
        description: "There will be no water supply on 15th December from 9 AM to 5 PM due to pipeline maintenance work.",
        category: "urgent",
        priority: "high",
        targetAudience: "ward_specific",
        targetWards: ["5"],
        createdBy: { name: "Sanjay Sharma" },
        publishDate: "2024-12-10T08:00:00Z",
        fileUrl: null,
        views: 45,
        isPinned: true
      },
      {
        _id: 2,
        title: "Property Tax Payment Deadline Extended",
        description: "The last date for property tax payment has been extended to 31st December 2024.",
        category: "tax",
        priority: "medium",
        targetAudience: "all",
        createdBy: { name: "Priya Singh" },
        publishDate: "2024-12-08T10:30:00Z",
        fileUrl: null,
        views: 120,
        isPinned: false
      }
    ];
    
    setUser(demoData);
    setNotices(demoNotices);
    setStats({
      newNotices: 2,
      unreadNotifications: 0,
      wardNotices: 1,
      urgentNotices: 1
    });
  };

  const trackNoticeView = async (noticeId) => {
    try {
      await axios.post(`${API_BASE_URL}/notice/${noticeId}/view`, {
        visitorId: getVisitorId()
      });
      localStorage.setItem(`viewed_${noticeId}`, 'true');
    } catch (error) {
      console.error('Error tracking view:', error);
    }
  };

  const handleFilterChange = async (filter) => {
    setActiveFilter(filter);
    try {
      const token = getAuthToken();
      const response = await axios.get(`${API_BASE_URL}/notice/citizen/notices`, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        withCredentials: true,
        params: { 
          page: 1, 
          limit: 10,
          category: filter === 'all' ? undefined : filter
        }
      });
      setNotices(response.data.notices);
    } catch (error) {
      console.error('Error filtering notices:', error);
    }
  };

  const downloadFile = async (noticeId, filename) => {
    try {
      const token = getAuthToken();
      const response = await axios.get(`${API_BASE_URL}/notice/${noticeId}/file`, {
        headers: { 
          Authorization: `Bearer ${token}`,
        },
        params: { download: "true" },
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading file:', error);
      alert('Error downloading file. Please try again.');
    }
  };

  const handleLogout = async () => {
    try {
      await axios.post(`${API_BASE_URL}/citizen/logout`, {}, {
        withCredentials: true
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('authToken');
      navigate('/citizen/login');
    }
  };

  const filteredNotices = notices;

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-text-secondary">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-header-gradient border-b border-primary-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-4xl font-serif font-bold text-text-primary">
                GramVartha
              </h1>
              <p className="text-text-secondary mt-1">Citizen Dashboard</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-text-primary font-semibold">{user?.name}</p>
                <p className="text-text-muted text-sm">Ward {user?.address?.wardNumber}</p>
              </div>
              <div className="relative">
                <button className="p-2 rounded-lg bg-primary-100 hover:bg-primary-200 transition-colors">
                  <span className="text-xl">🔔</span>
                  {stats.unreadNotifications > 0 && (
                    <span className="absolute -top-1 -right-1 bg-accent-berry text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {stats.unreadNotifications}
                    </span>
                  )}
                </button>
              </div>
              <button
                onClick={handleLogout}
                className="bg-primary-100 hover:bg-primary-200 text-primary-700 px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-serif font-bold text-text-primary mb-2">
            Welcome back, {user?.name}! 👋
          </h2>
          <p className="text-text-secondary text-lg">
            Here's what's happening in your gram panchayat
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-surface rounded-2xl p-6 shadow-soft-earth border border-primary-100">
            <div className="flex items-center">
              <div className="bg-primary-400 rounded-xl p-3 mr-4">
                <span className="text-2xl text-white">📢</span>
              </div>
              <div>
                <p className="text-text-muted text-sm">New Notices</p>
                <p className="text-2xl font-bold text-text-primary">{stats.newNotices}</p>
              </div>
            </div>
          </div>

          <div className="bg-surface rounded-2xl p-6 shadow-soft-earth border border-primary-100">
            <div className="flex items-center">
              <div className="bg-accent-teal rounded-xl p-3 mr-4">
                <span className="text-2xl text-white">⚠️</span>
              </div>
              <div>
                <p className="text-text-muted text-sm">Urgent Notices</p>
                <p className="text-2xl font-bold text-text-primary">{stats.urgentNotices}</p>
              </div>
            </div>
          </div>

          <div className="bg-surface rounded-2xl p-6 shadow-soft-earth border border-primary-100">
            <div className="flex items-center">
              <div className="bg-accent-berry rounded-xl p-3 mr-4">
                <span className="text-2xl text-white">🔔</span>
              </div>
              <div>
                <p className="text-text-muted text-sm">Unread Notifications</p>
                <p className="text-2xl font-bold text-text-primary">{stats.unreadNotifications}</p>
              </div>
            </div>
          </div>

          <div className="bg-surface rounded-2xl p-6 shadow-soft-earth border border-primary-100">
            <div className="flex items-center">
              <div className="bg-accent-olive rounded-xl p-3 mr-4">
                <span className="text-2xl text-white">🏠</span>
              </div>
              <div>
                <p className="text-text-muted text-sm">Your Ward</p>
                <p className="text-2xl font-bold text-text-primary">Ward {user?.address?.wardNumber}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Notices */}
          <div className="lg:col-span-2">
            <div className="bg-surface rounded-2xl p-6 shadow-soft-earth border border-primary-100 mb-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
                <h2 className="text-2xl font-serif font-bold text-text-primary mb-4 sm:mb-0">
                  Recent Notices
                </h2>
                <div className="flex space-x-2">
                  {['all', 'urgent', 'tax', 'meeting', 'development'].map((filter) => (
                    <button
                      key={filter}
                      onClick={() => handleFilterChange(filter)}
                      className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                        activeFilter === filter
                          ? 'bg-button-primary text-white'
                          : 'bg-primary-100 text-text-muted hover:bg-primary-200'
                      }`}
                    >
                      {filter.charAt(0).toUpperCase() + filter.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                {filteredNotices.length > 0 ? (
                  filteredNotices.map((notice) => (
                    <NoticeCard 
                      key={notice._id} 
                      notice={notice} 
                      onDownloadFile={downloadFile}
                    />
                  ))
                ) : (
                  <div className="text-center py-8 text-text-muted">
                    No notices found for your ward.
                  </div>
                )}
              </div>

              <div className="mt-6 text-center">
                <button 
                  className="bg-button-gradient text-white px-6 py-2 rounded-lg font-semibold hover:shadow-earth-md transition-all"
                  onClick={() => window.location.href = '/notices'}
                >
                  View All Notices →
                </button>
              </div>
            </div>
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-surface rounded-2xl p-6 shadow-soft-earth border border-primary-100">
              <h3 className="text-xl font-serif font-bold text-text-primary mb-4">Quick Actions</h3>
              <div className="grid grid-cols-2 gap-3">
                <button className="bg-primary-50 hover:bg-primary-100 p-4 rounded-xl text-center transition-colors border border-primary-100">
                  <div className="text-2xl mb-2">📋</div>
                  <span className="text-sm font-medium text-text-primary">Apply for Certificate</span>
                </button>
                <button className="bg-primary-50 hover:bg-primary-100 p-4 rounded-xl text-center transition-colors border border-primary-100">
                  <div className="text-2xl mb-2">💰</div>
                  <span className="text-sm font-medium text-text-primary">Pay Taxes</span>
                </button>
                <button className="bg-primary-50 hover:bg-primary-100 p-4 rounded-xl text-center transition-colors border border-primary-100">
                  <div className="text-2xl mb-2">⚠️</div>
                  <span className="text-sm font-medium text-text-primary">Submit Grievance</span>
                </button>
                <button className="bg-primary-50 hover:bg-primary-100 p-4 rounded-xl text-center transition-colors border border-primary-100">
                  <div className="text-2xl mb-2">⚙️</div>
                  <span className="text-sm font-medium text-text-primary">Settings</span>
                </button>
              </div>
            </div>

            {/* Profile Summary */}
            <div className="bg-surface rounded-2xl p-6 shadow-soft-earth border border-primary-100">
              <h3 className="text-xl font-serif font-bold text-text-primary mb-4">Your Profile</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-text-muted">Email:</span>
                  <span className="text-text-primary font-medium">{user?.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">Phone:</span>
                  <span className="text-text-primary font-medium">{user?.profile?.phone || 'Not provided'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">Member Since:</span>
                  <span className="text-text-primary font-medium">
                    {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">Address:</span>
                  <span className="text-text-primary font-medium text-right">
                    Ward {user?.address?.wardNumber}
                    {user?.address?.street && `, ${user.address.street}`}
                  </span>
                </div>
              </div>
              <button className="w-full mt-4 bg-primary-100 hover:bg-primary-200 text-text-primary py-2 rounded-lg font-medium transition-colors">
                Edit Profile
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Notice Card Component
const NoticeCard = ({ notice, onDownloadFile }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const getPriorityStyles = (priority) => {
    switch (priority) {
      case 'high':
        return 'border-l-4 border-red-500 bg-red-50';
      case 'medium':
        return 'border-l-4 border-amber-500 bg-amber-50';
      case 'low':
        return 'border-l-4 border-emerald-500 bg-emerald-50';
      default:
        return 'border-l-4 border-primary-300 bg-primary-50';
    }
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'urgent':
        return 'bg-red-100 text-red-800';
      case 'tax':
        return 'bg-amber-100 text-amber-800';
      case 'meeting':
        return 'bg-blue-100 text-blue-800';
      case 'development':
        return 'bg-emerald-100 text-emerald-800';
      default:
        return 'bg-primary-100 text-primary-800';
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '';
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const isNewNotice = () => {
    const noticeDate = new Date(notice.publishDate || notice.createdAt);
    const daysDiff = (new Date() - noticeDate) / (1000 * 60 * 60 * 24);
    return daysDiff <= 2; // Notices from last 2 days are considered new
  };

  return (
    <div className={`p-4 rounded-xl transition-all hover:shadow-earth-md ${getPriorityStyles(notice.priority)}`}>
      <div className="flex flex-wrap items-start justify-between mb-3 gap-2">
        <div className="flex flex-wrap gap-2">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(notice.category)}`}>
            {notice.category}
          </span>
          <span className="bg-primary-200 text-primary-800 px-2 py-1 rounded-full text-xs font-medium">
            {notice.priority}
          </span>
          {isNewNotice() && (
            <span className="bg-accent-berry text-white px-2 py-1 rounded-full text-xs font-medium">
              NEW
            </span>
          )}
          {notice.targetAudience === 'ward_specific' && (
            <span className="bg-accent-teal text-white px-2 py-1 rounded-full text-xs font-medium">
              Ward Specific
            </span>
          )}
          {notice.isPinned && (
            <span className="bg-amber-100 text-amber-800 px-2 py-1 rounded-full text-xs font-medium">
              PINNED
            </span>
          )}
        </div>
        <div className="text-xs text-text-muted">
          {new Date(notice.publishDate || notice.createdAt).toLocaleDateString()}
        </div>
      </div>

      <h3 className="font-serif font-bold text-text-primary text-lg mb-2">
        {notice.title}
      </h3>

      <div className="text-text-secondary mb-3">
        <p className={isExpanded ? '' : 'line-clamp-2'}>
          {notice.description}
        </p>
        {notice.description && notice.description.length > 120 && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-accent-teal font-medium hover:text-accent-teal-dark text-sm mt-1"
          >
            {isExpanded ? 'Read Less' : 'Read More'}
          </button>
        )}
      </div>

      <div className="flex items-center justify-between">
        <div className="text-sm text-text-muted">
          By: {notice.createdBy?.name || 'Panchayat'}
          {notice.views > 0 && (
            <span className="ml-2">👁 {notice.views}</span>
          )}
        </div>
        {notice.fileUrl && (
          <div className="flex gap-2">
            <button
              onClick={() => onDownloadFile(notice._id, notice.fileName || 'notice_file')}
              className="flex items-center gap-1 text-xs text-accent-teal hover:text-accent-teal-dark"
            >
              <span>📎</span>
              <span>
                {notice.fileName?.split('.').pop()?.toUpperCase() || 'FILE'} 
                {notice.fileSize && ` (${formatFileSize(notice.fileSize)})`}
              </span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CitizenDashboard;