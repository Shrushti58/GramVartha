import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import * as api from '../services/api';

/* ─── Icons ─── */
const Icons = {
  home:    <svg fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
  users:   <svg fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>,
  clock:   <svg fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
  doc:     <svg fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>,
  qr:      <svg fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><path d="M14 14h3v3h-3zM17 17h3v3h-3zM14 20h3"/></svg>,
  logout:  <svg fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/></svg>,
  check:   <svg fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>,
  x:       <svg fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  trash:   <svg fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6M14 11v6M9 6V4h6v2"/></svg>,
  edit:    <svg fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
  plus:    <svg fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  chevron: <svg fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"/></svg>,
  upload:  <svg fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/><path d="M20.39 18.39A5 5 0 0018 9h-1.26A8 8 0 103 16.3"/></svg>,
  link:    <svg fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/></svg>,
  share:   <svg fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>,
};

function Ico({ name, cls = 'w-4 h-4' }) {
  return <span className={`${cls} inline-flex items-center justify-center flex-shrink-0`}>{Icons[name]}</span>;
}

/* ─── Avatar ─── */
function Avatar({ name = '', img, size = 'md' }) {
  const sz = { sm: 'w-8 h-8 text-[11px]', md: 'w-10 h-10 text-sm', lg: 'w-16 h-16 text-xl' }[size];
  const letters = name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || '?';
  if (img) return <img src={img} alt={name} className={`${sz} rounded-xl object-cover flex-shrink-0 border-2 border-white shadow-sm`} />;
  return (
    <div className={`${sz} rounded-xl bg-[#1a3a2a] flex items-center justify-center flex-shrink-0 font-bold text-white/90 border-2 border-white shadow-sm`}>
      {letters}
    </div>
  );
}

