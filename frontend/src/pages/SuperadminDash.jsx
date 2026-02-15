import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import * as api from '../services/api';

export default function SuperadminDashboard() {
  const [adminRole, setAdminRole] = useState(null);
  const [pendingVillages, setPendingVillages] = useState([]);
  const [pendingAdmins, setPendingAdmins] = useState([]);
  const [villages, setVillages] = useState([]);
  const [activeTab, setActiveTab] = useState('villages');
  const [loading, setLoading] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    checkAdminRole();
    loadData();
  }, []);

  const checkAdminRole = async () => {
    try {
      const res = await api.getAdminProfile();
      if (res.data.role !== 'superadmin') {
        navigate('/admin/login');
      }
      setAdminRole(res.data.role);
    } catch (err) {
      console.error('Error checking admin role:', err);
      navigate('/admin/login');
    }
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [villagesRes, adminsRes, allVillagesRes] = await Promise.all([
        api.getPendingVillages(),
        api.getPendingAdmins(),
        api.getAllVillages()
      ]);
      setPendingVillages(villagesRes.data);
      setPendingAdmins(adminsRes.data);
      setVillages(allVillagesRes.data);
    } catch (err) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleApproveVillage = async (villageId) => {
    try {
      await api.approveVillage(villageId);
      toast.success('Village approved');
      setPendingVillages(pendingVillages.filter(v => v._id !== villageId));
      loadData();
    } catch (err) {
      toast.error('Failed to approve village');
    }
  };

  const handleRejectVillage = async (villageId) => {
    try {
      await api.rejectVillage(villageId);
      toast.success('Village rejected');
      setPendingVillages(pendingVillages.filter(v => v._id !== villageId));
    } catch (err) {
      toast.error('Failed to reject village');
    }
  };

  const handleApproveAdmin = async (adminId) => {
    try {
      await api.approveAdmin(adminId);
      toast.success('Admin approved');
      setPendingAdmins(pendingAdmins.filter(a => a._id !== adminId));
    } catch (err) {
      toast.error('Failed to approve admin');
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

  if (adminRole !== 'superadmin') {
    return <div className="p-5">Unauthorized</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-slate-800">Superadmin Dashboard</h1>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
          >
            Logout
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-slate-600 text-sm font-semibold">Total Villages</h3>
            <p className="text-3xl font-bold text-slate-900">{villages.length}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-slate-600 text-sm font-semibold">Pending Villages</h3>
            <p className="text-3xl font-bold text-orange-500">{pendingVillages.length}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-slate-600 text-sm font-semibold">Pending Admins</h3>
            <p className="text-3xl font-bold text-blue-500">{pendingAdmins.length}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="flex border-b">
            <button
              onClick={() => setActiveTab('villages')}
              className={`px-6 py-4 font-semibold ${activeTab === 'villages' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-slate-600'}`}
            >
              Pending Villages
            </button>
            <button
              onClick={() => setActiveTab('admins')}
              className={`px-6 py-4 font-semibold ${activeTab === 'admins' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-slate-600'}`}
            >
              Pending Admins
            </button>
            <button
              onClick={() => setActiveTab('all-villages')}
              className={`px-6 py-4 font-semibold ${activeTab === 'all-villages' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-slate-600'}`}
            >
              All Villages
            </button>
          </div>

          <div className="p-6">
            {loading ? (
              <div className="text-center py-8">
                <p className="text-slate-500">Loading...</p>
              </div>
            ) : activeTab === 'villages' && pendingVillages.length > 0 ? (
              <div className="space-y-4">
                {pendingVillages.map(village => (
                  <div key={village._id} className="border rounded-lg p-4 hover:bg-slate-50">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="text-lg font-semibold text-slate-800">{village.name}</h3>
                        <p className="text-slate-600">{village.district}, {village.state}</p>
                        <p className="text-sm text-slate-500 mt-2">Requested by: {village.requestedBy?.email}</p>
                      </div>
                      {village.documentUrl && (
                        <button
                          onClick={() => setSelectedDocument(village.documentUrl)}
                          className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 transition-colors"
                        >
                          View Document
                        </button>
                      )}
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={() => handleApproveVillage(village._id)}
                        className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleRejectVillage(village._id)}
                        className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : activeTab === 'admins' && pendingAdmins.length > 0 ? (
              <div className="space-y-4">
                {pendingAdmins.map(admin => (
                  <div key={admin._id} className="border rounded-lg p-4 hover:bg-slate-50">
                    <h3 className="text-lg font-semibold text-slate-800">{admin.email}</h3>
                    <p className="text-slate-600">Status: {admin.status}</p>
                    <p className="text-sm text-slate-500 mt-2">Village: {admin.village?.name || 'N/A'}</p>
                    {admin.status === 'pending' && (
                      <button
                        onClick={() => handleApproveAdmin(admin._id)}
                        className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 mt-4"
                      >
                        Approve
                      </button>
                    )}
                  </div>
                ))}
              </div>
            ) : activeTab === 'all-villages' && villages.length > 0 ? (
              <div className="space-y-4">
                {villages.map(village => (
                  <div key={village._id} className="border rounded-lg p-4 hover:bg-slate-50">
                    <h3 className="text-lg font-semibold text-slate-800">{village.name}</h3>
                    <p className="text-slate-600">{village.district}, {village.state}</p>
                    <p className="text-sm text-slate-500">Status: <span className={`font-semibold ${village.status === 'approved' ? 'text-green-600' : 'text-orange-600'}`}>{village.status}</span></p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-slate-500">No items to display</p>
              </div>
            )}
          </div>
        </div>

        {/* Document Preview Modal */}
        {selectedDocument && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-auto">
              <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
                <h2 className="text-xl font-semibold text-slate-800">Document Preview</h2>
                <button
                  onClick={() => setSelectedDocument(null)}
                  className="text-slate-500 hover:text-slate-700 text-2xl"
                >
                  ×
                </button>
              </div>
              <div className="p-6">
                <img
                  src={selectedDocument}
                  alt="Village registration document"
                  className="w-full h-auto rounded-lg border border-slate-200"
                />
              </div>
              <div className="border-t p-4 flex gap-3 justify-end">
                <button
                  onClick={() => setSelectedDocument(null)}
                  className="px-4 py-2 bg-slate-200 text-slate-800 rounded hover:bg-slate-300 transition-colors"
                >
                  Close
                </button>
                <a
                  href={selectedDocument}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                >
                  Open in New Tab
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
