import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

// ── Constants ──────────────────────────────────────────────────────────────────
const CATEGORIES = [
  'Certificates & Documents',
  'Land & Property',
  'Ration & Government Schemes',
  'Water & Sanitation',
  'Roads & Infrastructure',
  'Birth & Death Registration',
  'Elections',
  'Agriculture',
  'Health',
  'Education',
  'Gram Sabha & Administration',
];

const DESIGNATIONS = [
  'Sarpanch',
  'Gram Sevak',
  'Talathi / Patwari',
  'Clerk',
  'Accountant',
  'Health Worker (ASHA)',
  'Anganwadi Worker',
  'Panchayat Secretary',
  'Engineer / JE',
  'Other',
];

const ALL_DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

// Pre-defined work names grouped by category for the dropdown
const WORK_NAMES = {
  'Certificates & Documents': [
    'Birth Certificate', 'Death Certificate', 'Residence / Domicile Certificate',
    'Caste Certificate (SC/ST/OBC)', 'Income Certificate', 'No Objection Certificate (NOC)',
    'Character Certificate', 'Single Status Certificate', 'Solvency Certificate',
  ],
  'Land & Property': [
    '7/12 Extract (Satbara Utara)', '8A Extract', 'Property Tax Payment & Receipt',
    'Property Mutation (Name Transfer)', 'Land Use Certificate',
    'Building Permission / Construction NOC', 'Shop / Commercial Establishment License',
  ],
  'Ration & Government Schemes': [
    'Ration Card (New / Correction / Member Addition)', 'PM Awas Yojana',
    'PM Kisan Samman Nidhi', 'MGNREGA Job Card', 'Widow / Old Age / Disability Pension',
    'Scholarship Applications', 'Ujjwala Yojana (LPG Connection)', 'Ayushman Bharat Health Card',
  ],
  'Water & Sanitation': [
    'New Water Connection', 'Water Bill Payment', 'Handpump / Borewell Repair Request',
    'Drainage / Sewage Work Request', 'ODF Certificate',
  ],
  'Roads & Infrastructure': [
    'Road Repair Request', 'Street Light Request', 'New Road / Bridge Demand',
    'Construction Work Query',
  ],
  'Birth & Death Registration': [
    'Register New Birth', 'Register a Death', 'Correction in Birth / Death Record',
    'Reissue of Certificate',
  ],
  'Elections': [
    'Voter ID Registration Help', 'Voter List Correction', 'Polling Booth Information',
  ],
  'Agriculture': [
    'Crop Damage Report', 'Kisan Credit Card Help', 'Soil Health Card',
    'Irrigation Water Demand', 'Agriculture Scheme Application',
  ],
  'Health': [
    'ASHA Worker Contact', 'Anganwadi Services', 'Health Camp Information',
    'Janani Suraksha Yojana',
  ],
  'Education': [
    'School Enrollment Help', 'Scholarship Form Submission', 'Balwadi / Anganwadi Enrollment',
  ],
  'Gram Sabha & Administration': [
    'Gram Sabha Meeting Request', 'RTI Application Help', 'General Query to Sarpanch',
  ],
};

const emptyForm = () => ({
  category:       'Certificates & Documents',
  workName:       '',
  customWorkName: '',
  officerName:    '',
  designation:    'Clerk',
  availableDays:  ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
  timing:         '',
  location:       '',
  documents:      [],
  docInput:       '',
  searchKeywords: [],
  kwInput:        '',
  note:           '',
  isActive:       true,
});

// ── Shared input class — matches VillageAdminDashboard exactly ─────────────────
const inp = "w-full px-4 py-3.5 rounded-xl border border-gray-200 bg-white text-sm text-gray-900 placeholder-gray-300 outline-none transition-all duration-200 focus:border-green-500 focus:ring-4 focus:ring-green-500/10 hover:border-gray-300";

// ── Icons (matching the Icons object pattern in VillageAdminDashboard) ─────────
function PlusIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" viewBox="0 0 24 24">
      <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}
