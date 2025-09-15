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

  const isOtherFile = (filename) => {
    const extension = getFileExtension(filename);
    return extension && !isImage(filename) && !isDocument(filename);
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-blue-200 rounded-full animate-spin"></div>
            <div className="w-20 h-20 border-4 border-blue-600 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
          </div>
          <div className="mt-6 space-y-2">
            <h3 className="text-lg font-semibold text-gray-900">
              {t("loading_title", { defaultValue: "Loading Notices" })}
            </h3>
            <p className="text-gray-600">
              {t("loading", { defaultValue: "Please wait while we fetch the latest updates..." })}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4">
        <div className="bg-white border border-red-200 rounded-2xl shadow-xl p-8 max-w-md mx-auto">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4">
              <ExclamationCircleIcon className="h-8 w-8 text-red-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              {t("error_title", { defaultValue: "Something went wrong" })}
            </h3>
            <p className="text-gray-600 mb-4">
              {t("error_fetching_notices", { defaultValue: "Unable to load notices at the moment" })}
            </p>
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-700 font-mono">{error}</p>
            </div>
            <button 
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              {t("retry", { defaultValue: "Try Again" })}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        {/* Modern Header Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center p-2 bg-blue-100 rounded-full mb-4">
            <SparklesIcon className="h-6 w-6 text-blue-600" />
          </div>
          <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-indigo-800 bg-clip-text text-transparent mb-4">
            {t("notices_page_title", {
              defaultValue: "Official Notices",
            })}
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
            {t("notices_page_subtitle", {
              defaultValue:
                "Stay updated with the latest announcements, important updates, and official communications.",
            })}
          </p>
        </div>

        {/* Enhanced Search and Filter Section */}
        <div className="bg-white/70 backdrop-blur-sm border border-white/20 rounded-2xl shadow-xl p-6 mb-10">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search Input */}
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder={t("search_placeholder", {
                  defaultValue: "Search notices by title or content...",
                })}
                className="block w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/50 backdrop-blur-sm placeholder-gray-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Filter Controls */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="lg:hidden flex items-center px-4 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors"
              >
                <FunnelIcon className="h-4 w-4 mr-2" />
                {t("filters", { defaultValue: "Filters" })}
              </button>
              
              <div className={`flex gap-2 ${showFilters ? 'flex' : 'hidden lg:flex'} flex-col lg:flex-row w-full lg:w-auto`}>
                <button
                  onClick={() => setFilter("all")}
                  className={`px-6 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                    filter === "all"
                      ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/25"
                      : "bg-white/50 text-gray-700 hover:bg-white/80 border border-gray-200"
                  }`}
                >
                  {t("filter_all", { defaultValue: "All Notices" })}
                  <span className="ml-2 text-xs opacity-75">({notices.length})</span>
                </button>
                <button
                  onClick={() => setFilter("with-attachments")}
                  className={`px-6 py-3 rounded-xl text-sm font-medium transition-all duration-200 flex items-center ${
                    filter === "with-attachments"
                      ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/25"
                      : "bg-white/50 text-gray-700 hover:bg-white/80 border border-gray-200"
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
            <p className="text-gray-600">
              {t("showing_results", { 
                defaultValue: `Showing ${filteredNotices.length} of ${notices.length} notices` 
              })}
            </p>
          </div>
        )}

        {/* Enhanced Notice Grid */}
        {filteredNotices.length === 0 ? (
          <div className="text-center py-20">
            <div className="bg-white/50 backdrop-blur-sm rounded-2xl border border-white/20 shadow-xl p-12 max-w-md mx-auto">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <DocumentTextIcon className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {searchTerm || filter !== "all"
                  ? t("no_matching_notices", { defaultValue: "No matching notices" })
                  : t("no_notices", { defaultValue: "No notices yet" })}
              </h3>
              <p className="text-gray-600">
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
                  className="group bg-white/70 backdrop-blur-sm border border-white/20 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden hover:-translate-y-1"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  {/* Enhanced Preview Section */}
                  <div
                    className="relative aspect-video bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 cursor-pointer overflow-hidden"
                    onClick={() => {
                      if (fileUrl) {
                        isFileAnImage
                          ? setSelectedAttachment({ type: "image", url: fileUrl })
                          : window.open(fileUrl, "_blank");
                      }
                    }}
                  >
                    {fileUrl ? (
                      <>
                        {isFileAnImage || isFileADocument ? (
                          <img
                            src={isFileAnImage ? fileUrl : previewUrl}
                            alt="Notice preview"
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                            loading="lazy"
                          />
                        ) : (
                          <div className="flex items-center justify-center h-full p-6">
                            <div className="text-center">
                              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                <DocumentTextIcon className="h-6 w-6 text-blue-600" />
                              </div>
                              <p className="text-sm font-medium text-gray-700">
                                {t("file_attachment", { defaultValue: "File Attachment" })}
                              </p>
                              <p className="text-xs text-gray-500 mt-1">
                                {getFileExtension(fileUrl)?.toUpperCase()}
                              </p>
                            </div>
                          </div>
                        )}
                        
                        {/* Hover Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center">
                          <div className="bg-white/90 backdrop-blur-sm text-gray-800 rounded-full p-3 transform scale-75 group-hover:scale-100 transition-transform duration-300">
                            {isFileAnImage ? (
                              <EyeIcon className="w-5 h-5" />
                            ) : (
                              <ArrowDownTrayIcon className="w-5 h-5" />
                            )}
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="flex items-center justify-center h-full p-6">
                        <div className="text-center">
                          <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <DocumentTextIcon className="h-8 w-8 text-blue-600" />
                          </div>
                          <p className="text-sm font-medium text-gray-700">
                            {t("text_notice", { defaultValue: "Text Notice" })}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {t("no_attachments", { defaultValue: "No attachments" })}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* File Type Badge */}
                    {fileUrl && (
                      <div className="absolute top-3 right-3">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-white/90 backdrop-blur-sm text-gray-700 border border-white/20">
                          <PaperClipIcon className="h-3 w-3 mr-1" />
                          {getFileExtension(fileUrl)?.toUpperCase() || "FILE"}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Enhanced Content Section */}
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-blue-700 transition-colors">
                      {notice.title}
                    </h3>
                    
                    <p className="text-gray-600 leading-relaxed mb-4 line-clamp-3">
                      {notice.description}
                    </p>

                    {/* Enhanced Meta Information */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <div className="flex items-center text-sm text-gray-500">
                        <CalendarIcon className="w-4 h-4 mr-1.5 text-gray-400" />
                        <time dateTime={notice.createdAt}>
                          {new Date(notice.createdAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </time>
                      </div>
                      
                      {notice.createdBy?.name && (
                        <div className="flex items-center text-sm text-gray-500">
                          <UserIcon className="w-4 h-4 mr-1.5 text-gray-400" />
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
      {selectedAttachment && selectedAttachment.type === "image" && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          onClick={() => setSelectedAttachment(null)}
        >
          <div className="relative max-w-6xl w-full max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
            {/* Close Button */}
            <button
              className="absolute -top-12 right-0 text-white/80 hover:text-white p-2 rounded-full hover:bg-white/10 transition-all z-10"
              onClick={() => setSelectedAttachment(null)}
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
            
            {/* Image Container */}
            <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
              <img
                src={selectedAttachment.url}
                alt="Notice full preview"
                className="w-full h-auto max-h-[80vh] object-contain"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Notices;
