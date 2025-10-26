import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

export default function OfficialsDashboard() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("general");
  const [file, setFile] = useState(null);
  const [notices, setNotices] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [editingNotice, setEditingNotice] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [viewFileModal, setViewFileModal] = useState(null);
  const navigate = useNavigate();

  // Gram Panchayat categories
  const categories = [
    { value: "development", label: "Development" },
    { value: "health", label: "Health" },
    { value: "education", label: "Education" },
    { value: "agriculture", label: "Agriculture" },
    { value: "employment", label: "Employment" },
    { value: "social_welfare", label: "Social Welfare" },
    { value: "tax_billing", label: "Tax & Billing" },
    { value: "election", label: "Election" },
    { value: "meeting", label: "Meeting" },
    { value: "general", label: "General" }
  ];

  useEffect(() => {
    fetchNotices();
  }, []);

  const fetchNotices = async () => {
    try {
      const res = await axios.get("http://localhost:3000/notice/fetch");
      setNotices(res.data);
    } catch (error) {
      console.error("Error fetching notices:", error);
      toast.error("Failed to load notices");
    }
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      toast.error("Please fill in title and description");
      return;
    }
    
    setIsUploading(true);

    const formData = new FormData();
    formData.append("title", title.trim());
    formData.append("description", description.trim());
    formData.append("category", category);
    if (file) formData.append("file", file);

    try {
      if (editingNotice) {
        await axios.put(
          `http://localhost:3000/notice/update/${editingNotice._id}`,
          formData,
          {
            headers: { "Content-Type": "multipart/form-data" },
            withCredentials: true,
          }
        );
        toast.success("Notice updated successfully");
      } else {
        await axios.post("http://localhost:3000/notice/upload", formData, {
          headers: { "Content-Type": "multipart/form-data" },
          withCredentials: true,
        });
        toast.success("Notice published successfully");
      }

      resetForm();
      fetchNotices();
    } catch (error) {
      console.error("Error saving notice:", error);
      toast.error("Failed to save notice");
    } finally {
      setIsUploading(false);
    }
  };

  const handleEdit = (notice) => {
    setEditingNotice(notice);
    setTitle(notice.title);
    setDescription(notice.description);
    setCategory(notice.category || "general");
    setFile(null);
    document.getElementById('notice-form').scrollIntoView({ behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:3000/notice/delete/${id}`, {
        withCredentials: true,
      });
      toast.success("Notice deleted successfully");
      fetchNotices();
    } catch (error) {
      console.error("Error deleting notice:", error);
      toast.error("Failed to delete notice");
    } finally {
      setDeleteConfirm(null);
    }
  };

  const handleViewFile = (notice) => {
    setViewFileModal(notice);
  };

  // Function to get file type and render appropriate viewer
  const getFileViewer = (fileUrl) => {
    if (!fileUrl) return null;

    const extension = fileUrl.split('.').pop()?.toLowerCase();
    const fileName = fileUrl.split('/').pop();

    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension)) {
      return (
        <div className="flex flex-col items-center">
          <div className="w-full max-w-2xl mx-auto">
            <img 
              src={fileUrl} 
              alt="Notice attachment" 
              className="w-full h-auto max-h-80 md:max-h-96 object-contain rounded-lg shadow-lg"
            />
          </div>
          <p className="mt-4 text-sm text-primary-600 text-center break-all px-2">{fileName}</p>
        </div>
      );
    } else if (['pdf'].includes(extension)) {
      return (
        <div className="flex flex-col items-center w-full">
          <div className="w-full bg-white rounded-lg overflow-hidden">
            <iframe
              src={fileUrl}
              className="w-full h-64 md:h-80 lg:h-96 border-0"
              title={fileName}
            />
          </div>
          <p className="mt-4 text-sm text-primary-600 text-center break-all px-2">{fileName}</p>
        </div>
      );
    } else if (['doc', 'docx'].includes(extension)) {
      return (
        <div className="flex flex-col items-center justify-center py-8 md:py-12">
          <div className="text-center max-w-sm">
            <svg className="w-12 h-12 md:w-16 md:h-16 text-primary-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-base md:text-lg font-semibold text-primary-900 mb-2">Document File</p>
            <p className="text-primary-600 text-sm md:text-base mb-4 break-all">{fileName}</p>
            <a
              href={fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-4 py-2 bg-button-primary text-white rounded-lg hover:shadow-earth-md transition-all duration-200 text-sm md:text-base"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Download File
            </a>
          </div>
        </div>
      );
    } else {
      return (
        <div className="flex flex-col items-center justify-center py-8 md:py-12">
          <div className="text-center max-w-sm">
            <svg className="w-12 h-12 md:w-16 md:h-16 text-primary-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-base md:text-lg font-semibold text-primary-900 mb-2">File Attachment</p>
            <p className="text-primary-600 text-sm md:text-base mb-4 break-all">{fileName}</p>
            <a
              href={fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-4 py-2 bg-button-primary text-white rounded-lg hover:shadow-earth-md transition-all duration-200 text-sm md:text-base"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Download File
            </a>
          </div>
        </div>
      );
    }
  };

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setCategory("general");
    setFile(null);
    setEditingNotice(null);
  };

  const handleLogout = () => {
    navigate("/officials/login");
    toast.info("Logged out successfully");
  };

  const stats = {
    total: notices.length,
    recent: notices.filter(n => {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      return new Date(n.createdAt) >= oneWeekAgo;
    }).length,
    withFiles: notices.filter(n => n.fileUrl).length,
    categories: categories.reduce((acc, cat) => {
      acc[cat.value] = notices.filter(n => n.category === cat.value).length;
      return acc;
    }, {})
  };

  const getCategoryLabel = (categoryValue) => {
    const found = categories.find(cat => cat.value === categoryValue);
    return found ? found.label : "General";
  };

  const getCategoryColor = (categoryValue) => {
    const colors = {
      development: "bg-blue-100 text-blue-700",
      health: "bg-green-100 text-green-700",
      education: "bg-purple-100 text-purple-700",
      agriculture: "bg-amber-100 text-amber-700",
      employment: "bg-indigo-100 text-indigo-700",
      social_welfare: "bg-pink-100 text-pink-700",
      tax_billing: "bg-red-100 text-red-700",
      election: "bg-orange-100 text-orange-700",
      meeting: "bg-cyan-100 text-cyan-700",
      general: "bg-gray-100 text-gray-700"
    };
    return colors[categoryValue] || colors.general;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 font-sans">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-gradient-to-r from-primary-900 to-primary-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex justify-between items-center h-16 sm:h-20">
            <div className="flex items-center space-x-3 sm:space-x-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-white/20">
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold">GramVartha</h1>
                <p className="text-primary-200 text-xs sm:text-sm">Community Portal</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 sm:space-x-3 px-4 py-2 sm:px-6 sm:py-3 bg-white/10 hover:bg-white/20 rounded-xl transition-all duration-200 backdrop-blur-sm border border-white/20 hover:border-white/30 text-sm sm:text-base"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span className="font-semibold">Logout</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Welcome Section */}
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-primary-900 font-serif mb-3 sm:mb-4">
            Community Notices
          </h2>
          <p className="text-sm sm:text-lg text-primary-600 max-w-2xl mx-auto px-4">
            Create and manage announcements for your community. Keep everyone informed with important updates.
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8 sm:mb-12">
          <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-soft-earth border border-primary-200 text-center">
            <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-primary-900 mb-1 sm:mb-2">{stats.total}</div>
            <div className="text-xs sm:text-sm text-primary-600 font-medium">Total Notices</div>
          </div>
          <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-soft-earth border border-primary-200 text-center">
            <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-primary-900 mb-1 sm:mb-2">{stats.recent}</div>
            <div className="text-xs sm:text-sm text-primary-600 font-medium">This Week</div>
          </div>
          <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-soft-earth border border-primary-200 text-center">
            <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-primary-900 mb-1 sm:mb-2">{stats.withFiles}</div>
            <div className="text-xs sm:text-sm text-primary-600 font-medium">With Files</div>
          </div>
          <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-soft-earth border border-primary-200 text-center">
            <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-primary-900 mb-1 sm:mb-2">{categories.length}</div>
            <div className="text-xs sm:text-sm text-primary-600 font-medium">Categories</div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 sm:gap-8">
          {/* Create Notice Card */}
          <div id="notice-form" className="bg-white rounded-2xl shadow-earth-lg border border-primary-200 p-6 sm:p-8">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h3 className="text-xl sm:text-2xl font-bold text-primary-900 font-serif">
                {editingNotice ? "Edit Notice" : "Create Notice"}
              </h3>
              {editingNotice && (
                <button
                  onClick={resetForm}
                  className="text-primary-500 hover:text-primary-700 transition-colors duration-200 p-1"
                >
                  <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
              <div>
                <label className="block text-sm font-semibold text-primary-800 mb-2 sm:mb-3">
                  Title
                </label>
                <input
                  type="text"
                  placeholder="Enter a clear title for your notice..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 sm:px-4 sm:py-3 border border-primary-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 bg-white text-primary-900 placeholder-primary-400 text-sm sm:text-base"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-primary-800 mb-2 sm:mb-3">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 sm:px-4 sm:py-3 border border-primary-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 bg-white text-primary-900 text-sm sm:text-base"
                  required
                >
                  {categories.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-primary-800 mb-2 sm:mb-3">
                  Description
                </label>
                <textarea
                  placeholder="Provide detailed information about the notice..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 sm:px-4 sm:py-3 border border-primary-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 bg-white text-primary-900 placeholder-primary-400 resize-none text-sm sm:text-base"
                  rows="4"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-primary-800 mb-2 sm:mb-3">
                  Attachment (Optional)
                </label>
                <div className="border-2 border-dashed border-primary-300 rounded-xl p-4 sm:p-6 text-center hover:border-primary-400 transition-colors duration-200 cursor-pointer bg-primary-50">
                  <label className="cursor-pointer">
                    <svg className="w-6 h-6 sm:w-8 sm:h-8 text-primary-400 mx-auto mb-2 sm:mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <div className="text-primary-600 font-medium mb-1 text-sm sm:text-base">
                      {file ? file.name : "Click to upload file"}
                    </div>
                    <div className="text-xs sm:text-sm text-primary-500">
                      PDF, DOC, JPEG, PNG (Max 5MB)
                    </div>
                    <input 
                      type="file" 
                      onChange={handleFileChange} 
                      className="hidden" 
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                    />
                  </label>
                </div>
              </div>
              
              <button
                type="submit"
                disabled={isUploading || !title.trim() || !description.trim()}
                className={`w-full py-3 sm:py-4 px-6 rounded-xl font-semibold transition-all duration-200 text-sm sm:text-base ${
                  isUploading || !title.trim() || !description.trim()
                    ? "bg-primary-300 text-primary-500 cursor-not-allowed"
                    : "bg-button-primary hover:shadow-earth-md hover:brightness-110 text-white shadow-soft-earth"
                }`}
              >
                {isUploading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-2 border-white border-t-transparent"></div>
                    <span>{editingNotice ? "Updating Notice..." : "Publishing Notice..."}</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center space-x-2">
                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    <span>{editingNotice ? "Update Notice" : "Publish Notice"}</span>
                  </div>
                )}
              </button>
            </form>
          </div>

          {/* Notices List */}
          <div className="bg-white rounded-2xl shadow-earth-lg border border-primary-200 p-6 sm:p-8">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h3 className="text-xl sm:text-2xl font-bold text-primary-900 font-serif">
                Your Notices
              </h3>
              <span className="bg-primary-100 text-primary-700 px-2 py-1 sm:px-3 sm:py-1 rounded-full text-xs sm:text-sm font-medium">
                {notices.length} total
              </span>
            </div>

            <div className="space-y-4 max-h-[500px] sm:max-h-[600px] overflow-y-auto">
              {notices.length === 0 ? (
                <div className="text-center py-8 sm:py-12">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                    <svg className="w-6 h-6 sm:w-8 sm:h-8 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h4 className="text-base sm:text-lg font-semibold text-primary-900 mb-2">No notices yet</h4>
                  <p className="text-primary-600 text-sm sm:text-base mb-4">Create your first notice to get started</p>
                  <button
                    onClick={() => document.getElementById('notice-form').scrollIntoView({ behavior: 'smooth' })}
                    className="px-4 py-2 sm:px-6 sm:py-2 bg-button-primary text-white rounded-lg hover:shadow-earth-md transition-all duration-200 text-sm sm:text-base"
                  >
                    Create First Notice
                  </button>
                </div>
              ) : (
                notices.map((notice) => (
                  <div
                    key={notice._id}
                    className="bg-primary-50 rounded-xl p-4 sm:p-5 border border-primary-200 hover:shadow-soft-earth transition-all duration-200"
                  >
                    <div className="flex justify-between items-start mb-2 sm:mb-3">
                      <h4 className="font-semibold text-primary-900 text-base sm:text-lg pr-4 leading-tight">
                        {notice.title}
                      </h4>
                      <span className="text-xs sm:text-sm text-primary-500 whitespace-nowrap flex-shrink-0">
                        {new Date(notice.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric'
                        })}
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-2 mb-2 sm:mb-3">
                      <span className={`inline-flex items-center px-2 py-1 sm:px-3 sm:py-1 rounded-full text-xs font-medium ${getCategoryColor(notice.category)}`}>
                        {getCategoryLabel(notice.category)}
                      </span>
                      {notice.fileUrl && (
                        <span className="inline-flex items-center px-2 py-1 sm:px-3 sm:py-1 rounded-full text-xs bg-green-100 text-green-700 font-medium">
                          <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          Attachment
                        </span>
                      )}
                    </div>
                    
                    <p className="text-primary-600 mb-3 sm:mb-4 leading-relaxed line-clamp-2 text-sm sm:text-base">
                      {notice.description}
                    </p>

                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-2 sm:space-y-0">
                      <div className="flex items-center space-x-2">
                        {/* Additional info can go here */}
                      </div>
                      
                      <div className="flex items-center space-x-2 sm:space-x-3">
                        {notice.fileUrl && (
                          <button
                            onClick={() => handleViewFile(notice)}
                            className="inline-flex items-center px-2 py-1 sm:px-3 sm:py-2 text-primary-600 hover:text-primary-800 hover:bg-white rounded-lg transition-colors duration-200 font-medium text-xs sm:text-sm"
                            title="View attachment"
                          >
                            <svg className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            View
                          </button>
                        )}
                        <button
                          onClick={() => handleEdit(notice)}
                          className="inline-flex items-center px-2 py-1 sm:px-3 sm:py-2 text-accent-teal hover:text-accent-teal-dark hover:bg-white rounded-lg transition-colors duration-200 font-medium text-xs sm:text-sm"
                          title="Edit notice"
                        >
                          <svg className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                          Edit
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(notice._id)}
                          className="inline-flex items-center px-2 py-1 sm:px-3 sm:py-2 text-red-500 hover:text-red-700 hover:bg-white rounded-lg transition-colors duration-200 font-medium text-xs sm:text-sm"
                          title="Delete notice"
                        >
                          <svg className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 sm:p-8 max-w-md w-full mx-4 shadow-earth-lg border border-primary-200">
            <div className="text-center mb-4 sm:mb-6">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <svg className="w-6 h-6 sm:w-8 sm:h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-primary-900 font-serif mb-2">Delete Notice?</h3>
              <p className="text-primary-600 text-sm sm:text-base">This action cannot be undone. The notice will be permanently removed from the system.</p>
            </div>
            <div className="flex space-x-3 sm:space-x-4">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 py-2 sm:py-3 px-4 sm:px-6 border border-primary-300 text-primary-700 rounded-xl hover:bg-primary-50 transition-colors duration-200 font-semibold text-sm sm:text-base"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="flex-1 py-2 sm:py-3 px-4 sm:px-6 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors duration-200 font-semibold text-sm sm:text-base"
              >
                Delete Notice
              </button>
            </div>
          </div>
        </div>
      )}

      {/* File View Modal */}
      {viewFileModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-4xl mx-4 shadow-earth-lg border border-primary-200 flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-primary-200 flex-shrink-0">
              <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-primary-900 font-serif truncate pr-4">
                {viewFileModal.title}
              </h3>
              <button
                onClick={() => setViewFileModal(null)}
                className="text-primary-500 hover:text-primary-700 transition-colors duration-200 p-1 sm:p-2 flex-shrink-0"
              >
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {/* Content - Scrollable */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6">
              <div className="mb-3 sm:mb-4">
                <span className={`inline-flex items-center px-2 py-1 sm:px-3 sm:py-1 rounded-full text-xs sm:text-sm font-medium ${getCategoryColor(viewFileModal.category)}`}>
                  {getCategoryLabel(viewFileModal.category)}
                </span>
              </div>

              <div className="bg-primary-50 rounded-xl p-3 sm:p-4 mb-4 sm:mb-6">
                <p className="text-primary-700 text-sm sm:text-base">{viewFileModal.description}</p>
              </div>

              <div className="border-t border-primary-200 pt-4 sm:pt-6">
                <h4 className="text-base sm:text-lg font-semibold text-primary-800 mb-3 sm:mb-4">Attachment</h4>
                <div className="bg-primary-25 rounded-lg p-3 sm:p-4">
                  {getFileViewer(viewFileModal.fileUrl)}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-end p-4 sm:p-6 border-t border-primary-200 flex-shrink-0">
              <a
                href={viewFileModal.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-3 py-2 sm:px-4 sm:py-2 bg-button-primary text-white rounded-lg hover:shadow-earth-md transition-all duration-200 text-sm sm:text-base"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download File
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}