function EditIcon() {
  return (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  );
}
function TrashIcon() {
  return (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
      <path d="M10 11v6M14 11v6M9 6V4h6v2" />
    </svg>
  );
}
function XIcon() {
  return (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}
function ChevronIcon({ open }) {
  return (
    <svg className={`w-4 h-4 transition-transform ${open ? 'rotate-90' : ''}`} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}

// ── Spinner ────────────────────────────────────────────────────────────────────
function Spinner() {
  return (
    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}

// ── WorkGuideAdmin ─────────────────────────────────────────────────────────────
export default function WorkGuideAdmin({ villageId }) {
  const [grouped, setGrouped]         = useState([]); // [{ category, items }]
  const [loading, setLoading]         = useState(true);
  const [saving, setSaving]           = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [editingId, setEditingId]     = useState(null);  // null = new entry
  const [showForm, setShowForm]       = useState(false);
  const [form, setForm]               = useState(emptyForm());
  const [expandedCat, setExpandedCat] = useState(null);  // which category is expanded

  useEffect(() => {
    if (villageId) fetchGuides();
  }, [villageId]);

  // ── Data ──────────────────────────────────────────────────────────────────────
  const fetchGuides = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`http://localhost:3000/workguide/village/${villageId}`, { withCredentials: true });
      setGrouped(Array.isArray(res.data) ? res.data : []);
      // Auto-expand first category
      if (res.data?.length > 0 && !expandedCat) setExpandedCat(res.data[0].category);
    } catch { toast.error('Failed to load work guide'); }
    finally { setLoading(false); }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.officerName.trim()) { toast.error('Officer name is required'); return; }
    if (!form.timing.trim())      { toast.error('Timing is required'); return; }
    if (!form.location.trim())    { toast.error('Location is required'); return; }

    const workName = form.workName === '__custom__' ? form.customWorkName.trim() : form.workName;
    if (!workName) { toast.error('Work name is required'); return; }

    const payload = {
      category:       form.category,
      workName,
      officerName:    form.officerName.trim(),
      designation:    form.designation,
      availableDays:  form.availableDays,
      timing:         form.timing.trim(),
      location:       form.location.trim(),
      documents:      form.documents,
      searchKeywords: form.searchKeywords,
      note:           form.note.trim(),
      isActive:       form.isActive,
    };

    try {
      setSaving(true);
      if (editingId) {
        await axios.put(`http://localhost:3000/workguide/${editingId}`, payload, { withCredentials: true });
        toast.success('Work guide entry updated');
      } else {
        await axios.post('http://localhost:3000/workguide', payload, { withCredentials: true });
        toast.success('Work guide entry added');
      }
      setShowForm(false);
      setEditingId(null);
      setForm(emptyForm());
      fetchGuides();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await axios.delete(`http://localhost:3000/workguide/${deleteTarget}`, { withCredentials: true });
      toast.success('Entry deleted');
      setDeleteTarget(null);
      fetchGuides();
    } catch { toast.error('Failed to delete'); }
  };

  const openNew = () => {
    setForm(emptyForm());
    setEditingId(null);
    setShowForm(true);
  };

  const openEdit = (item) => {
    const workNames = WORK_NAMES[item.category] || [];
    const isPreset  = workNames.includes(item.workName);
    setForm({
      category:       item.category,
      workName:       isPreset ? item.workName : '__custom__',
      customWorkName: isPreset ? '' : item.workName,
      officerName:    item.officerName,
      designation:    item.designation,
      availableDays:  item.availableDays || [],
      timing:         item.timing || '',
      location:       item.location || '',
      documents:      item.documents || [],
      docInput:       '',
      searchKeywords: item.searchKeywords || [],
      kwInput:        '',
      note:           item.note || '',
      isActive:       item.isActive !== false,
    });
    setEditingId(item._id);
    setShowForm(true);
  };

  // ── Form helpers ──────────────────────────────────────────────────────────────
  const toggleDay = (day) => {
    setForm(f => ({
      ...f,
      availableDays: f.availableDays.includes(day)
        ? f.availableDays.filter(d => d !== day)
        : [...f.availableDays, day],
    }));
  };

  const addDoc = () => {
    const val = form.docInput.trim();
    if (!val || form.documents.includes(val)) { setForm(f => ({ ...f, docInput: '' })); return; }
    setForm(f => ({ ...f, documents: [...f.documents, val], docInput: '' }));
  };

  const removeDoc = (i) => setForm(f => ({ ...f, documents: f.documents.filter((_, idx) => idx !== i) }));

  const addKw = () => {
    const val = form.kwInput.trim().toLowerCase();
    if (!val || form.searchKeywords.includes(val)) { setForm(f => ({ ...f, kwInput: '' })); return; }
    setForm(f => ({ ...f, searchKeywords: [...f.searchKeywords, val], kwInput: '' }));
  };

  const removeKw = (i) => setForm(f => ({ ...f, searchKeywords: f.searchKeywords.filter((_, idx) => idx !== i) }));

  const onCategoryChange = (cat) => {
    setForm(f => ({ ...f, category: cat, workName: '', customWorkName: '' }));
  };

  const totalEntries = grouped.reduce((sum, g) => sum + g.items.length, 0);

  // ── Render ────────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">

      {/* ── Header card ── */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="flex items-center justify-between px-5 sm:px-6 py-5 border-b border-gray-100">
          <div>
            <h2 className="text-base font-bold text-gray-900">Work Guide</h2>
            <p className="text-xs text-gray-400 mt-0.5">
              {totalEntries} {totalEntries === 1 ? 'entry' : 'entries'} across {grouped.length} {grouped.length === 1 ? 'category' : 'categories'}
            </p>
          </div>
          <button onClick={openNew}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#1a3a2a] hover:bg-green-800 text-white text-sm font-semibold rounded-xl transition-all duration-200 shadow-sm hover:shadow-lg hover:shadow-green-900/20">
            <PlusIcon /> Add Entry
          </button>
        </div>

        {/* ── Content ── */}
        <div className="p-5 sm:p-6">
          {loading ? (
            <div className="flex items-center justify-center py-16 gap-3 text-gray-400">
              <Spinner /> <span className="text-sm">Loading...</span>
            </div>
          ) : grouped.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
              <div className="w-12 h-12 rounded-2xl bg-green-50 border border-green-100 flex items-center justify-center mb-1">
                <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <p className="text-sm font-semibold text-gray-700">No work guide entries yet</p>
              <p className="text-xs text-gray-400">Add entries to help citizens find the right official for their work</p>
              <button onClick={openNew}
                className="mt-2 px-5 py-2.5 bg-[#1a3a2a] hover:bg-green-800 text-white text-sm font-semibold rounded-xl transition-all shadow-sm">
                Add First Entry
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {grouped.map(({ category, items }) => (
                <div key={category} className="border border-gray-200 rounded-2xl overflow-hidden">
                  {/* Category header */}
                  <button
                    onClick={() => setExpandedCat(expandedCat === category ? null : category)}
                    className="w-full flex items-center justify-between px-5 py-4 bg-gray-50 hover:bg-gray-100 transition-all text-left">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-semibold text-gray-800">{category}</span>
                      <span className="text-xs font-bold bg-[#1a3a2a]/10 text-[#1a3a2a] px-2.5 py-0.5 rounded-full">
                        {items.length}
                      </span>
                    </div>
                    <ChevronIcon open={expandedCat === category} />
                  </button>

                  {/* Items */}
                  {expandedCat === category && (
                    <div className="divide-y divide-gray-100">
                      {items.map(item => (
                        <div key={item._id} className="flex items-start gap-4 px-5 py-4 hover:bg-gray-50/60 transition-all">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap mb-1">
                              <p className="text-sm font-semibold text-gray-900">{item.workName}</p>
                              {!item.isActive && (
                                <span className="text-xs bg-gray-100 text-gray-400 px-2 py-0.5 rounded-full font-medium">Inactive</span>
                              )}
                            </div>
                            <p className="text-xs text-gray-500">
                              {item.officerName} — {item.designation}
                            </p>
                            {item.availableDays?.length > 0 && (
                              <p className="text-xs text-gray-400 mt-1">
                                {item.availableDays.join(', ')}
                                {item.timing ? ` · ${item.timing}` : ''}
                              </p>
                            )}
                            {item.location && (
                              <p className="text-xs text-gray-400">{item.location}</p>
                            )}
                            {item.documents?.length > 0 && (
                              <p className="text-xs text-gray-400 mt-1">
                                {item.documents.length} document{item.documents.length !== 1 ? 's' : ''} required
                              </p>
                            )}
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0 pt-0.5">
                            <button onClick={() => openEdit(item)}
                              className="w-8 h-8 rounded-xl border border-gray-200 hover:border-green-300 hover:bg-green-50 flex items-center justify-center text-gray-400 hover:text-[#1a3a2a] transition-all">
                              <EditIcon />
                            </button>
                            <button onClick={() => setDeleteTarget(item._id)}
                              className="w-8 h-8 rounded-xl border border-red-200 bg-red-50 hover:bg-red-100 flex items-center justify-center text-red-400 transition-all">
                              <TrashIcon />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ══════ FORM MODAL ══════ */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowForm(false)} />
          <div className="relative z-10 bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden">
            <div className="max-h-[90vh] overflow-y-auto">

              {/* Modal header — matches VillageAdminDashboard Modal */}
              <div className="bg-[#1a3a2a] px-6 py-4 flex items-center justify-between sticky top-0 z-10">
                <div className="flex items-center gap-3">
                  <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  <span className="text-sm font-semibold text-white">
                    {editingId ? 'Edit Work Guide Entry' : 'Add New Work Guide Entry'}
                  </span>
                </div>
                <button onClick={() => setShowForm(false)}
                  className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/70 hover:text-white transition-all">
                  <XIcon />
                </button>
              </div>

              <form onSubmit={handleSave} className="p-6 sm:p-8 space-y-5">

                {/* Category */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Category <span className="text-red-400">*</span>
                  </label>
                  <select value={form.category} onChange={e => onCategoryChange(e.target.value)} className={inp}>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                {/* Work Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Work Name <span className="text-red-400">*</span>
                  </label>
                  <select
                    value={form.workName}
                    onChange={e => setForm(f => ({ ...f, workName: e.target.value, customWorkName: '' }))}
                    className={inp}>
                    <option value="">— Select a work type —</option>
                    {(WORK_NAMES[form.category] || []).map(w => (
                      <option key={w} value={w}>{w}</option>
                    ))}
                    <option value="__custom__">Other (type your own)</option>
                  </select>
                  {form.workName === '__custom__' && (
                    <input
                      type="text"
                      value={form.customWorkName}
                      onChange={e => setForm(f => ({ ...f, customWorkName: e.target.value }))}
                      placeholder="Type the work name..."
                      className={`${inp} mt-2`}
                    />
                  )}
                </div>

                {/* Officer name + Designation */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Officer Name <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={form.officerName}
                      onChange={e => setForm(f => ({ ...f, officerName: e.target.value }))}
                      placeholder="e.g. Rajesh Patil"
                      required
                      className={inp}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Designation <span className="text-red-400">*</span>
                    </label>
                    <select value={form.designation} onChange={e => setForm(f => ({ ...f, designation: e.target.value }))} className={inp}>
                      {DESIGNATIONS.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                </div>

                {/* Available Days */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Available Days
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {ALL_DAYS.map(day => (
                      <button
                        key={day}
                        type="button"
                        onClick={() => toggleDay(day)}
                        className={`px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all duration-150 ${
                          form.availableDays.includes(day)
                            ? 'bg-[#1a3a2a] text-white border-[#1a3a2a] shadow-sm'
                            : 'bg-white text-gray-500 border-gray-200 hover:border-green-300 hover:text-[#1a3a2a]'
                        }`}>
                        {day.slice(0, 3)}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Timing + Location */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Timing <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={form.timing}
                      onChange={e => setForm(f => ({ ...f, timing: e.target.value }))}
                      placeholder="e.g. 10:00 AM – 1:00 PM"
                      required
                      className={inp}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Location <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={form.location}
                      onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
                      placeholder="e.g. Room 2, Panchayat Office"
                      required
                      className={inp}
                    />
                  </div>
                </div>

                {/* Documents */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Documents Required
                    <span className="text-gray-400 font-normal text-xs ml-1">(citizen must bring)</span>
                  </label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={form.docInput}
                      onChange={e => setForm(f => ({ ...f, docInput: e.target.value }))}
                      onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addDoc(); } }}
                      placeholder="e.g. Aadhar Card"
                      className={`${inp} flex-1`}
                    />
                    <button type="button" onClick={addDoc}
                      className="px-4 py-2 bg-[#1a3a2a] hover:bg-green-800 text-white text-sm font-semibold rounded-xl transition-all flex-shrink-0">
                      Add
                    </button>
                  </div>
                  {form.documents.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {form.documents.map((doc, i) => (
                        <span key={i} className="inline-flex items-center gap-1.5 bg-green-50 border border-green-200 text-green-800 text-xs font-medium px-3 py-1.5 rounded-xl">
                          {doc}
                          <button type="button" onClick={() => removeDoc(i)} className="text-green-500 hover:text-red-500 transition-colors">
                            <XIcon />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Search Keywords */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Search Keywords
                    <span className="text-gray-400 font-normal text-xs ml-1">(alternate names, local terms)</span>
                  </label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={form.kwInput}
                      onChange={e => setForm(f => ({ ...f, kwInput: e.target.value }))}
                      onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addKw(); } }}
                      placeholder="e.g. janam, janm praman patra"
                      className={`${inp} flex-1`}
                    />
                    <button type="button" onClick={addKw}
                      className="px-4 py-2 bg-[#1a3a2a] hover:bg-green-800 text-white text-sm font-semibold rounded-xl transition-all flex-shrink-0">
                      Add
                    </button>
                  </div>
                  {form.searchKeywords.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {form.searchKeywords.map((kw, i) => (
                        <span key={i} className="inline-flex items-center gap-1.5 bg-gray-100 border border-gray-200 text-gray-600 text-xs font-medium px-3 py-1.5 rounded-xl">
                          {kw}
                          <button type="button" onClick={() => removeKw(i)} className="text-gray-400 hover:text-red-500 transition-colors">
                            <XIcon />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Note */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Note <span className="text-gray-400 font-normal text-xs">(optional)</span>
                  </label>
                  <textarea
                    value={form.note}
                    onChange={e => setForm(f => ({ ...f, note: e.target.value }))}
                    placeholder="Any extra info for citizens, e.g. Bring originals and photocopies both"
                    rows={3}
                    className={`${inp} resize-none`}
                  />
                </div>

                {/* Active toggle */}
                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl border border-gray-100">
                  <div
                    onClick={() => setForm(f => ({ ...f, isActive: !f.isActive }))}
                    className={`w-10 h-[22px] rounded-full relative cursor-pointer transition-all flex-shrink-0 ${form.isActive ? 'bg-[#1a3a2a]' : 'bg-gray-300'}`}>
                    <div className={`w-4 h-4 bg-white rounded-full absolute top-[3px] transition-all shadow-sm ${form.isActive ? 'left-[22px]' : 'left-[3px]'}`} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-800">Active</p>
                    <p className="text-xs text-gray-400">Citizens can see this entry</p>
                  </div>
                </div>

                {/* Buttons */}
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setShowForm(false)}
                    className="flex-1 py-3.5 border border-gray-200 hover:border-gray-300 text-gray-600 text-sm font-semibold rounded-xl transition-all duration-200">
                    Cancel
                  </button>
                  <button type="submit" disabled={saving}
                    className="flex-1 py-3.5 bg-[#1a3a2a] hover:bg-green-800 text-white text-sm font-semibold rounded-xl transition-all duration-200 shadow-sm hover:shadow-lg hover:shadow-green-900/20 disabled:opacity-60 flex items-center justify-center gap-2">
                    {saving
                      ? <><Spinner /> Saving...</>
                      : editingId ? 'Save Changes' : 'Add Entry'
                    }
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ══════ DELETE CONFIRM ══════ */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setDeleteTarget(null)} />
          <div className="relative z-10 bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden">
            <div className="bg-[#1a3a2a] px-6 py-4 flex items-center justify-between">
              <span className="w-2 h-2 bg-red-400 rounded-full" />
              <button onClick={() => setDeleteTarget(null)}
                className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/70 hover:text-white transition-all">
                <XIcon />
              </button>
            </div>
            <div className="p-6 sm:p-8 text-center">
              <div className="w-12 h-12 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center mx-auto mb-4">
                <TrashIcon />
              </div>
              <h3 className="text-base font-bold text-gray-900 mb-2">Delete this entry?</h3>
              <p className="text-sm text-gray-400 mb-6">This cannot be undone. Citizens will no longer see this work guide entry.</p>
              <div className="flex gap-3">
                <button onClick={() => setDeleteTarget(null)}
                  className="flex-1 py-3.5 border border-gray-200 hover:border-gray-300 text-gray-600 text-sm font-semibold rounded-xl transition-all">
                  Cancel
                </button>
                <button onClick={handleDelete}
                  className="flex-1 py-3.5 bg-red-500 hover:bg-red-600 text-white text-sm font-semibold rounded-xl transition-all">
                  Yes, Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}