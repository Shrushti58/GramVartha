import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

// ─── Constants ────────────────────────────────────────────────────────────────

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
  'Sarpanch', 'Gram Sevak', 'Talathi / Patwari', 'Clerk', 'Accountant',
  'Health Worker (ASHA)', 'Anganwadi Worker', 'Panchayat Secretary',
  'Engineer / JE', 'Other',
];

const ALL_DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

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

const emptyForm = function() {
  return {
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
  };
};

// ─── Shared input style ───────────────────────────────────────────────────────

const inp = "w-full px-4 py-3 rounded-xl border border-border dark:border-dark-border bg-white dark:bg-dark-surface2 text-sm text-text-primary dark:text-dark-text-primary placeholder-text-muted dark:placeholder-dark-text-muted outline-none transition-all duration-200 focus:border-primary-500 dark:focus:border-primary-400 focus:ring-2 focus:ring-primary-500/10";

// ─── Small icons ──────────────────────────────────────────────────────────────

function IcoPlus() {
  return <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
}
function IcoEdit() {
  return <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>;
}
function IcoTrash() {
  return <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6M14 11v6M9 6V4h6v2"/></svg>;
}
function IcoX() {
  return <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
}
function IcoChevron({ open }) {
  return (
    <svg className={`w-4 h-4 transition-transform duration-200 ${open ? 'rotate-90' : ''}`} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      <polyline points="9 18 15 12 9 6"/>
    </svg>
  );
}
function IcoSpinner() {
  return (
    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
    </svg>
  );
}

// ─── Notice Form (inline) — matches VillageAdminDashboard style ───────────────

