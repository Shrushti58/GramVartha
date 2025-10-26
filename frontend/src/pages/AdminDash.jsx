import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

export default function AdminDashboard() {
  const [officials, setOfficials] = useState([]);
  const [citizens, setCitizens] = useState([]);
  const [pendingOfficials, setPendingOfficials] = useState([]);
  const [stats, setStats] = useState({
    totalCitizens: 0,
    totalOfficials: 0,
    pendingOfficials: 0
  });
  const [view, setView] = useState("pending"); // "pending", "allOfficials", "allCitizens"
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState({ id: null, type: "", name: "" });
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      try {
        // Fetch all data in parallel
        const [citizensRes, officialsRes, pendingRes] = await Promise.all([
          axios.get("http://localhost:3000/admin/all-citizens"),
          axios.get("http://localhost:3000/admin/all-officials"),
          axios.get("http://localhost:3000/admin/pending-officials")
        ]);

        setCitizens(citizensRes.data);
        setOfficials(officialsRes.data);
        setPendingOfficials(pendingRes.data);

        // Update stats
        setStats({
          totalCitizens: citizensRes.data.length,
          totalOfficials: officialsRes.data.length,
          pendingOfficials: pendingRes.data.length
        });

        // Set initial view data
        if (view === "pending") {
          setOfficials(pendingRes.data);
        } else if (view === "allOfficials") {
          setOfficials(officialsRes.data);
        } else if (view === "allCitizens") {
          setCitizens(citizensRes.data);
        }
      } catch (err) {
        setMessage("Failed to load data.");
        toast.error("Failed to load data.");
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
          const res = await axios.get("http://localhost:3000/admin/all-officials");
          setOfficials(res.data);
        } catch (err) {
          toast.error("Failed to load officials.");
        }
      };
      fetchOfficials();
    } else if (view === "allCitizens") {
      const fetchCitizens = async () => {
        try {
          const res = await axios.get("http://localhost:3000/admin/all-citizens");
          setCitizens(res.data);
        } catch (err) {
          toast.error("Failed to load citizens.");
        }
      };
      fetchCitizens();
    }
  }, [view, pendingOfficials]);

  const handleApprove = async (id) => {
    try {
      const res = await axios.put(`http://localhost:3000/admin/approve/${id}`);
      setMessage(res.data.message);
      setOfficials(officials.filter((o) => o._id !== id));
      setPendingOfficials(pendingOfficials.filter((o) => o._id !== id));
      setStats(prev => ({
        ...prev,
        pendingOfficials: prev.pendingOfficials - 1,
        totalOfficials: prev.totalOfficials + 1
      }));
      toast.success("Official approved successfully!");
    } catch {
      setMessage("Error approving official.");
      toast.error("Error approving official.");
    }
  };

  const handleReject = async (id) => {
    try {
      const res = await axios.put(`http://localhost:3000/admin/reject/${id}`);
      setMessage(res.data.message);
      setOfficials(officials.filter((o) => o._id !== id));
      setPendingOfficials(pendingOfficials.filter((o) => o._id !== id));
      setStats(prev => ({
        ...prev,
        pendingOfficials: prev.pendingOfficials - 1
      }));
      toast.success("Official rejected successfully!");
    } catch {
      setMessage("Error rejecting official.");
      toast.error("Error rejecting official.");
    }
  };

  const openDeleteModal = (id, type, name) => {
    setDeleteTarget({ id, type, name });
    setShowModal(true);
  };

  const handleDelete = async () => {
    try {
      if (deleteTarget.type === "official") {
        const res = await axios.delete(`http://localhost:3000/admin/official/${deleteTarget.id}`);
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
      } else if (deleteTarget.type === "citizen") {
        const res = await axios.delete(`http://localhost:3000/admin/citizen/${deleteTarget.id}`);
        setCitizens(citizens.filter((c) => c._id !== deleteTarget.id));
        setMessage(res.data.message);
        setStats(prev => ({
          ...prev,
          totalCitizens: prev.totalCitizens - 1
        }));
        toast.success("Citizen deleted successfully!");
      }
    } catch {
      setMessage("Error deleting user.");
      toast.error("Error deleting user.");
    } finally {
      setShowModal(false);
      setDeleteTarget({ id: null, type: "", name: "" });
    }
  };

  const handleLogout = () => {
    navigate("/admin/login");
    toast.info("Logged out successfully");
  };

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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Total Citizens Card */}
          <div className="bg-surface rounded-2xl shadow-earth-lg border border-primary-200 p-6 hover:shadow-earth-md transition-all duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-primary-600 text-sm font-medium">Total Citizens</p>
                <p className="text-3xl font-bold text-primary-900 mt-2">{stats.totalCitizens}</p>
              </div>
              <div className="w-12 h-12 bg-accent-teal/20 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-accent-teal" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm text-primary-500">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
              Registered citizens in the system
            </div>
          </div>

          {/* Total Officials Card */}
          <div className="bg-surface rounded-2xl shadow-earth-lg border border-primary-200 p-6 hover:shadow-earth-md transition-all duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-primary-600 text-sm font-medium">Total Officials</p>
                <p className="text-3xl font-bold text-primary-900 mt-2">{stats.totalOfficials}</p>
              </div>
              <div className="w-12 h-12 bg-primary-600/20 rounded-full flex items-center justify-center">
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
          <div className="bg-surface rounded-2xl shadow-earth-lg border border-primary-200 p-6 hover:shadow-earth-md transition-all duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-primary-600 text-sm font-medium">Pending Officials</p>
                <p className="text-3xl font-bold text-primary-900 mt-2">{stats.pendingOfficials}</p>
              </div>
              <div className="w-12 h-12 bg-orange-500/20 rounded-full flex items-center justify-center">
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
        <button
          className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 shadow-soft-earth ${
            view === "allCitizens" 
              ? "bg-button-primary text-primary-50 shadow-earth-md" 
              : "bg-surface text-primary-700 hover:bg-primary-100 border border-primary-200"
          }`}
          onClick={() => setView("allCitizens")}
        >
          All Citizens ({stats.totalCitizens})
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

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-button-primary"></div>
          </div>
        ) : view === "allCitizens" ? (
          <div className="bg-surface rounded-2xl shadow-earth-lg border border-primary-200 overflow-hidden">
            <table className="w-full">
              <thead className="bg-button-primary text-primary-50">
                <tr>
                  <th className="p-4 text-left font-semibold font-serif">Name</th>
                  <th className="p-4 text-left font-semibold font-serif">Email</th>
                  <th className="p-4 text-left font-semibold font-serif">Status</th>
                  <th className="p-4 text-center font-semibold font-serif">Actions</th>
                </tr>
              </thead>
              <tbody>
                {citizens.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="p-6 text-center text-primary-500">
                      No citizens found.
                    </td>
                  </tr>
                ) : (
                  citizens.map((citizen, index) => (
                    <tr key={citizen._id} className={`${index % 2 === 0 ? 'bg-primary-50' : 'bg-surface'} hover:bg-primary-100 transition-colors`}>
                      <td className="p-4 text-primary-900 font-medium">{citizen.name}</td>
                      <td className="p-4 text-primary-700">{citizen.email}</td>
                      <td className="p-4">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Active
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        <button
                          onClick={() => openDeleteModal(citizen._id, "citizen", citizen.name)}
                          className="bg-red-500 text-primary-50 px-4 py-2 rounded-lg hover:bg-red-600 transition-colors duration-200 font-semibold shadow-soft-earth"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        ) : (
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
                      No officials found.
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
        )}

        {/* Delete Confirmation Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fade-in">
            <div className="bg-surface p-6 rounded-2xl w-96 shadow-earth-lg border border-primary-200">
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