import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

// Modal Component
function Modal({ isOpen, onClose, title, children, size = "md" }) {
  if (!isOpen) return null;
  
  const sizeClasses = {
    sm: "max-w-md",
    md: "max-w-lg",
    lg: "max-w-2xl",
    xl: "max-w-4xl",
    full: "max-w-6xl"
  };
  
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4 text-center sm:p-0">
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity" 
          onClick={onClose}
        />
        <div className={`relative inline-block transform overflow-hidden rounded-2xl bg-white dark:bg-gray-900 text-left align-bottom shadow-2xl transition-all sm:my-8 sm:w-full ${sizeClasses[size]} sm:align-middle max-h-[90vh] overflow-y-auto`}>
          <div className="sticky top-0 bg-white dark:bg-gray-900 z-10 flex items-center justify-between border-b border-gray-200 dark:border-gray-700 px-6 py-4">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
              {title}
            </h3>
            <button
              onClick={onClose}
              className="rounded-lg p-1 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="px-6 py-4">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

// Complete Scheme Details Modal
function SchemeDetailsModal({ isOpen, onClose, scheme }) {
  if (!scheme) return null;

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Scheme Details" size="full">
      <div className="space-y-6">
        {/* Title Section */}
        <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {scheme.title}
          </h2>
          {scheme.slug && (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Scheme ID: {scheme.slug}
            </p>
          )}
        </div>

        {/* Key Information Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
            <p className="text-xs text-blue-600 dark:text-blue-400 mb-1 font-semibold">Scheme Amount</p>
            <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">
              {formatCurrency(scheme.amount)}
            </p>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-xl p-4 border border-purple-200 dark:border-purple-800">
            <p className="text-xs text-purple-600 dark:text-purple-400 mb-1 font-semibold">Scheme Level</p>
            <p className="text-lg font-semibold text-purple-700 dark:text-purple-300">
              {scheme.level || "State Level"}
            </p>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-xl p-4 border border-green-200 dark:border-green-800">
            <p className="text-xs text-green-600 dark:text-green-400 mb-1 font-semibold">Status</p>
            <span className={`inline-flex px-2 py-1 rounded-lg text-xs font-bold ${
              scheme.status === 'active' 
                ? 'bg-green-500 text-white'
                : 'bg-red-500 text-white'
            }`}>
              {scheme.status || "Active"}
            </span>
          </div>

          <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 rounded-xl p-4 border border-orange-200 dark:border-orange-800">
            <p className="text-xs text-orange-600 dark:text-orange-400 mb-1 font-semibold">Last Updated</p>
            <p className="text-sm font-medium text-orange-700 dark:text-orange-300">
              {formatDate(scheme.updatedAt)}
            </p>
          </div>
        </div>

        {/* Description */}
        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-5 border border-gray-200 dark:border-gray-700">
          <h4 className="text-base font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
            <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Description
          </h4>
          <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
            {scheme.description}
          </p>
        </div>

        {/* Categories */}
        {scheme.category && scheme.category.length > 0 && (
          <div>
            <h4 className="text-base font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <svg className="w-5 h-5 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l5 5a2 2 0 01.586 1.414V19a2 2 0 01-2 2H7a2 2 0 01-2-2V5a2 2 0 012-2z" />
              </svg>
              Categories
            </h4>
            <div className="flex flex-wrap gap-2">
              {(Array.isArray(scheme.category) ? scheme.category : [scheme.category]).map((cat, idx) => (
                <span key={idx} className="text-sm px-3 py-1.5 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-medium shadow-sm">
                  {cat}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Tags */}
        {scheme.tags && scheme.tags.length > 0 && (
          <div>
            <h4 className="text-base font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <svg className="w-5 h-5 text-teal-600 dark:text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
              </svg>
              Tags
            </h4>
            <div className="flex flex-wrap gap-2">
              {scheme.tags.map((tag, idx) => (
                <span key={idx} className="text-sm px-3 py-1.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-medium border border-gray-200 dark:border-gray-700">
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Eligibility Criteria */}
        {scheme.eligibility && (
          <div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/10 dark:to-teal-900/10 rounded-xl p-5 border border-emerald-200 dark:border-emerald-800">
            <h4 className="text-base font-bold text-emerald-900 dark:text-emerald-100 mb-3 flex items-center gap-2">
              <svg className="w-5 h-5 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              Eligibility Criteria
            </h4>
            <p className="text-sm text-emerald-800 dark:text-emerald-200 leading-relaxed whitespace-pre-wrap">
              {scheme.eligibility}
            </p>
          </div>
        )}

        {/* Required Documents */}
        {scheme.documents && scheme.documents.length > 0 && (
          <div className="bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-900/10 dark:to-yellow-900/10 rounded-xl p-5 border border-amber-200 dark:border-amber-800">
            <h4 className="text-base font-bold text-amber-900 dark:text-amber-100 mb-3 flex items-center gap-2">
              <svg className="w-5 h-5 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Required Documents ({scheme.documents.length})
            </h4>
            <ul className="space-y-2">
              {scheme.documents.map((doc, idx) => (
                <li key={idx} className="text-sm text-amber-800 dark:text-amber-200 flex items-start gap-2">
                  <svg className="w-4 h-4 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{doc}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Application Process */}
        {scheme.applicationSteps && scheme.applicationSteps.length > 0 && (
          <div className="bg-gradient-to-br from-rose-50 to-pink-50 dark:from-rose-900/10 dark:to-pink-900/10 rounded-xl p-5 border border-rose-200 dark:border-rose-800">
            <h4 className="text-base font-bold text-rose-900 dark:text-rose-100 mb-3 flex items-center gap-2">
              <svg className="w-5 h-5 text-rose-600 dark:text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
              Application Process ({scheme.applicationSteps.length} Steps)
            </h4>
            <ol className="space-y-4">
              {scheme.applicationSteps.map((step, idx) => (
                <li key={idx} className="flex gap-3">
                  <div className="flex-shrink-0 w-7 h-7 rounded-full bg-gradient-to-r from-rose-500 to-pink-500 text-white flex items-center justify-center text-sm font-bold shadow-sm">
                    {idx + 1}
                  </div>
                  <p className="text-sm text-rose-800 dark:text-rose-200 leading-relaxed flex-1">
                    {step}
                  </p>
                </li>
              ))}
            </ol>
          </div>
        )}

        {/* Request Status */}
        {scheme.requestStatus && scheme.requestStatus !== "none" && (
          <div className="bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/10 dark:to-orange-900/10 rounded-xl p-4 border border-yellow-200 dark:border-yellow-800">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse"></div>
              <p className="text-sm font-bold text-yellow-800 dark:text-yellow-200">
                Request Status: {scheme.requestStatus === "pending" ? "Pending Approval" : scheme.requestStatus}
              </p>
            </div>
          </div>
        )}

        {/* Custom Scheme Badge */}
        {scheme.isCustom && (
          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/10 dark:to-cyan-900/10 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              <p className="text-sm font-semibold text-blue-800 dark:text-blue-200">
                This is a custom scheme created by your village
              </p>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}

// Improved Scheme Card Component
function SchemeCard({ scheme, onViewDetails, onRequestUpdate, onEditAmount }) {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Get gradient based on scheme level
  const getCardGradient = () => {
    if (scheme.level === 'Central') {
      return 'from-purple-50 to-indigo-50 dark:from-purple-900/10 dark:to-indigo-900/10 border-purple-200 dark:border-purple-800';
    }
    return 'from-blue-50 to-cyan-50 dark:from-blue-900/10 dark:to-cyan-900/10 border-blue-200 dark:border-blue-800';
  };

  return (
    <div className={`bg-gradient-to-br ${getCardGradient()} rounded-2xl p-5 border shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col`}>
      {/* Header */}
      <div className="flex justify-between items-start mb-3">
        <h3 className="font-bold text-gray-900 dark:text-white text-lg leading-tight flex-1">
          {scheme.title}
        </h3>
        {scheme.requestStatus === "pending" && (
          <span className="text-xs font-bold px-2 py-1 rounded-full bg-yellow-500 text-white shadow-sm ml-2 animate-pulse">
            Pending
          </span>
        )}
      </div>

      {/* Level Badge */}
      <div className="mb-3">
        <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-lg ${
          scheme.level === 'Central' 
            ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300'
            : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
        }`}>
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
          </svg>
          {scheme.level || "State"} Level
        </span>
      </div>

      {/* Description */}
      <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-3 leading-relaxed">
        {scheme.description}
      </p>

      {/* Amount */}
      <div className="mb-4">
        <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
          {formatCurrency(scheme.amount)}
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Scheme Amount</p>
      </div>

      {/* Categories */}
      {scheme.category && scheme.category.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-4">
          {(Array.isArray(scheme.category) ? scheme.category.slice(0, 2) : [scheme.category]).map((cat, idx) => (
            <span key={idx} className="text-xs px-2 py-1 rounded-full bg-white/60 dark:bg-gray-800/60 text-gray-700 dark:text-gray-300 font-medium backdrop-blur-sm">
              {cat}
            </span>
          ))}
          {Array.isArray(scheme.category) && scheme.category.length > 2 && (
            <span className="text-xs px-2 py-1 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 font-medium">
              +{scheme.category.length - 2}
            </span>
          )}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-2 mt-auto pt-3">
        <button
          onClick={() => onViewDetails(scheme)}
          className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-3 py-2 rounded-xl text-sm font-semibold transition-all shadow-md hover:shadow-lg"
        >
          View Details
        </button>
        <button
          onClick={() => onRequestUpdate(scheme)}
          className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-3 py-2 rounded-xl text-sm font-semibold transition-all shadow-md hover:shadow-lg"
        >
          Request Update
        </button>
        <button
          onClick={() => onEditAmount(scheme)}
          className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white px-3 py-2 rounded-xl text-sm font-semibold transition-all shadow-md hover:shadow-lg"
          title="Edit Amount"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        </button>
      </div>
    </div>
  );
}

// Loading Skeleton
function SchemesSkeleton() {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <div className="w-48 h-8 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded-lg animate-pulse" />
          <div className="w-64 h-4 bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 rounded animate-pulse mt-2" />
        </div>
        <div className="w-32 h-10 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded-xl animate-pulse" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 rounded-2xl p-5 animate-pulse">
            <div className="w-3/4 h-6 bg-gradient-to-r from-gray-300 to-gray-400 dark:from-gray-600 dark:to-gray-500 rounded-lg mb-3" />
            <div className="w-24 h-4 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded mb-3" />
            <div className="w-full h-16 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded mb-3" />
            <div className="w-32 h-8 bg-gradient-to-r from-gray-300 to-gray-400 dark:from-gray-600 dark:to-gray-500 rounded mb-3" />
            <div className="flex gap-2">
              <div className="flex-1 h-9 bg-gradient-to-r from-gray-300 to-gray-400 dark:from-gray-600 dark:to-gray-500 rounded-xl" />
              <div className="flex-1 h-9 bg-gradient-to-r from-gray-300 to-gray-400 dark:from-gray-600 dark:to-gray-500 rounded-xl" />
              <div className="w-9 h-9 bg-gradient-to-r from-gray-300 to-gray-400 dark:from-gray-600 dark:to-gray-500 rounded-xl" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function OfficialSchemes() {
  const [schemes, setSchemes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalSchemes, setTotalSchemes] = useState(0);
  const [selectedScheme, setSelectedScheme] = useState(null);
  const [viewingScheme, setViewingScheme] = useState(null);
  const [amount, setAmount] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [requesting, setRequesting] = useState(false);
  const [newScheme, setNewScheme] = useState({
    title: "",
    description: "",
    amount: "",
  });

  const fetchSchemes = async (pageNum = 1) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.get(`/schemes/official?page=${pageNum}&limit=9`);
      
      if (response.data && response.data.data) {
        setSchemes(response.data.data);
        setPage(response.data.pagination.page);
        setTotalPages(response.data.pagination.totalPages);
        setTotalSchemes(response.data.pagination.total);
      } else if (Array.isArray(response.data)) {
        setSchemes(response.data);
        setTotalPages(1);
        setTotalSchemes(response.data.length);
      }
      
    } catch (error) {
      console.error("Error fetching schemes:", error);
      setError(error.response?.data?.message || "Failed to load schemes");
      toast.error("Failed to load schemes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchemes(page);
  }, [page]);

  const submitRequest = async () => {
    if (!amount || amount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }
    
    try {
      setRequesting(true);
      await api.post("/scheme-requests", {
        schemeId: selectedScheme._id,
        requestedChanges: {
          customAmount: Number(amount),
        },
      });
      
      toast.success("Request sent successfully!");
      setSelectedScheme(null);
      setAmount("");
      fetchSchemes(page);
    } catch (error) {
      console.error("Error submitting request:", error);
      toast.error(error.response?.data?.message || "Failed to send request");
    } finally {
      setRequesting(false);
    }
  };

  const createScheme = async () => {
    if (!newScheme.title.trim() || !newScheme.description.trim() || !newScheme.amount) {
      toast.error("Please fill all fields");
      return;
    }
    
    try {
      setCreating(true);
      await api.post("/schemes/village", {
        title: newScheme.title.trim(),
        description: newScheme.description.trim(),
        amount: Number(newScheme.amount),
      });
      
      toast.success("Scheme created successfully!");
      setShowCreate(false);
      setNewScheme({ title: "", description: "", amount: "" });
      setPage(1);
      fetchSchemes(1);
    } catch (error) {
      console.error("Error creating scheme:", error);
      toast.error(error.response?.data?.message || "Failed to create scheme");
    } finally {
      setCreating(false);
    }
  };

  const updateScheme = async (scheme) => {
    const newAmount = prompt("Enter new amount", scheme.amount);
    if (!newAmount || newAmount <= 0) return;
    
    try {
      await api.put(`/schemes/village/${scheme._id}`, {
        customAmount: Number(newAmount),
      });
      
      toast.success("Scheme updated successfully!");
      fetchSchemes(page);
    } catch (error) {
      console.error("Error updating scheme:", error);
      toast.error(error.response?.data?.message || "Failed to update scheme");
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  if (loading && page === 1) {
    return <SchemesSkeleton />;
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Government Schemes
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
            Manage and track welfare schemes for your village • Total: {totalSchemes} schemes
          </p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white text-sm font-semibold rounded-xl transition-all shadow-lg hover:shadow-xl"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <line x1="12" y1="5" x2="12" y2="19"/>
            <line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Add Custom Scheme
        </button>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 border border-red-200 dark:border-red-800 rounded-2xl p-4 mb-6">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
              <svg className="w-5 h-5 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-red-800 dark:text-red-200">Error Loading Schemes</p>
              <p className="text-xs text-red-600 dark:text-red-300 mt-1">{error}</p>
              <button 
                onClick={() => fetchSchemes(1)}
                className="mt-2 text-xs font-semibold text-red-700 dark:text-red-300 hover:underline"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Schemes Grid */}
      {!error && schemes.length === 0 && !loading ? (
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900/50 dark:to-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-2xl flex flex-col items-center justify-center py-16 gap-3 text-center">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 flex items-center justify-center">
            <svg className="w-8 h-8 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
            </svg>
          </div>
          <p className="text-lg font-semibold text-gray-900 dark:text-white">
            No schemes available
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400 max-w-md">
            No government schemes are currently available. You can create custom schemes for your village.
          </p>
          <button 
            onClick={() => setShowCreate(true)}
            className="mt-4 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white text-sm font-semibold rounded-xl transition-all shadow-lg"
          >
            Create Custom Scheme
          </button>
        </div>
      ) : (
        !error && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {schemes.map((scheme) => (
                <SchemeCard
                  key={scheme._id}
                  scheme={scheme}
                  onViewDetails={setViewingScheme}
                  onRequestUpdate={setSelectedScheme}
                  onEditAmount={updateScheme}
                />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <>
                <div className="flex justify-center items-center gap-2 mt-8">
                  <button
                    onClick={() => handlePageChange(page - 1)}
                    disabled={page === 1}
                    className="px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  
                  <div className="flex gap-2">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (page <= 3) {
                        pageNum = i + 1;
                      } else if (page >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = page - 2 + i;
                      }
                      
                      return (
                        <button
                          key={pageNum}
                          onClick={() => handlePageChange(pageNum)}
                          className={`min-w-[40px] h-10 px-3 rounded-xl text-sm font-semibold transition-all ${
                            page === pageNum
                              ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                              : 'border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>
                  
                  <button
                    onClick={() => handlePageChange(page + 1)}
                    disabled={page === totalPages}
                    className="px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
                
                <div className="text-center mt-4">
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Page {page} of {totalPages} • Total {totalSchemes} schemes
                  </p>
                </div>
              </>
            )}
          </>
        )
      )}

      {/* Modals */}
      <SchemeDetailsModal 
        isOpen={!!viewingScheme} 
        onClose={() => setViewingScheme(null)} 
        scheme={viewingScheme} 
      />

      {/* Request Update Modal */}
      <Modal 
        isOpen={!!selectedScheme} 
        onClose={() => {
          setSelectedScheme(null);
          setAmount("");
        }} 
        title={`Request Update - ${selectedScheme?.title || ''}`}
        size="sm"
      >
        <div className="space-y-5">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl p-4">
            <p className="text-xs text-blue-600 dark:text-blue-400 mb-1 font-semibold">Current Amount</p>
            <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">
              {formatCurrency(selectedScheme?.amount || 0)}
            </p>
          </div>
          
          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Requested Amount *
            </label>
            <input
              type="number"
              placeholder="Enter new amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              autoFocus
            />
          </div>
          
          <div className="flex gap-3 pt-2">
            <button 
              onClick={() => {
                setSelectedScheme(null);
                setAmount("");
              }} 
              className="flex-1 px-4 py-2.5 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-sm font-semibold rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
            >
              Cancel
            </button>
            <button 
              onClick={submitRequest} 
              disabled={requesting || !amount}
              className="flex-1 px-4 py-2.5 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white text-sm font-semibold rounded-xl transition-all disabled:opacity-60 flex items-center justify-center gap-2 shadow-lg"
            >
              {requesting && (
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
              )}
              {requesting ? "Sending..." : "Submit Request"}
            </button>
          </div>
        </div>
      </Modal>

      {/* Create Scheme Modal */}
      <Modal 
        isOpen={showCreate} 
        onClose={() => {
          setShowCreate(false);
          setNewScheme({ title: "", description: "", amount: "" });
        }} 
        title="Create Custom Scheme"
        size="md"
      >
        <div className="space-y-5">
          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Scheme Title *
            </label>
            <input
              placeholder="e.g., Village Development Fund"
              value={newScheme.title}
              onChange={(e) => setNewScheme({ ...newScheme, title: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>
          
          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Description *
            </label>
            <textarea
              placeholder="Describe the scheme details, eligibility criteria, benefits..."
              rows={4}
              value={newScheme.description}
              onChange={(e) => setNewScheme({ ...newScheme, description: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
            />
          </div>
          
          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Amount (₹) *
            </label>
            <input
              type="number"
              placeholder="Enter scheme amount"
              value={newScheme.amount}
              onChange={(e) => setNewScheme({ ...newScheme, amount: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>
          
          <div className="flex gap-3 pt-2">
            <button 
              onClick={() => {
                setShowCreate(false);
                setNewScheme({ title: "", description: "", amount: "" });
              }} 
              className="flex-1 px-4 py-2.5 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-sm font-semibold rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
            >
              Cancel
            </button>
            <button 
              onClick={createScheme} 
              disabled={creating || !newScheme.title || !newScheme.description || !newScheme.amount}
              className="flex-1 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white text-sm font-semibold rounded-xl transition-all disabled:opacity-60 flex items-center justify-center gap-2 shadow-lg"
            >
              {creating && (
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
              )}
              {creating ? "Creating..." : "Create Scheme"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}