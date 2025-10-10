import React, { useEffect, useState } from "react";
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
} from "@heroicons/react/24/outline";
import { ExclamationCircleIcon, SparklesIcon } from "@heroicons/react/20/solid";

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

  const navigate = useNavigate();

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

  const handleDetails = (noticeId) => {
    navigate(`/notice-details/${noticeId}`);
  };

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

  const isPDF = (filename) => getFileExtension(filename) === "pdf";

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

  const handleFileView = async (fileUrl, filename) => {
    setFileLoading(true);
    try {
      if (isImage(fileUrl)) {
        setSelectedAttachment({ type: "image", url: fileUrl, filename: filename || "image" });
      } else if (isPDF(fileUrl)) {
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

  const handleFileDownload = async (fileUrl, filename) => {
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">{t("loading_title", { defaultValue: "Loading Notices" })}</h3>
          <p className="text-gray-600">{t("loading", { defaultValue: "Please wait while we fetch the latest updates..." })}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-sm p-8 max-w-md text-center">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4">
            <ExclamationCircleIcon className="h-8 w-8 text-red-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">{t("error_title", { defaultValue: "Something went wrong" })}</h3>
          <p className="text-gray-600 mb-4">{t("error_fetching_notices", { defaultValue: "Unable to load notices at the moment" })}</p>
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
            <p className="text-sm text-red-700 font-mono break-words">{error}</p>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            {t("retry", { defaultValue: "Try Again" })}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center p-4 bg-blue-100 rounded-full mb-6">
            <SparklesIcon className="h-8 w-8 text-blue-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">{t("notices_page_title", { defaultValue: "Official Notices" })}</h1>
          <p className="text-gray-600 max-w-3xl mx-auto text-lg">{t("notices_page_subtitle", { defaultValue: "Stay updated with the latest announcements, important updates, and official communications." })}</p>
        </div>

        {/* Search and Filter Section */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search Input */}
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder={t("search_placeholder", { defaultValue: "Search notices by title or content..." })}
                className="block w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Filter Controls */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="lg:hidden flex items-center px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <FunnelIcon className="h-5 w-5 mr-2" />
                {t("filters", { defaultValue: "Filters" })}
              </button>

              <div className={`flex gap-2 ${showFilters ? "flex" : "hidden lg:flex"} flex-col lg:flex-row w-full lg:w-auto`}>
                <button
                  onClick={() => setFilter("all")}
                  className={`px-6 py-3 rounded-lg text-sm font-medium transition-colors ${filter === "all" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
                >
                  {t("filter_all", { defaultValue: "All Notices" })}
                  <span className="ml-2 text-xs opacity-75">({notices.length})</span>
                </button>
                <button
                  onClick={() => setFilter("with-attachments")}
                  className={`px-6 py-3 rounded-lg text-sm font-medium transition-colors flex items-center ${filter === "with-attachments" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
                >
                  <PaperClipIcon className="h-4 w-4 mr-2" />
                  {t("filter_with_attachments", { defaultValue: "With Files" })}
                  <span className="ml-2 text-xs opacity-75">({notices.filter((n) => n.fileUrl).length})</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Results Summary */}
        {(searchTerm || filter !== "all") && (
          <div className="mb-6 text-center">
            <div className="inline-block bg-white rounded-lg px-4 py-2 shadow-sm border border-gray-200">
              <p className="text-gray-700 font-medium">
                {t("showing_results", { defaultValue: `Showing ${filteredNotices.length} of ${notices.length} notices` })}
              </p>
            </div>
          </div>
        )}

        {/* Notice Grid */}
        {filteredNotices.length === 0 ? (
          <div className="text-center py-16">
            <div className="bg-white rounded-lg shadow-sm p-12 max-w-lg mx-auto">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <DocumentTextIcon className="h-10 w-10 text-gray-400" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                {searchTerm || filter !== "all"
                  ? t("no_matching_notices", { defaultValue: "No matching notices" })
                  : t("no_notices", { defaultValue: "No notices yet" })}
              </h3>
              <p className="text-gray-600 text-lg">
                {searchTerm || filter !== "all"
                  ? t("no_matching_notices_description", { defaultValue: "Try adjusting your search or filter criteria." })
                  : t("no_notices_description", { defaultValue: "New announcements will appear here when available." })}
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredNotices.map((notice) => {
              const fileUrl = notice.fileUrl;
              const previewUrl = getCloudinaryPreviewUrl(fileUrl);
              const isFileAnImage = isImage(fileUrl);
              const isFileADocument = isDocument(fileUrl);

              return (
                <div key={notice._id} className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden">
                  {/* Preview Section */}
                  <div
                    className="relative aspect-video bg-gray-100 cursor-pointer overflow-hidden"
                    onClick={() => fileUrl && handleFileView(fileUrl, notice.title)}
                  >
                    {fileUrl ? (
                      isFileAnImage || isFileADocument ? (
                        <img
                          src={isFileAnImage ? fileUrl : previewUrl}
                          alt="Notice preview"
                          className="w-full h-full object-cover transition-transform hover:scale-105"
                          loading="lazy"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full p-6">
                          <div className="text-center">
                            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                              <DocumentTextIcon className="h-8 w-8 text-gray-600" />
                            </div>
                            <p className="text-sm font-semibold text-gray-700">{t("file_attachment", { defaultValue: "File Attachment" })}</p>
                            <p className="text-xs text-gray-500 mt-1">{getFileExtension(fileUrl)?.toUpperCase()}</p>
                          </div>
                        </div>
                      )
                    ) : (
                      <div className="flex items-center justify-center h-full p-6">
                        <div className="text-center">
                          <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                            <DocumentTextIcon className="h-8 w-8 text-gray-600" />
                          </div>
                          <p className="text-sm font-semibold text-gray-700">{t("text_notice", { defaultValue: "Text Notice" })}</p>
                          <p className="text-xs text-gray-500 mt-1">{t("no_attachments", { defaultValue: "No attachments" })}</p>
                        </div>
                      </div>
                    )}

                    {/* Hover Overlay */}
                    {fileUrl && (
                      <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center opacity-0 hover:opacity-100">
                        <div className="flex gap-3">
                          <div className="bg-white text-gray-700 rounded-full p-3 hover:scale-110 transition-transform">
                            <EyeIcon className="w-5 h-5" />
                          </div>
                          <div
                            className="bg-white text-gray-700 rounded-full p-3 hover:scale-110 transition-transform"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleFileDownload(fileUrl, notice.title);
                            }}
                          >
                            <ArrowDownTrayIcon className="w-5 h-5" />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* File Type Badge */}
                    {fileUrl && (
                      <div className="absolute top-3 right-3">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-white text-gray-700 border border-gray-200">
                          <PaperClipIcon className="h-3 w-3 mr-1" />
                          {getFileExtension(fileUrl)?.toUpperCase() || "FILE"}
                        </span>
                      </div>
                    )}

                    {/* Loading Overlay */}
                    {fileLoading && (
                      <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                        <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      </div>
                    )}
                  </div>

                  {/* Content Section */}
                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3 line-clamp-2">{notice.title}</h3>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">{notice.description}</p>

                    {/* View Details Button */}
                    <button
                      onClick={() => handleDetails(notice._id)}
                      className="w-full mb-4 inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm"
                    >
                      View Details
                    </button>

                    {/* Meta Information */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <div className="flex items-center text-sm text-gray-500">
                        <CalendarIcon className="w-4 h-4 mr-1" />
                        <time dateTime={notice.createdAt}>
                          {new Date(notice.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                        </time>
                      </div>

                      {notice.createdBy?.name && (
                        <div className="flex items-center text-sm text-gray-500">
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-75" onClick={() => setSelectedAttachment(null)}>
          <div className="relative max-w-3xl w-full" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setSelectedAttachment(null)}
              className="absolute top-3 right-3 text-white bg-gray-800 bg-opacity-50 p-2 rounded-full hover:bg-opacity-75"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>

            {selectedAttachment.type === "image" && <img src={selectedAttachment.url} alt={selectedAttachment.filename} className="w-full rounded-lg max-h-[80vh] object-contain" />}
            {selectedAttachment.type === "pdf" && (
              <iframe
                src={selectedAttachment.url}
                title={selectedAttachment.filename}
                className="w-full h-[80vh] rounded-lg"
                frameBorder="0"
              />
            )}
            {selectedAttachment.type === "document" && (
              <div className="bg-white rounded-lg p-6 flex flex-col items-center justify-center">
                <DocumentTextIcon className="w-16 h-16 text-gray-700 mb-4" />
                <p className="text-gray-700 text-lg mb-2">{selectedAttachment.filename}</p>
                <button
                  onClick={() => handleFileDownload(selectedAttachment.url, selectedAttachment.filename)}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
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
