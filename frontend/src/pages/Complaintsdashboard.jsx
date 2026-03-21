import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";

// ── Constants ──────────────────────────────────────────────────────────────────
const STATUSES = [
  { value: "all",         label: "All" },
  { value: "pending",     label: "Pending" },
  { value: "in-progress", label: "In Progress" },
  { value: "resolved",    label: "Resolved" },
  { value: "rejected",    label: "Rejected" },
];

const STATUS_CFG = {
  pending:      { label: "Pending",     bg: "#fef9c3", color: "#ca8a04",  dot: "#eab308" },
  "in-progress":{ label: "In Progress", bg: "#dbeafe", color: "#1d4ed8",  dot: "#3b82f6" },
  resolved:     { label: "Resolved",    bg: "#dcfce7", color: "#15803d",  dot: "#22c55e" },
  rejected:     { label: "Rejected",    bg: "#fee2e2", color: "#b91c1c",  dot: "#ef4444" },
};

const TYPE_CFG = {
  issue:      { bg: "#fee2e2", color: "#dc2626", label: "Issue" },
  suggestion: { bg: "#e0e7ff", color: "#4338ca", label: "Suggestion" },
};

const G   = "#1a9e5c";
const GL  = "#e8f8f0";
const GM  = "#d1f0e0";

// Convert any Cloudinary URL (including .heic) to a browser-safe JPEG
// by injecting Cloudinary's f_jpg,q_auto transformation.
const cloudinaryJpg = (url) => {
  if (!url) return url;
  // Already has transformations — just ensure format conversion
  if (url.includes("res.cloudinary.com")) {
    // Insert f_jpg,q_auto before the version segment (v123456...)
    return url.replace(
      /\/upload\/(v\d+\/)/,
      "/upload/f_jpg,q_auto/$1"
    ).replace(
      /\/upload\/(?!v\d)/,
      "/upload/f_jpg,q_auto/"
    );
  }
  return url;
};

// ── Helpers ────────────────────────────────────────────────────────────────────
const Spinner = () => (
  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
  </svg>
);

const Badge = ({ cfg, text }) => (
  <span style={{ fontSize: "11px", fontWeight: "700", background: cfg.bg, color: cfg.color, padding: "3px 9px", borderRadius: "50px", whiteSpace: "nowrap" }}>
    {text || cfg.label}
  </span>
);

const StatusDot = ({ status }) => {
  const cfg = STATUS_CFG[status] || STATUS_CFG.pending;
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: "5px", fontSize: "12px", fontWeight: "600", color: cfg.color }}>
      <span style={{ width: "7px", height: "7px", borderRadius: "50%", background: cfg.dot, display: "inline-block" }} />
      {cfg.label}
    </span>
  );
};

const FraudBar = ({ score }) => {
  const color = score > 60 ? "#ef4444" : score > 30 ? "#f59e0b" : G;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
      <div style={{ flex: 1, height: "6px", background: "#f3f4f6", borderRadius: "99px", overflow: "hidden" }}>
        <div style={{ width: `${Math.min(score, 100)}%`, height: "100%", background: color, borderRadius: "99px", transition: "width 0.4s" }} />
      </div>
      <span style={{ fontSize: "11px", fontWeight: "700", color, minWidth: "28px" }}>{score}%</span>
    </div>
  );
};

