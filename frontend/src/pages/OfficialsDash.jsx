import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

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

const catColors = {
  development: "bg-blue-400/20 text-blue-300 border-blue-400/30",
  health: "bg-emerald-400/20 text-emerald-300 border-emerald-400/30",
  education: "bg-violet-400/20 text-violet-300 border-violet-400/30",
  agriculture: "bg-amber-400/20 text-amber-300 border-amber-400/30",
  employment: "bg-indigo-400/20 text-indigo-300 border-indigo-400/30",
  social_welfare: "bg-pink-400/20 text-pink-300 border-pink-400/30",
  tax_billing: "bg-red-400/20 text-red-300 border-red-400/30",
  election: "bg-orange-400/20 text-orange-300 border-orange-400/30",
  urgent: "bg-red-400/20 text-red-300 border-red-400/30",
  general: "bg-white/10 text-white/60 border-white/20",
};

const catDot = {
  development: "bg-blue-400", health: "bg-emerald-400", education: "bg-violet-400",
  agriculture: "bg-amber-400", employment: "bg-indigo-400", social_welfare: "bg-pink-400",
  tax_billing: "bg-red-400", election: "bg-orange-400", urgent: "bg-red-500", general: "bg-white/40",
};

const priConfig = {
  low: { label: "Low", color: "text-white/40", bar: "bg-white/20", w: "33%" },
  medium: { label: "Medium", color: "text-blue-300", bar: "bg-blue-400", w: "66%" },
  high: { label: "High", color: "text-orange-300", bar: "bg-orange-400", w: "100%" },
};

