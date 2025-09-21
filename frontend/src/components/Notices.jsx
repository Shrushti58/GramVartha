import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
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
} from "@heroicons/react/24/outline";
import {
  ExclamationCircleIcon,
  SparklesIcon,
} from "@heroicons/react/20/solid";

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

  useEffect(() => {
    const fetchNotices = async () => {
      try {
        const response = await fetch("http://localhost:3000/notice/fetch");
        if (!response.ok) {
          throw new Error("Failed to fetch notices");
        }
        const data = await response.json();
        setNotices(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchNotices();
  }, []);

  const filteredNotices = notices.filter((notice) => {
    const matchesSearch =
      notice.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notice.description.toLowerCase().includes(searchTerm.toLowerCase());

    const hasAttachment = !!notice.fileUrl;

    if (filter === "with-attachments") {
      return matchesSearch && hasAttachment;
    }
    return matchesSearch;
  });

  const getFileExtension = (filename) => {
    if (typeof filename !== "string" || !filename) {
      return null;
    }
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

  const isPDF = (filename) => {
    const extension = getFileExtension(filename);
    return extension === "pdf";
  };

  const cloudName = "dciadbf71";
  
  const getCloudinaryPreviewUrl = (fileUrl) => {
    if(!fileUrl){
      return null;
    }

    const urlParts = fileUrl.split("/upload/");
    if (urlParts.length < 2) {
      return null;
    }
    
    const pathParts = urlParts[1].split("/");
    let publicIdStartIndex = 0;
    if (pathParts[0].startsWith("v")) {
      publicIdStartIndex = 1;
    }
    const publicId = pathParts.slice(publicIdStartIndex).join("/").split('.')[0];
    
    const extension = getFileExtension(fileUrl);
    
    if (!publicId || !extension) return null;
    
    if (isImage(fileUrl)) {
      return `https://res.cloudinary.com/${cloudName}/image/upload/w_600,h_400,c_fill/${publicId}.${extension}`;
    } else if (isDocument(fileUrl)) {
      return `https://res.cloudinary.com/${cloudName}/image/upload/w_600,h_400,c_fill,pg_1/${publicId}.jpg`;
    }
    return null;
  };

  // Function to handle file viewing
  const handleFileView = async (fileUrl, filename) => {
    setFileLoading(true);
    try {
      if (isImage(fileUrl)) {
        setSelectedAttachment({ 
          type: "image", 
          url: fileUrl, 
          filename: filename || "image" 
        });
      } else if (isPDF(fileUrl)) {
        setSelectedAttachment({ 
          type: "pdf", 
          url: fileUrl, 
          filename: filename || "document.pdf" 
        });
      } else {
        // For other document types, we'll show a preview modal with download option
        setSelectedAttachment({ 
          type: "document", 
          url: fileUrl, 
          filename: filename || "document",
          extension: getFileExtension(fileUrl)
        });
      }
    } catch (error) {
      console.error("Error viewing file:", error);
      // Fallback to download
      handleFileDownload(fileUrl, filename);
    } finally {
      setFileLoading(false);
    }
  };

  // Function to handle file download
  const handleFileDownload = async (fileUrl, filename) => {
    try {
      setFileLoading(true);
      const response = await fetch(fileUrl);
      const blob = await response.blob();
      
      // Create download link
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      
      // Set filename
      const extension = getFileExtension(fileUrl);
      const downloadFilename = filename || `document.${extension}`;
      link.download = downloadFilename;
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error("Error downloading file:", error);
      alert("Error downloading file. Please try again.");
    } finally {
      setFileLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background-cream flex items-center justify-center p-4">
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-40 h-40 bg-field-green-300 rounded-full filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute bottom-0 right-0 w-40 h-40 bg-sunshine-yellow-300 rounded-full filter blur-3xl opacity-20 animate-pulse delay-500"></div>
        
        <div className="text-center relative z-10">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-field-green-200 rounded-full animate-spin"></div>
            <div className="w-20 h-20 border-4 border-field-green-500 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
          </div>
          <div className="mt-6 space-y-2">
            <h3 className="text-lg font-semibold text-field-green-900">
              {t("loading_title", { defaultValue: "Loading Notices" })}
            </h3>
            <p className="text-warm-earth-700">
              {t("loading", { defaultValue: "Please wait while we fetch the latest updates..." })}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background-cream flex items-center justify-center p-4">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-warm-earth-200 rounded-full filter blur-3xl opacity-20"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-field-green-200 rounded-full filter blur-3xl opacity-20"></div>
        
        <div className="bg-white border border-red-200 rounded-2xl shadow-xl p-8 max-w-md mx-auto relative z-10">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4">
              <ExclamationCircleIcon className="h-8 w-8 text-red-600" />
            </div>
            <h3 className="text-xl font-bold text-warm-earth-900 mb-2">
              {t("error_title", { defaultValue: "Something went wrong" })}
            </h3>
            <p className="text-warm-earth-700 mb-4">
              {t("error_fetching_notices", { defaultValue: "Unable to load notices at the moment" })}
            </p>
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-700 font-mono">{error}</p>
            </div>
            <button 
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-gradient-to-b from-field-green-500 to-field-green-600 text-white rounded-lg hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5"
            >
              {t("retry", { defaultValue: "Try Again" })}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-cream relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute -top-40 -left-40 w-80 h-80 bg-field-green-300 rounded-full filter blur-3xl opacity-20"></div>
      <div className="absolute -bottom-40 -right-40 w-80 h-80 bg-sunshine-yellow-300 rounded-full filter blur-3xl opacity-20"></div>
      <div className="absolute top-1/4 right-1/4 w-40 h-40 bg-warm-earth-300 rounded-full filter blur-3xl opacity-15"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12 relative z-10">
        {/* Modern Header Section with theme colors */}
        <div className="text-center mb-12 relative">
          {/* Animated decorative elements */}
          <div className="absolute -top-10 -left-10 w-20 h-20 bg-field-green-100 rounded-full opacity-50 animate-bounce"></div>
          <div className="absolute -top-5 -right-5 w-16 h-16 bg-sunshine-yellow-100 rounded-full opacity-50 animate-bounce delay-300"></div>
          
          <div className="inline-flex items-center justify-center p-3 bg-gradient-to-r from-field-green-100 to-sunshine-yellow-100 rounded-full mb-6 transform transition-all duration-500 hover:rotate-12">
            <SparklesIcon className="h-8 w-8 text-field-green-600" />
          </div>
          <h1 className="text-4xl lg:text-5xl font-bold bg-header-gradient bg-clip-text text-transparent mb-4 transform transition-all duration-700 hover:scale-105">
            {t("notices_page_title", {
              defaultValue: "Official Notices",
            })}
          </h1>
          <p className="text-lg text-warm-earth-700 max-w-2xl mx-auto leading-relaxed">
            {t("notices_page_subtitle", {
              defaultValue:
                "Stay updated with the latest announcements, important updates, and official communications.",
            })}
          </p>
        </div>

        {/* Enhanced Search and Filter Section */}
        <div className="bg-white/80 backdrop-blur-sm border border-white rounded-2xl shadow-lg p-6 mb-10 transform transition-all duration-500 hover:shadow-xl">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search Input */}
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-field-green-500" />
              </div>
              <input
                type="text"
                placeholder={t("search_placeholder", {
                  defaultValue: "Search notices by title or content...",
                })}
                className="block w-full pl-12 pr-4 py-3 border border-field-green-100 rounded-xl focus:ring-2 focus:ring-field-green-500 focus:border-transparent transition-all duration-200 bg-white/70 backdrop-blur-sm placeholder-warm-earth-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Filter Controls */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="lg:hidden flex items-center px-4 py-3 bg-field-green-50 text-field-green-700 rounded-xl hover:bg-field-green-100 transition-all duration-300 transform hover:-translate-y-0.5"
              >
                <FunnelIcon className="h-4 w-4 mr-2" />
                {t("filters", { defaultValue: "Filters" })}
              </button>
              
              <div className={`flex gap-2 ${showFilters ? 'flex' : 'hidden lg:flex'} flex-col lg:flex-row w-full lg:w-auto`}>
                <button
                  onClick={() => setFilter("all")}
                  className={`px-6 py-3 rounded-xl text-sm font-medium transition-all duration-300 transform hover:-translate-y-0.5 ${
                    filter === "all"
                      ? "bg-button-primary text-white shadow-lg shadow-field-green-500/25"
                      : "bg-white/70 text-warm-earth-700 hover:bg-white border border-field-green-100"
                  }`}
                >
                  {t("filter_all", { defaultValue: "All Notices" })}
                  <span className="ml-2 text-xs opacity-75">({notices.length})</span>
                </button>
                <button
                  onClick={() => setFilter("with-attachments")}
                  className={`px-6 py-3 rounded-xl text-sm font-medium transition-all duration-300 transform hover:-translate-y-0.5 flex items-center ${
                    filter === "with-attachments"
                      ? "bg-button-primary text-white shadow-lg shadow-field-green-500/25"
                      : "bg-white/70 text-warm-earth-700 hover:bg-white border border-field-green-100"
                  }`}
                >
                  <PaperClipIcon className="h-4 w-4 mr-2" />
                  {t("filter_with_attachments", { defaultValue: "With Files" })}
                  <span className="ml-2 text-xs opacity-75">
                    ({notices.filter(n => n.fileUrl).length})
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Results Summary */}
        {(searchTerm || filter !== "all") && (
          <div className="mb-6 text-center">
            <p className="text-warm-earth-700">
              {t("showing_results", { 
                defaultValue: `Showing ${filteredNotices.length} of ${notices.length} notices` 
              })}
            </p>
          </div>
        )}

        {/* Enhanced Notice Grid with 3D effects */}
        {filteredNotices.length === 0 ? (
          <div className="text-center py-20 relative">
            {/* Decorative elements */}
            <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-field-green-100 rounded-full opacity-30 animate-pulse"></div>
            <div className="absolute top-1/3 right-1/4 w-12 h-12 bg-sunshine-yellow-100 rounded-full opacity-30 animate-pulse delay-500"></div>
            
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-field-green-100 shadow-lg p-12 max-w-md mx-auto transform transition-all duration-500 hover:shadow-xl">
              <div className="w-16 h-16 bg-field-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <DocumentTextIcon className="h-8 w-8 text-field-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-field-green-900 mb-2">
                {searchTerm || filter !== "all"
                  ? t("no_matching_notices", { defaultValue: "No matching notices" })
                  : t("no_notices", { defaultValue: "No notices yet" })}
              </h3>
              <p className="text-warm-earth-600">
                {searchTerm || filter !== "all"
                  ? t("no_matching_notices_description", {
                      defaultValue: "Try adjusting your search or filter criteria.",
                    })
                  : t("no_notices_description", {
                      defaultValue: "New announcements will appear here when available.",
                    })}
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-8">
            {filteredNotices.map((notice, index) => {
              const fileUrl = notice.fileUrl;
              const previewUrl = getCloudinaryPreviewUrl(fileUrl);
              const isFileAnImage = isImage(fileUrl);
              const isFileADocument = isDocument(fileUrl);

              return (
                <div
                  key={notice._id}
                  className="group bg-white/80 backdrop-blur-sm border border-field-green-100 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden hover:-translate-y-2 transform perspective-1000 hover:rotate-x-2"
                  style={{ 
                    animationDelay: `${index * 100}ms`,
                    transformStyle: 'preserve-3d'
                  }}
                >
                  {/* Enhanced Preview Section */}
                  <div
                    className="relative aspect-video bg-gradient-to-br from-field-green-50 to-sunshine-yellow-50 cursor-pointer overflow-hidden"
                    onClick={() => {
                      if (fileUrl) {
                        handleFileView(fileUrl, notice.title);
                      }
                    }}
                  >
                    {fileUrl ? (
                      <>
                        {isFileAnImage || isFileADocument ? (
                          <img
                            src={isFileAnImage ? fileUrl : previewUrl}
                            alt="Notice preview"
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                            loading="lazy"
                          />
                        ) : (
                          <div className="flex items-center justify-center h-full p-6">
                            <div className="text-center">
                              <div className="w-12 h-12 bg-field-green-100 rounded-full flex items-center justify-center mx-auto mb-3 transform transition-all duration-500 group-hover:scale-110">
                                <DocumentTextIcon className="h-6 w-6 text-field-green-600" />
                              </div>
                              <p className="text-sm font-medium text-field-green-900">
                                {t("file_attachment", { defaultValue: "File Attachment" })}
                              </p>
                              <p className="text-xs text-warm-earth-500 mt-1">
                                {getFileExtension(fileUrl)?.toUpperCase()}
                              </p>
                            </div>
                          </div>
                        )}
                        
                        {/* Hover Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-field-green-900/30 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 flex items-center justify-center">
                          <div className="flex gap-2">
                            <div className="bg-white/90 backdrop-blur-sm text-field-green-700 rounded-full p-3 transform scale-75 group-hover:scale-100 transition-transform duration-300">
                              <EyeIcon className="w-5 h-5" />
                            </div>
                            <div 
                              className="bg-white/90 backdrop-blur-sm text-field-green-700 rounded-full p-3 transform scale-75 group-hover:scale-100 transition-transform duration-300"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleFileDownload(fileUrl, notice.title);
                              }}
                            >
                              <ArrowDownTrayIcon className="w-5 h-5" />
                            </div>
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="flex items-center justify-center h-full p-6">
                        <div className="text-center">
                          <div className="w-16 h-16 bg-gradient-to-br from-field-green-100 to-sunshine-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4 transform transition-all duration-500 group-hover:scale-110">
                            <DocumentTextIcon className="h-8 w-8 text-field-green-600" />
                          </div>
                          <p className="text-sm font-medium text-field-green-900">
                            {t("text_notice", { defaultValue: "Text Notice" })}
                          </p>
                          <p className="text-xs text-warm-earth-500 mt-1">
                            {t("no_attachments", { defaultValue: "No attachments" })}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* File Type Badge */}
                    {fileUrl && (
                      <div className="absolute top-3 right-3">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-white/90 backdrop-blur-sm text-field-green-700 border border-field-green-100">
                          <PaperClipIcon className="h-3 w-3 mr-1" />
                          {getFileExtension(fileUrl)?.toUpperCase() || "FILE"}
                        </span>
                      </div>
                    )}

                    {/* Loading Overlay */}
                    {fileLoading && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      </div>
                    )}
                  </div>

                  {/* Enhanced Content Section */}
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-field-green-900 mb-3 line-clamp-2 group-hover:text-field-green-700 transition-colors">
                      {notice.title}
                    </h3>
                    
                    <p className="text-warm-earth-700 leading-relaxed mb-4 line-clamp-3">
                      {notice.description}
                    </p>

                    {/* Enhanced Meta Information */}
                    <div className="flex items-center justify-between pt-4 border-t border-field-green-100">
                      <div className="flex items-center text-sm text-warm-earth-600">
                        <CalendarIcon className="w-4 h-4 mr-1.5 text-warm-earth-400" />
                        <time dateTime={notice.createdAt}>
                          {new Date(notice.createdAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </time>
                      </div>
                      
                      {notice.createdBy?.name && (
                        <div className="flex items-center text-sm text-warm-earth-600">
                          <UserIcon className="w-4 h-4 mr-1.5 text-warm-earth-400" />
                          <span className="truncate max-w-24">{notice.createdBy.name}</span>
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

      {/* Enhanced Fullscreen Modal */}
      {selectedAttachment && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          onClick={() => setSelectedAttachment(null)}
        >
          <div className="relative max-w-6xl w-full max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
            {/* Close Button */}
            <button
              className="absolute -top-12 right-0 text-white/80 hover:text-white p-2 rounded-full hover:bg-white/10 transition-all z-10 transform hover:scale-110"
              onClick={() => setSelectedAttachment(null)}
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
            
            {/* Download Button */}
            <button
              className="absolute -top-12 right-12 text-white/80 hover:text-white p-2 rounded-full hover:bg-white/10 transition-all z-10 transform hover:scale-110"
              onClick={() => handleFileDownload(selectedAttachment.url, selectedAttachment.filename)}
            >
              <ArrowDownTrayIcon className="h-6 w-6" />
            </button>
            
            {/* Content Container */}
            <div className="bg-white rounded-2xl shadow-2xl overflow-hidden transform transition-all duration-500 max-h-[90vh]">
              {selectedAttachment.type === "image" && (
                <img
                  src={selectedAttachment.url}
                  alt="Notice full preview"
                  className="w-full h-auto max-h-[80vh] object-contain"
                />
              )}
              
              {selectedAttachment.type === "pdf" && (
                <div className="h-[80vh]">
                  <iframe
                    src={selectedAttachment.url}
                    className="w-full h-full"
                    title="PDF Preview"
                  />
                </div>
              )}
              
              {selectedAttachment.type === "document" && (
                <div className="p-8 text-center">
                  <div className="w-20 h-20 bg-field-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <DocumentTextIcon className="h-10 w-10 text-field-green-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-field-green-900 mb-4">
                    {selectedAttachment.filename}
                  </h3>
                  <p className="text-warm-earth-700 mb-6">
                    {selectedAttachment.extension?.toUpperCase()} Document
                  </p>
                  <p className="text-warm-earth-600 mb-8">
                    This document type cannot be previewed in the browser. Click download to view the file.
                  </p>
                  <button
                    onClick={() => handleFileDownload(selectedAttachment.url, selectedAttachment.filename)}
                    className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-field-green-500 to-field-green-600 text-white rounded-xl hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5"
                  >
                    <ArrowDownTrayIcon className="h-5 w-5 mr-2" />
                    Download File
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Notices;