// ── Main Component ─────────────────────────────────────────────────────────────
export default function ComplaintsDashboard() {
  const [complaints, setComplaints]         = useState([]);
  const [loading, setLoading]               = useState(true);
  const [activeTab, setActiveTab]           = useState("all");
  const [typeFilter, setTypeFilter]         = useState("all");
  const [selected, setSelected]             = useState(null);
  const [resolutionFile, setResolutionFile] = useState(null);
  const [previewUrl, setPreviewUrl]         = useState(null);
  const [resolving, setResolving]           = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [newStatus, setNewStatus]           = useState("");
  const [showResolveForm, setShowResolveForm] = useState(false);
  const [imageModal, setImageModal]         = useState(null);

  const openImage = (url) => {
    if (!url) return;
    setImageModal(cloudinaryJpg(url));
  };

  useEffect(() => { fetchComplaints(); }, []);

  // Create & revoke object URL whenever resolutionFile changes
  useEffect(() => {
    if (!resolutionFile) { setPreviewUrl(null); return; }
    const url = URL.createObjectURL(resolutionFile);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [resolutionFile]);

  // ── Data ──────────────────────────────────────────────────────────────────────
  const fetchComplaints = async () => {
    try {
      setLoading(true);
      const res = await axios.get("http://localhost:3000/complaints", { withCredentials: true });
      setComplaints(Array.isArray(res.data) ? res.data : []);
    } catch { toast.error("Failed to load complaints"); setComplaints([]); }
    finally { setLoading(false); }
  };

  const handleStatusUpdate = async () => {
    if (!selected || !newStatus) return;
    try {
      setUpdatingStatus(true);
      await axios.patch(`http://localhost:3000/complaints/${selected._id}/status`, { status: newStatus }, { withCredentials: true });
      toast.success("Status updated");
      setSelected(prev => ({ ...prev, status: newStatus }));
      setComplaints(prev => prev.map(c => c._id === selected._id ? { ...c, status: newStatus } : c));
      setNewStatus("");
    } catch (err) { toast.error(err.response?.data?.message || "Failed to update status"); }
    finally { setUpdatingStatus(false); }
  };

  const handleResolve = async () => {
    if (!selected || !resolutionFile) { toast.error("Please attach a resolution photo"); return; }
    try {
      setResolving(true);
      const fd = new FormData();
      fd.append("image", resolutionFile);
      const res = await axios.patch(`http://localhost:3000/complaints/${selected._id}/resolve`, fd, { headers: { "Content-Type": "multipart/form-data" }, withCredentials: true });
      toast.success("Complaint marked as resolved");
      const updated = res.data;
      setSelected(updated);
      setComplaints(prev => prev.map(c => c._id === updated._id ? updated : c));
      setResolutionFile(null);
      setShowResolveForm(false);
    } catch (err) { toast.error(err.response?.data?.message || "Failed to resolve complaint"); }
    finally { setResolving(false); }
  };

  // ── Derived ───────────────────────────────────────────────────────────────────
  const stats = {
    total:      complaints.length,
    pending:    complaints.filter(c => c.status === "pending").length,
    inProgress: complaints.filter(c => c.status === "in-progress").length,
    resolved:   complaints.filter(c => c.status === "resolved").length,
    rejected:   complaints.filter(c => c.status === "rejected").length,
  };

  const filtered = complaints.filter(c => {
    const tabMatch  = activeTab === "all" || c.status === activeTab;
    const typeMatch = typeFilter === "all" || c.type === typeFilter;
    return tabMatch && typeMatch;
  });

  const inputCls = {
    width: "100%", padding: "10px 14px", border: "1.5px solid #e5e7eb",
    borderRadius: "10px", fontSize: "14px", color: "#111827",
    background: "#f9fafb", outline: "none", boxSizing: "border-box",
    fontFamily: "inherit", transition: "border-color 0.2s, background 0.2s",
  };

  // ── Render ────────────────────────────────────────────────────────────────────
  return (
    <div style={{ minHeight: "100vh", background: "#f5f7f5", fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>

      {/* ── Stat cards ── */}
      <div style={{ maxWidth: "1180px", margin: "0 auto", padding: "32px 24px 0" }}>
        <div style={{ marginBottom: "28px" }}>
          <h1 style={{ fontSize: "26px", fontWeight: "800", color: "#111827" }}>Complaints</h1>
          <p style={{ fontSize: "14px", color: "#6b7280", marginTop: "2px" }}>Review, track and resolve citizen complaints</p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: "14px", marginBottom: "28px" }}>
          {[
            { label: "Total",       value: stats.total,      bg: GL,        accent: G,         icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" },
            { label: "Pending",     value: stats.pending,    bg: "#fef9c3", accent: "#ca8a04", icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" },
            { label: "In Progress", value: stats.inProgress, bg: "#dbeafe", accent: "#2563eb", icon: "M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" },
            { label: "Resolved",    value: stats.resolved,   bg: "#dcfce7", accent: "#15803d", icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" },
            { label: "Rejected",    value: stats.rejected,   bg: "#fee2e2", accent: "#dc2626", icon: "M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" },
          ].map(s => (
            <div key={s.label} style={{ background: "#fff", borderRadius: "16px", padding: "18px 20px", border: "1px solid #f0f0f0", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
              <div style={{ width: "38px", height: "38px", borderRadius: "10px", background: s.bg, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "12px" }}>
                <svg style={{ width: "18px", height: "18px", color: s.accent }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={s.icon} />
                </svg>
              </div>
              <p style={{ fontSize: "28px", fontWeight: "800", color: "#111827", lineHeight: 1 }}>{s.value}</p>
              <p style={{ fontSize: "12px", color: "#9ca3af", marginTop: "3px" }}>{s.label}</p>
            </div>
          ))}
        </div>

        {/* ── Main grid ── */}
        <div style={{ display: "grid", gridTemplateColumns: selected ? "1fr 420px" : "1fr", gap: "20px", alignItems: "start" }}>

          {/* ── Complaints list ── */}
          <div style={{ background: "#fff", borderRadius: "20px", border: "1px solid #f0f0f0", boxShadow: "0 1px 4px rgba(0,0,0,0.04)", overflow: "hidden" }}>

            {/* Toolbar */}
            <div style={{ padding: "16px 20px", borderBottom: "1px solid #f3f4f6", display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
              {/* Status tabs */}
              <div style={{ display: "flex", background: "#f3f4f6", borderRadius: "12px", padding: "4px", gap: "2px" }}>
                {STATUSES.map(tab => (
                  <button key={tab.value} onClick={() => setActiveTab(tab.value)}
                    style={{
                      padding: "7px 13px", borderRadius: "9px", border: "none", cursor: "pointer",
                      fontSize: "12px", fontWeight: "600",
                      background: activeTab === tab.value ? "#fff" : "transparent",
                      color: activeTab === tab.value ? "#111827" : "#9ca3af",
                      boxShadow: activeTab === tab.value ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
                    }}>
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Type filter */}
              <div style={{ display: "flex", background: "#f3f4f6", borderRadius: "12px", padding: "4px", gap: "2px" }}>
                {["all","issue","suggestion"].map(t => (
                  <button key={t} onClick={() => setTypeFilter(t)}
                    style={{
                      padding: "7px 12px", borderRadius: "9px", border: "none", cursor: "pointer",
                      fontSize: "12px", fontWeight: "600", textTransform: "capitalize",
                      background: typeFilter === t ? "#fff" : "transparent",
                      color: typeFilter === t ? "#111827" : "#9ca3af",
                      boxShadow: typeFilter === t ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
                    }}>
                    {t === "all" ? "All Types" : t.charAt(0).toUpperCase() + t.slice(1)}
                  </button>
                ))}
              </div>

              <span style={{ marginLeft: "auto", fontSize: "12px", color: "#9ca3af" }}>{filtered.length} complaints</span>
            </div>

            {/* List */}
            <div style={{ maxHeight: "600px", overflowY: "auto" }}>
              {loading ? (
                <div style={{ display: "flex", justifyContent: "center", alignItems: "center", padding: "60px", gap: "10px", color: "#9ca3af", fontSize: "14px" }}>
                  <Spinner /> Loading...
                </div>
              ) : filtered.length === 0 ? (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "60px 20px", gap: "10px" }}>
                  <div style={{ width: "56px", height: "56px", borderRadius: "16px", background: GL, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <svg style={{ width: "26px", height: "26px", color: G }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <p style={{ fontSize: "15px", fontWeight: "700", color: "#374151" }}>No complaints found</p>
                  <p style={{ fontSize: "13px", color: "#9ca3af" }}>Try changing your filters</p>
                </div>
              ) : (
                <div style={{ padding: "12px 16px", display: "flex", flexDirection: "column", gap: "8px" }}>
                  {filtered.map(c => {
                    const statusCfg = STATUS_CFG[c.status] || STATUS_CFG.pending;
                    const typeCfg   = TYPE_CFG[c.type]     || TYPE_CFG.issue;
                    const isSelected = selected?._id === c._id;
                    const fraudScore = c.aiVerification?.fraudScore ?? 0;
                    return (
                      <div key={c._id} onClick={() => { setSelected(c); setNewStatus(c.status); setShowResolveForm(false); setResolutionFile(null); setPreviewUrl(null); }}
                        style={{
                          border: `1.5px solid ${isSelected ? G : "#f0f0f0"}`,
                          borderRadius: "14px", padding: "14px 16px",
                          background: isSelected ? GL : "#fafafa",
                          cursor: "pointer", transition: "all 0.15s",
                        }}
                        onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = "#f5f5f5"; }}
                        onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = "#fafafa"; }}>

                        <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
                          {/* Image thumb */}
                          {c.imageUrl ? (
                            <img src={cloudinaryJpg(c.imageUrl)} alt="" onClick={e => { e.stopPropagation(); openImage(c.imageUrl); }}
                              style={{ width: "52px", height: "52px", borderRadius: "10px", objectFit: "cover", flexShrink: 0, border: "1.5px solid #e5e7eb", cursor: "zoom-in" }} />
                          ) : (
                            <div style={{ width: "52px", height: "52px", borderRadius: "10px", background: "#f3f4f6", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                              <svg style={{ width: "22px", height: "22px", color: "#d1d5db" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                            </div>
                          )}

                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "5px", flexWrap: "wrap" }}>
                              <Badge cfg={typeCfg} />
                              <Badge cfg={statusCfg} />
                              {fraudScore > 60 && <Badge cfg={{ bg: "#fee2e2", color: "#dc2626" }} text="High Risk" />}
                              {fraudScore > 30 && fraudScore <= 60 && <Badge cfg={{ bg: "#fef9c3", color: "#ca8a04" }} text="Verify" />}
                            </div>
                            <p style={{ fontSize: "14px", fontWeight: "700", color: "#111827", marginBottom: "2px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                              {c.title}
                            </p>
                            <p style={{ fontSize: "12px", color: "#6b7280", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                              {c.description}
                            </p>
                            <p style={{ fontSize: "11px", color: "#9ca3af", marginTop: "5px" }}>
                              {new Date(c.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                              {c.location && <> &nbsp;·&nbsp; {c.location.lat?.toFixed(4)}, {c.location.lng?.toFixed(4)}</>}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* ── Detail / Action panel ── */}
          {selected && (
            <div style={{ display: "flex", flexDirection: "column", gap: "16px", position: "sticky", top: "20px" }}>

              {/* Header card */}
              <div style={{ background: "#fff", borderRadius: "20px", border: "1px solid #f0f0f0", boxShadow: "0 1px 4px rgba(0,0,0,0.04)", overflow: "hidden" }}>
                <div style={{ padding: "16px 20px", borderBottom: "1px solid #f3f4f6", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <p style={{ fontSize: "15px", fontWeight: "700", color: "#111827" }}>Complaint Detail</p>
                  <button onClick={() => setSelected(null)}
                    style={{ width: "28px", height: "28px", borderRadius: "50%", background: "#f3f4f6", border: "none", cursor: "pointer", fontSize: "15px", color: "#6b7280" }}>
                    ×
                  </button>
                </div>

                <div style={{ padding: "18px 20px", display: "flex", flexDirection: "column", gap: "14px" }}>
                  {/* Badges */}
                  <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                    <Badge cfg={TYPE_CFG[selected.type] || TYPE_CFG.issue} />
                    <Badge cfg={STATUS_CFG[selected.status] || STATUS_CFG.pending} />
                  </div>

                  <div>
                    <p style={{ fontSize: "16px", fontWeight: "800", color: "#111827", marginBottom: "4px" }}>{selected.title}</p>
                    <p style={{ fontSize: "13px", color: "#6b7280", lineHeight: "1.6" }}>{selected.description}</p>
                  </div>

                  {/* Complaint photo */}
                  {selected.imageUrl && (
                    <div>
                      <p style={{ fontSize: "11px", fontWeight: "600", color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "8px" }}>Complaint Photo</p>
                      <img src={cloudinaryJpg(selected.imageUrl)} alt="Complaint" onClick={() => openImage(selected.imageUrl)}
                        style={{ width: "100%", borderRadius: "12px", objectFit: "cover", maxHeight: "180px", cursor: "zoom-in", border: "1.5px solid #e5e7eb" }} />
                    </div>
                  )}

                  {/* Location */}
                  {selected.location?.lat && (
                    <div style={{ background: "#f9fafb", borderRadius: "10px", padding: "10px 14px" }}>
                      <p style={{ fontSize: "11px", fontWeight: "600", color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "4px" }}>Location</p>
                      <p style={{ fontSize: "13px", color: "#374151", fontWeight: "500" }}>
                        {selected.location.lat.toFixed(6)}, {selected.location.lng.toFixed(6)}
                      </p>
                      <a href={`https://maps.google.com/?q=${selected.location.lat},${selected.location.lng}`} target="_blank" rel="noopener noreferrer"
                        style={{ fontSize: "12px", color: G, fontWeight: "600", textDecoration: "none", marginTop: "4px", display: "inline-block" }}>
                        Open in Maps →
                      </a>
                    </div>
                  )}

                  {/* Submitted on */}
                  <p style={{ fontSize: "12px", color: "#9ca3af" }}>
                    Submitted on {new Date(selected.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
                  </p>
                </div>
              </div>

              {/* AI Verification card */}
              {selected.aiVerification && (
                <div style={{ background: "#fff", borderRadius: "20px", border: "1px solid #f0f0f0", boxShadow: "0 1px 4px rgba(0,0,0,0.04)", padding: "18px 20px" }}>
                  <p style={{ fontSize: "13px", fontWeight: "700", color: "#111827", marginBottom: "14px" }}>AI Verification</p>

                  <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    {/* Valid issue */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: "12px", color: "#6b7280" }}>Valid Issue</span>
                      <span style={{ fontSize: "12px", fontWeight: "700", color: selected.aiVerification.isValidIssue ? G : "#ef4444" }}>
                        {selected.aiVerification.isValidIssue ? "Yes" : "No"}
                      </span>
                    </div>

                    {/* Fraud score */}
                    <div>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "5px" }}>
                        <span style={{ fontSize: "12px", color: "#6b7280" }}>Fraud Score</span>
                      </div>
                      <FraudBar score={selected.aiVerification.fraudScore ?? 0} />
                    </div>

                    {/* Remarks */}
                    <div style={{ background: "#f9fafb", borderRadius: "8px", padding: "8px 12px" }}>
                      <p style={{ fontSize: "12px", color: "#374151", fontWeight: "500" }}>{selected.aiVerification.remarks}</p>
                    </div>

                    {/* Detected labels */}
                    {selected.aiVerification.labels?.length > 0 && (
                      <div>
                        <p style={{ fontSize: "11px", color: "#9ca3af", marginBottom: "6px" }}>Detected Labels</p>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
                          {selected.aiVerification.labels.slice(0, 8).map((l, i) => (
                            <span key={i} style={{ fontSize: "10px", background: "#f3f4f6", color: "#6b7280", padding: "2px 7px", borderRadius: "50px" }}>{l}</span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Resolution verification card */}
              {selected.resolutionVerification && (
                <div style={{ background: "#fff", borderRadius: "20px", border: "1px solid #f0f0f0", boxShadow: "0 1px 4px rgba(0,0,0,0.04)", padding: "18px 20px" }}>
                  <p style={{ fontSize: "13px", fontWeight: "700", color: "#111827", marginBottom: "14px" }}>Resolution Verification</p>
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: "12px", color: "#6b7280" }}>Score</span>
                      <span style={{ fontSize: "14px", fontWeight: "800", color: selected.resolutionVerification.score >= 70 ? G : "#ef4444" }}>
                        {selected.resolutionVerification.score}/100
                      </span>
                    </div>
                    <div style={{ background: "#f9fafb", borderRadius: "8px", padding: "8px 12px" }}>
                      <p style={{ fontSize: "12px", color: "#374151", fontWeight: "500" }}>{selected.resolutionVerification.remarks}</p>
                    </div>
                    {selected.resolvedImageUrl && (
                      <div>
                        <p style={{ fontSize: "11px", fontWeight: "600", color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "6px" }}>After Photo</p>
                        <img src={cloudinaryJpg(selected.resolvedImageUrl)} alt="Resolved" onClick={() => openImage(selected.resolvedImageUrl)}
                          style={{ width: "100%", borderRadius: "10px", objectFit: "cover", maxHeight: "140px", cursor: "zoom-in", border: "1.5px solid #e5e7eb" }} />
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Action card */}
              {selected.status !== "resolved" && (
                <div style={{ background: "#fff", borderRadius: "20px", border: "1px solid #f0f0f0", boxShadow: "0 1px 4px rgba(0,0,0,0.04)", padding: "18px 20px" }}>
                  <p style={{ fontSize: "13px", fontWeight: "700", color: "#111827", marginBottom: "14px" }}>Update Status</p>

                  <div style={{ display: "flex", gap: "8px", marginBottom: "12px" }}>
                    <select value={newStatus} onChange={e => setNewStatus(e.target.value)}
                      style={{ ...inputCls, flex: 1 }}
                      onFocus={e => { e.target.style.borderColor = G; e.target.style.background = "#fff"; }}
                      onBlur={e => { e.target.style.borderColor = "#e5e7eb"; e.target.style.background = "#f9fafb"; }}>
                      {["pending","in-progress","rejected"].map(s => (
                        <option key={s} value={s}>{STATUS_CFG[s]?.label || s}</option>
                      ))}
                    </select>
                    <button onClick={handleStatusUpdate} disabled={updatingStatus || newStatus === selected.status}
                      style={{
                        padding: "10px 16px", background: (updatingStatus || newStatus === selected.status) ? "#d1d5db" : G,
                        color: "#fff", border: "none", borderRadius: "10px", fontSize: "13px", fontWeight: "600",
                        cursor: (updatingStatus || newStatus === selected.status) ? "not-allowed" : "pointer",
                        display: "flex", alignItems: "center", gap: "6px", whiteSpace: "nowrap",
                        boxShadow: (updatingStatus || newStatus === selected.status) ? "none" : "0 3px 10px rgba(26,158,92,0.25)",
                      }}>
                      {updatingStatus ? <Spinner /> : null} Save
                    </button>
                  </div>

                  {/* Resolve section */}
                  {selected.type === "issue" && (
                    <>
                      <div style={{ borderTop: "1px solid #f3f4f6", paddingTop: "12px" }}>
                        <button onClick={() => setShowResolveForm(!showResolveForm)}
                          style={{ width: "100%", padding: "11px", background: showResolveForm ? "#f3f4f6" : GL, border: `1.5px solid ${showResolveForm ? "#e5e7eb" : GM}`, borderRadius: "10px", color: showResolveForm ? "#374151" : G, fontSize: "13px", fontWeight: "700", cursor: "pointer" }}>
                          {showResolveForm ? "Cancel Resolution" : "Mark as Resolved"}
                        </button>
                      </div>

                      {showResolveForm && (
                        <div style={{ marginTop: "12px", display: "flex", flexDirection: "column", gap: "10px" }}>
                          <p style={{ fontSize: "12px", color: "#6b7280" }}>Upload a photo proving the issue is fixed. The AI will verify it.</p>

                          <label style={{
                            display: "flex", alignItems: "center", gap: "10px", padding: "12px 14px",
                            background: "#f9fafb", border: "1.5px dashed #d1d5db", borderRadius: "10px",
                            cursor: "pointer", transition: "all 0.15s"
                          }}
                            onMouseEnter={e => { e.currentTarget.style.background = GL; e.currentTarget.style.borderColor = G; }}
                            onMouseLeave={e => { e.currentTarget.style.background = "#f9fafb"; e.currentTarget.style.borderColor = "#d1d5db"; }}>
                            <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: GL, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                              <svg style={{ width: "16px", height: "16px", color: G }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                              </svg>
                            </div>
                            <div>
                              <p style={{ fontSize: "13px", fontWeight: "600", color: "#374151" }}>
                                {resolutionFile ? resolutionFile.name : "Attach resolution photo"}
                              </p>
                              <p style={{ fontSize: "11px", color: "#9ca3af" }}>JPG or PNG, max 5MB</p>
                            </div>
                            <input type="file" onChange={e => setResolutionFile(e.target.files[0] || null)} style={{ display: "none" }} accept=".jpg,.jpeg,.png" />
                          </label>

                          {/* Preview */}
                          {previewUrl && (
                            <img src={previewUrl} alt="Preview"
                              style={{ width: "100%", borderRadius: "10px", objectFit: "cover", maxHeight: "130px", border: "1.5px solid #e5e7eb" }} />
                          )}

                          <button onClick={handleResolve} disabled={resolving || !resolutionFile}
                            style={{
                              width: "100%", padding: "12px", background: (resolving || !resolutionFile) ? "#d1d5db" : G,
                              color: "#fff", border: "none", borderRadius: "10px", fontSize: "14px", fontWeight: "700",
                              cursor: (resolving || !resolutionFile) ? "not-allowed" : "pointer",
                              display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
                              boxShadow: (resolving || !resolutionFile) ? "none" : "0 4px 14px rgba(26,158,92,0.3)",
                            }}>
                            {resolving ? <><Spinner /> Verifying with AI...</> : "Submit Resolution"}
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}

              {/* Already resolved card */}
              {selected.status === "resolved" && (
                <div style={{ background: GL, borderRadius: "16px", border: `1.5px solid ${GM}`, padding: "16px 20px", display: "flex", alignItems: "center", gap: "12px" }}>
                  <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: G, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <svg style={{ width: "18px", height: "18px", color: "#fff" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <p style={{ fontSize: "14px", fontWeight: "700", color: "#14532d" }}>Resolved</p>
                    <p style={{ fontSize: "12px", color: "#166534" }}>This complaint has been resolved</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div style={{ height: "40px" }} />
      </div>

      {/* ── Image zoom modal ── */}
      {imageModal && (
        <div
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", zIndex: 9999, padding: "20px" }}
          onClick={() => setImageModal(null)}>
          {/* Close + open-in-tab bar */}
          <div onClick={e => e.stopPropagation()}
            style={{ display: "flex", gap: "10px", marginBottom: "14px", alignItems: "center" }}>
            <a href={imageModal} target="_blank" rel="noopener noreferrer"
              style={{ padding: "8px 18px", background: "#fff", color: "#111827", fontSize: "13px", fontWeight: "600", borderRadius: "8px", textDecoration: "none", display: "flex", alignItems: "center", gap: "6px" }}>
              <svg style={{ width: "14px", height: "14px" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              Open in new tab
            </a>
            <button onClick={() => setImageModal(null)}
              style={{ padding: "8px 14px", background: "rgba(255,255,255,0.15)", border: "none", color: "#fff", fontSize: "13px", fontWeight: "600", borderRadius: "8px", cursor: "pointer" }}>
              Close ×
            </button>
          </div>
          <img
            src={cloudinaryJpg(imageModal)}
            alt="Full view"
            onClick={e => e.stopPropagation()}
            onError={e => { e.target.style.display = "none"; }}
            style={{ maxWidth: "90vw", maxHeight: "80vh", objectFit: "contain", borderRadius: "12px", boxShadow: "0 20px 60px rgba(0,0,0,0.5)", display: "block" }}
          />
          <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "12px", marginTop: "12px" }}>Click outside to close</p>
        </div>
      )}
    </div>
  );
}