import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import * as api from '../services/api';

export default function LocationBasedNotices() {
  const [notices, setNotices] = useState([]);
  const [nearbyVillages, setNearbyVillages] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const [radiusKm, setRadiusKm] = useState(10);
  const [loading, setLoading] = useState(false);
  const [manualMode, setManualMode] = useState(false);
  const [manualLat, setManualLat] = useState('');
  const [manualLon, setManualLon] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    requestUserLocation();
  }, []);

  const requestUserLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation not supported by your browser');
      setManualMode(true);
      return;
    }

    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation({ latitude, longitude });
        fetchNoticesByLocation(latitude, longitude, radiusKm);
      },
      (err) => {
        toast.error('Could not access your location. Using manual entry.');
        setManualMode(true);
        setLoading(false);
      }
    );
  };

  const fetchNoticesByLocation = async (lat, lon, radius) => {
    setLoading(true);
    try {
      const res = await api.getNoticesByLocation(lat, lon, radius);
      setNotices(res.data.notices);
      setNearbyVillages(res.data.nearbyVillages);
    } catch (err) {
      toast.error('Failed to fetch notices');
    } finally {
      setLoading(false);
    }
  };

  const handleManualSearch = (e) => {
    e.preventDefault();
    if (!manualLat || !manualLon) {
      toast.error('Please enter latitude and longitude');
      return;
    }
    setUserLocation({ latitude: parseFloat(manualLat), longitude: parseFloat(manualLon) });
    fetchNoticesByLocation(manualLat, manualLon, radiusKm);
  };

  const handleRadiusChange = () => {
    if (userLocation) {
      fetchNoticesByLocation(userLocation.latitude, userLocation.longitude, radiusKm);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-blue-900 mb-2">Notices Near You</h1>
          <p className="text-blue-600">Discover important notices from your nearby villages</p>
        </div>

        {/* Location Input Section */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          {userLocation && !manualMode ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Latitude</label>
                <input
                  type="text"
                  value={userLocation.latitude.toFixed(4)}
                  disabled
                  className="w-full px-3 py-2 bg-slate-100 border border-slate-300 rounded text-slate-600"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Longitude</label>
                <input
                  type="text"
                  value={userLocation.longitude.toFixed(4)}
                  disabled
                  className="w-full px-3 py-2 bg-slate-100 border border-slate-300 rounded text-slate-600"
                />
              </div>
              <button
                onClick={requestUserLocation}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Refresh Location
              </button>
            </div>
          ) : manualMode ? (
            <form onSubmit={handleManualSearch} className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-800">Enter Your Location</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Latitude</label>
                  <input
                    type="number"
                    value={manualLat}
                    onChange={(e) => setManualLat(e.target.value)}
                    placeholder="e.g., 18.5204"
                    step="0.0001"
                    className="w-full px-3 py-2 border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Longitude</label>
                  <input
                    type="number"
                    value={manualLon}
                    onChange={(e) => setManualLon(e.target.value)}
                    placeholder="e.g., 73.8567"
                    step="0.0001"
                    className="w-full px-3 py-2 border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <button
                type="submit"
                className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Search
              </button>
            </form>
          ) : (
            <div className="text-center py-8">
              <p className="text-slate-600">Getting your location...</p>
            </div>
          )}

          {/* Radius Selector */}
          {userLocation && (
            <div className="mt-6 pt-6 border-t">
              <label className="block text-sm font-medium text-slate-700 mb-3">
                Search Radius: {radiusKm} km
              </label>
              <input
                type="range"
                min="1"
                max="50"
                value={radiusKm}
                onChange={(e) => {
                  setRadiusKm(parseInt(e.target.value));
                  handleRadiusChange();
                }}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-slate-500 mt-2">
                <span>1 km</span>
                <span>50 km</span>
              </div>
            </div>
          )}
        </div>

        {/* Stats */}
        {userLocation && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-slate-600 text-sm font-semibold">Nearby Villages</h3>
              <p className="text-3xl font-bold text-blue-600">{nearbyVillages.length}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-slate-600 text-sm font-semibold">Available Notices</h3>
              <p className="text-3xl font-bold text-green-600">{notices.length}</p>
            </div>
          </div>
        )}

        {/* Nearby Villages */}
        {nearbyVillages.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-slate-800 mb-4">Nearby Villages</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {nearbyVillages.map(village => (
                <div key={village._id} className="bg-white rounded-lg shadow p-4 hover:shadow-lg transition">
                  <h3 className="text-lg font-semibold text-slate-800">{village.name}</h3>
                  <p className="text-slate-600 text-sm mt-1">{village.district}, {village.state}</p>
                  <p className="text-xs text-slate-500 mt-2">
                    📍 {village.coordinates.latitude.toFixed(4)}, {village.coordinates.longitude.toFixed(4)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Notices */}
        <div>
          <h2 className="text-2xl font-bold text-slate-800 mb-4">Notices from Nearby Villages</h2>
          {loading ? (
            <div className="text-center py-12">
              <p className="text-slate-600">Loading notices...</p>
            </div>
          ) : notices.length > 0 ? (
            <div className="space-y-4">
              {notices.map(notice => (
                <div
                  key={notice._id}
                  onClick={() => navigate(`/notice-details/${notice._id}`)}
                  className="bg-white rounded-lg shadow p-6 hover:shadow-lg cursor-pointer transition"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-semibold text-slate-800 flex-1">{notice.title}</h3>
                    <span className={`px-3 py-1 rounded text-xs font-semibold ${
                      notice.priority === 'high' ? 'bg-red-100 text-red-800' :
                      notice.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {notice.priority.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-slate-600 mb-3 line-clamp-2">{notice.description}</p>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-blue-600 font-semibold">📍 {notice.village.name}</span>
                    <span className="text-slate-500">{new Date(notice.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : userLocation ? (
            <div className="bg-white rounded-lg shadow p-12 text-center">
              <p className="text-slate-600 text-lg">No notices found in this area</p>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow p-12 text-center">
              <p className="text-slate-600 text-lg">Please enable location access to see nearby notices</p>
            </div>
          )}
        </div>

        {/* Back Link */}
        <div className="text-center mt-8">
          <button
            onClick={() => navigate('/')}
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            ← Back to Home
          </button>
        </div>
      </div>
    </div>
  );
}
