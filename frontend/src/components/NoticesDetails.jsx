import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  ArrowLeftIcon, 
  DocumentTextIcon, 
  CalendarIcon, 
  UserIcon,
  ArrowDownTrayIcon
} from "@heroicons/react/24/outline";

const NoticeDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [notice, setNotice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [fileLoading, setFileLoading] = useState(false);

  useEffect(() => {
    const fetchNotice = async () => {
      try {
        const response = await fetch(`http://localhost:3000/notice/generateDetails/${id}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch notice details");
        }

        const data = await response.json();
        setNotice(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchNotice();
  }, [id]);

  // File utility functions
  const getFileExtension = (filename) => {
    if (typeof filename !== "string" || !filename) return null;
    return filename.split(".").pop().toLowerCase();
  };

  const isImage = (filename) => {
    const imageExtensions = ["jpg", "jpeg", "png", "gif", "webp", "bmp", "svg"];
    const extension = getFileExtension(filename);
    return extension && imageExtensions.includes(extension);
  };

  const isDocument = (filename) => {
    const documentExtensions = ["pdf", "doc", "docx", "ppt", "pptx", "txt", "xls", "xlsx"];
    const extension = getFileExtension(filename);
    return extension && documentExtensions.includes(extension);
  };

  const isPDF = (filename) => getFileExtension(filename) === "pdf";

  const getFileIcon = (filename) => {
    const extension = getFileExtension(filename);
    
    if (isImage(filename)) {
      return "🖼️";
    } else if (isPDF(filename)) {
      return "📄";
    } else if (["doc", "docx"].includes(extension)) {
      return "📝";
    } else if (["ppt", "pptx"].includes(extension)) {
      return "📊";
    } else if (["xls", "xlsx"].includes(extension)) {
      return "📈";
    } else if (extension === "txt") {
      return "📃";
    } else {
      return "📎";
    }
  };

  const getFileTypeDescription = (filename) => {
    const extension = getFileExtension(filename);
    
    if (isImage(filename)) {
      return "Image File";
    } else if (isPDF(filename)) {
      return "PDF Document";
    } else if (["doc", "docx"].includes(extension)) {
      return "Word Document";
    } else if (["ppt", "pptx"].includes(extension)) {
      return "PowerPoint Presentation";
    } else if (["xls", "xlsx"].includes(extension)) {
      return "Excel Spreadsheet";
    } else if (extension === "txt") {
      return "Text Document";
    } else {
      return "Document File";
    }
  };

  const cloudName = "dciadbf71";

  const getCloudinaryPreviewUrl = (fileUrl, size = "medium") => {
    if (!fileUrl) return null;

    try {
      const urlParts = fileUrl.split("/upload/");
      if (urlParts.length < 2) return fileUrl;

      const pathParts = urlParts[1].split("/");
      let publicIdStartIndex = 0;
      if (pathParts[0].startsWith("v")) publicIdStartIndex = 1;

      const publicId = pathParts.slice(publicIdStartIndex).join("/").split(".")[0];
      const extension = getFileExtension(fileUrl);

      if (!publicId || !extension) return fileUrl;

      const sizeConfigs = {
        thumbnail: "w_300,h_200,c_fill",
        medium: "w_600,h_400,c_fill"
      };

      const sizeConfig = sizeConfigs[size] || sizeConfigs.medium;

      if (isImage(fileUrl)) {
        return `https://res.cloudinary.com/${cloudName}/image/upload/${sizeConfig}/${publicId}.${extension}`;
      } else if (isDocument(fileUrl)) {
        return `https://res.cloudinary.com/${cloudName}/image/upload/${sizeConfigs.thumbnail},pg_1,f_jpg/${publicId}.jpg`;
      }
      return fileUrl;
    } catch (error) {
      console.error("Error generating Cloudinary preview URL:", error);
      return fileUrl;
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

  const getFileSizeEstimate = (filename) => {
    const extension = getFileExtension(filename);
    if (isPDF(filename)) return "Typical size: 1-5 MB";
    if (["doc", "docx"].includes(extension)) return "Typical size: 100KB - 2MB";
    if (["ppt", "pptx"].includes(extension)) return "Typical size: 1-10 MB";
    if (["xls", "xlsx"].includes(extension)) return "Typical size: 100KB - 5MB";
    if (isImage(filename)) return "High resolution image";
    return "File size varies";
  };

  const getDownloadInstructions = (filename) => {
    const extension = getFileExtension(filename);
    
    if (isPDF(filename)) {
      return [
        "• Click 'Download File' to save the PDF to your device",
        "• Open with any PDF viewer (built into most browsers and devices)",
        "• For best experience, use Adobe Acrobat Reader"
      ];
    } else if (["doc", "docx"].includes(extension)) {
      return [
        "• Click 'Download File' to save the document",
        "• Open with Microsoft Word, Google Docs, or LibreOffice",
        "• Preserves all formatting and layout"
      ];
    } else if (["ppt", "pptx"].includes(extension)) {
      return [
        "• Click 'Download File' to save the presentation",
        "• Open with PowerPoint, Google Slides, or similar software",
        "• Best viewed in presentation mode for full experience"
      ];
    } else if (["xls", "xlsx"].includes(extension)) {
      return [
        "• Click 'Download File' to save the spreadsheet",
        "• Open with Excel, Google Sheets, or similar software",
        "• Preserves formulas, charts, and data formatting"
      ];
    } else if (isImage(filename)) {
      return [
        "• Click 'Download File' to save the high-resolution image",
        "• Opens with any image viewer or editor",
        "• Full quality and resolution preserved"
      ];
    } else {
      return [
        "• Click 'Download File' to save the document",
        "• Use appropriate software to open the file",
        "• Ensure you have the necessary applications installed"
      ];
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600 text-lg">Loading notice details...</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center max-w-md p-6">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-red-600 text-2xl">!</span>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Notice</h3>
        <p className="text-red-600 mb-4">{error}</p>
        <button
          onClick={() => navigate(-1)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Go Back
        </button>
      </div>
    </div>
  );

  if (!notice) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center max-w-md p-6">
        <DocumentTextIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Notice Not Found</h3>
        <p className="text-gray-600 mb-4">The requested notice could not be found.</p>
        <button
          onClick={() => navigate(-1)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Go Back
        </button>
      </div>
    </div>
  );

  const thumbnailUrl = notice.fileUrl ? getCloudinaryPreviewUrl(notice.fileUrl, "thumbnail") : null;
  const downloadInstructions = notice.fileUrl ? getDownloadInstructions(notice.fileUrl) : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header with Back Button */}
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-blue-600 hover:bg-white rounded-lg transition-all duration-200 group"
          >
            <ArrowLeftIcon className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
            <span className="font-medium">Back to Notices</span>
          </button>
        </div>

        {/* Main Content Card */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200">
          {/* Header Section */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-8 text-white">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h1 className="text-3xl font-bold mb-3 leading-tight">
                  {notice.title}
                </h1>
                <div className="flex flex-wrap gap-4 text-blue-100">
                  <div className="flex items-center gap-2">
                    <UserIcon className="w-4 h-4" />
                    <span>{notice.createdBy?.name || "Unknown Author"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CalendarIcon className="w-4 h-4" />
                    <span>
                      {new Date(notice.createdAt).toLocaleDateString("en-US", { 
                        month: "long", 
                        day: "numeric", 
                        year: "numeric" 
                      })}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Content Section */}
          <div className="p-6 space-y-6">
            {/* Description */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">Description</h2>
              <div className="prose max-w-none">
                <p className="text-gray-700 leading-relaxed text-lg">
                  {notice.description}
                </p>
              </div>
            </div>

            {/* File Attachment */}
            {notice.fileUrl && (
              <div className="border border-gray-200 rounded-lg p-6 bg-gray-50">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <DocumentTextIcon className="w-5 h-5 text-blue-600" />
                  Attachment
                </h3>
                
                <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
                  <div className="p-6">
                    <div className="flex flex-col lg:flex-row gap-6">
                      {/* Thumbnail Preview */}
                      <div className="flex-shrink-0">
                        <div className="w-48 h-32 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden">
                          {thumbnailUrl ? (
                            <img 
                              src={thumbnailUrl}
                              alt={`Thumbnail of ${notice.fileUrl.split("/").pop()}`}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.nextElementSibling.style.display = 'flex';
                              }}
                            />
                          ) : null}
                          <div className={`w-full h-full flex flex-col items-center justify-center text-gray-500 ${thumbnailUrl ? 'hidden' : ''}`}>
                            <span className="text-4xl mb-2">
                              {getFileIcon(notice.fileUrl)}
                            </span>
                            <span className="text-xs text-center px-2">
                              {getFileTypeDescription(notice.fileUrl)}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* File Information */}
                      <div className="flex-1 min-w-0">
                        <div className="mb-4">
                          <h4 className="text-xl font-semibold text-gray-900 mb-2 flex items-center gap-2">
                            <span className="text-2xl">
                              {getFileIcon(notice.fileUrl)}
                            </span>
                            {notice.fileUrl.split("/").pop()}
                          </h4>
                          <div className="space-y-1 text-sm text-gray-600">
                            <p className="font-medium">{getFileTypeDescription(notice.fileUrl)}</p>
                            <p>{getFileSizeEstimate(notice.fileUrl)}</p>
                            <p className="capitalize">Format: {getFileExtension(notice.fileUrl)?.toUpperCase()}</p>
                          </div>
                        </div>

                        {/* Download Button */}
                        <div className="mb-4">
                          <button
                            onClick={() => handleFileDownload(notice.fileUrl, notice.fileUrl.split("/").pop())}
                            disabled={fileLoading}
                            className="flex items-center justify-center gap-2 px-8 py-4 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50 font-medium text-lg w-full sm:w-auto min-w-[280px]"
                          >
                            <ArrowDownTrayIcon className="w-5 h-5" />
                            {fileLoading ? "Downloading..." : "Download File"}
                          </button>
                        </div>

                        {/* Download Instructions */}
                        {downloadInstructions.length > 0 && (
                          <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                            <h5 className="font-medium text-blue-900 mb-2">📋 How to View:</h5>
                            <ul className="text-sm text-blue-800 space-y-1">
                              {downloadInstructions.map((instruction, index) => (
                                <li key={index}>{instruction}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {fileLoading && (
                    <div className="px-6 pb-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                        <span>Preparing your download... This may take a moment for larger files.</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Footer Metadata */}
            <div className="border-t border-gray-200 pt-6 mt-6">
              <div className="flex flex-wrap gap-6 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <UserIcon className="w-4 h-4" />
                  <span>Created by: {notice.createdBy?.name || "Unknown"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <CalendarIcon className="w-4 h-4" />
                  <span>
                    Created: {new Date(notice.createdAt).toLocaleDateString("en-US", { 
                      month: "short", 
                      day: "numeric", 
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit"
                    })}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NoticeDetails;