function WorkGuideForm({ initial, editingId, onSave, onCancel, saving }) {
  const [form, setForm] = useState(initial || emptyForm());

  function set(key, val) {
    setForm(function(p) { return Object.assign({}, p, { [key]: val }); });
  }

  function onCategoryChange(cat) {
    setForm(function(p) { return Object.assign({}, p, { category: cat, workName: '', customWorkName: '' }); });
  }

  function toggleDay(day) {
    setForm(function(p) {
      const days = p.availableDays.includes(day)
        ? p.availableDays.filter(function(d) { return d !== day; })
        : [...p.availableDays, day];
      return Object.assign({}, p, { availableDays: days });
    });
  }

  function addDoc() {
    const val = form.docInput.trim();
    if (!val || form.documents.includes(val)) { set('docInput', ''); return; }
    setForm(function(p) { return Object.assign({}, p, { documents: [...p.documents, val], docInput: '' }); });
  }

  function removeDoc(i) {
    setForm(function(p) { return Object.assign({}, p, { documents: p.documents.filter(function(_, idx) { return idx !== i; }) }); });
  }

  function addKw() {
    const val = form.kwInput.trim().toLowerCase();
    if (!val || form.searchKeywords.includes(val)) { set('kwInput', ''); return; }
    setForm(function(p) { return Object.assign({}, p, { searchKeywords: [...p.searchKeywords, val], kwInput: '' }); });
  }

  function removeKw(i) {
    setForm(function(p) { return Object.assign({}, p, { searchKeywords: p.searchKeywords.filter(function(_, idx) { return idx !== i; }) }); });
  }

  function handleSubmit(e) {
    e.preventDefault();
    onSave(form);
  }

  return (
    <div className="bg-white dark:bg-dark-surface border border-border dark:border-dark-border rounded-2xl overflow-hidden mb-4">
      <div className="flex items-center justify-between px-6 py-4 border-b border-border dark:border-dark-border bg-accent-mist dark:bg-dark-surface2">
        <h3 className="text-sm font-bold text-text-primary dark:text-dark-text-primary">
          {editingId ? 'Edit Work Guide Entry' : 'Add New Work Guide Entry'}
        </h3>
        <button type="button" onClick={onCancel} className="p-1.5 rounded-lg hover:bg-border dark:hover:bg-dark-border text-text-muted dark:text-dark-text-muted transition-all">
          <IcoX />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-5">

        {/* Category */}
        <div>
          <label className="block text-xs font-semibold text-text-secondary dark:text-dark-text-secondary mb-1.5">
            Category <span className="text-red-400">*</span>
          </label>
          <select value={form.category} onChange={function(e) { onCategoryChange(e.target.value); }} className={inp}>
            {CATEGORIES.map(function(c) { return <option key={c} value={c}>{c}</option>; })}
          </select>
        </div>

        {/* Work Name */}
        <div>
          <label className="block text-xs font-semibold text-text-secondary dark:text-dark-text-secondary mb-1.5">
            Work Name <span className="text-red-400">*</span>
          </label>
          <select
            value={form.workName}
            onChange={function(e) { setForm(function(p) { return Object.assign({}, p, { workName: e.target.value, customWorkName: '' }); }); }}
            className={inp}
          >
            <option value="">— Select a work type —</option>
            {(WORK_NAMES[form.category] || []).map(function(w) { return <option key={w} value={w}>{w}</option>; })}
            <option value="__custom__">Other (type your own)</option>
          </select>
          {form.workName === '__custom__' && (
            <input
              type="text"
              value={form.customWorkName}
              onChange={function(e) { set('customWorkName', e.target.value); }}
              placeholder="Type the work name..."
              className={`${inp} mt-2`}
            />
          )}
        </div>

        {/* Officer name + Designation */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-text-secondary dark:text-dark-text-secondary mb-1.5">
              Officer Name <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={form.officerName}
              onChange={function(e) { set('officerName', e.target.value); }}
              placeholder="e.g. Rajesh Patil"
              required
              className={inp}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-text-secondary dark:text-dark-text-secondary mb-1.5">
              Designation <span className="text-red-400">*</span>
            </label>
            <select value={form.designation} onChange={function(e) { set('designation', e.target.value); }} className={inp}>
              {DESIGNATIONS.map(function(d) { return <option key={d} value={d}>{d}</option>; })}
            </select>
          </div>
        </div>

        {/* Available Days */}
        <div>
          <label className="block text-xs font-semibold text-text-secondary dark:text-dark-text-secondary mb-2">
            Available Days
          </label>
          <div className="flex flex-wrap gap-2">
            {ALL_DAYS.map(function(day) {
              return (
                <button
                  key={day}
                  type="button"
                  onClick={function() { toggleDay(day); }}
                  className={`px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all duration-150 ${
                    form.availableDays.includes(day)
                      ? 'bg-primary-600 dark:bg-primary-700 text-white border-primary-600 dark:border-primary-700 shadow-soft'
                      : 'bg-white dark:bg-dark-surface border-border dark:border-dark-border text-text-muted dark:text-dark-text-muted hover:border-primary-300 dark:hover:border-primary-600 hover:text-primary-600 dark:hover:text-primary-400'
                  }`}
                >
                  {day.slice(0, 3)}
                </button>
              );
            })}
          </div>
        </div>

        {/* Timing + Location */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-text-secondary dark:text-dark-text-secondary mb-1.5">
              Timing <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={form.timing}
              onChange={function(e) { set('timing', e.target.value); }}
              placeholder="e.g. 10:00 AM – 1:00 PM"
              required
              className={inp}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-text-secondary dark:text-dark-text-secondary mb-1.5">
              Location <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={form.location}
              onChange={function(e) { set('location', e.target.value); }}
              placeholder="e.g. Room 2, Panchayat Office"
              required
              className={inp}
            />
          </div>
        </div>

        {/* Documents */}
        <div>
          <label className="block text-xs font-semibold text-text-secondary dark:text-dark-text-secondary mb-1.5">
            Documents Required
            <span className="text-text-muted dark:text-dark-text-muted font-normal ml-1">(citizen must bring)</span>
          </label>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={form.docInput}
              onChange={function(e) { set('docInput', e.target.value); }}
              onKeyDown={function(e) { if (e.key === 'Enter') { e.preventDefault(); addDoc(); } }}
              placeholder="e.g. Aadhar Card"
              className={`${inp} flex-1`}
            />
            <button type="button" onClick={addDoc}
              className="px-4 py-2.5 bg-primary-600 hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-400 text-white text-sm font-semibold rounded-xl transition-all flex-shrink-0">
              Add
            </button>
          </div>
          {form.documents.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {form.documents.map(function(doc, i) {
                return (
                  <span key={i} className="inline-flex items-center gap-1.5 bg-primary-100 dark:bg-primary-900/30 border border-primary-200 dark:border-primary-800 text-primary-700 dark:text-primary-400 text-xs font-medium px-3 py-1.5 rounded-xl">
                    {doc}
                    <button type="button" onClick={function() { removeDoc(i); }} className="text-primary-400 hover:text-red-500 transition-colors">
                      <IcoX />
                    </button>
                  </span>
                );
              })}
            </div>
          )}
        </div>

        {/* Search Keywords */}
        <div>
          <label className="block text-xs font-semibold text-text-secondary dark:text-dark-text-secondary mb-1.5">
            Search Keywords
            <span className="text-text-muted dark:text-dark-text-muted font-normal ml-1">(alternate names, local terms)</span>
          </label>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={form.kwInput}
              onChange={function(e) { set('kwInput', e.target.value); }}
              onKeyDown={function(e) { if (e.key === 'Enter') { e.preventDefault(); addKw(); } }}
              placeholder="e.g. janam, janm praman patra"
              className={`${inp} flex-1`}
            />
            <button type="button" onClick={addKw}
              className="px-4 py-2.5 bg-primary-600 hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-400 text-white text-sm font-semibold rounded-xl transition-all flex-shrink-0">
              Add
            </button>
          </div>
          {form.searchKeywords.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {form.searchKeywords.map(function(kw, i) {
                return (
                  <span key={i} className="inline-flex items-center gap-1.5 bg-accent-mist dark:bg-dark-surface2 border border-border dark:border-dark-border text-text-secondary dark:text-dark-text-secondary text-xs font-medium px-3 py-1.5 rounded-xl">
                    {kw}
                    <button type="button" onClick={function() { removeKw(i); }} className="text-text-muted hover:text-red-500 transition-colors">
                      <IcoX />
                    </button>
                  </span>
                );
              })}
            </div>
          )}
        </div>

        {/* Note */}
        <div>
          <label className="block text-xs font-semibold text-text-secondary dark:text-dark-text-secondary mb-1.5">
            Note <span className="text-text-muted dark:text-dark-text-muted font-normal">(optional)</span>
          </label>
          <textarea
            value={form.note}
            onChange={function(e) { set('note', e.target.value); }}
            placeholder="Any extra info for citizens..."
            rows={3}
            className={`${inp} resize-none`}
          />
        </div>

        {/* Active toggle */}
        <div className="flex items-center gap-3 p-4 bg-accent-mist dark:bg-dark-surface2 rounded-xl border border-border dark:border-dark-border">
          <div
            onClick={function() { set('isActive', !form.isActive); }}
            className={`w-10 h-[22px] rounded-full relative cursor-pointer transition-all flex-shrink-0 ${form.isActive ? 'bg-primary-600 dark:bg-primary-500' : 'bg-border dark:bg-dark-border'}`}
          >
            <div className={`w-4 h-4 bg-white rounded-full absolute top-[3px] transition-all shadow-sm ${form.isActive ? 'left-[22px]' : 'left-[3px]'}`} />
          </div>
          <div>
            <p className="text-sm font-semibold text-text-primary dark:text-dark-text-primary">Active</p>
            <p className="text-xs text-text-muted dark:text-dark-text-muted">Citizens can see this entry</p>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onCancel}
            className="flex-1 py-2.5 border border-border dark:border-dark-border text-text-secondary dark:text-dark-text-secondary text-sm font-semibold rounded-xl hover:bg-accent-mist dark:hover:bg-dark-surface2 transition-all">
            Cancel
          </button>
          <button type="submit" disabled={saving}
            className="flex-1 py-2.5 bg-primary-600 hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-400 text-white text-sm font-semibold rounded-xl transition-all shadow-soft disabled:opacity-60 flex items-center justify-center gap-2">
            {saving ? <><IcoSpinner /> Saving...</> : editingId ? 'Save Changes' : 'Add Entry'}
          </button>
        </div>
      </form>
    </div>
  );
}

