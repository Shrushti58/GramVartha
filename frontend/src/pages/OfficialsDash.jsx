import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import ComplaintsDashboard from "../pages/Complaintsdashboard";

const categories = [
  { value: "development", label: "Development" },
  { value: "health", label: "Health" },
  { value: "education", label: "Education" },
  { value: "agriculture", label: "Agriculture" },
  { value: "employment", label: "Employment" },
  { value: "social_welfare", label: "Social Welfare" },
  { value: "tax_billing", label: "Tax & Billing" },
  { value: "election", label: "Election" },
  { value: "urgent", label: "Urgent" },
  { value: "general", label: "General" },
];

const priorities = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
];

const catColor = {
  development: "#2563eb", health: "#059669", education: "#7c3aed",
  agriculture: "#d97706", employment: "#4338ca", social_welfare: "#db2777",
  tax_billing: "#dc2626", election: "#ea580c", urgent: "#dc2626", general: "#6b7280",
};

const Spinner = () => (
  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
  </svg>
);

export default function OfficialsDashboard() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("general");
  const [priority, setPriority] = useState("medium");
  const [isPinned, setIsPinned] = useState(false);
  const [file, setFile] = useState(null);
  const [notices, setNotices] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [editingNotice, setEditingNotice] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [viewFileModal, setViewFileModal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [officialVillageId, setOfficialVillageId] = useState(null);
  const [officialVillage, setOfficialVillage] = useState(null);
  const [showVillageModal, setShowVillageModal] = useState(false);
  const [qrLoading, setQrLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [activePage, setActivePage] = useState("notices");
  const navigate = useNavigate();

  useEffect(() => { fetchNotices(); }, []);

  const fetchNotices = async () => {
    try {
      setLoading(true);
      const profileRes = await axios.get("http://localhost:3000/officials/profile", { withCredentials: true });
      const villageId = profileRes.data?.village?._id || profileRes.data?.village;
      if (!villageId) { toast.error("No village linked to your account"); setNotices([]); return; }
      setOfficialVillageId(villageId);
      const noticesRes = await axios.get(`http://localhost:3000/notice/village/${villageId}`, { withCredentials: true });
      setNotices(Array.isArray(noticesRes.data?.notices) ? noticesRes.data.notices : []);
    } catch { toast.error("Failed to load notices"); setNotices([]); }
    finally { setLoading(false); }
  };

  const fetchCurrentOfficialProfile = async () => {
    try {
      const res = await axios.get("http://localhost:3000/officials/profile", { withCredentials: true });
      if (res.data?.village) {
        const villageId = res.data.village._id || res.data.village;
        setOfficialVillage(res.data.village);
        try {
          const qrRes = await axios.get(`http://localhost:3000/villages/${villageId}/qrcode`, { withCredentials: true });
          if (qrRes.data?.village) setOfficialVillage(prev => ({ ...prev, qrCode: qrRes.data.village.qrCode }));
        } catch { }
      }
    } catch { }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) { toast.error("Fill in title and description"); return; }
    setIsUploading(true);
    const fd = new FormData();
    fd.append("title", title.trim()); fd.append("description", description.trim());
    fd.append("category", category); fd.append("priority", priority); fd.append("isPinned", isPinned);
    if (file) fd.append("file", file);
    if (editingNotice) { fd.append("noticeId", editingNotice._id); }
    else { if (officialVillageId) fd.append("village", officialVillageId); }
    try {
      await axios.post("http://localhost:3000/notice/upload", fd, { headers: { "Content-Type": "multipart/form-data" }, withCredentials: true });
      toast.success(editingNotice ? "Notice updated!" : "Notice published!");
      resetForm(); fetchNotices(); setShowForm(false);
    } catch (err) { toast.error(err.response?.data?.message || "Failed to save notice"); }
    finally { setIsUploading(false); }
  };

  const handleEdit = (notice) => {
    setEditingNotice(notice); setTitle(notice.title); setDescription(notice.description);
    setCategory(notice.category || "general"); setPriority(notice.priority || "medium");
    setIsPinned(notice.isPinned || false); setFile(null); setShowForm(true);
    setTimeout(() => document.getElementById("notice-form")?.scrollIntoView({ behavior: "smooth" }), 100);
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:3000/notice/delete/${id}`, { withCredentials: true });
      toast.success("Notice deleted"); fetchNotices(); setShowForm(false); resetForm();
    } catch { toast.error("Failed to delete notice"); }
    finally { setDeleteConfirm(null); }
  };

  const handleLogout = async () => {
    try {
      await axios.post("http://localhost:3000/officials/logout", {}, { withCredentials: true });
      toast.info("Logged out"); navigate("/");
    } catch { toast.error("Error logging out"); }
  };

  const generateAndShareVillageQRCode = async (village) => {
    try {
      setQrLoading(true);
      const res = await axios.post(`http://localhost:3000/villages/${village._id}/qrcode/generate`, {}, { withCredentials: true });
      const imageUrl = res.data?.village?.qrCode?.imageUrl || res.data?.downloadUrl;
      const qrImageUrl = imageUrl || `${window.location.origin}/qr-notices/${village._id}`;
      if (navigator.share && navigator.canShare && imageUrl) {
        try {
          const blob = await (await fetch(imageUrl)).blob();
          const f = new File([blob], `${(village.name || "village").replace(/\s+/g, "_")}.png`, { type: blob.type });
          if (navigator.canShare({ files: [f] })) { await navigator.share({ files: [f], title: village.name, text: qrImageUrl }); toast.success("Shared!"); return; }
        } catch { }
      }
      const finalUrl = imageUrl ? imageUrl : await (await import("qrcode")).default.toDataURL(qrImageUrl, { margin: 1, width: 400 });
      const a = document.createElement("a"); a.href = finalUrl; a.download = `${(village.name || "village").replace(/\s+/g, "_")}.png`;
      document.body.appendChild(a); a.click(); a.remove(); toast.success("QR downloaded!");
    } catch (err) { toast.error(err.response?.data?.message || "Failed to generate QR"); }
    finally { setQrLoading(false); }
  };

  const resetForm = () => {
    setTitle(""); setDescription(""); setCategory("general");
    setPriority("medium"); setIsPinned(false); setFile(null); setEditingNotice(null);
  };

  const isActive = (n) => n?.status === "published";
  const getCatLabel = (v) => categories.find((c) => c.value === v)?.label || "General";

  const stats = {
    total: notices.length,
    active: notices.filter(isActive).length,
    pinned: notices.filter((n) => n?.isPinned).length,
    urgent: notices.filter((n) => n?.priority === "high" || n?.category === "urgent").length,
  };

  const filtered = notices.filter((n) => {
    if (activeTab === "active") return isActive(n);
    if (activeTab === "pinned") return n?.isPinned;
    if (activeTab === "urgent") return n?.priority === "high" || n?.category === "urgent";
    return true;
  });

  const G = "#1a9e5c";   // primary green
  const GL = "#e8f8f0";  // light green bg
  const GM = "#d1f0e0";  // medium green

  const inputCls = {
    width: "100%", padding: "11px 16px", border: "1.5px solid #e5e7eb",
    borderRadius: "12px", fontSize: "14px", color: "#111827",
    background: "#f9fafb", outline: "none", boxSizing: "border-box",
    fontFamily: "inherit", transition: "border-color 0.2s, background 0.2s",
  };

  const getFileViewer = (fileUrl) => {
    if (!fileUrl) return null;
    const ext = fileUrl.split(".").pop()?.toLowerCase();
    const fileName = fileUrl.split("/").pop();
    if (["jpg","jpeg","png","gif","webp"].includes(ext)) return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
        <img src={fileUrl} alt="Attachment" style={{ maxHeight: "300px", objectFit: "contain", width: "100%", borderRadius: "12px" }} />
        <p style={{ fontSize: "12px", color: "#9ca3af", wordBreak: "break-all" }}>{fileName}</p>
      </div>
    );
    if (ext === "pdf") return (
      <div style={{ display: "flex", flexDirection: "column", gap: "8px", width: "100%" }}>
        <iframe src={fileUrl} style={{ width: "100%", height: "280px", borderRadius: "12px", border: "1px solid #e5e7eb" }} title={fileName} />
        <p style={{ fontSize: "12px", color: "#9ca3af", wordBreak: "break-all", textAlign: "center" }}>{fileName}</p>
      </div>
    );
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "32px 0", gap: "14px" }}>
        <p style={{ fontSize: "13px", color: "#6b7280", wordBreak: "break-all", textAlign: "center" }}>{fileName}</p>
        <a href={fileUrl} target="_blank" rel="noopener noreferrer"
          style={{ padding: "10px 28px", background: G, color: "#fff", fontSize: "14px", fontWeight: "600", borderRadius: "50px", textDecoration: "none" }}>
          Download
        </a>
      </div>
    );
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f5f7f5", fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>

      {/* ── Navbar ── */}
      <nav style={{ background: "#fff", borderBottom: "1px solid #e5e7eb", padding: "0 32px", height: "64px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 40 }}>
        {/* Left: logo + page tabs */}
        <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{ width: "36px", height: "36px", borderRadius: "10px", overflow: "hidden", background: GL, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <img src="/gramvarthalogo.png" alt="GramVartha" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
            </div>
            <span style={{ fontSize: "17px", fontWeight: "700", color: "#111827" }}>GramVartha</span>
            <span style={{ fontSize: "12px", background: GL, color: G, fontWeight: "600", padding: "3px 10px", borderRadius: "50px" }}>Officials</span>
          </div>

          {/* Page switcher tabs */}
          <div style={{ display: "flex", background: "#f3f4f6", borderRadius: "12px", padding: "4px", gap: "2px" }}>
            {[
              { key: "notices",    label: "Notices",    icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" },
              { key: "complaints", label: "Complaints", icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" },
            ].map(tab => (
              <button key={tab.key} onClick={() => setActivePage(tab.key)}
                style={{
                  padding: "7px 14px", borderRadius: "9px", border: "none", cursor: "pointer",
                  fontSize: "13px", fontWeight: "600",
                  background: activePage === tab.key ? "#fff" : "transparent",
                  color: activePage === tab.key ? "#111827" : "#9ca3af",
                  boxShadow: activePage === tab.key ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
                  display: "flex", alignItems: "center", gap: "6px", transition: "all 0.15s",
                }}>
                <svg style={{ width: "14px", height: "14px", color: activePage === tab.key ? G : "#9ca3af" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={tab.icon} />
                </svg>
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Right: actions */}
        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          <button onClick={async () => { await fetchCurrentOfficialProfile(); setShowVillageModal(true); }}
            style={{ padding: "8px 16px", border: "1.5px solid #e5e7eb", borderRadius: "10px", background: "#fff", color: "#374151", fontSize: "13px", fontWeight: "500", cursor: "pointer" }}>
            Village QR
          </button>
          <button onClick={() => navigate("/officials/profile")}
            style={{ padding: "8px 16px", border: "1.5px solid #e5e7eb", borderRadius: "10px", background: "#fff", color: "#374151", fontSize: "13px", fontWeight: "500", cursor: "pointer" }}>
            Profile
          </button>
          <button onClick={handleLogout}
            style={{ padding: "8px 16px", border: "1.5px solid #fecaca", borderRadius: "10px", background: "#fff5f5", color: "#ef4444", fontSize: "13px", fontWeight: "500", cursor: "pointer" }}>
            Logout
          </button>
        </div>
      </nav>

      {activePage === "complaints" ? (
        <ComplaintsDashboard />
      ) : (
      <div style={{ maxWidth: "1180px", margin: "0 auto", padding: "36px 24px" }}>

        {/* ── Page header ── */}
        <div style={{ marginBottom: "32px" }}>
          <h1 style={{ fontSize: "28px", fontWeight: "800", color: "#111827", marginBottom: "4px" }}>Community Notices</h1>
          <p style={{ fontSize: "14px", color: "#6b7280" }}>Manage and publish announcements for your village</p>
        </div>

        {/* ── Stat cards ── */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px", marginBottom: "32px" }}>
          {[
            { label: "Total Notices", value: stats.total, bg: GL, accent: G, icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" },
            { label: "Active", value: stats.active, bg: "#e0f2fe", accent: "#0284c7", icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" },
            { label: "Pinned", value: stats.pinned, bg: "#fef9c3", accent: "#ca8a04", icon: "M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" },
            { label: "Urgent", value: stats.urgent, bg: "#fee2e2", accent: "#ef4444", icon: "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" },
          ].map((s) => (
            <div key={s.label} style={{ background: "#fff", borderRadius: "16px", padding: "20px 22px", border: "1px solid #f0f0f0", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
              <div style={{ width: "40px", height: "40px", borderRadius: "12px", background: s.bg, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "14px" }}>
                <svg style={{ width: "20px", height: "20px", color: s.accent }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={s.icon} />
                </svg>
              </div>
              <p style={{ fontSize: "30px", fontWeight: "800", color: "#111827", lineHeight: 1 }}>{s.value}</p>
              <p style={{ fontSize: "13px", color: "#9ca3af", marginTop: "4px" }}>{s.label}</p>
            </div>
          ))}
        </div>

        {/* ── Main grid ── */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "24px", alignItems: "start" }}>

          {/* Form card */}
          <div id="notice-form" style={{ background: "#fff", borderRadius: "20px", border: "1px solid #f0f0f0", boxShadow: "0 1px 4px rgba(0,0,0,0.04)", overflow: "hidden" }}>
            {/* Card header */}
            <div style={{ padding: "20px 24px", borderBottom: "1px solid #f3f4f6", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <p style={{ fontSize: "16px", fontWeight: "700", color: "#111827" }}>{editingNotice ? "Edit Notice" : "New Notice"}</p>
                <p style={{ fontSize: "12px", color: "#9ca3af", marginTop: "2px" }}>{editingNotice ? "Update the details" : "Publish to your village"}</p>
              </div>
              {editingNotice ? (
                <button onClick={resetForm} style={{ width: "30px", height: "30px", borderRadius: "50%", background: "#f3f4f6", border: "none", cursor: "pointer", fontSize: "16px", color: "#6b7280" }}>×</button>
              ) : (
                <div style={{ width: "32px", height: "32px", borderRadius: "10px", background: GL, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <svg style={{ width: "16px", height: "16px", color: G }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                  </svg>
                </div>
              )}
            </div>

            <div style={{ padding: "20px 24px" }}>
              <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>

                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#374151", marginBottom: "6px" }}>Title *</label>
                  <input type="text" value={title} onChange={(e) => setTitle(e.target.value)}
                    placeholder="Notice title..." required style={inputCls}
                    onFocus={e => { e.target.style.borderColor = G; e.target.style.background = "#fff"; }}
                    onBlur={e => { e.target.style.borderColor = "#e5e7eb"; e.target.style.background = "#f9fafb"; }} />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#374151", marginBottom: "6px" }}>Category</label>
                    <select value={category} onChange={(e) => setCategory(e.target.value)} style={inputCls}
                      onFocus={e => { e.target.style.borderColor = G; e.target.style.background = "#fff"; }}
                      onBlur={e => { e.target.style.borderColor = "#e5e7eb"; e.target.style.background = "#f9fafb"; }}>
                      {categories.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#374151", marginBottom: "6px" }}>Priority</label>
                    <select value={priority} onChange={(e) => setPriority(e.target.value)} style={inputCls}
                      onFocus={e => { e.target.style.borderColor = G; e.target.style.background = "#fff"; }}
                      onBlur={e => { e.target.style.borderColor = "#e5e7eb"; e.target.style.background = "#f9fafb"; }}>
                      {priorities.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
                    </select>
                  </div>
                </div>

                {/* Pin toggle */}
                <div onClick={() => setIsPinned(!isPinned)} style={{
                  display: "flex", alignItems: "center", gap: "12px",
                  padding: "12px 14px", borderRadius: "12px", cursor: "pointer",
                  background: isPinned ? GL : "#f9fafb",
                  border: `1.5px solid ${isPinned ? GM : "#e5e7eb"}`,
                  transition: "all 0.15s"
                }}>
                  <div style={{ width: "40px", height: "22px", borderRadius: "11px", background: isPinned ? G : "#d1d5db", position: "relative", flexShrink: 0, transition: "background 0.2s" }}>
                    <div style={{ width: "16px", height: "16px", background: "#fff", borderRadius: "50%", position: "absolute", top: "3px", left: isPinned ? "21px" : "3px", transition: "left 0.2s", boxShadow: "0 1px 3px rgba(0,0,0,0.2)" }} />
                  </div>
                  <div>
                    <p style={{ fontSize: "13px", fontWeight: "600", color: "#111827" }}>Pin to top</p>
                    <p style={{ fontSize: "11px", color: "#9ca3af" }}>Show first in the board</p>
                  </div>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#374151", marginBottom: "6px" }}>Description *</label>
                  <textarea value={description} onChange={(e) => setDescription(e.target.value)}
                    placeholder="Write the notice details here..." rows={4} required
                    style={{ ...inputCls, resize: "vertical", lineHeight: "1.6" }}
                    onFocus={e => { e.target.style.borderColor = G; e.target.style.background = "#fff"; }}
                    onBlur={e => { e.target.style.borderColor = "#e5e7eb"; e.target.style.background = "#f9fafb"; }} />
                </div>

                {/* File */}
                <label style={{
                  display: "flex", alignItems: "center", gap: "12px", padding: "12px 14px",
                  borderRadius: "12px", background: "#f9fafb", border: "1.5px dashed #d1d5db",
                  cursor: "pointer", transition: "all 0.15s"
                }}
                  onMouseEnter={e => { e.currentTarget.style.background = GL; e.currentTarget.style.borderColor = G; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "#f9fafb"; e.currentTarget.style.borderColor = "#d1d5db"; }}>
                  <div style={{ width: "34px", height: "34px", borderRadius: "10px", background: GL, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <svg style={{ width: "16px", height: "16px", color: G }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                    </svg>
                  </div>
                  <div>
                    <p style={{ fontSize: "13px", fontWeight: "600", color: "#374151" }}>{file ? file.name : "Attach a file"}</p>
                    <p style={{ fontSize: "11px", color: "#9ca3af" }}>PDF or Image, max 5MB</p>
                  </div>
                  <input type="file" onChange={(e) => setFile(e.target.files[0])} style={{ display: "none" }} accept=".pdf,.doc,.docx,.jpg,.jpeg,.png" />
                </label>

                <button type="submit" disabled={isUploading || !title.trim() || !description.trim()}
                  style={{
                    width: "100%", padding: "13px", borderRadius: "12px", border: "none",
                    background: (isUploading || !title.trim() || !description.trim()) ? "#d1d5db" : G,
                    color: "#fff", fontSize: "14px", fontWeight: "700",
                    cursor: (isUploading || !title.trim() || !description.trim()) ? "not-allowed" : "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
                    transition: "background 0.2s", boxShadow: (isUploading || !title.trim() || !description.trim()) ? "none" : "0 4px 14px rgba(26,158,92,0.3)"
                  }}>
                  {isUploading ? <><Spinner />{editingNotice ? "Updating..." : "Publishing..."}</> : (editingNotice ? "Update Notice" : "Publish Notice")}
                </button>

                {editingNotice && (
                  <button type="button" onClick={() => setDeleteConfirm(editingNotice._id)}
                    style={{ width: "100%", padding: "11px", background: "#fff5f5", border: "1.5px solid #fecaca", color: "#ef4444", borderRadius: "12px", fontSize: "13px", fontWeight: "600", cursor: "pointer" }}>
                    Delete this notice
                  </button>
                )}
              </form>
            </div>
          </div>

          {/* Notices list card */}
          <div style={{ background: "#fff", borderRadius: "20px", border: "1px solid #f0f0f0", boxShadow: "0 1px 4px rgba(0,0,0,0.04)", overflow: "hidden" }}>

            {/* Tabs */}
            <div style={{ padding: "16px 20px", borderBottom: "1px solid #f3f4f6", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px" }}>
              <div style={{ display: "flex", background: "#f3f4f6", borderRadius: "12px", padding: "4px", gap: "2px" }}>
                {[
                  { key: "all", label: "All", count: notices.length },
                  { key: "active", label: "Active", count: stats.active },
                  { key: "pinned", label: "Pinned", count: stats.pinned },
                  { key: "urgent", label: "Urgent", count: stats.urgent },
                ].map((tab) => (
                  <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                    style={{
                      padding: "7px 14px", borderRadius: "9px", border: "none", cursor: "pointer", fontSize: "13px", fontWeight: "600",
                      background: activeTab === tab.key ? "#fff" : "transparent",
                      color: activeTab === tab.key ? "#111827" : "#9ca3af",
                      boxShadow: activeTab === tab.key ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
                      transition: "all 0.15s", display: "flex", alignItems: "center", gap: "5px"
                    }}>
                    {tab.label}
                    <span style={{
                      fontSize: "11px", fontWeight: "700", padding: "1px 6px", borderRadius: "50px",
                      background: activeTab === tab.key ? GL : "transparent",
                      color: activeTab === tab.key ? G : "#9ca3af",
                    }}>{tab.count}</span>
                  </button>
                ))}
              </div>
              <button onClick={() => { resetForm(); setShowForm(true); document.getElementById("notice-form")?.scrollIntoView({ behavior: "smooth" }); }}
                style={{ padding: "8px 18px", background: G, color: "#fff", border: "none", borderRadius: "10px", fontSize: "13px", fontWeight: "600", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px", boxShadow: "0 2px 8px rgba(26,158,92,0.25)" }}>
                <svg style={{ width: "14px", height: "14px" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                </svg>
                New Notice
              </button>
            </div>

            {/* List */}
            <div style={{ maxHeight: "640px", overflowY: "auto" }}>
              {loading ? (
                <div style={{ display: "flex", justifyContent: "center", alignItems: "center", padding: "60px", gap: "10px", color: "#9ca3af", fontSize: "14px" }}>
                  <Spinner /> Loading notices...
                </div>
              ) : filtered.length === 0 ? (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "60px 20px", gap: "12px" }}>
                  <div style={{ width: "60px", height: "60px", borderRadius: "18px", background: GL, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <svg style={{ width: "28px", height: "28px", color: G }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <p style={{ fontSize: "16px", fontWeight: "700", color: "#374151" }}>No notices yet</p>
                  <p style={{ fontSize: "13px", color: "#9ca3af" }}>Create the first notice for your village</p>
                </div>
              ) : (
                <div style={{ padding: "12px 16px", display: "flex", flexDirection: "column", gap: "10px" }}>
                  {filtered.map((notice) => {
                    const isUrgent = notice.priority === "high" || notice.category === "urgent";
                    const accent = catColor[notice.category] || "#6b7280";
                    return (
                      <div key={notice._id}
                        style={{
                          border: `1.5px solid ${isUrgent ? "#fecaca" : "#f0f0f0"}`,
                          borderRadius: "14px", padding: "16px 18px",
                          background: isUrgent ? "#fff8f8" : "#fafafa",
                          opacity: !isActive(notice) ? 0.55 : 1,
                          transition: "box-shadow 0.15s, transform 0.15s",
                          cursor: "pointer",
                        }}
                        onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.07)"; e.currentTarget.style.transform = "translateY(-1px)"; }}
                        onMouseLeave={e => { e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.transform = "none"; }}>

                        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "12px" }}>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            {/* Category + badges row */}
                            <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "6px", flexWrap: "wrap" }}>
                              <span style={{ fontSize: "11px", fontWeight: "700", color: accent, background: accent + "18", padding: "2px 8px", borderRadius: "50px" }}>
                                {getCatLabel(notice.category)}
                              </span>
                              {notice.isPinned && (
                                <span style={{ fontSize: "11px", fontWeight: "600", color: "#ca8a04", background: "#fef9c3", padding: "2px 8px", borderRadius: "50px" }}>Pinned</span>
                              )}
                              {isUrgent && (
                                <span style={{ fontSize: "11px", fontWeight: "600", color: "#ef4444", background: "#fee2e2", padding: "2px 8px", borderRadius: "50px" }}>Urgent</span>
                              )}
                              {notice.fileUrl && (
                                <span style={{ fontSize: "11px", fontWeight: "600", color: G, background: GL, padding: "2px 8px", borderRadius: "50px" }}>File</span>
                              )}
                            </div>

                            <p style={{ fontSize: "15px", fontWeight: "700", color: "#111827", marginBottom: "4px", lineHeight: 1.3 }}>
                              {notice.title}
                            </p>
                            <p style={{ fontSize: "13px", color: "#6b7280", lineHeight: 1.55,
                              display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                              {notice.description}
                            </p>
                            <p style={{ fontSize: "11px", color: "#9ca3af", marginTop: "8px" }}>
                              {new Date(notice.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                              &nbsp;·&nbsp; {notice.views || 0} views
                            </p>
                          </div>

                          {/* Actions */}
                          <div style={{ display: "flex", flexDirection: "column", gap: "6px", flexShrink: 0 }}>
                            <button onClick={() => handleEdit(notice)}
                              style={{ padding: "6px 14px", background: GL, border: "none", borderRadius: "8px", color: G, fontSize: "12px", fontWeight: "600", cursor: "pointer" }}>
                              Edit
                            </button>
                            {notice.fileUrl && (
                              <button onClick={() => setViewFileModal(notice)}
                                style={{ padding: "6px 14px", background: "#f3f4f6", border: "none", borderRadius: "8px", color: "#374151", fontSize: "12px", fontWeight: "600", cursor: "pointer" }}>
                                View
                              </button>
                            )}
                            <button onClick={() => setDeleteConfirm(notice._id)}
                              style={{ padding: "6px 14px", background: "#fff5f5", border: "none", borderRadius: "8px", color: "#ef4444", fontSize: "12px", fontWeight: "600", cursor: "pointer" }}>
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      )} {/* end activePage === "notices" */}

      {/* Village QR Modal */}
      {showVillageModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.35)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50, padding: "16px" }}>
          <div style={{ background: "#fff", borderRadius: "20px", padding: "28px", maxWidth: "400px", width: "100%", boxShadow: "0 20px 60px rgba(0,0,0,0.12)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <p style={{ fontSize: "17px", fontWeight: "700", color: "#111827" }}>Village QR Code</p>
              <button onClick={() => setShowVillageModal(false)} style={{ width: "30px", height: "30px", borderRadius: "50%", background: "#f3f4f6", border: "none", cursor: "pointer", fontSize: "16px", color: "#6b7280" }}>×</button>
            </div>
            {!officialVillage ? (
              <p style={{ fontSize: "14px", color: "#9ca3af", textAlign: "center", padding: "20px 0" }}>No village linked to your account.</p>
            ) : (
              <div style={{ background: "#f9fafb", border: "1.5px solid #e5e7eb", borderRadius: "14px", padding: "16px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px" }}>
                <div>
                  <p style={{ fontWeight: "700", color: "#111827", fontSize: "15px" }}>{officialVillage.name}</p>
                  <p style={{ fontSize: "12px", color: "#9ca3af", marginTop: "2px" }}>{officialVillage.district}, {officialVillage.state}</p>
                  <p style={{ fontSize: "12px", fontWeight: "600", color: officialVillage.qrCode?.imageUrl ? G : "#9ca3af", marginTop: "4px" }}>
                    {officialVillage.qrCode?.imageUrl ? "QR ready" : "Not generated yet"}
                  </p>
                </div>
                <button onClick={() => generateAndShareVillageQRCode(officialVillage)} disabled={qrLoading}
                  style={{ padding: "10px 18px", background: qrLoading ? "#d1d5db" : G, color: "#fff", border: "none", borderRadius: "10px", fontSize: "13px", fontWeight: "600", cursor: qrLoading ? "not-allowed" : "pointer", flexShrink: 0, display: "flex", alignItems: "center", gap: "6px", boxShadow: qrLoading ? "none" : "0 4px 12px rgba(26,158,92,0.25)" }}>
                  {qrLoading ? <><Spinner />Wait...</> : "Download QR"}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {deleteConfirm && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.35)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50, padding: "16px" }}>
          <div style={{ background: "#fff", borderRadius: "20px", padding: "32px", maxWidth: "340px", width: "100%", textAlign: "center", boxShadow: "0 20px 60px rgba(0,0,0,0.12)" }}>
            <div style={{ width: "56px", height: "56px", background: "#fee2e2", borderRadius: "18px", margin: "0 auto 16px", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg style={{ width: "26px", height: "26px", color: "#ef4444" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </div>
            <p style={{ fontSize: "17px", fontWeight: "700", color: "#111827", marginBottom: "8px" }}>Delete notice?</p>
            <p style={{ fontSize: "13px", color: "#6b7280", marginBottom: "24px", lineHeight: "1.6" }}>This cannot be undone.</p>
            <div style={{ display: "flex", gap: "10px" }}>
              <button onClick={() => setDeleteConfirm(null)}
                style={{ flex: 1, padding: "12px", background: "#f3f4f6", border: "none", color: "#374151", fontSize: "14px", fontWeight: "600", borderRadius: "12px", cursor: "pointer" }}>
                Cancel
              </button>
              <button onClick={() => handleDelete(deleteConfirm)}
                style={{ flex: 1, padding: "12px", background: "#ef4444", border: "none", color: "#fff", fontSize: "14px", fontWeight: "600", borderRadius: "12px", cursor: "pointer" }}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* File View Modal */}
      {viewFileModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.35)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50, padding: "16px" }}>
          <div style={{ background: "#fff", borderRadius: "20px", width: "100%", maxWidth: "640px", boxShadow: "0 20px 60px rgba(0,0,0,0.12)", display: "flex", flexDirection: "column", maxHeight: "90vh" }}>
            <div style={{ padding: "18px 22px", borderBottom: "1px solid #f3f4f6", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
              <div style={{ flex: 1, minWidth: 0, paddingRight: "12px" }}>
                <p style={{ fontSize: "16px", fontWeight: "700", color: "#111827", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{viewFileModal.title}</p>
                <p style={{ fontSize: "12px", color: "#9ca3af", marginTop: "2px" }}>{getCatLabel(viewFileModal.category)}</p>
              </div>
              <button onClick={() => setViewFileModal(null)} style={{ width: "30px", height: "30px", borderRadius: "50%", background: "#f3f4f6", border: "none", cursor: "pointer", fontSize: "16px", color: "#6b7280" }}>×</button>
            </div>
            <div style={{ flex: 1, overflowY: "auto", padding: "20px 22px" }}>
              <div style={{ background: "#f9fafb", borderRadius: "12px", padding: "14px", marginBottom: "16px", fontSize: "14px", color: "#374151", lineHeight: "1.65" }}>
                {viewFileModal.description}
              </div>
              {getFileViewer(viewFileModal.fileUrl)}
            </div>
            <div style={{ padding: "16px 22px", borderTop: "1px solid #f3f4f6", display: "flex", justifyContent: "flex-end", flexShrink: 0 }}>
              <a href={viewFileModal.fileUrl} target="_blank" rel="noopener noreferrer"
                style={{ padding: "10px 24px", background: G, color: "#fff", fontSize: "14px", fontWeight: "600", borderRadius: "10px", textDecoration: "none", boxShadow: "0 4px 12px rgba(26,158,92,0.25)" }}>
                Download File
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}