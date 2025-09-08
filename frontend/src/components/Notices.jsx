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
} from "@heroicons/react/24/outline";
import {
  ExclamationCircleIcon,
} from "@heroicons/react/20/solid";

const Notices = () => {
  const { t } = useTranslation();
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedAttachment, setSelectedAttachment] = useState(null);
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

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
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500 uppercase tracking-wider font-semibold">
            {t("loading", { defaultValue: "Loading notices..." })}
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-lg shadow-md max-w-lg mx-auto">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <ExclamationCircleIcon
                className="h-8 w-8 text-red-400"
                aria-hidden="true"
              />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-bold text-red-800">
                {t("error_fetching_notices_title", {
                  defaultValue: "Something went wrong",
                })}
              </h3>
              <p className="mt-1 text-sm text-red-700">
                {t("error_fetching_notices", {
                  defaultValue: "Error fetching notices",
                })}
                : {error}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        {/* Header Section */}
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            {t("notices_page_title", {
              defaultValue: "Official Notices & Announcements",
            })}
          </h1>
          <p className="text-gray-600 max-w-3xl mx-auto text-lg">
            {t("notices_page_subtitle", {
              defaultValue:
                "Stay informed with the latest updates, important news, and official announcements from our community.",
            })}
          </p>
        </div>

        {/* Search and Filter Controls */}
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 mb-10">
          <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
            <div className="relative flex-grow w-full md:max-w-xl">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon
                  className="h-5 w-5 text-gray-400"
                  aria-hidden="true"
                />
              </div>
              <input
                type="text"
                placeholder={t("search_placeholder", {
                  defaultValue: "Search by title or description...",
                })}
                className="block w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 text-gray-800"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setFilter("all")}
                className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  filter === "all"
                    ? "bg-green-600 text-white shadow-sm"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {t("filter_all", { defaultValue: "All Notices" })}
              </button>
              <button
                onClick={() => setFilter("with-attachments")}
                className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  filter === "with-attachments"
                    ? "bg-green-600 text-white shadow-sm"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                <PaperClipIcon className="h-4 w-4 mr-1.5" />
                {t("filter_with_attachments", {
                  defaultValue: "With Attachments",
                })}
              </button>
            </div>
          </div>
        </div>

        {/* Notice List */}
        {filteredNotices.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl shadow-sm border border-gray-200">
            <svg
              className="mx-auto h-12 w-12 text-gray-400 mb-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm || filter !== "all"
                ? t("no_matching_notices", {
                    defaultValue: "No matching notices found",
                  })
                : t("no_notices", {
                    defaultValue: "No notices available right now",
                  })}
            </h3>
            <p className="text-gray-500 max-w-md mx-auto">
              {searchTerm || filter !== "all"
                ? t("no_matching_notices_description", {
                    defaultValue:
                      "Try adjusting your search query or filter to see more results.",
                  })
                : t("no_notices_description", {
                    defaultValue:
                      "Check back later for new announcements and updates.",
                  })}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredNotices.map((notice) => {
              const fileUrl = notice.fileUrl;
              const previewUrl = getCloudinaryPreviewUrl(fileUrl);
              
              const isFileAnImage = isImage(fileUrl);
              const isFileADocument = isDocument(fileUrl);
              const isFileAnOther = isOtherFile(fileUrl);

              return (
                <div
                  key={notice._id}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col transition-all duration-300 hover:shadow-md group"
                >
                  {/* File Preview Section - Always show an image */}
                  <div
                    className="relative w-full aspect-video bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center p-4 cursor-pointer"
                    onClick={() => {
                      if (fileUrl) {
                        isFileAnImage
                          ? setSelectedAttachment({ type: "image", url: fileUrl })
                          : window.open(fileUrl, "_blank");
                      }
                    }}
                  >
                    {/* Render preview based on file type or placeholder */}
                    {fileUrl ? (
                      <>
                        {isFileAnImage || isFileADocument ? (
                          <img
                            src={isFileAnImage ? fileUrl : previewUrl}
                            alt="Notice attachment preview"
                            className="w-full h-full object-cover rounded-lg"
                          />
                        ) : (
                          <div className="text-center p-4">
                            <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400 mb-2" />
                            <p className="text-sm font-medium text-gray-600">
                              {t("unsupported_preview", { defaultValue: "No Preview Available" })}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              {t("click_to_download", { defaultValue: "Click to view/download" })}
                            </p>
                          </div>
                        )}
                        
                        {/* The overlay and icon for the click action */}
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                          <div className="bg-white/80 text-gray-800 rounded-full p-2 backdrop-blur-sm">
                            {isFileAnImage ? (
                              <MagnifyingGlassIcon className="w-5 h-5" />
                            ) : (
                              <ArrowDownTrayIcon className="w-5 h-5" />
                            )}
                          </div>
                        </div>
                      </>
                    ) : (
                      // Placeholder for notices without attachments
                      <div className="text-center p-4">
                        <div className="mx-auto mb-3 w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                          <DocumentTextIcon className="h-8 w-8 text-green-600" />
                        </div>
                        <p className="text-sm font-medium text-gray-600">
                          {t("no_attachment", { defaultValue: "No Attachment" })}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {t("text_notice_only", { defaultValue: "Text notice only" })}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Card Content Section */}
                  <div className="p-5 flex-grow flex flex-col">
                    <div className="flex justify-between items-start mb-3">
                      <h2 className="text-xl font-semibold text-gray-900 pr-8 line-clamp-2">
                        {notice.title}
                      </h2>
                      {notice.fileUrl && (
                        <span className="flex-shrink-0 inline-flex items-center rounded-full bg-green-100 px-2.5 py-1 text-xs font-medium text-green-800">
                          <PaperClipIcon className="h-3.5 w-3.5 mr-1" />
                          {t("attachment_label", { defaultValue: "Attachment" })}
                        </span>
                      )}
                    </div>

                    <p className="text-gray-600 leading-relaxed mb-4 line-clamp-3 flex-grow">
                      {notice.description}
                    </p>

                    <div className="mt-auto flex items-center text-sm text-gray-500 space-x-4 pt-4 border-t border-gray-100">
                      <div className="flex items-center">
                        <CalendarIcon className="w-4 h-4 text-gray-400 mr-1.5" />
                        <span>
                          {new Date(notice.createdAt).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                      </div>
                      {notice.createdBy?.name && (
                        <div className="flex items-center">
                          <UserIcon className="w-4 h-4 text-gray-400 mr-1.5" />
                          <span>{notice.createdBy.name}</span>
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

      {/* Fullscreen Modal for Image Preview */}
      {selectedAttachment && selectedAttachment.type === "image" && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-80 backdrop-blur-sm"
          onClick={() => setSelectedAttachment(null)}
        >
          <div className="relative max-w-4xl w-full" onClick={(e) => e.stopPropagation()}>
            <button
              className="absolute -top-10 right-0 text-white p-2 rounded-full hover:bg-gray-800 transition-all z-10"
              onClick={() => setSelectedAttachment(null)}
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
            <div className="max-h-[90vh] max-w-full overflow-auto rounded-lg">
              <img
                src={selectedAttachment.url}
                alt="Notice full preview"
                className="rounded-lg shadow-xl w-full"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Notices;