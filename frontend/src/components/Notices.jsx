import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

export default function Notices() {
  const { t } = useTranslation();
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
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

  // Filter notices based on search and filter criteria
  const filteredNotices = notices.filter(notice => {
    const matchesSearch = notice.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          notice.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filter === "with-attachments") {
      return matchesSearch && notice.file;
    }
    
    return matchesSearch;
  });

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-16 text-center">
        <div className="flex flex-col items-center justify-center h-64">
          <div className="w-16 h-16 border-4 border-green-600 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-gray-500 uppercase tracking-wider text-lg">
            {t("loading", { defaultValue: "Loading notices..." })}
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-16 text-center">
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg max-w-md mx-auto">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">
                {t("error_fetching_notices", { defaultValue: "Error fetching notices" })}: {error}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 md:py-16">
      {/* Page Title */}
      <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-gray-900 mb-6 text-center">
        {t("notices_page_title", { defaultValue: "Notices & Announcements" })}
      </h1>
      
      <p className="text-gray-600 text-center mb-10 max-w-2xl mx-auto">
        {t("notices_page_subtitle", { defaultValue: "Stay updated with the latest news and announcements" })}
      </p>

      {/* Search and Filter Section */}
      <div className="flex flex-col md:flex-row gap-4 mb-10 justify-between items-stretch">
        <div className="relative flex-grow max-w-2xl">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
            </svg>
          </div>
          <input
            type="text"
            placeholder={t("search_placeholder", { defaultValue: "Search notices..." })}
            className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={() => setFilter("all")}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${filter === "all" ? "bg-green-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
          >
            {t("filter_all", { defaultValue: "All" })}
          </button>
          <button
            onClick={() => setFilter("with-attachments")}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${filter === "with-attachments" ? "bg-green-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
          >
            {t("filter_with_attachments", { defaultValue: "With Attachments" })}
          </button>
        </div>
      </div>

      {filteredNotices.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-2xl">
          <svg className="mx-auto h-12 w-12 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="mt-2 text-lg font-medium text-gray-900">
            {searchTerm || filter !== "all" 
              ? t("no_matching_notices", { defaultValue: "No matching notices" })
              : t("no_notices", { defaultValue: "No notices available right now" })
            }
          </h3>
          <p className="mt-1 text-gray-500 max-w-prose mx-auto">
            {searchTerm || filter !== "all" 
              ? t("no_matching_notices_description", { defaultValue: "Try adjusting your search or filter to find what you're looking for." })
              : t("no_notices_description", { defaultValue: "Check back later for new announcements and updates." })
            }
          </p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredNotices.map((notice) => {
            const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(
              notice.fileUrl || ""
            );

            return (
              <div
                key={notice._id}
                className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden hover:shadow-lg transition-all duration-300 flex flex-col"
              >
                <div className="p-6 flex-grow">
                  <div className="flex justify-between items-start mb-3">
                    <h2 className="text-xl font-bold text-gray-900 line-clamp-2">
                      {notice.title}
                    </h2>
                    {notice.file && (
                      <span className="flex-shrink-0 ml-2 bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                        {isImage ? t("has_image", { defaultValue: "Image" }) : t("has_document", { defaultValue: "Document" })}
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-gray-500 mb-4 flex items-center">
                    <svg className="w-4 h-4 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {new Date(notice.createdAt).toLocaleDateString()}
                    {notice.createdBy?.name && (
                      <span className="ml-2 flex items-center">
                        <svg className="w-4 h-4 mr-1 ml-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        {notice.createdBy.name}
                      </span>
                    )}
                  </p>

                  <p className="text-gray-700 leading-relaxed mb-4 line-clamp-3">
                    {notice.description}
                  </p>
                </div>

                {/* Show image or document link */}
                {notice.file && (
                  <div className="px-6 pb-6 pt-0">
                    {isImage ? (
                      <div className="relative group cursor-zoom-in" onClick={() => setSelectedImage(`http://localhost:3000/notice/${notice._id}/file`)}>
                        <img
                          src={`http://localhost:3000/notice/${notice._id}/file`}
                          alt="Notice attachment"
                          className="rounded-lg border border-gray-200 shadow-sm w-full h-48 object-cover transition-all duration-300 group-hover:brightness-90"
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-300 flex items-center justify-center">
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black bg-opacity-50 text-white rounded-full p-2">
                            <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3-3H7" />
                            </svg>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <a
                        href={`http://localhost:3000/notice/${notice._id}/file`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center w-full bg-gray-900 text-white px-4 py-3 rounded-lg text-sm font-medium uppercase tracking-wide hover:bg-green-600 transition-all"
                      >
                        <svg className="w-5 h-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        {t("view_document", { defaultValue: "View Document" })}
                      </a>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Fullscreen Modal for Image Preview */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <button
            className="absolute top-4 right-4 md:top-6 md:right-6 text-white text-3xl font-bold bg-black bg-opacity-50 rounded-full w-10 h-10 flex items-center justify-center hover:bg-opacity-70 transition-all"
            onClick={() => setSelectedImage(null)}
          >
            ✕
          </button>
          <div className="relative max-h-full max-w-full">
            <img
              src={selectedImage}
              alt="Notice full preview"
              className="max-h-[90vh] max-w-full object-contain rounded-lg"
            />
          </div>
        </div>
      )}
    </div>
  );
}