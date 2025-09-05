import React, { useState, useEffect } from "react";
import axios from "axios";

export default function OfficialsDashboard() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState(null);
  const [notices, setNotices] = useState([]);
  const [filters, setFilters] = useState({ keyword: "", fromDate: "", toDate: "" });

  // Fetch notices
  const fetchNotices = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/notices", {
        params: filters,
      });
      setNotices(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  // Run on mount & when filters change
  useEffect(() => {
    fetchNotices();
  }, [filters]);

  // Upload Notice
  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    if (file) formData.append("file", file);

    try {
      await axios.post("http://localhost:5000/api/notices/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      alert("Notice uploaded successfully!");
      setTitle("");
      setDescription("");
      setFile(null);
      fetchNotices(); // refresh after upload
    } catch (error) {
      console.error(error);
      alert("Failed to upload notice.");
    }
  };

  return (
    <div className="max-w-4xl mx-auto mt-10 p-6 bg-white rounded-2xl shadow-lg space-y-8">
      {/* Upload Form */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Upload Notice</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Notice Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-2 border rounded-lg"
            required
          />
          <textarea
            placeholder="Notice Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full p-2 border rounded-lg"
            rows="3"
            required
          />
          <input
            type="file"
            onChange={(e) => setFile(e.target.files[0])}
            className="w-full"
          />
          <button
            type="submit"
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
          >
            Upload Notice
          </button>
        </form>
      </div>

      {/* Filters */}
      <div>
        <h2 className="text-xl font-bold mb-2">Filter Notices</h2>
        <div className="flex gap-4 flex-wrap">
          <input
            type="text"
            placeholder="Search keyword..."
            value={filters.keyword}
            onChange={(e) => setFilters({ ...filters, keyword: e.target.value })}
            className="p-2 border rounded-lg"
          />
          <input
            type="date"
            value={filters.fromDate}
            onChange={(e) => setFilters({ ...filters, fromDate: e.target.value })}
            className="p-2 border rounded-lg"
          />
          <input
            type="date"
            value={filters.toDate}
            onChange={(e) => setFilters({ ...filters, toDate: e.target.value })}
            className="p-2 border rounded-lg"
          />
          <button
            onClick={() => setFilters({ keyword: "", fromDate: "", toDate: "" })}
            className="bg-gray-500 text-white px-3 py-2 rounded-lg"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Notice List */}
      <div>
        <h2 className="text-xl font-bold mb-4">Uploaded Notices</h2>
        <ul className="space-y-4">
          {notices.map((n) => (
            <li key={n._id} className="p-4 border rounded-lg shadow-sm">
              <h3 className="font-semibold text-lg">{n.title}</h3>
              <p className="text-gray-700">{n.description}</p>
              <p className="text-sm text-gray-500">
                Uploaded by {n.createdBy?.name || "Unknown"} on{" "}
                {new Date(n.createdAt).toLocaleDateString()}
              </p>
              {n.fileUrl && (
                <a
                  href={`http://localhost:5000${n.fileUrl}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-green-600 hover:underline"
                >
                  View File
                </a>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
