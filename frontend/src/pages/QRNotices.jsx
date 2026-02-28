import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import * as api from '../services/api';

export default function QRNotices() {
  const { villageId } = useParams();
  const navigate = useNavigate();
  const [notices, setNotices] = useState([]);
  const [village, setVillage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const CATEGORIES = [
    { id: 'all', name: 'All', icon: '📋' },
    { id: 'development', name: 'Development', icon: '🏗️' },
    { id: 'health', name: 'Health', icon: '❤️' },
    { id: 'education', name: 'Education', icon: '🎓' },
    { id: 'agriculture', name: 'Agriculture', icon: '🚜' },
    { id: 'employment', name: 'Employment', icon: '💼' },
    { id: 'social_welfare', name: 'Social Welfare', icon: '👥' },
    { id: 'tax_billing', name: 'Tax & Billing', icon: '💰' },
    { id: 'election', name: 'Election', icon: '🗳️' },
    { id: 'general', name: 'General', icon: '📄' },
  ];

  useEffect(() => {
    fetchNotices();
  }, [villageId, selectedCategory, page]);

  const fetchNotices = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const res = await api.getNoticesByVillage(villageId, { 
        page, 
        limit: 10, 
        category: selectedCategory 
      });
      
      setNotices(res.data.notices);
      setVillage(res.data.village);
      setTotalPages(res.data.totalPages);
    } catch (err) {
      console.error('Error fetching notices:', err);
      const errorMsg = err.response?.data?.message || err.message || 'Failed to fetch notices';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleScanAnother = () => {
    localStorage.removeItem('scannedVillage');
    navigate('/qr-scanner');
  };

  const handleCategoryChange = (categoryId) => {
    setSelectedCategory(categoryId);
    setPage(1);
  };

  if (loading && !village) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading village {villageId}...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <div className="text-4xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-red-600 mb-4">Unable to Load Notices</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={handleScanAnother}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition"
          >
            Scan Another QR Code
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-6 shadow-lg">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-4xl font-bold mb-2">
                {village?.name || 'Village'} Notices
              </h1>
              <p className="text-blue-100">
                {village?.district}, {village?.state} {village?.pincode}
              </p>
            </div>
            <button
              onClick={handleScanAnother}
              className="bg-white text-blue-600 hover:bg-blue-50 font-semibold py-2 px-4 rounded-lg transition"
            >
              Scan Another QR
            </button>
          </div>

          {/* Scanned Info */}
          <div className="bg-blue-500 bg-opacity-30 border border-blue-300 rounded-lg p-3 text-sm">
            ✓ Village scanned and saved to your device. You won't need to scan again!
          </div>
        </div>
      </div>

      {/* Category Filter */}
      <div className="bg-white shadow border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => handleCategoryChange(cat.id)}
                className={`whitespace-nowrap px-4 py-2 rounded-full font-medium transition ${
                  selectedCategory === cat.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <span className="mr-1">{cat.icon}</span>
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading notices...</p>
          </div>
        ) : notices.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <p className="text-gray-500 text-lg">No notices found for this category</p>
          </div>
        ) : (
          <>
            {/* Notices Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {notices.map((notice) => (
                <div
                  key={notice._id}
                  onClick={() => navigate(`/notice/${notice._id}`)}
                  className="bg-white rounded-lg shadow hover:shadow-lg transition cursor-pointer overflow-hidden"
                >
                  {/* Category Badge */}
                  <div className="bg-blue-100 px-4 py-2">
                    <span className="inline-block bg-blue-600 text-white text-xs font-semibold px-3 py-1 rounded-full">
                      {notice.category?.toUpperCase()}
                    </span>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <h3 className="text-lg font-bold text-gray-800 mb-2 line-clamp-2">
                      {notice.title}
                    </h3>
                    
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {notice.description}
                    </p>

                    {/* Priority Badge */}
                    <div className="flex items-center gap-2 mb-4">
                      <span
                        className={`text-xs font-semibold px-2 py-1 rounded ${
                          notice.priority === 'high'
                            ? 'bg-red-100 text-red-700'
                            : notice.priority === 'medium'
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-green-100 text-green-700'
                        }`}
                      >
                        {notice.priority?.toUpperCase()} PRIORITY
                      </span>
                    </div>

                    {/* Footer */}
                    <div className="border-t pt-4 flex justify-between items-center text-xs text-gray-500">
                      <span>
                        By {notice.createdBy?.name || 'Official'}
                      </span>
                      <span>👁 {notice.views || 0}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-2">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`px-4 py-2 rounded-lg font-medium transition ${
                      page === p
                        ? 'bg-blue-600 text-white'
                        : 'bg-white text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Info Footer */}
      <div className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <h4 className="font-bold text-gray-800 mb-2">📍 Location Based</h4>
              <p className="text-gray-600 text-sm">Notices from your scanned village</p>
            </div>
            <div>
              <h4 className="font-bold text-gray-800 mb-2">🔒 No Login</h4>
              <p className="text-gray-600 text-sm">No registration required to view</p>
            </div>
            <div>
              <h4 className="font-bold text-gray-800 mb-2">💾 Saved Locally</h4>
              <p className="text-gray-600 text-sm">Your scan is saved on this device</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
