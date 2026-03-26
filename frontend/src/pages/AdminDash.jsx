import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

// ─── Enhanced Skeleton Components for Admin Dashboard ────────────────────────

function SkeletonStatsCard() {
  return (
    <div className="bg-surface rounded-2xl shadow-earth-lg border border-primary-200 p-6 animate-pulse">
      <div className="flex items-center justify-between">
        <div>
          <div className="w-28 h-4 bg-primary-200 rounded mb-2" />
          <div className="w-16 h-8 bg-primary-300 rounded mt-2" />
        </div>
        <div className="w-12 h-12 bg-primary-200 rounded-full" />
      </div>
      <div className="mt-4 flex items-center">
        <div className="w-4 h-4 bg-primary-200 rounded mr-1" />
        <div className="w-32 h-3 bg-primary-200 rounded" />
      </div>
    </div>
  );
}

function SkeletonStatsGrid() {
  return (
    <div className="px-6 mt-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <SkeletonStatsCard />
        <SkeletonStatsCard />
      </div>
    </div>
  );
}

function SkeletonTabButtons() {
  return (
    <div className="flex justify-center gap-4 mt-6 px-4">
      <div className="w-44 h-12 rounded-xl bg-primary-200 animate-pulse" />
      <div className="w-44 h-12 rounded-xl bg-primary-200 animate-pulse" />
    </div>
  );
}

function SkeletonTableHeader() {
  return (
    <div className="bg-button-primary px-4 py-4 grid grid-cols-4 gap-4">
      <div className="w-20 h-4 bg-primary-50/30 rounded animate-pulse" />
      <div className="w-32 h-4 bg-primary-50/30 rounded animate-pulse" />
      <div className="w-24 h-4 bg-primary-50/30 rounded animate-pulse" />
      <div className="w-24 h-4 bg-primary-50/30 rounded animate-pulse ml-auto" />
    </div>
  );
}

function SkeletonTableRow() {
  return (
    <div className="px-4 py-4 grid grid-cols-4 gap-4 items-center border-b border-primary-100">
      <div className="w-32 h-4 bg-primary-200 rounded animate-pulse" />
      <div className="w-48 h-4 bg-primary-200 rounded animate-pulse" />
      <div className="w-20 h-6 bg-primary-200 rounded-full animate-pulse" />
      <div className="flex justify-center gap-2">
        <div className="w-20 h-8 bg-primary-200 rounded-lg animate-pulse" />
        <div className="w-20 h-8 bg-primary-200 rounded-lg animate-pulse" />
      </div>
    </div>
  );
}

