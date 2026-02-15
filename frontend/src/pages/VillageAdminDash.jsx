import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import * as api from '../services/api';

export default function VillageAdminDashboard() {
  const [adminData, setAdminData] = useState(null);
  const [pendingOfficials, setPendingOfficials] = useState([]);
  const [allOfficials, setAllOfficials] = useState([]);
  const [activeTab, setActiveTab] = useState('pending');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [pendingRes, allRes] = await Promise.all([
        api.getPendingOfficials(),
        api.getAllOfficials()
      ]);
      setPendingOfficials(pendingRes.data);
      setAllOfficials(allRes.data);
    } catch (err) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleApproveOfficial = async (officialId) => {
    try {
      await api.approveOfficial(officialId);
      toast.success('Official approved');
      setPendingOfficials(pendingOfficials.filter(o => o._id !== officialId));
      loadData();
    } catch (err) {
      toast.error('Failed to approve official');
    }
  };

  const handleRejectOfficial = async (officialId) => {
    try {
      await api.rejectOfficial(officialId);
      toast.success('Official rejected');
      setPendingOfficials(pendingOfficials.filter(o => o._id !== officialId));
    } catch (err) {
      toast.error('Failed to reject official');
    }
  };

  const handleDeleteOfficial = async (officialId) => {
    if (window.confirm('Are you sure?')) {
      try {
        await api.deleteOfficial(officialId);
        toast.success('Official deleted');
        setAllOfficials(allOfficials.filter(o => o._id !== officialId));
      } catch (err) {
        toast.error('Failed to delete official');
      }
    }
  };

  const handleLogout = async () => {
    try {
      await api.adminLogout();
      navigate('/');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-slate-800">Village Admin Dashboard</h1>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
          >
            Logout
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-slate-600 text-sm font-semibold">Total Officials</h3>
            <p className="text-3xl font-bold text-slate-900">{allOfficials.length}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-slate-600 text-sm font-semibold">Pending Approvals</h3>
            <p className="text-3xl font-bold text-orange-500">{pendingOfficials.length}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="flex border-b">
            <button
              onClick={() => setActiveTab('pending')}
              className={`px-6 py-4 font-semibold ${activeTab === 'pending' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-slate-600'}`}
            >
              Pending Officials
            </button>
            <button
              onClick={() => setActiveTab('all')}
              className={`px-6 py-4 font-semibold ${activeTab === 'all' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-slate-600'}`}
            >
              All Officials
            </button>
          </div>

          <div className="p-6">
            {loading ? (
              <div className="text-center py-8">
                <p className="text-slate-500">Loading...</p>
              </div>
            ) : activeTab === 'pending' && pendingOfficials.length > 0 ? (
              <div className="space-y-4">
                {pendingOfficials.map(official => (
                  <div key={official._id} className="border rounded-lg p-4 hover:bg-slate-50">
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        {official.profileImage ? (
                          <img
                            src={official.profileImage}
                            alt={`${official.name}'s profile`}
                            className="w-16 h-16 rounded-full object-cover border-2 border-slate-300"
                          />
                        ) : (
                          <div className="w-16 h-16 rounded-full bg-slate-200 flex items-center justify-center border-2 border-slate-300">
                            <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-slate-800">{official.name}</h3>
                        <p className="text-slate-600">{official.email}</p>
                        <p className="text-sm text-slate-500 mt-2">Phone: {official.phone}</p>
                      </div>
                    </div>
                    <div className="flex gap-3 mt-4">
                      <button
                        onClick={() => handleApproveOfficial(official._id)}
                        className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleRejectOfficial(official._id)}
                        className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : activeTab === 'all' && allOfficials.length > 0 ? (
              <div className="space-y-4">
                {allOfficials.map(official => (
                  <div key={official._id} className="border rounded-lg p-4 hover:bg-slate-50">
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        {official.profileImage ? (
                          <img
                            src={official.profileImage}
                            alt={`${official.name}'s profile`}
                            className="w-16 h-16 rounded-full object-cover border-2 border-slate-300"
                          />
                        ) : (
                          <div className="w-16 h-16 rounded-full bg-slate-200 flex items-center justify-center border-2 border-slate-300">
                            <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-slate-800">{official.name}</h3>
                        <p className="text-slate-600">{official.email}</p>
                        <p className="text-sm text-slate-500">Status: <span className={`font-semibold ${official.status === 'approved' ? 'text-green-600' : 'text-orange-600'}`}>{official.status}</span></p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteOfficial(official._id)}
                      className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 mt-4"
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-slate-500">No officials to display</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
