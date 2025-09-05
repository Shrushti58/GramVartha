import React, { useState, useEffect } from "react";
import axios from "axios";

export default function OfficialsDashboard() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState("");
  const [notices, setNotices] = useState([]);
  const [allNotices, setAllNotices] = useState([]);
  const [filters, setFilters] = useState({
    keyword: "",
    fromDate: "",
    toDate: "",
  });
  const [isUploading, setIsUploading] = useState(false);
  const [editingNotice, setEditingNotice] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(() => {
    fetchNotices();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [filters, allNotices]);

  const fetchNotices = async () => {
    try {
      const res = await axios.get("http://localhost:3000/notice/fetch");
      setAllNotices(res.data);
      setNotices(res.data);
    } catch (error) {
      console.error("Error fetching notices:", error);
    }
  };

  const applyFilters = () => {
    let filtered = [...allNotices];

    if (filters.keyword) {
      const keyword = filters.keyword.toLowerCase();
      filtered = filtered.filter(
        (notice) =>
          notice.title.toLowerCase().includes(keyword) ||
          notice.description.toLowerCase().includes(keyword)
      );
    }

    if (filters.fromDate) {
      filtered = filtered.filter(
        (notice) => new Date(notice.createdAt) >= new Date(filters.fromDate)
      );
    }

    if (filters.toDate) {
      const toDate = new Date(filters.toDate);
      toDate.setHours(23, 59, 59, 999);
      filtered = filtered.filter(
        (notice) => new Date(notice.createdAt) <= toDate
      );
    }

    setNotices(filtered);
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    setFileName(selectedFile ? selectedFile.name : "");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsUploading(true);

    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    if (file) formData.append("file", file);

    try {
      if (isEditing && editingNotice) {
        // Update existing notice
        await axios.put(
          `http://localhost:3000/notice/update/${editingNotice._id}`,
          formData,
          {
            headers: { "Content-Type": "multipart/form-data" },
            withCredentials: true,
          }
        );
        alert("Notice updated successfully!");
      } else {
        // Create new notice
        await axios.post("http://localhost:3000/notice/upload", formData, {
          headers: { "Content-Type": "multipart/form-data" },
          withCredentials: true,
        });
        alert("Notice uploaded successfully!");
      }

      resetForm();
      fetchNotices();
    } catch (error) {
      console.error("Error saving notice:", error);
      alert("Failed to save notice.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleEdit = (notice) => {
    setEditingNotice(notice);
    setIsEditing(true);
    setTitle(notice.title);
    setDescription(notice.description);
    setFile(null);
    setFileName(notice.fileUrl ? "Existing file attached" : "");
    
    // Scroll to form
    document.getElementById("upload-form").scrollIntoView({ behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:3000/notice/delete/${id}`, {
        withCredentials: true,
      });
      alert("Notice deleted successfully!");
      fetchNotices();
    } catch (error) {
      console.error("Error deleting notice:", error);
      alert("Failed to delete notice.");
    } finally {
      setDeleteConfirm(null);
    }
  };

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setFile(null);
    setFileName("");
    setEditingNotice(null);
    setIsEditing(false);
  };

  const cancelEdit = () => {
    resetForm();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-gray-900 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-green-600">
            Officials Dashboard
          </h1>
          <p className="mt-3 text-lg text-gray-600 max-w-2xl mx-auto">
            Manage and publish notices for your community with our intuitive dashboard
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Upload/Edit Form */}
          <div className="lg:col-span-1">
            <div id="upload-form" className="bg-white rounded-2xl shadow-lg p-6 sticky top-6 border border-gray-100">
              <div className="flex items-center justify-between mb-6 pb-3 border-b">
                <h2 className="text-xl font-semibold text-gray-800">
                  {isEditing ? "Edit Notice" : "Upload New Notice"}
                </h2>
                {isEditing && (
                  <button
                    onClick={cancelEdit}
                    className="text-sm text-gray-500 hover:text-gray-700 flex items-center"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Cancel Edit
                  </button>
                )}
              </div>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Enter notice title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    placeholder="Enter notice description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    rows="4"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Attachment (Optional)
                  </label>
                  <div className="flex items-center justify-center w-full">
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <svg className="w-10 h-10 mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
                        </svg>
                        <p className="mb-2 text-sm text-gray-500 text-center">
                          {fileName || (
                            <>
                              <span className="font-semibold">Click to upload</span> or drag and drop
                            </>
                          )}
                        </p>
                        <p className="text-xs text-gray-500">PDF, DOC, DOCX, JPEG, PNG (Max 5MB)</p>
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
                  disabled={isUploading}
                  className={`w-full py-3.5 px-4 rounded-xl font-medium flex items-center justify-center ${
                    isUploading
                      ? "bg-blue-400 cursor-not-allowed"
                      : "bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700"
                  } text-white transition-all shadow-md hover:shadow-lg`}
                >
                  {isUploading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      {isEditing ? "Updating..." : "Uploading..."}
                    </>
                  ) : (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      {isEditing ? "Update Notice" : "Upload Notice"}
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Right Column - Filters and Notices */}
          <div className="lg:col-span-2">
            {/* Filters Card */}
            <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-gray-100">
              <h2 className="text-xl font-semibold text-gray-800 mb-5 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
                Filter Notices
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Keyword</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <input
                      type="text"
                      placeholder="Search by keyword..."
                      value={filters.keyword}
                      onChange={(e) => setFilters({ ...filters, keyword: e.target.value })}
                      className="pl-10 w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">From Date</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <input
                      type="date"
                      value={filters.fromDate}
                      onChange={(e) => setFilters({ ...filters, fromDate: e.target.value })}
                      className="pl-10 w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">To Date</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <input
                      type="date"
                      value={filters.toDate}
                      onChange={(e) => setFilters({ ...filters, toDate: e.target.value })}
                      className="pl-10 w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>
                </div>
              </div>
              
              <div className="flex justify-between items-center mt-5">
                <span className="text-sm text-gray-500">
                  Showing {notices.length} of {allNotices.length} notices
                </span>
                <button
                  onClick={() => setFilters({ keyword: "", fromDate: "", toDate: "" })}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors flex items-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Reset Filters
                </button>
              </div>
            </div>

            {/* Notices List */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-800 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                  </svg>
                  Uploaded Notices
                </h2>
                <span className="text-sm font-medium px-3 py-1 bg-blue-100 text-blue-800 rounded-full">
                  {notices.length} {notices.length === 1 ? 'Notice' : 'Notices'}
                </span>
              </div>

              {notices.length === 0 ? (
                <div className="text-center py-10">
                  <svg className="mx-auto h-16 w-16 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <h3 className="mt-5 text-lg font-medium text-gray-900">No notices found</h3>
                  <p className="mt-2 text-sm text-gray-500">
                    {allNotices.length === 0 
                      ? "Get started by uploading your first notice." 
                      : "Try changing your filters or search criteria."}
                  </p>
                  {allNotices.length === 0 && (
                    <button
                      onClick={() => document.getElementById("upload-form").scrollIntoView({ behavior: "smooth" })}
                      className="mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Create Your First Notice
                    </button>
                  )}
                </div>
              ) : (
                <div className="space-y-5">
                  {notices.map((n) => (
                    <div
                      key={n._id}
                      className="border border-gray-200 rounded-2xl p-5 hover:shadow-md transition-all bg-gradient-to-br from-white to-gray-50"
                    >
                      <div className="flex justify-between items-start">
                        <h3 className="text-lg font-semibold text-gray-900">{n.title}</h3>
                        <span className="text-sm text-gray-500 whitespace-nowrap ml-2">
                          {new Date(n.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="mt-3 text-gray-600">{n.description}</p>

                      <div className="mt-5 flex justify-between items-center">
                        <div className="flex items-center">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {n.createdBy?.name || "Unknown"}
                          </span>
                          {n.fileUrl && (
                            <span className="ml-2 inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              Attachment Available
                            </span>
                          )}
                        </div>
                        
                        <div className="flex space-x-2">
                          {n.fileUrl && (
                            <a
                              href={n.fileUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-xl shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                              View
                            </a>
                          )}
                          <button
                            onClick={() => handleEdit(n)}
                            className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-xl shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            Edit
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(n._id)}
                            className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-xl shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            Delete
                          </button>
                        </div>
                      </div>

                      {/* Delete Confirmation Modal */}
                      {deleteConfirm === n._id && (
                        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                          <div className="bg-white p-6 rounded-2xl shadow-xl max-w-md w-full mx-4">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Confirm Deletion</h3>
                            <p className="text-gray-600">Are you sure you want to delete this notice? This action cannot be undone.</p>
                            <div className="mt-6 flex justify-end space-x-3">
                              <button
                                onClick={() => setDeleteConfirm(null)}
                                className="px-4 py-2 border border-gray-300 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                              >
                                Cancel
                              </button>
                              <button
                                onClick={() => handleDelete(n._id)}
                                className="px-4 py-2 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                              >
                                Delete Notice
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}