/* ─── Modal ─── */
function Modal({ children, onClose, wide }) {
  useEffect(() => {
    const h = e => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [onClose]);
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative z-10 bg-white w-full ${wide ? 'max-w-2xl' : 'max-w-md'} rounded-2xl shadow-2xl overflow-hidden`}>
        <div className="max-h-[90vh] overflow-y-auto">
          {/* Modal top bar — same dark green as register page header */}
          <div className="bg-[#1a3a2a] px-6 py-4 flex items-center justify-between">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <button onClick={onClose}
              className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/70 hover:text-white transition-all">
              <Ico name="x" cls="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="p-6 sm:p-8">{children}</div>
        </div>
      </div>
    </div>
  );
}

/* ─── Input style — identical to OfficialRegister ─── */
const inp = "w-full px-4 py-3.5 rounded-xl border border-gray-200 bg-white text-sm text-gray-900 placeholder-gray-300 outline-none transition-all duration-200 focus:border-green-500 focus:ring-4 focus:ring-green-500/10 hover:border-gray-300";

/* ─── Status badge ─── */
function Badge({ status }) {
  const map = {
    approved: 'bg-green-50 text-green-700 border border-green-200',
    pending:  'bg-amber-50 text-amber-700 border border-amber-200',
    rejected: 'bg-red-50 text-red-600 border border-red-200',
  };
  return <span className={`inline-flex text-xs font-semibold px-2.5 py-0.5 rounded-full ${map[status] || map.pending}`}>{status}</span>;
}

/* ─── Empty state ─── */
function Empty({ title, sub, children }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
      <div className="w-12 h-12 rounded-2xl bg-green-50 border border-green-100 flex items-center justify-center mb-1">
        <Ico name="check" cls="w-5 h-5 text-green-500" />
      </div>
      <p className="text-sm font-semibold text-gray-700">{title}</p>
      <p className="text-xs text-gray-400">{sub}</p>
      {children}
    </div>
  );
}

/* ══════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════ */
export default function VillageAdminDashboard() {
  const [adminData, setAdminData]         = useState(null);
  const [pending, setPending]             = useState([]);
  const [officials, setOfficials]         = useState([]);
  const [notices, setNotices]             = useState([]);
  const [tab, setTab]                     = useState('overview');
  const [loading, setLoading]             = useState(true);
  const [villageId, setVillageId]         = useState(null);
  const [qrData, setQrData]               = useState(null);

  const [officialModal, setOfficialModal] = useState(null);
  const [noticeModal, setNoticeModal]     = useState(null);
  const [noticeForm, setNoticeForm]       = useState(null); // null | 'new' | notice
  const [qrModal, setQrModal]            = useState(false);
  const [saving, setSaving]               = useState(false);
  const [form, setForm]                   = useState({ title: '', description: '', category: 'general', priority: 'medium', status: 'published', isPinned: false });
  const [file, setFile]                   = useState(null);

  const navigate = useNavigate();

  function formatRelativeTime(dateStr) {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    const diffSec = Math.floor((Date.now() - d.getTime()) / 1000);
    if (diffSec < 5) return 'just now';
    if (diffSec < 60) return `${diffSec} sec ago`;
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin} min ago`;
    const diffHr = Math.floor(diffMin / 60);
    if (diffHr < 24) return `${diffHr} hr ago`;
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  }

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    try {
      const ar = await api.getAdminProfile();
      setAdminData(ar.data);
      const vid = ar.data?.village?._id || ar.data?.village;
      setVillageId(vid);
      const [pr, or] = await Promise.all([api.getPendingOfficials(), api.getAllOfficials()]);
      setPending(pr.data);
      setOfficials(or.data);
      if (vid) {
        const nr = await api.getNoticesByVillage(vid);
        setNotices(nr.data?.notices || []);
        try { const qr = await api.getVillageQRCode(vid); setQrData(qr.data.village.qrCode || null); } catch {}
      }
    } catch { toast.error('Failed to load dashboard'); }
    finally { setLoading(false); }
  }

  async function approve(id) {
    try {
      await api.approveOfficial(id);
      const obj = pending.find(o => o._id === id);
      setPending(p => p.filter(o => o._id !== id));
      setOfficials(o => o.some(x => x._id === id)
        ? o.map(x => x._id === id ? { ...x, status: 'approved' } : x)
        : [...o, { ...obj, status: 'approved' }]);
      setOfficialModal(null);
      toast.success('Official approved ✓');
    } catch { toast.error('Failed to approve'); }
  }

  async function reject(id) {
    try {
      await api.rejectOfficial(id);
      setPending(p => p.filter(o => o._id !== id));
      setOfficials(o => o.filter(x => x._id !== id));
      setOfficialModal(null);
      toast.success('Official rejected');
    } catch { toast.error('Failed to reject'); }
  }

  async function delOfficial(id) {
    if (!confirm('Remove this official?')) return;
    try {
      await api.deleteOfficial(id);
      setOfficials(o => o.filter(x => x._id !== id));
      setOfficialModal(null);
      toast.success('Removed');
    } catch { toast.error('Failed'); }
  }

  async function delNotice(id) {
    if (!confirm('Delete this notice?')) return;
    try {
      await api.deleteNotice(id);
      setNotices(n => n.filter(x => x._id !== id));
      setNoticeModal(null);
      toast.success('Notice deleted');
    } catch { toast.error('Failed'); }
  }

  async function submitNotice(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      if (file) fd.append('file', file);
      if (noticeForm === 'new') {
        const res = await api.uploadNotice(fd);
        setNotices(n => [res.data, ...n]);
        toast.success('Notice published ✓');
      } else {
        await api.updateNotice(noticeForm._id, fd);
        setNotices(n => n.map(x => x._id === noticeForm._id ? { ...x, ...form, updatedAt: new Date().toISOString() } : x));
        toast.success('Notice updated ✓');
      }
      setNoticeForm(null);
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setSaving(false); }
  }

  function openNew() { setForm({ title: '', description: '', category: 'general', priority: 'medium', status: 'published', isPinned: false }); setFile(null); setNoticeForm('new'); }
  function openEdit(n) { setForm({ title: n.title || '', description: n.description || n.summary || '', category: n.category || 'general', priority: n.priority || 'medium', status: n.status || 'published', isPinned: !!n.isPinned }); setFile(null); setNoticeModal(null); setNoticeForm(n); }

  async function generateQr() {
    try { const r = await api.generateVillageQRCode(villageId); setQrData(r.data.village.qrCode); toast.success('QR generated'); }
    catch { toast.error('Failed to generate QR'); }
  }
  async function shareQr() {
    const url = qrData?.imageUrl; if (!url) return;
    try {
      if (navigator.share) await navigator.share({ title: 'Village QR', url });
      else { await navigator.clipboard.writeText(url); toast.success('Link copied'); }
    } catch {}
  }

  async function logout() { try { await api.adminLogout(); navigate('/'); } catch {} }

  const village = adminData?.village;
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  /* ── Tab definitions ── */
  const TABS = [
    { key: 'overview',  label: 'Overview',  icon: 'home'  },
    { key: 'pending',   label: 'Pending',   icon: 'clock', badge: pending.length },
    { key: 'officials', label: 'Officials', icon: 'users', badge: officials.length },
    { key: 'notices',   label: 'Notices',   icon: 'doc',   badge: notices.length },
  ];

  if (loading) return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-[#1a3a2a] flex items-center justify-center shadow-lg">
          <svg className="animate-spin w-6 h-6 text-white" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
          </svg>
        </div>
        <p className="text-sm text-gray-400 font-medium">Loading dashboard...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">

      {/* ══════ HEADER — same dark green as register left panel ══════ */}
      <header className="bg-[#1a3a2a] sticky top-0 z-30 flex-shrink-0">
        {/* subtle grid overlay — identical to register page */}
        <div className="absolute inset-0 opacity-[0.04] pointer-events-none"
          style={{ backgroundImage: `linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)`, backgroundSize: '40px 40px' }} />

        <div className="relative max-w-7xl mx-auto px-5 sm:px-8 h-16 flex items-center justify-between gap-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 flex-shrink-0">
            <div className="w-8 h-8 rounded-xl bg-white/10 border border-white/20 backdrop-blur-sm flex items-center justify-center">
              <img src="/gramvarthalogo.png" alt="" className="w-full h-full object-contain" />
            </div>
            <div className="hidden sm:block">
              <p className="text-sm font-bold text-white leading-none tracking-tight">GramVartha</p>
              <p className="text-xs text-white/40 mt-0.5">{village?.name || 'Admin Portal'}</p>
            </div>
          </Link>

          {/* Center tabs (desktop) */}
          <nav className="hidden md:flex items-center gap-1 bg-white/8 rounded-xl p-1">
            {TABS.map(t => (
              <button key={t.key} onClick={() => setTab(t.key)}
                className={`relative flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${
                  tab === t.key ? 'bg-white text-[#1a3a2a] shadow-sm' : 'text-white/60 hover:text-white hover:bg-white/10'
                }`}>
                <Ico name={t.icon} cls="w-3.5 h-3.5" />
                {t.label}
                {t.badge > 0 && (
                  <span className={`text-[10px] font-bold min-w-[16px] h-4 px-1 flex items-center justify-center rounded-full ${
                    tab === t.key ? 'bg-[#1a3a2a] text-white' : 'bg-green-400/30 text-white'
                  }`}>{t.badge > 99 ? '99+' : t.badge}</span>
                )}
              </button>
            ))}
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-2">
            <button onClick={() => setQrModal(true)}
              className="flex items-center gap-2 px-3 py-2 rounded-xl border border-white/20 hover:bg-white/10 text-white/60 hover:text-white text-xs font-medium transition-all">
              <Ico name="qr" cls="w-4 h-4" />
              <span className="hidden sm:block">QR Code</span>
            </button>
            <button onClick={logout}
              className="flex items-center gap-2 px-3 py-2 rounded-xl border border-white/20 hover:bg-white/10 text-white/60 hover:text-white text-xs font-medium transition-all">
              <Ico name="logout" cls="w-4 h-4" />
              <span className="hidden sm:block">Logout</span>
            </button>
          </div>
        </div>

        {/* Mobile tab bar inside header */}
        <div className="md:hidden relative border-t border-white/10 flex">
          {TABS.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`flex-1 flex flex-col items-center gap-1 py-2.5 relative transition-all text-xs font-medium ${
                tab === t.key ? 'text-white' : 'text-white/40'
              }`}>
              <Ico name={t.icon} cls="w-4 h-4" />
              {t.label}
              {tab === t.key && <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-green-400 rounded-full" />}
              {t.badge > 0 && <span className="absolute top-1.5 right-1/4 w-3.5 h-3.5 bg-amber-400 text-white text-[9px] font-bold rounded-full flex items-center justify-center">{t.badge}</span>}
            </button>
          ))}
        </div>
      </header>

      {/* ══════ MAIN CONTENT ══════ */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-5 sm:px-8 py-8 space-y-6">

        {/* ─── OVERVIEW ─── */}
        {tab === 'overview' && <>

          {/* Hero card — dark green like register's left panel */}
          <div className="relative rounded-2xl overflow-hidden bg-[#1a3a2a] p-7">
            <div className="absolute inset-0 opacity-[0.04] pointer-events-none"
              style={{ backgroundImage: `linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)`, backgroundSize: '40px 40px' }} />
            <div className="absolute top-1/4 -right-16 w-56 h-56 bg-green-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="relative z-10 flex items-start justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-2 bg-white/10 border border-white/15 rounded-full px-3 py-1 mb-4">
                  <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                  <span className="text-xs text-white/70 font-medium">Village Admin Portal</span>
                </div>
                <p className="text-white/60 text-sm mb-1">{greeting}</p>
                <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                  {adminData?.name?.split(' ')[0] || 'Admin'} 👋
                </h1>
                {village && (
                  <p className="text-white/50 text-sm mt-2 flex items-center gap-1.5">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                    {village.name}{village.district ? `, ${village.district}` : ''}
                  </p>
                )}
              </div>
              {pending.length > 0 && (
                <button onClick={() => setTab('pending')}
                  className="flex-shrink-0 bg-amber-400 hover:bg-amber-500 text-amber-900 rounded-2xl px-5 py-3 text-center transition-all shadow-lg">
                  <p className="text-2xl font-bold leading-none">{pending.length}</p>
                  <p className="text-xs font-semibold mt-0.5">pending</p>
                </button>
              )}
            </div>
          </div>

          {/* Stat cards — white with green border, matching register inputs */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {[
              { label: 'Total Officials', val: officials.length, icon: 'users', tab: 'officials' },
              { label: 'Pending Review', val: pending.length, icon: 'clock', tab: 'pending', warn: pending.length > 0 },
              { label: 'Active Notices', val: notices.length, icon: 'doc', tab: 'notices' },
              { label: 'Approved', val: officials.filter(o => o.status === 'approved').length, icon: 'check', tab: 'officials' },
            ].map(s => (
              <button key={s.label} onClick={() => setTab(s.tab)}
                className={`bg-white rounded-2xl border transition-all duration-200 p-5 text-left hover:shadow-md hover:-translate-y-0.5 ${
                  s.warn ? 'border-amber-200 hover:border-amber-300' : 'border-gray-200 hover:border-green-300'
                }`}>
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${s.warn ? 'bg-amber-50' : 'bg-green-50'}`}>
                  <Ico name={s.icon} cls={`w-4 h-4 ${s.warn ? 'text-amber-500' : 'text-[#1a3a2a]'}`} />
                </div>
                <p className={`text-3xl font-bold ${s.warn ? 'text-amber-500' : 'text-gray-900'}`}>{s.val}</p>
                <p className="text-xs text-gray-400 mt-1 font-medium">{s.label}</p>
              </button>
            ))}
          </div>

          {/* Pending strip */}
          {pending.length > 0 && (
            <div className="bg-white rounded-2xl border border-amber-200 overflow-hidden">
              <div className="flex items-center justify-between px-5 py-3.5 border-b border-amber-100 bg-amber-50/60">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-amber-400 rounded-full animate-pulse" />
                  <p className="text-sm font-semibold text-gray-800">Needs your approval</p>
                </div>
                <button onClick={() => setTab('pending')} className="text-xs font-semibold text-[#1a3a2a] hover:underline">
                  See all →
                </button>
              </div>
              <div className="divide-y divide-gray-50">
                {pending.slice(0, 3).map(o => (
                  <div key={o._id} className="flex items-center gap-3 px-5 py-4 hover:bg-gray-50/80 transition-all">
                    <Avatar name={o.name} img={o.profileImage} size="sm" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">{o.name}</p>
                      <p className="text-xs text-gray-400 truncate">{o.email}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button onClick={() => approve(o._id)}
                        className="flex items-center gap-1.5 pl-3 pr-3.5 py-2 bg-[#1a3a2a] hover:bg-green-800 text-white text-xs font-semibold rounded-xl transition-all duration-200 shadow-sm hover:shadow-md hover:shadow-green-900/20">
                        <Ico name="check" cls="w-3 h-3" /> Approve
                      </button>
                      <button onClick={() => reject(o._id)}
                        className="w-8 h-8 rounded-xl border border-red-200 bg-red-50 hover:bg-red-100 flex items-center justify-center text-red-400 transition-all">
                        <Ico name="x" cls="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recent notices */}
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100">
              <p className="text-sm font-semibold text-gray-800">Recent Notices</p>
              <div className="flex items-center gap-4">
                <button onClick={openNew}
                  className="flex items-center gap-1.5 text-xs font-semibold text-[#1a3a2a] bg-green-50 hover:bg-green-100 border border-green-200 px-3 py-1.5 rounded-xl transition-all duration-200">
                  <Ico name="plus" cls="w-3 h-3" /> New
                </button>
                <button onClick={() => setTab('notices')} className="text-xs text-gray-400 hover:text-gray-600 font-medium">
                  All →
                </button>
              </div>
            </div>
            {notices.length === 0 ? (
              <div className="px-5 py-10 text-center">
                <p className="text-sm text-gray-400">No notices yet.</p>
                <button onClick={openNew} className="mt-2 text-sm font-semibold text-[#1a3a2a] hover:underline">
                  Publish your first notice →
                </button>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {notices.slice(0, 4).map(n => (
                  <button key={n._id} onClick={() => setNoticeModal(n)}
                    className="w-full flex items-center gap-3 px-5 py-4 hover:bg-gray-50/80 text-left transition-all group">
                    <div className="w-9 h-9 rounded-xl bg-green-50 border border-green-100 flex items-center justify-center flex-shrink-0 group-hover:bg-[#1a3a2a] group-hover:border-[#1a3a2a] transition-all">
                      <Ico name="doc" cls="w-4 h-4 text-[#1a3a2a] group-hover:text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">{n.title || 'Untitled'}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{formatRelativeTime(n.createdAt)}</p>
                    </div>
                    <Ico name="chevron" cls="w-4 h-4 text-gray-300 group-hover:text-gray-500 transition-all flex-shrink-0" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </>}

        {/* ─── PENDING ─── */}
        {tab === 'pending' && (
          <Section title="Pending Approvals" sub={`${pending.length} official${pending.length !== 1 ? 's' : ''} waiting for review`}>
            {pending.length === 0
              ? <Empty title="All caught up!" sub="No pending approvals right now." />
              : <div className="space-y-3">
                  {pending.map(o => (
                    <OfficialRow key={o._id} official={o} isPending
                      onView={() => setOfficialModal(o)}
                      onApprove={() => approve(o._id)}
                      onReject={() => reject(o._id)} />
                  ))}
                </div>
            }
          </Section>
        )}

        {/* ─── ALL OFFICIALS ─── */}
        {tab === 'officials' && (
          <Section title="Officials" sub={`${officials.length} registered official${officials.length !== 1 ? 's' : ''}`}>
            {officials.length === 0
              ? <Empty title="No officials yet" sub="Approved officials will appear here." />
              : <div className="space-y-3">
                  {officials.map(o => (
                    <OfficialRow key={o._id} official={o}
                      onView={() => setOfficialModal(o)}
                      onDelete={() => delOfficial(o._id)} />
                  ))}
                </div>
            }
          </Section>
        )}

        {/* ─── NOTICES ─── */}
        {tab === 'notices' && (
          <Section title="Notices" sub={`${notices.length} published notice${notices.length !== 1 ? 's' : ''}`}
            action={
              <button onClick={openNew}
                className="flex items-center gap-2 px-4 py-2.5 bg-[#1a3a2a] hover:bg-green-800 text-white text-sm font-semibold rounded-xl transition-all duration-200 shadow-sm hover:shadow-lg hover:shadow-green-900/20">
                <Ico name="plus" cls="w-4 h-4" /> New Notice
              </button>
            }>
            {notices.length === 0
              ? <Empty title="No notices yet" sub="Publish your first notice to inform citizens.">
                  <button onClick={openNew}
                    className="mt-3 px-5 py-2.5 bg-[#1a3a2a] hover:bg-green-800 text-white text-sm font-semibold rounded-xl transition-all shadow-sm">
                    Publish Notice
                  </button>
                </Empty>
              : <div className="space-y-3">
                  {notices.map(n => (
                    <button key={n._id} onClick={() => setNoticeModal(n)}
                      className="w-full bg-white border border-gray-200 hover:border-green-300 rounded-2xl px-5 py-4 flex items-center gap-4 hover:shadow-md text-left transition-all duration-200 group">
                      <div className="w-10 h-10 rounded-xl bg-green-50 border border-green-100 flex items-center justify-center flex-shrink-0 group-hover:bg-[#1a3a2a] group-hover:border-[#1a3a2a] transition-all">
                        <Ico name="doc" cls="w-4 h-4 text-[#1a3a2a] group-hover:text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900">{n.title || 'Untitled Notice'}</p>
                        {n.summary && <p className="text-xs text-gray-400 truncate mt-0.5">{n.summary}</p>}
                        <p className="text-xs text-gray-300 mt-1">{formatRelativeTime(n.createdAt)}</p>
                      </div>
                      <Ico name="chevron" cls="w-4 h-4 text-gray-300 group-hover:text-gray-500 transition-all flex-shrink-0" />
                    </button>
                  ))}
                </div>
            }
          </Section>
        )}
      </main>

      {/* ══════ OFFICIAL MODAL ══════ */}
      {officialModal && (
        <Modal onClose={() => setOfficialModal(null)}>
          <div className="flex items-start gap-4 mb-6">
            <Avatar name={officialModal.name} img={officialModal.profileImage} size="lg" />
            <div className="flex-1 min-w-0 pt-1">
              <h2 className="text-xl font-bold text-gray-900">{officialModal.name}</h2>
              <p className="text-sm text-gray-400 mt-0.5">{officialModal.email}</p>
              <div className="mt-2"><Badge status={officialModal.status || 'pending'} /></div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-5">
            {officialModal.phone && <InfoBox label="Phone" val={officialModal.phone} />}
            {officialModal.createdAt && <InfoBox label="Joined" val={new Date(officialModal.createdAt).toLocaleDateString('en-IN')} />}
            {officialModal.village?.name && <InfoBox label="Village" val={officialModal.village.name} />}
          </div>

          {officialModal.documentProof && (
            <div className="mb-5">
              <p className="text-xs font-medium text-gray-400 mb-2">Document Proof</p>
              <img src={officialModal.documentProof} alt="Doc" className="w-full max-h-52 object-contain rounded-xl border border-gray-200 bg-gray-50" />
            </div>
          )}

          {pending.some(o => o._id === officialModal._id) ? (
            <div className="flex gap-3">
              <button onClick={() => approve(officialModal._id)}
                className="flex-1 py-3.5 bg-[#1a3a2a] hover:bg-green-800 text-white font-semibold text-sm rounded-xl transition-all duration-200 shadow-sm hover:shadow-lg hover:shadow-green-900/20 flex items-center justify-center gap-2">
                <Ico name="check" cls="w-4 h-4" /> Approve Official
              </button>
              <button onClick={() => reject(officialModal._id)}
                className="px-5 py-3.5 border border-red-200 bg-red-50 hover:bg-red-100 text-red-500 font-semibold text-sm rounded-xl transition-all">
                Reject
              </button>
            </div>
          ) : (
            <button onClick={() => delOfficial(officialModal._id)}
              className="w-full flex items-center justify-center gap-2 py-3 border border-red-200 bg-red-50 hover:bg-red-100 text-red-500 text-sm font-semibold rounded-xl transition-all">
              <Ico name="trash" cls="w-4 h-4" /> Remove Official
            </button>
          )}
        </Modal>
      )}

      {/* ══════ NOTICE DETAIL MODAL ══════ */}
      {noticeModal && (
        <Modal onClose={() => setNoticeModal(null)} wide>
          <div className="inline-flex items-center gap-2 bg-green-50 border border-green-100 rounded-full px-3 py-1 mb-4">
            <span className="w-1.5 h-1.5 bg-green-400 rounded-full" />
            <span className="text-xs text-green-700 font-medium">Notice</span>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-1 pr-4">{noticeModal.title || 'Untitled'}</h2>
          <p className="text-xs text-gray-400 mb-5">{new Date(noticeModal.createdAt).toLocaleString('en-IN')}</p>
          <div className="h-px bg-gray-100 mb-5" />

          {noticeModal.summary && (
            <div className="mb-4 bg-gray-50 border border-gray-100 rounded-xl px-4 py-3">
              <p className="text-xs text-gray-400 mb-1">Summary</p>
              <p className="text-sm text-gray-700">{noticeModal.summary}</p>
            </div>
          )}
          {noticeModal.content && (
            <div className="mb-5">
              <p className="text-xs text-gray-400 mb-2">Content</p>
              <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{noticeModal.content}</p>
            </div>
          )}
          {noticeModal.fileUrl && (
            <a href={noticeModal.fileUrl} target="_blank" rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-[#1a3a2a] hover:underline mb-5">
              <Ico name="link" cls="w-4 h-4" /> View Attachment
            </a>
          )}

          <div className="flex gap-3 pt-4 border-t border-gray-100">
            <button onClick={() => openEdit(noticeModal)}
              className="flex-1 py-3.5 bg-[#1a3a2a] hover:bg-green-800 text-white font-semibold text-sm rounded-xl transition-all duration-200 shadow-sm hover:shadow-lg hover:shadow-green-900/20 flex items-center justify-center gap-2">
              <Ico name="edit" cls="w-4 h-4" /> Edit Notice
            </button>
            <button onClick={() => delNotice(noticeModal._id)}
              className="px-5 py-3.5 border border-red-200 bg-red-50 hover:bg-red-100 text-red-500 font-semibold text-sm rounded-xl transition-all flex items-center gap-2">
              <Ico name="trash" cls="w-4 h-4" />
            </button>
          </div>
        </Modal>
      )}

      {/* ══════ NOTICE FORM MODAL ══════ */}
      {noticeForm !== null && (
        <Modal onClose={() => setNoticeForm(null)} wide>
          <h2 className="text-xl font-bold text-gray-900 mb-6">
            {noticeForm === 'new' ? 'Publish New Notice' : 'Edit Notice'}
          </h2>
          <form onSubmit={submitNotice} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Title <span className="text-red-400">*</span></label>
              <input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                placeholder="What is this notice about?" required className={inp} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Description <span className="text-gray-400 font-normal text-xs">(full notice text)</span></label>
              <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                placeholder="Full notice details..." rows={5}
                className={`${inp} resize-none`} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Category</label>
              <select value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}
                className={inp}>
                <option value="general">General</option>
                <option value="development">Development</option>
                <option value="health">Health</option>
                <option value="education">Education</option>
                <option value="agriculture">Agriculture</option>
                <option value="employment">Employment</option>
                <option value="social_welfare">Social Welfare</option>
                <option value="tax_billing">Tax & Billing</option>
                <option value="election">Election</option>
                <option value="meeting">Meetings</option>
              </select>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Priority</label>
                <select value={form.priority} onChange={e => setForm(p => ({ ...p, priority: e.target.value }))} className={inp}>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Status</label>
                <select value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value }))} className={inp}>
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
              <div className="flex items-center gap-3">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Pin</label>
                <div className="flex items-center">
                  <input id="pin" type="checkbox" checked={form.isPinned} onChange={e => setForm(p => ({ ...p, isPinned: e.target.checked }))} className="mr-2" />
                  <label htmlFor="pin" className="text-sm text-gray-600">Pin this notice</label>
                </div>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Attachment <span className="text-gray-400 font-normal text-xs">(optional)</span>
              </label>
              <label htmlFor="nf"
                className="flex items-center gap-3 w-full px-4 py-3.5 rounded-xl border border-dashed border-gray-200 bg-white hover:border-green-500 hover:bg-green-50/30 cursor-pointer transition-all duration-200 group">
                <Ico name="upload" cls="w-5 h-5 text-gray-300 group-hover:text-green-500 transition-colors" />
                <span className={`text-sm ${file ? 'text-gray-700 font-medium' : 'text-gray-400'}`}>
                  {file ? `✓  ${file.name}` : 'Click to attach a file'}
                </span>
                <input id="nf" type="file" className="hidden" onChange={e => setFile(e.target.files[0])} />
              </label>
            </div>
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => setNoticeForm(null)}
                className="flex-1 py-3.5 border border-gray-200 hover:border-gray-300 text-gray-600 text-sm font-semibold rounded-xl transition-all duration-200">
                Cancel
              </button>
              <button type="submit" disabled={saving}
                className="flex-1 py-3.5 bg-[#1a3a2a] hover:bg-green-800 text-white text-sm font-semibold rounded-xl transition-all duration-200 shadow-sm hover:shadow-lg hover:shadow-green-900/20 disabled:opacity-60 flex items-center justify-center gap-2">
                {saving
                  ? <><svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg> Saving...</>
                  : noticeForm === 'new' ? 'Publish Notice' : 'Save Changes'
                }
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* ══════ QR MODAL ══════ */}
      {qrModal && (
        <Modal onClose={() => setQrModal(false)}>
          <div className="inline-flex items-center gap-2 bg-green-50 border border-green-100 rounded-full px-3 py-1 mb-4">
            <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
            <span className="text-xs text-green-700 font-medium">Village QR Code</span>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-1">{village?.name || 'Your Village'}</h2>
          {village?.district && <p className="text-sm text-gray-400 mb-5">{village.district}, {village.state}</p>}
          <div className="h-px bg-gray-100 mb-5" />

          {qrData?.imageUrl ? (
            <div className="flex flex-col items-center gap-3 mb-5">
              <div className="p-5 bg-white border border-gray-200 rounded-2xl shadow-sm">
                <img src={qrData.imageUrl} alt="QR" className="w-44 h-44 object-contain" />
              </div>
              {qrData.generatedAt && (
                <p className="text-xs text-gray-400">Generated {new Date(qrData.generatedAt).toLocaleDateString()}</p>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center py-10 gap-3 mb-5">
              <div className="w-20 h-20 rounded-2xl bg-gray-50 border border-gray-200 flex items-center justify-center">
                <Ico name="qr" cls="w-10 h-10 text-gray-300" />
              </div>
              <p className="text-sm text-gray-500 text-center max-w-xs">Generate a QR code so citizens can scan and access your village notices.</p>
            </div>
          )}

          <div className="flex gap-3">
            {!qrData?.imageUrl ? (
              <button onClick={generateQr}
                className="flex-1 py-3.5 bg-[#1a3a2a] hover:bg-green-800 text-white font-semibold text-sm rounded-xl transition-all duration-200 shadow-sm hover:shadow-lg hover:shadow-green-900/20">
                Generate QR Code
              </button>
            ) : (
              <>
                <a href={qrData.imageUrl} target="_blank" rel="noreferrer"
                  className="flex-1 py-3.5 border border-gray-200 hover:border-gray-300 text-gray-600 font-semibold text-sm rounded-xl transition-all text-center">
                  Open Full
                </a>
                <button onClick={shareQr}
                  className="flex-1 py-3.5 bg-[#1a3a2a] hover:bg-green-800 text-white font-semibold text-sm rounded-xl transition-all duration-200 shadow-sm hover:shadow-lg hover:shadow-green-900/20 flex items-center justify-center gap-2">
                  <Ico name="share" cls="w-4 h-4" /> Share
                </button>
              </>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
}

/* ─── Section wrapper ─── */
function Section({ title, sub, action, children }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
      <div className="flex items-start justify-between gap-4 px-5 sm:px-6 py-5 border-b border-gray-100">
        <div>
          <h2 className="text-base font-bold text-gray-900">{title}</h2>
          {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
        </div>
        {action}
      </div>
      <div className="p-5 sm:p-6">{children}</div>
    </div>
  );
}

/* ─── Official row ─── */
function OfficialRow({ official, isPending, onView, onApprove, onReject, onDelete }) {
  return (
    <div className="flex items-center gap-4 bg-white border border-gray-200 hover:border-green-200 rounded-2xl px-4 py-4 hover:shadow-sm transition-all duration-200">
      <Avatar name={official.name} img={official.profileImage} />
      <div className="flex-1 min-w-0 cursor-pointer" onClick={onView}>
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-sm font-semibold text-gray-900 truncate">{official.name}</p>
          {!isPending && <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
            official.status === 'approved' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
          }`}>{official.status}</span>}
          {isPending && <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">pending</span>}
        </div>
        <p className="text-xs text-gray-400 truncate mt-0.5">{official.email}</p>
        {official.phone && <p className="text-xs text-gray-400">{official.phone}</p>}
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <button onClick={onView}
          className="px-3 py-2 rounded-xl border border-gray-200 hover:border-green-300 text-gray-500 hover:text-[#1a3a2a] text-xs font-medium transition-all hidden sm:block">
          Details
        </button>
        {isPending ? (
          <>
            <button onClick={onApprove}
              className="flex items-center gap-1.5 pl-3 pr-3.5 py-2 bg-[#1a3a2a] hover:bg-green-800 text-white text-xs font-semibold rounded-xl transition-all duration-200 shadow-sm">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
              Approve
            </button>
            <button onClick={onReject}
              className="w-8 h-8 rounded-xl border border-red-200 bg-red-50 hover:bg-red-100 flex items-center justify-center text-red-400 transition-all">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </>
        ) : (
          <button onClick={onDelete}
            className="w-8 h-8 rounded-xl border border-red-200 bg-red-50 hover:bg-red-100 flex items-center justify-center text-red-400 transition-all">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6M14 11v6M9 6V4h6v2"/></svg>
          </button>
        )}
      </div>
    </div>
  );
}

/* ─── Info box ─── */
function InfoBox({ label, val }) {
  return (
    <div className="bg-gray-50 border border-gray-100 rounded-xl px-3.5 py-3">
      <p className="text-xs text-gray-400 mb-0.5">{label}</p>
      <p className="text-sm font-semibold text-gray-800">{val}</p>
    </div>
  );
}