function SkeletonTable() {
  return (
    <div className="bg-surface rounded-2xl shadow-earth-lg border border-primary-200 overflow-hidden">
      <div className="hidden md:block">
        <SkeletonTableHeader />
        <div className="space-y-0">
          {[1, 2, 3, 4, 5].map((i) => (
            <SkeletonTableRow key={i} />
          ))}
        </div>
      </div>
      {/* Mobile skeleton view */}
      <div className="md:hidden">
        {[1, 2, 3].map((i) => (
          <div key={i} className="p-4 border-b border-primary-100 space-y-3 animate-pulse">
            <div className="flex justify-between">
              <div className="w-24 h-4 bg-primary-200 rounded" />
              <div className="w-32 h-4 bg-primary-200 rounded" />
            </div>
            <div className="w-48 h-4 bg-primary-200 rounded" />
            <div className="flex gap-2">
              <div className="w-20 h-8 bg-primary-200 rounded-lg" />
              <div className="w-20 h-8 bg-primary-200 rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SkeletonDashboard() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-primary-100 to-primary-200 flex flex-col font-sans">
      {/* Navbar skeleton */}
      <header className="bg-button-primary p-4 flex justify-between items-center shadow-soft-earth">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-primary-50/30 animate-pulse" />
          <div className="w-40 h-5 rounded bg-primary-50/30 animate-pulse" />
        </div>
        <div className="w-20 h-9 rounded-lg bg-primary-50/30 animate-pulse" />
      </header>

      <SkeletonStatsGrid />
      <SkeletonTabButtons />
      
      <main className="flex-1 p-6">
        <SkeletonTable />
      </main>
    </div>
  );
}

// ─── Mobile Card Component for Better Responsiveness ─────────────────────────

function OfficialCard({ official, view, onApprove, onReject, onDelete }) {
  return (
    <div className="bg-surface border border-primary-200 rounded-xl p-4 mb-3 shadow-soft-earth hover:shadow-earth-md transition-all duration-200">
      <div className="flex justify-between items-start mb-2">
        <div className="flex-1">
          <h3 className="font-semibold text-primary-900 text-lg">{official.name}</h3>
          <p className="text-primary-600 text-sm break-all">{official.email}</p>
        </div>
        {view === "allOfficials" && (
          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ml-2 flex-shrink-0 ${
            official.status === 'approved' 
              ? 'bg-green-100 text-green-800'
              : official.status === 'pending'
              ? 'bg-yellow-100 text-yellow-800'
              : 'bg-red-100 text-red-800'
          }`}>
            {official.status || 'approved'}
          </span>
        )}
      </div>
      <div className="flex gap-2 mt-3">
        {view === "pending" && (
          <>
            <button
              onClick={() => onApprove(official._id)}
              className="flex-1 bg-accent-teal text-primary-50 px-3 py-2 rounded-lg hover:bg-accent-teal-dark transition-colors duration-200 font-semibold text-sm shadow-soft-earth"
            >
              Approve
            </button>
            <button
              onClick={() => onReject(official._id)}
              className="flex-1 bg-orange-500 text-primary-50 px-3 py-2 rounded-lg hover:bg-orange-600 transition-colors duration-200 font-semibold text-sm shadow-soft-earth"
            >
              Reject
            </button>
          </>
        )}
        <button
          onClick={() => onDelete(official._id, "official", official.name)}
          className={`${view === "pending" ? "flex-1" : "w-full"} bg-red-500 text-primary-50 px-3 py-2 rounded-lg hover:bg-red-600 transition-colors duration-200 font-semibold text-sm shadow-soft-earth`}
        >
          Delete
        </button>
      </div>
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function AdminDashboard() {
  const [officials, setOfficials] = useState([]);
  const [citizens, setCitizens] = useState([]);
  const [pendingOfficials, setPendingOfficials] = useState([]);
  const [stats, setStats] = useState({
    totalCitizens: 0,
    totalOfficials: 0,
    pendingOfficials: 0
  });
  const [view, setView] = useState("pending"); // "pending", "allOfficials"
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState({ id: null, type: "", name: "" });
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      try {
        // Fetch officials data - this is for village admins
        const pendingRes = await axios.get("http://localhost:3000/officials/pending", { withCredentials: true });
        const allOfficialsRes = await axios.get("http://localhost:3000/officials/all", { withCredentials: true });

        setPendingOfficials(pendingRes.data);
        setOfficials(allOfficialsRes.data);

        // Update stats
        setStats({
          totalCitizens: 0,
          totalOfficials: allOfficialsRes.data.length,
          pendingOfficials: pendingRes.data.length
        });

        // Set initial view data
        if (view === "pending") {
          setOfficials(pendingRes.data);
        } else if (view === "allOfficials") {
          setOfficials(allOfficialsRes.data);
        }
      } catch (err) {
        setMessage("Failed to load data. This page is only for Village Admins.");
        toast.error("Failed to load data.");
        // Redirect to login if unauthorized
        if (err.response?.status === 401) {
          navigate("/");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, []);

  useEffect(() => {
    // Update view when switching tabs
    if (view === "pending") {
      setOfficials(pendingOfficials);
    } else if (view === "allOfficials") {
      const fetchOfficials = async () => {
        try {
          const res = await axios.get("http://localhost:3000/officials/all", { withCredentials: true });
          setOfficials(res.data);
          setStats(prev => ({
            ...prev,
            totalOfficials: res.data.length
          }));
        } catch (err) {
          toast.error("Failed to load officials.");
        }
      };
      fetchOfficials();
    }
  }, [view, pendingOfficials]);

  const handleApprove = async (id) => {
    try {
      const res = await axios.put(`http://localhost:3000/officials/approve/${id}`, {}, { withCredentials: true });
      setMessage(res.data.message);
      setOfficials(officials.filter((o) => o._id !== id));
      setPendingOfficials(pendingOfficials.filter((o) => o._id !== id));
      setStats(prev => ({
        ...prev,
        pendingOfficials: prev.pendingOfficials - 1,
        totalOfficials: prev.totalOfficials + 1
      }));
      toast.success("Official approved successfully!");
      
      // Auto-clear message after 3 seconds
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      console.error(err);
      setMessage("Error approving official.");
      toast.error(err.response?.data?.message || "Error approving official.");
      setTimeout(() => setMessage(""), 3000);
    }
  };

  const handleReject = async (id) => {
    try {
      const res = await axios.put(`http://localhost:3000/officials/reject/${id}`, {}, { withCredentials: true });
      setMessage(res.data.message);
      setOfficials(officials.filter((o) => o._id !== id));
      setPendingOfficials(pendingOfficials.filter((o) => o._id !== id));
      setStats(prev => ({
        ...prev,
        pendingOfficials: prev.pendingOfficials - 1
      }));
      toast.success("Official rejected successfully!");
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      console.error(err);
      setMessage("Error rejecting official.");
      toast.error(err.response?.data?.message || "Error rejecting official.");
      setTimeout(() => setMessage(""), 3000);
    }
  };

  const openDeleteModal = (id, type, name) => {
    setDeleteTarget({ id, type, name });
    setShowModal(true);
  };

  const handleDelete = async () => {
    try {
      if (deleteTarget.type === "official") {
        const res = await axios.delete(`http://localhost:3000/officials/delete/${deleteTarget.id}`, { withCredentials: true });
        setOfficials(officials.filter((o) => o._id !== deleteTarget.id));
        setPendingOfficials(pendingOfficials.filter((o) => o._id !== deleteTarget.id));
        setMessage(res.data.message);
        setStats(prev => ({
          ...prev,
          totalOfficials: prev.totalOfficials - 1,
          pendingOfficials: pendingOfficials.some(o => o._id === deleteTarget.id) 
            ? prev.pendingOfficials - 1 
            : prev.pendingOfficials
        }));
        toast.success("Official deleted successfully!");
        setTimeout(() => setMessage(""), 3000);
      }
    } catch (err) {
      console.error(err);
      setMessage("Error deleting user.");
      toast.error(err.response?.data?.message || "Error deleting user.");
      setTimeout(() => setMessage(""), 3000);
    } finally {
      setShowModal(false);
      setDeleteTarget({ id: null, type: "", name: "" });
    }
  };

  const handleLogout = async () => {
    try {
      await axios.post(
        "http://localhost:3000/admin/logout",
        {},
        { withCredentials: true }
      );
      toast.info("Logged out successfully");
      navigate("/");
    } catch (err) {
      console.error(err);
      toast.error("Error logging out");
    }
  };

  // Show skeleton while loading
  if (loading) return <SkeletonDashboard />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-primary-100 to-primary-200 flex flex-col font-sans">
      {/* Navbar */}
      <header className="bg-button-primary text-primary-50 p-4 flex justify-between items-center shadow-soft-earth">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-primary-50/20 rounded-full flex items-center justify-center">
            <svg className="w-6 h-6 text-primary-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <h1 className="text-xl font-bold font-serif">Admin Dashboard</h1>
        </div>
        <button
          onClick={handleLogout}
          className="bg-primary-50 text-primary-900 px-4 py-2 rounded-lg hover:bg-primary-100 transition-colors duration-200 font-semibold shadow-soft-earth"
        >
          Logout
        </button>
      </header>

      {/* Stats Cards */}
      <div className="px-6 mt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Total Officials Card */}
          <div className="bg-surface rounded-2xl shadow-earth-lg border border-primary-200 p-6 hover:shadow-earth-md transition-all duration-200 group">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-primary-600 text-sm font-medium">Total Officials</p>
                <p className="text-3xl font-bold text-primary-900 mt-2">{stats.totalOfficials}</p>
              </div>
              <div className="w-12 h-12 bg-primary-600/20 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm text-primary-500">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
              Approved government officials
            </div>
          </div>

          {/* Pending Officials Card */}
          <div className="bg-surface rounded-2xl shadow-earth-lg border border-primary-200 p-6 hover:shadow-earth-md transition-all duration-200 group">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-primary-600 text-sm font-medium">Pending Officials</p>
                <p className="text-3xl font-bold text-primary-900 mt-2">{stats.pendingOfficials}</p>
              </div>
              <div className="w-12 h-12 bg-orange-500/20 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                <svg className="w-6 h-6 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm text-primary-500">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Awaiting approval
            </div>
          </div>
        </div>
      </div>

      {/* View Switcher */}
      <div className="flex justify-center gap-4 mt-6 px-4">
        <button
          className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 shadow-soft-earth ${
            view === "pending" 
              ? "bg-button-primary text-primary-50 shadow-earth-md" 
              : "bg-surface text-primary-700 hover:bg-primary-100 border border-primary-200"
          }`}
          onClick={() => setView("pending")}
        >
          Pending Officials ({stats.pendingOfficials})
        </button>
        <button
          className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 shadow-soft-earth ${
            view === "allOfficials" 
              ? "bg-button-primary text-primary-50 shadow-earth-md" 
              : "bg-surface text-primary-700 hover:bg-primary-100 border border-primary-200"
          }`}
          onClick={() => setView("allOfficials")}
        >
          All Officials ({stats.totalOfficials})
        </button>
      </div>

      {/* Content */}
      <main className="flex-1 p-6">
        {message && (
          <div className={`mb-6 p-4 rounded-xl text-center font-medium shadow-soft-earth animate-slide-up ${
            message.includes("Error") || message.includes("Failed") 
              ? "bg-red-50 border border-red-200 text-red-700" 
              : "bg-green-50 border border-green-200 text-green-700"
          }`}>
            {message}
          </div>
        )}

        {/* Desktop Table View */}
        <div className="hidden md:block">
          <div className="bg-surface rounded-2xl shadow-earth-lg border border-primary-200 overflow-hidden">
            <table className="w-full">
              <thead className="bg-button-primary text-primary-50">
                <tr>
                  <th className="p-4 text-left font-semibold font-serif">Name</th>
                  <th className="p-4 text-left font-semibold font-serif">Email</th>
                  {view === "allOfficials" && <th className="p-4 text-left font-semibold font-serif">Status</th>}
                  <th className="p-4 text-center font-semibold font-serif">Actions</th>
                </tr>
              </thead>
              <tbody>
                {officials.length === 0 ? (
                  <tr>
                    <td colSpan={view === "pending" ? "3" : "4"} className="p-6 text-center text-primary-500">
                      <div className="flex flex-col items-center gap-2">
                        <svg className="w-12 h-12 text-primary-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                        </svg>
                        <p className="text-sm font-medium">No officials found</p>
                        <p className="text-xs">There are no {view === "pending" ? "pending" : "approved"} officials at the moment</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  officials.map((official, index) => (
                    <tr key={official._id} className={`${index % 2 === 0 ? 'bg-primary-50' : 'bg-surface'} hover:bg-primary-100 transition-colors`}>
                      <td className="p-4 text-primary-900 font-medium">{official.name}</td>
                      <td className="p-4 text-primary-700">{official.email}</td>
                      {view === "allOfficials" && (
                        <td className="p-4">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                            official.status === 'approved' 
                              ? 'bg-green-100 text-green-800'
                              : official.status === 'pending'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {official.status || 'approved'}
                          </span>
                        </td>
                      )}
                      <td className="p-4 text-center">
                        <div className="flex justify-center items-center space-x-2">
                          {view === "pending" && (
                            <>
                              <button
                                onClick={() => handleApprove(official._id)}
                                className="bg-accent-teal text-primary-50 px-4 py-2 rounded-lg hover:bg-accent-teal-dark transition-colors duration-200 font-semibold shadow-soft-earth"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => handleReject(official._id)}
                                className="bg-orange-500 text-primary-50 px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors duration-200 font-semibold shadow-soft-earth"
                              >
                                Reject
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => openDeleteModal(official._id, "official", official.name)}
                            className="bg-red-500 text-primary-50 px-4 py-2 rounded-lg hover:bg-red-600 transition-colors duration-200 font-semibold shadow-soft-earth"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden">
          {officials.length === 0 ? (
            <div className="bg-surface rounded-2xl shadow-earth-lg border border-primary-200 p-8 text-center">
              <svg className="w-12 h-12 text-primary-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
              <p className="text-primary-500 font-medium">No officials found</p>
              <p className="text-primary-400 text-sm mt-1">There are no {view === "pending" ? "pending" : "approved"} officials at the moment</p>
            </div>
          ) : (
            officials.map((official) => (
              <OfficialCard
                key={official._id}
                official={official}
                view={view}
                onApprove={handleApprove}
                onReject={handleReject}
                onDelete={openDeleteModal}
              />
            ))
          )}
        </div>

        {/* Delete Confirmation Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fade-in p-4">
            <div className="bg-surface p-6 rounded-2xl w-full max-w-md shadow-earth-lg border border-primary-200">
              <div className="text-center mb-4">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </div>
                <h2 className="text-xl font-bold text-primary-900 font-serif">Confirm Delete</h2>
              </div>
              <p className="text-primary-700 text-center mb-6">
                Are you sure you want to delete <span className="font-semibold text-primary-900">{deleteTarget.name}</span>? 
                This action cannot be undone.
              </p>
              <div className="flex justify-center gap-3">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-6 py-2 rounded-lg bg-primary-200 text-primary-700 hover:bg-primary-300 transition-colors duration-200 font-semibold shadow-soft-earth"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  className="px-6 py-2 rounded-lg bg-red-500 text-primary-50 hover:bg-red-600 transition-colors duration-200 font-semibold shadow-soft-earth"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}