// ─── Delete Confirm (inline) ──────────────────────────────────────────────────

function DeleteConfirm({ onConfirm, onCancel }) {
  return (
    <div className="bg-white dark:bg-dark-surface border border-red-200 dark:border-red-800 rounded-2xl overflow-hidden mb-4">
      <div className="px-6 py-4 border-b border-red-100 dark:border-red-900/30 bg-red-50/60 dark:bg-red-900/10 flex items-center justify-between">
        <p className="text-sm font-bold text-red-700 dark:text-red-400">Delete this entry?</p>
        <button onClick={onCancel} className="p-1.5 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 text-red-400 transition-all">
          <IcoX />
        </button>
      </div>
      <div className="p-6 flex items-center justify-between gap-4">
        <p className="text-sm text-text-muted dark:text-dark-text-muted">
          This cannot be undone. Citizens will no longer see this entry.
        </p>
        <div className="flex gap-3 flex-shrink-0">
          <button onClick={onCancel}
            className="px-4 py-2 border border-border dark:border-dark-border text-text-secondary dark:text-dark-text-secondary text-sm font-semibold rounded-xl hover:bg-accent-mist dark:hover:bg-dark-surface2 transition-all">
            Cancel
          </button>
          <button onClick={onConfirm}
            className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-sm font-semibold rounded-xl transition-all">
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function WorkGuideAdmin({ villageId }) {
  const [grouped, setGrouped]         = useState([]);
  const [loading, setLoading]         = useState(true);
  const [saving, setSaving]           = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [editingId, setEditingId]     = useState(null);
  const [showForm, setShowForm]       = useState(false);
  const [editInitial, setEditInitial] = useState(null);
  const [expandedCat, setExpandedCat] = useState(null);

  useEffect(function() {
    if (villageId) fetchGuides();
  }, [villageId]);

  async function fetchGuides() {
    try {
      setLoading(true);
      const res = await axios.get(`http://localhost:3000/workguide/village/${villageId}`, { withCredentials: true });
      const data = Array.isArray(res.data) ? res.data : [];
      setGrouped(data);
      if (data.length > 0 && !expandedCat) setExpandedCat(data[0].category);
    } catch(e) { toast.error('Failed to load work guide'); }
    finally { setLoading(false); }
  }

  async function handleSave(form) {
    if (!form.officerName.trim()) { toast.error('Officer name is required'); return; }
    if (!form.timing.trim())      { toast.error('Timing is required'); return; }
    if (!form.location.trim())    { toast.error('Location is required'); return; }

    const workName = form.workName === '__custom__' ? form.customWorkName.trim() : form.workName;
    if (!workName) { toast.error('Work name is required'); return; }

    const payload = {
      category: form.category, workName,
      officerName: form.officerName.trim(), designation: form.designation,
      availableDays: form.availableDays, timing: form.timing.trim(),
      location: form.location.trim(), documents: form.documents,
      searchKeywords: form.searchKeywords, note: form.note.trim(),
      isActive: form.isActive,
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
      setEditInitial(null);
      fetchGuides();
    } catch(err) {
      toast.error(err.response && err.response.data && err.response.data.message ? err.response.data.message : 'Failed to save');
    } finally { setSaving(false); }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    try {
      await axios.delete(`http://localhost:3000/workguide/${deleteTarget}`, { withCredentials: true });
      toast.success('Entry deleted');
      setDeleteTarget(null);
      fetchGuides();
    } catch(e) { toast.error('Failed to delete'); }
  }

  function openNew() {
    setEditInitial(null);
    setEditingId(null);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function openEdit(item) {
    const workNames = WORK_NAMES[item.category] || [];
    const isPreset  = workNames.includes(item.workName);
    setEditInitial({
      category: item.category,
      workName: isPreset ? item.workName : '__custom__',
      customWorkName: isPreset ? '' : item.workName,
      officerName: item.officerName,
      designation: item.designation,
      availableDays: item.availableDays || [],
      timing: item.timing || '',
      location: item.location || '',
      documents: item.documents || [],
      docInput: '',
      searchKeywords: item.searchKeywords || [],
      kwInput: '',
      note: item.note || '',
      isActive: item.isActive !== false,
    });
    setEditingId(item._id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  const totalEntries = grouped.reduce(function(sum, g) { return sum + g.items.length; }, 0);

  return (
    <div className="space-y-4">

      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-text-primary dark:text-dark-text-primary tracking-tight">Work Guide</h2>
          <p className="text-sm text-text-muted dark:text-dark-text-muted mt-1">
            {totalEntries} {totalEntries === 1 ? 'entry' : 'entries'} across {grouped.length} {grouped.length === 1 ? 'category' : 'categories'}
          </p>
        </div>
        {!showForm && (
          <button onClick={openNew}
            className="inline-flex items-center gap-2 text-sm font-semibold px-5 py-2.5 bg-primary-600 hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-400 text-white rounded-xl transition-all shadow-soft flex-shrink-0">
            <IcoPlus /> Add Entry
          </button>
        )}
      </div>

      {/* Inline form */}
      {showForm && (
        <WorkGuideForm
          initial={editInitial}
          editingId={editingId}
          onSave={handleSave}
          onCancel={function() { setShowForm(false); setEditingId(null); setEditInitial(null); }}
          saving={saving}
        />
      )}

      {/* Inline delete confirm */}
      {deleteTarget && (
        <DeleteConfirm
          onConfirm={handleDelete}
          onCancel={function() { setDeleteTarget(null); }}
        />
      )}

      {/* Content */}
      {loading ? (
        <div className="bg-white dark:bg-dark-surface border border-border dark:border-dark-border rounded-2xl flex items-center justify-center py-16 gap-3">
          <IcoSpinner />
          <span className="text-sm text-text-muted dark:text-dark-text-muted">Loading...</span>
        </div>
      ) : grouped.length === 0 ? (
        <div className="bg-white dark:bg-dark-surface border border-border dark:border-dark-border rounded-2xl flex flex-col items-center justify-center py-16 gap-3 text-center">
          <div className="w-12 h-12 rounded-2xl bg-accent-mist dark:bg-dark-surface2 border border-border dark:border-dark-border flex items-center justify-center mb-1">
            <svg className="w-5 h-5 text-primary-500 dark:text-primary-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
            </svg>
          </div>
          <p className="text-sm font-semibold text-text-primary dark:text-dark-text-primary">No work guide entries yet</p>
          <p className="text-xs text-text-muted dark:text-dark-text-muted max-w-xs">
            Add entries to help citizens find the right official for their work
          </p>
          <button onClick={openNew}
            className="mt-2 px-5 py-2.5 bg-primary-600 hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-400 text-white text-sm font-semibold rounded-xl transition-all shadow-soft">
            Add First Entry
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {grouped.map(function(group) {
            const isOpen = expandedCat === group.category;
            return (
              <div key={group.category} className="bg-white dark:bg-dark-surface border border-border dark:border-dark-border rounded-2xl overflow-hidden hover:border-primary-200 dark:hover:border-primary-800 transition-all duration-200">

                {/* Category header */}
                <button
                  onClick={function() { setExpandedCat(isOpen ? null : group.category); }}
                  className="w-full flex items-center justify-between px-5 py-4 hover:bg-accent-mist dark:hover:bg-dark-surface2 transition-colors duration-200 text-left"
                >
                  <div className="flex items-center gap-3">
                    <p className="text-sm font-bold text-text-primary dark:text-dark-text-primary">{group.category}</p>
                    <span className="text-xs font-bold bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 px-2.5 py-0.5 rounded-full">
                      {group.items.length}
                    </span>
                  </div>
                  <span className="text-text-muted dark:text-dark-text-muted">
                    <IcoChevron open={isOpen} />
                  </span>
                </button>

                {/* Items */}
                {isOpen && (
                  <div className="border-t border-border dark:border-dark-border divide-y divide-border dark:divide-dark-border">
                    {group.items.map(function(item) {
                      return (
                        <div key={item._id} className="flex items-start gap-4 px-5 py-4 hover:bg-accent-mist dark:hover:bg-dark-surface2 transition-colors duration-200">
                          <div className="w-9 h-9 bg-primary-100 dark:bg-primary-900/40 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5">
                            <svg className="w-4 h-4 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                            </svg>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap mb-1">
                              <p className="text-sm font-bold text-text-primary dark:text-dark-text-primary">{item.workName}</p>
                              {!item.isActive && (
                                <span className="text-xs bg-border dark:bg-dark-border text-text-muted dark:text-dark-text-muted px-2 py-0.5 rounded-full font-medium">Inactive</span>
                              )}
                            </div>
                            <p className="text-xs text-text-secondary dark:text-dark-text-secondary">
                              {item.officerName} — {item.designation}
                            </p>
                            {item.availableDays && item.availableDays.length > 0 && (
                              <p className="text-xs text-text-muted dark:text-dark-text-muted mt-1">
                                {item.availableDays.join(', ')}
                                {item.timing ? ` · ${item.timing}` : ''}
                              </p>
                            )}
                            {item.location && (
                              <p className="text-xs text-text-muted dark:text-dark-text-muted">{item.location}</p>
                            )}
                            {item.documents && item.documents.length > 0 && (
                              <div className="flex flex-wrap gap-1.5 mt-2">
                                {item.documents.slice(0, 3).map(function(doc, i) {
                                  return (
                                    <span key={i} className="text-xs bg-accent-mist dark:bg-dark-surface2 border border-border dark:border-dark-border text-text-secondary dark:text-dark-text-secondary px-2 py-0.5 rounded-lg">
                                      {doc}
                                    </span>
                                  );
                                })}
                                {item.documents.length > 3 && (
                                  <span className="text-xs text-text-muted dark:text-dark-text-muted px-1 py-0.5">
                                    +{item.documents.length - 3} more
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0 pt-0.5">
                            <button onClick={function() { openEdit(item); }}
                              className="w-8 h-8 rounded-xl border border-border dark:border-dark-border hover:border-primary-300 dark:hover:border-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 flex items-center justify-center text-text-muted dark:text-dark-text-muted hover:text-primary-600 dark:hover:text-primary-400 transition-all">
                              <IcoEdit />
                            </button>
                            <button onClick={function() { setDeleteTarget(item._id); }}
                              className="w-8 h-8 rounded-xl border border-border dark:border-dark-border hover:border-red-300 dark:hover:border-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center justify-center text-text-muted dark:text-dark-text-muted hover:text-red-500 transition-all">
                              <IcoTrash />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}