const Spinner = ({ size = 4 }) => (
  <svg className={`animate-spin h-${size} w-${size}`} fill="none" viewBox="0 0 24 24">
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
  const navigate = useNavigate();

  useEffect(() => { fetchNotices(); }, []);

  // ── Data fetching ──────────────────────────────────────────────
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
        } catch { /* QR not yet generated */ }
      }
    } catch { console.error("Error fetching official profile"); }
  };

  // ── Form handlers ──────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) { toast.error("Fill in title and description"); return; }
    setIsUploading(true);
    const fd = new FormData();
    fd.append("title", title.trim()); fd.append("description", description.trim());
    fd.append("category", category); fd.append("priority", priority); fd.append("isPinned", isPinned);
    if (file) fd.append("file", file);
    if (editingNotice) {
      fd.append("noticeId", editingNotice._id);
    } else {
      if (officialVillageId) fd.append("village", officialVillageId);
    }
    try {
      await axios.post("http://localhost:3000/notice/upload", fd, { headers: { "Content-Type": "multipart/form-data" }, withCredentials: true });
      toast.success(editingNotice ? "Notice updated successfully" : "Notice published successfully");
      resetForm(); fetchNotices();
    } catch (err) { toast.error(err.response?.data?.message || "Failed to save notice"); }
    finally { setIsUploading(false); }
  };

  const handleEdit = (notice) => {
    setEditingNotice(notice); setTitle(notice.title); setDescription(notice.description);
    setCategory(notice.category || "general"); setPriority(notice.priority || "medium");
    setIsPinned(notice.isPinned || false); setFile(null);
    document.getElementById("notice-form").scrollIntoView({ behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:3000/notice/delete/${id}`, { withCredentials: true });
      toast.success("Notice deleted successfully"); fetchNotices();
    } catch { toast.error("Failed to delete notice"); }
    finally { setDeleteConfirm(null); }
  };

  const handleLogout = async () => {
    try { await axios.post("http://localhost:3000/officials/logout", {}, { withCredentials: true }); toast.info("Logged out successfully"); navigate("/"); }
    catch { toast.error("Error logging out"); }
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
          if (navigator.canShare({ files: [f] })) { await navigator.share({ files: [f], title: village.name, text: qrImageUrl }); toast.success("Shared QR successfully"); return; }
        } catch { /* fall through to download */ }
      }
      const finalUrl = imageUrl ? imageUrl : await (await import("qrcode")).default.toDataURL(qrImageUrl, { margin: 1, width: 400 });
      const a = document.createElement("a"); a.href = finalUrl; a.download = `${(village.name || "village").replace(/\s+/g, "_")}.png`;
      document.body.appendChild(a); a.click(); a.remove(); toast.success("QR ready");
    } catch (err) { toast.error(err.response?.data?.message || "Failed to generate/share QR"); }
    finally { setQrLoading(false); }
  };

  const resetForm = () => { setTitle(""); setDescription(""); setCategory("general"); setPriority("medium"); setIsPinned(false); setFile(null); setEditingNotice(null); };

  // ── Helpers ────────────────────────────────────────────────────
  const isNoticeActive = (n) => n?.status === "published";
  const getCategoryLabel = (v) => categories.find((c) => c.value === v)?.label || "General";
  const getPriorityLabel = (v) => priorities.find((p) => p.value === v)?.label || "Medium";

  const stats = {
    total: notices.length,
    active: notices.filter(isNoticeActive).length,
    recent: notices.filter((n) => { if (!n?.createdAt) return false; const d = new Date(); d.setDate(d.getDate() - 7); return new Date(n.createdAt) >= d; }).length,
    withFiles: notices.filter((n) => n?.fileUrl).length,
    pinned: notices.filter((n) => n?.isPinned).length,
    urgent: notices.filter((n) => n?.priority === "high" || n?.category === "urgent").length,
  };

  const catDist = [...categories]
    .map((c) => ({ ...c, count: notices.filter((n) => n?.category === c.value).length }))
    .filter((c) => c.count > 0).sort((a, b) => b.count - a.count).slice(0, 6);
  const maxCat = Math.max(...catDist.map((c) => c.count), 1);

  const filtered = notices.filter((n) => {
    if (activeTab === "active") return isNoticeActive(n);
    if (activeTab === "pinned") return n?.isPinned;
    if (activeTab === "urgent") return n?.priority === "high" || n?.category === "urgent";
    return true;
  });

  const inputClass = "w-full px-4 py-3 rounded-xl border border-white/10 bg-white/5 text-sm text-white placeholder-white/30 outline-none transition-all duration-200 focus:border-green-400/50 focus:ring-4 focus:ring-green-400/10 hover:border-white/20";
  const selectClass = `${inputClass} [&>option]:bg-[#0d2218] [&>option]:text-white`;

  const getFileViewer = (fileUrl) => {
    if (!fileUrl) return null;
    const ext = fileUrl.split(".").pop()?.toLowerCase();
    const fileName = fileUrl.split("/").pop();
    if (["jpg","jpeg","png","gif","webp"].includes(ext)) return (
      <div className="flex flex-col items-center gap-3">
        <img src={fileUrl} alt="Notice attachment" className="max-h-80 md:max-h-96 object-contain rounded-xl border border-white/10 w-full" />
        <p className="text-xs text-white/40 break-all px-2">{fileName}</p>
      </div>
    );
    if (ext === "pdf") return (
      <div className="flex flex-col gap-3 w-full">
        <iframe src={fileUrl} className="w-full h-64 md:h-80 lg:h-96 rounded-xl border border-white/10" title={fileName} />
        <p className="text-xs text-white/40 break-all text-center">{fileName}</p>
      </div>
    );
    return (
      <div className="flex flex-col items-center py-10 gap-4">
        <div className="w-14 h-14 bg-green-500/20 rounded-2xl flex items-center justify-center">
          <svg className="w-7 h-7 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <p className="text-sm text-white/50 break-all text-center max-w-sm px-4">{fileName}</p>
        <a href={fileUrl} target="_blank" rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-green-500 hover:bg-green-400 text-white rounded-xl text-sm font-semibold transition-colors shadow-lg shadow-green-500/20">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Download File
        </a>
      </div>
    );
  };

  // ── Render ─────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#0a1f14]">

      {/* ── Header ── */}
      <header className="sticky top-0 z-50 bg-[#0d2218]/95 backdrop-blur-md border-b border-white/5">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-10">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg overflow-hidden bg-white/10 border border-white/10 flex items-center justify-center">
                <img src="/gramvarthalogo.png" alt="GramVartha" className="w-full h-full object-contain" />
              </div>
              <span className="text-sm font-bold text-white">GramVartha</span>
              <div className="hidden sm:flex items-center gap-1.5 bg-green-500/15 border border-green-400/20 text-green-400 text-xs font-medium px-2.5 py-1 rounded-full">
                <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                Officials Portal
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={async () => { await fetchCurrentOfficialProfile(); setShowVillageModal(true); }}
                className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 hover:text-white text-xs font-medium transition-all"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                </svg>
                <span className="hidden sm:inline">Village QR</span>
              </button>
              <button
                onClick={() => navigate("/officials/profile")}
                className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 hover:text-white text-xs font-medium transition-all"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span className="hidden sm:inline">Profile</span>
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 hover:bg-red-500/20 border border-white/10 hover:border-red-400/30 text-white/70 hover:text-red-300 text-xs font-medium transition-all"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-[1400px] mx-auto px-6 lg:px-10 py-10">

        {/* Page title */}
        <div className="mb-10">
          <p className="text-green-400 text-xs font-semibold uppercase tracking-widest mb-2">Dashboard</p>
          <h1 className="text-3xl lg:text-4xl font-black text-white tracking-tight">Community Notices</h1>
          <p className="text-white/40 text-sm mt-2">Manage and publish announcements for your village.</p>
        </div>

        {/* ── Stats ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {/* Overview hero card */}
          <div className="col-span-2 bg-gradient-to-br from-green-600/30 to-green-900/40 border border-green-500/20 rounded-2xl p-7 relative overflow-hidden">
            <div className="absolute -right-8 -top-8 w-40 h-40 bg-green-400/5 rounded-full pointer-events-none" />
            <div className="absolute -right-4 bottom-0 w-28 h-28 bg-green-500/5 rounded-full pointer-events-none" />
            <p className="text-green-400/70 text-xs font-semibold uppercase tracking-widest mb-5">Overview</p>
            <div className="flex items-end gap-10 relative z-10">
              <div>
                <p className="text-6xl font-black text-white leading-none">{stats.total}</p>
                <p className="text-white/40 text-sm mt-2">Total Notices</p>
              </div>
              <div className="space-y-3 pb-1">
                <div>
                  <p className="text-3xl font-bold text-green-400 leading-none">{stats.active}</p>
                  <p className="text-white/30 text-xs mt-0.5">Active</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-white/60 leading-none">{stats.recent}</p>
                  <p className="text-white/30 text-xs mt-0.5">This Week</p>
                </div>
              </div>
            </div>
            <div className="mt-6 relative z-10">
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-white/30">Active rate</span>
                <span className="text-green-400 font-semibold">{stats.total ? Math.round((stats.active / stats.total) * 100) : 0}%</span>
              </div>
              <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-green-400 rounded-full transition-all duration-700"
                  style={{ width: `${stats.total ? (stats.active / stats.total) * 100 : 0}%` }} />
              </div>
            </div>
          </div>

          {/* Pinned */}
          <div className="bg-[#0d2218] border border-white/5 rounded-2xl p-6 hover:border-amber-400/20 transition-all group">
            <div className="flex items-center justify-between mb-6">
              <div className="w-10 h-10 bg-amber-400/10 rounded-xl flex items-center justify-center group-hover:bg-amber-400/20 transition-colors">
                <svg className="w-5 h-5 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.293 1.293a1 1 0 011.414 0l3 3a1 1 0 010 1.414L12.414 7H15a1 1 0 01.707 1.707l-5 5a1 1 0 01-1.414-1.414L11 10.586V8a1 1 0 00-1-1H7.586a1 1 0 01-.707-1.707l3-3z" />
                </svg>
              </div>
              <span className="text-xs text-white/20 font-medium">Pinned</span>
            </div>
            <p className="text-4xl font-black text-white">{stats.pinned}</p>
            <p className="text-white/30 text-xs mt-1">notices pinned</p>
            <div className="mt-4 h-1 bg-white/5 rounded-full overflow-hidden">
              <div className="h-full bg-amber-400 rounded-full transition-all" style={{ width: `${stats.total ? (stats.pinned / stats.total) * 100 : 0}%` }} />
            </div>
          </div>

          {/* High Priority */}
          <div className="bg-[#0d2218] border border-white/5 rounded-2xl p-6 hover:border-orange-400/20 transition-all group">
            <div className="flex items-center justify-between mb-6">
              <div className="w-10 h-10 bg-orange-400/10 rounded-xl flex items-center justify-center group-hover:bg-orange-400/20 transition-colors">
                <svg className="w-5 h-5 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <span className="text-xs text-white/20 font-medium">Urgent</span>
            </div>
            <p className="text-4xl font-black text-white">{stats.urgent}</p>
            <p className="text-white/30 text-xs mt-1">high priority</p>
            <div className="mt-4 h-1 bg-white/5 rounded-full overflow-hidden">
              <div className="h-full bg-orange-400 rounded-full transition-all" style={{ width: `${stats.total ? (stats.urgent / stats.total) * 100 : 0}%` }} />
            </div>
          </div>
        </div>

        {/* Category distribution */}
        {catDist.length > 0 && (
          <div className="bg-[#0d2218] border border-white/5 rounded-2xl p-6 mb-8">
            <div className="flex items-center justify-between mb-5">
              <p className="text-sm font-semibold text-white/80">Distribution by Category</p>
              <span className="text-xs text-white/20">{notices.length} notices</span>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-3">
              {catDist.map((c) => (
                <div key={c.value} className="flex items-center gap-3">
                  <span className="text-xs text-white/40 w-24 flex-shrink-0 truncate">{c.label}</span>
                  <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div className={`h-full ${catDot[c.value]} rounded-full transition-all duration-700`}
                      style={{ width: `${(c.count / maxCat) * 100}%` }} />
                  </div>
                  <span className="text-xs font-bold text-white/60 w-4 text-right">{c.count}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Main Grid ── */}
        <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">

          {/* Form */}
          <div id="notice-form" className="xl:col-span-2 bg-[#0d2218] border border-white/5 rounded-2xl p-8 h-fit">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-lg font-bold text-white">{editingNotice ? "Edit Notice" : "New Notice"}</h2>
                <p className="text-white/30 text-xs mt-0.5">{editingNotice ? "Update the details below" : "Publish to your community"}</p>
              </div>
              {editingNotice && (
                <button onClick={resetForm} className="w-8 h-8 flex items-center justify-center rounded-xl bg-white/5 hover:bg-white/10 text-white/40 hover:text-white transition-all">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-white/40 uppercase tracking-wider">Title *</label>
                <input type="text" value={title} onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter a clear title for your notice..." required className={inputClass} />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-white/40 uppercase tracking-wider">Category *</label>
                  <select value={category} onChange={(e) => setCategory(e.target.value)} required className={selectClass}>
                    {categories.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-white/40 uppercase tracking-wider">Priority</label>
                  <select value={priority} onChange={(e) => setPriority(e.target.value)} className={selectClass}>
                    {priorities.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
                  </select>
                </div>
              </div>

              {/* Pin toggle */}
              <div onClick={() => setIsPinned(!isPinned)}
                className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-all duration-200 ${isPinned ? "bg-amber-400/10 border-amber-400/30" : "bg-white/5 border-white/10 hover:border-white/20"}`}>
                <div className={`w-10 h-[22px] rounded-full relative flex-shrink-0 transition-all duration-200 ${isPinned ? "bg-amber-400" : "bg-white/10"}`}>
                  <div className={`w-4 h-4 bg-white rounded-full absolute top-[3px] transition-all duration-200 shadow-sm ${isPinned ? "right-[3px]" : "left-[3px]"}`} />
                </div>
                <div>
                  <p className="text-xs font-semibold text-white/70">Pin this notice</p>
                  <p className="text-xs text-white/30">Always show first in the feed</p>
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-semibold text-white/40 uppercase tracking-wider">Description *</label>
                <textarea value={description} onChange={(e) => setDescription(e.target.value)}
                  placeholder="Provide detailed information about the notice..." rows={4} required
                  className={`${inputClass} resize-none`} />
              </div>

              {/* File upload */}
              <label className="flex items-center gap-4 border-2 border-dashed border-white/10 hover:border-green-400/40 bg-white/[0.02] hover:bg-green-400/5 rounded-xl p-4 cursor-pointer transition-all duration-200">
                <div className="w-9 h-9 bg-white/5 rounded-xl flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-white/50">{file ? file.name : "Attachment (Optional)"}</p>
                  <p className="text-xs text-white/25 mt-0.5">PDF, DOC, JPEG, PNG — max 5MB</p>
                </div>
                <input type="file" onChange={(e) => setFile(e.target.files[0])} className="hidden" accept=".pdf,.doc,.docx,.jpg,.jpeg,.png" />
              </label>

              <button type="submit" disabled={isUploading || !title.trim() || !description.trim()}
                className="w-full py-3.5 bg-green-500 hover:bg-green-400 text-white text-sm font-bold rounded-xl transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-green-500/20">
                {isUploading ? (
                  <><Spinner />{editingNotice ? "Updating Notice..." : "Publishing Notice..."}</>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    {editingNotice ? "Update Notice" : "Publish Notice"}
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Notices list */}
          <div className="xl:col-span-3">
            {/* Filter tabs */}
            <div className="flex gap-1 mb-5 bg-[#0d2218] border border-white/5 rounded-xl p-1.5">
              {[
                { key: "all", label: "All", count: notices.length },
                { key: "active", label: "Active", count: stats.active },
                { key: "pinned", label: "Pinned", count: stats.pinned },
                { key: "urgent", label: "Urgent", count: stats.urgent },
              ].map((tab) => (
                <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-semibold rounded-lg transition-all duration-200 ${
                    activeTab === tab.key ? "bg-green-500 text-white shadow-md shadow-green-500/30" : "text-white/30 hover:text-white/60"
                  }`}>
                  {tab.label}
                  <span className={`text-xs px-1.5 py-0.5 rounded-md font-bold ${activeTab === tab.key ? "bg-white/20" : "bg-white/5 text-white/20"}`}>
                    {tab.count}
                  </span>
                </button>
              ))}
            </div>

            <div className="space-y-3 max-h-[800px] overflow-y-auto pr-1">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-24 gap-3">
                  <Spinner size={8} />
                  <p className="text-sm text-white/30">Loading notices...</p>
                </div>
              ) : filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 gap-4 bg-[#0d2218] border border-white/5 rounded-2xl">
                  <div className="w-14 h-14 bg-green-500/10 rounded-2xl flex items-center justify-center">
                    <svg className="w-7 h-7 text-green-400/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-semibold text-white/50">No notices yet</p>
                    <p className="text-xs text-white/20 mt-1">Create your first notice to get started</p>
                  </div>
                  <button onClick={() => document.getElementById("notice-form").scrollIntoView({ behavior: "smooth" })}
                    className="text-xs font-semibold text-green-400 hover:text-green-300 transition-colors">
                    Create first notice →
                  </button>
                </div>
              ) : (
                filtered.map((notice) => {
                  const pri = priConfig[notice.priority] || priConfig.medium;
                  return (
                    <div key={notice._id}
                      className={`bg-[#0d2218] border rounded-2xl overflow-hidden hover:border-green-500/30 hover:-translate-y-0.5 transition-all duration-200 ${
                        notice.isPinned ? "border-amber-400/20" : !isNoticeActive(notice) ? "border-white/5 opacity-50" : "border-white/5"
                      }`}>
                      {/* Top accent strip */}
                      <div className={`h-0.5 w-full ${catDot[notice.category] || "bg-white/10"}`} />

                      <div className="p-5">
                        <div className="flex items-start justify-between gap-3 mb-4">
                          <div className="flex items-start gap-2 flex-1 min-w-0">
                            {notice.isPinned && (
                              <svg className="w-3.5 h-3.5 text-amber-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9.293 1.293a1 1 0 011.414 0l3 3a1 1 0 010 1.414L12.414 7H15a1 1 0 01.707 1.707l-5 5a1 1 0 01-1.414-1.414L11 10.586V8a1 1 0 00-1-1H7.586a1 1 0 01-.707-1.707l3-3z" />
                              </svg>
                            )}
                            <div className="min-w-0">
                              <h4 className="font-semibold text-white text-sm leading-snug">{notice.title}</h4>
                              <p className="text-xs text-white/25 mt-0.5">
                                {new Date(notice.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                              </p>
                            </div>
                          </div>
                          {/* Priority indicator */}
                          <div className="flex flex-col items-end gap-1 flex-shrink-0">
                            <span className={`text-xs font-bold ${pri.color}`}>{pri.label}</span>
                            <div className="w-14 h-1 bg-white/5 rounded-full overflow-hidden">
                              <div className={`h-full ${pri.bar} rounded-full`} style={{ width: pri.w }} />
                            </div>
                          </div>
                        </div>

                        {/* Tags */}
                        <div className="flex flex-wrap gap-1.5 mb-3">
                          <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border ${catColors[notice.category] || catColors.general}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${catDot[notice.category] || "bg-white/20"}`} />
                            {getCategoryLabel(notice.category)}
                          </span>
                          {notice.fileUrl && (
                            <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-green-500/15 text-green-400 border border-green-500/20">
                              Attachment
                            </span>
                          )}
                          {!isNoticeActive(notice) && (
                            <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-white/5 text-white/30 border border-white/10">Inactive</span>
                          )}
                        </div>

                        <p className="text-xs text-white/40 leading-relaxed line-clamp-2 mb-4">{notice.description}</p>

                        <div className="flex items-center justify-between pt-3 border-t border-white/5">
                          <div className="flex items-center gap-1 text-xs text-white/20">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            {notice.views || 0}
                          </div>
                          <div className="flex items-center gap-1">
                            {notice.fileUrl && (
                              <button onClick={() => setViewFileModal(notice)}
                                className="px-2.5 py-1.5 text-xs font-medium text-white/30 hover:text-white hover:bg-white/5 rounded-lg transition-all">
                                View File
                              </button>
                            )}
                            <button onClick={() => handleEdit(notice)}
                              className="px-2.5 py-1.5 text-xs font-medium text-green-400/60 hover:text-green-400 hover:bg-green-400/10 rounded-lg transition-all">
                              Edit
                            </button>
                            <button onClick={() => setDeleteConfirm(notice._id)}
                              className="px-2.5 py-1.5 text-xs font-medium text-red-400/50 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all">
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Village QR Modal ── */}
      {showVillageModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#0d2218] border border-white/10 rounded-2xl p-8 max-w-md w-full shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-base font-bold text-white">Generate Village QR</h3>
                <p className="text-xs text-white/30 mt-0.5">Share / download your village QR code</p>
              </div>
              <button onClick={() => setShowVillageModal(false)} className="w-8 h-8 flex items-center justify-center rounded-xl bg-white/5 hover:bg-white/10 text-white/40 hover:text-white transition-all">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            {!officialVillage ? (
              <p className="text-sm text-white/30 text-center py-8">No village linked to your account.</p>
            ) : (
              <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-center justify-between gap-4">
                <div>
                  <p className="font-semibold text-white text-sm">{officialVillage.name}</p>
                  <p className="text-xs text-white/30 mt-0.5">{officialVillage.district}, {officialVillage.state} {officialVillage.pincode}</p>
                  <p className={`text-xs mt-1.5 font-medium ${officialVillage.qrCode?.imageUrl ? "text-green-400" : "text-white/20"}`}>
                    QR generated: {officialVillage.qrCode?.imageUrl ? "Yes" : "No"}
                  </p>
                </div>
                <button onClick={() => generateAndShareVillageQRCode(officialVillage)} disabled={qrLoading}
                  className="flex items-center gap-2 px-4 py-2.5 bg-green-500 hover:bg-green-400 text-white text-sm font-bold rounded-xl transition-all disabled:opacity-40 shadow-lg shadow-green-500/20 flex-shrink-0">
                  {qrLoading ? <><Spinner />Generating...</> : (
                    <><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>Share / Download</>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Delete Modal ── */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#0d2218] border border-white/10 rounded-2xl p-8 max-w-sm w-full shadow-2xl text-center">
            <div className="w-14 h-14 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center justify-center mx-auto mb-5">
              <svg className="w-7 h-7 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="text-base font-bold text-white mb-2">Delete Notice?</h3>
            <p className="text-sm text-white/30 mb-6">This action cannot be undone. The notice will be permanently removed from the system.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(null)}
                className="flex-1 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white/60 text-sm font-semibold rounded-xl transition-all">
                Cancel
              </button>
              <button onClick={() => handleDelete(deleteConfirm)}
                className="flex-1 py-2.5 bg-red-500 hover:bg-red-400 text-white text-sm font-bold rounded-xl transition-all shadow-lg shadow-red-500/20">
                Delete Notice
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── File View Modal ── */}
      {viewFileModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#0d2218] border border-white/10 rounded-2xl w-full max-w-4xl shadow-2xl flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between p-6 border-b border-white/5 flex-shrink-0">
              <div className="flex-1 min-w-0 pr-4">
                <h3 className="text-base font-bold text-white truncate">{viewFileModal.title}</h3>
                <div className="flex gap-2 mt-2">
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${catColors[viewFileModal.category] || catColors.general}`}>
                    {getCategoryLabel(viewFileModal.category)}
                  </span>
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${priConfig[viewFileModal.priority]?.color || "text-white/40"} bg-white/5 border-white/10`}>
                    {getPriorityLabel(viewFileModal.priority)}
                  </span>
                </div>
              </div>
              <button onClick={() => setViewFileModal(null)} className="w-8 h-8 flex items-center justify-center rounded-xl bg-white/5 hover:bg-white/10 text-white/40 hover:text-white transition-all flex-shrink-0">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              <div className="bg-white/5 border border-white/5 rounded-xl p-4 mb-5 text-sm text-white/50 leading-relaxed">
                {viewFileModal.description}
              </div>
              <p className="text-xs font-semibold text-white/20 uppercase tracking-wider mb-4">Attachment</p>
              <div className="bg-white/[0.02] rounded-xl p-4">
                {getFileViewer(viewFileModal.fileUrl)}
              </div>
            </div>
            <div className="flex justify-end p-6 border-t border-white/5 flex-shrink-0">
              <a href={viewFileModal.fileUrl} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-green-500 hover:bg-green-400 text-white text-sm font-bold rounded-xl transition-all shadow-lg shadow-green-500/20">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download File
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}