import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function AdminDashboard() {
  const [officials, setOfficials] = useState([]);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch pending officials from backend
    const fetchOfficials = async () => {
      try {
        const res = await axios.get("http://localhost:3000/admin/pending-officials");
        setOfficials(res.data);
      } catch (err) {
        setMessage("Failed to load officials list.");
      }
    };
    fetchOfficials();
  }, []);

  const handleApprove = async (id) => {
    try {
      const res = await axios.post(`http://localhost:3000/admin/approve/${id}`);
      setMessage(res.data.message);
      setOfficials(officials.filter((o) => o._id !== id)); // remove approved
    } catch (err) {
      setMessage("Error approving official.");
    }
  };

  const handleReject = async (id) => {
    try {
      const res = await axios.post(`http://localhost:3000/admin/reject/${id}`);
      setMessage(res.data.message);
      setOfficials(officials.filter((o) => o._id !== id)); // remove rejected
    } catch (err) {
      setMessage("Error rejecting official.");
    }
  };

  const handleLogout = () => {
    navigate("/admin/login");
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Navbar */}
      <header className="bg-green-700 text-white p-4 flex justify-between items-center">
        <h1 className="text-xl font-bold">Admin Dashboard</h1>
        <button
          onClick={handleLogout}
          className="bg-white text-green-700 px-4 py-2 rounded-lg hover:bg-gray-200"
        >
          Logout
        </button>
      </header>

      {/* Content */}
      <main className="flex-1 p-6">
        <h2 className="text-2xl font-semibold mb-6">Pending Officials</h2>

        {message && (
          <p className="mb-4 text-center text-sm text-green-600">{message}</p>
        )}

        {officials.length === 0 ? (
          <p className="text-gray-600">No pending officials.</p>
        ) : (
          <table className="w-full bg-white rounded-xl shadow-md overflow-hidden">
            <thead className="bg-green-700 text-white">
              <tr>
                <th className="p-3 text-left">Name</th>
                <th className="p-3 text-left">Email</th>
                <th className="p-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {officials.map((official) => (
                <tr key={official._id} className="border-b">
                  <td className="p-3">{official.name}</td>
                  <td className="p-3">{official.email}</td>
                  <td className="p-3 text-center">
                    <button
                      onClick={() => handleApprove(official._id)}
                      className="bg-green-600 text-white px-3 py-1 rounded-lg hover:bg-green-700 mr-2"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleReject(official._id)}
                      className="bg-red-600 text-white px-3 py-1 rounded-lg hover:bg-red-700"
                    >
                      Reject
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </main>
    </div>
  );
}
