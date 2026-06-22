import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import api from "../services/api";

const initialForm = {
  title: "",
  description: "",
  amount: "",
  eligibility: "",
  documents: "",
  applicationSteps: "",
  category: "",
  beneficiary: "general",
};

export default function OfficialSchemes() {
  const [form, setForm] = useState(initialForm);
  const [saving, setSaving] = useState(false);
  const [schemes, setSchemes] = useState([]);
  const [loadingSchemes, setLoadingSchemes] = useState(true);
  const [editingScheme, setEditingScheme] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deletingId, setDeletingId] = useState("");

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const splitLines = (value) =>
    value
      .split("\n")
      .map((item) => item.trim())
      .filter(Boolean);

  const fetchVillageSchemes = async () => {
    try {
      setLoadingSchemes(true);
      const response = await api.get("/schemes/village");
      setSchemes(response.data?.data || []);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load village schemes");
    } finally {
      setLoadingSchemes(false);
    }
  };

  useEffect(() => {
    fetchVillageSchemes();
  }, []);

  const submitScheme = async (event) => {
    event.preventDefault();

    if (!form.title.trim() || !form.description.trim()) {
      toast.error("Title and description are required");
      return;
    }

    try {
      setSaving(true);

      const payload = {
        title: form.title.trim(),
        description: form.description.trim(),
        amount: Number(form.amount || 0),
        eligibility: form.eligibility.trim(),
        documents: splitLines(form.documents),
        applicationSteps: splitLines(form.applicationSteps),
        category: form.category
          ? form.category.split(",").map((item) => item.trim()).filter(Boolean)
          : [],
        beneficiary: form.beneficiary,
      };

      if (editingScheme) {
        await api.put(`/schemes/village/${editingScheme._id}`, payload);
        toast.success("Scheme updated successfully");
      } else {
        await api.post("/schemes/village", payload);
        toast.success("Scheme added successfully");
      }

      setForm(initialForm);
      setEditingScheme(null);
      fetchVillageSchemes();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to save scheme");
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (scheme) => {
    setEditingScheme(scheme);
    setForm({
      title: scheme.title || "",
      description: scheme.description || "",
      amount: scheme.amount ? String(scheme.amount) : "",
      eligibility: scheme.eligibility || "",
      documents: (scheme.documents || []).join("\n"),
      applicationSteps: (scheme.applicationSteps || []).join("\n"),
      category: (scheme.category || []).join(", "),
      beneficiary: scheme.beneficiary || "general",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const cancelEdit = () => {
    setEditingScheme(null);
    setForm(initialForm);
  };

  const deleteScheme = async () => {
    if (!deleteTarget) return;
    try {
      setDeletingId(deleteTarget._id);
      await api.delete(`/schemes/village/${deleteTarget._id}`);
      toast.success("Scheme deleted");
      if (editingScheme?._id === deleteTarget._id) {
        cancelEdit();
      }
      setDeleteTarget(null);
      fetchVillageSchemes();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete scheme");
    } finally {
      setDeletingId("");
    }
  };

  // ─── Skeleton ──────────────────────────────────────────────────────────────

  const SchemeSkeleton = () => (
    <div className="bg-white dark:bg-dark-surface border border-border dark:border-dark-border rounded-xl p-5 animate-pulse">
      <div className="flex justify-between">
        <div className="h-5 w-2/3 bg-gray-200 dark:bg-gray-700 rounded mb-3" />
        <div className="h-5 w-16 bg-gray-200 dark:bg-gray-700 rounded-full" />
      </div>
      <div className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded mb-2" />
      <div className="h-4 w-4/5 bg-gray-200 dark:bg-gray-700 rounded mb-4" />
      <div className="flex gap-2">
        <div className="h-6 w-16 bg-gray-200 dark:bg-gray-700 rounded-full" />
        <div className="h-6 w-16 bg-gray-200 dark:bg-gray-700 rounded-full" />
      </div>
    </div>
  );

  // ─── Delete Modal ─────────────────────────────────────────────────────────

  const DeleteModal = () => {
    if (!deleteTarget) return null;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setDeleteTarget(null)} />
        <div className="relative w-full max-w-md bg-white dark:bg-dark-surface border border-border dark:border-dark-border rounded-2xl p-6 shadow-2xl">
          <div className="w-12 h-12 rounded-2xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 flex items-center justify-center mb-4">
            <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-text-primary dark:text-dark-text-primary">
            Delete Scheme?
          </h3>
          <p className="text-sm text-text-secondary dark:text-dark-text-secondary mt-2">
            This will remove <span className="font-semibold">{deleteTarget.title}</span> from your village schemes.
          </p>
          <div className="flex gap-3 mt-6">
            <button
              onClick={() => setDeleteTarget(null)}
              disabled={deletingId === deleteTarget._id}
              className="flex-1 px-4 py-2.5 border border-border dark:border-dark-border rounded-xl text-sm font-semibold text-text-secondary dark:text-dark-text-secondary hover:bg-accent-mist transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={deleteScheme}
              disabled={deletingId === deleteTarget._id}
              className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-semibold transition-colors disabled:opacity-50"
            >
              {deletingId === deleteTarget._id ? "Deleting..." : "Delete"}
            </button>
          </div>
        </div>
      </div>
    );
  };

  // ─── Main Render ──────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-text-primary dark:text-dark-text-primary">
          Village Schemes
        </h1>
        <p className="text-sm text-text-muted dark:text-dark-text-muted mt-1">
          Create and manage schemes for your village citizens
        </p>
      </div>

      {/* Form */}
      <form
        onSubmit={submitScheme}
        className="bg-white dark:bg-dark-surface border border-border dark:border-dark-border rounded-xl p-5 shadow-soft"
      >
        <div className="mb-5">
          <h2 className="text-lg font-bold text-text-primary dark:text-dark-text-primary">
            {editingScheme ? "Edit Scheme" : "Add New Scheme"}
          </h2>
          <p className="text-xs text-text-muted dark:text-dark-text-muted mt-1">
            {editingScheme
              ? "Update this scheme for your village"
              : "This scheme will be visible only to citizens from your village"}
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-text-secondary dark:text-dark-text-secondary mb-1.5">
              Scheme Title *
            </label>
            <input
              value={form.title}
              onChange={(e) => updateField("title", e.target.value)}
              placeholder="e.g., Village Student Support Scheme"
              className="w-full px-4 py-2.5 rounded-xl border border-border dark:border-dark-border bg-white dark:bg-dark-surface2 text-sm text-text-primary dark:text-dark-text-primary placeholder-text-muted outline-none focus:ring-2 focus:ring-primary-400 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-text-secondary dark:text-dark-text-secondary mb-1.5">
              Description *
            </label>
            <textarea
              value={form.description}
              onChange={(e) => updateField("description", e.target.value)}
              rows={4}
              placeholder="Describe the scheme and who it's for"
              className="w-full px-4 py-2.5 rounded-xl border border-border dark:border-dark-border bg-white dark:bg-dark-surface2 text-sm text-text-primary dark:text-dark-text-primary placeholder-text-muted outline-none resize-none focus:ring-2 focus:ring-primary-400 transition-colors"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-text-secondary dark:text-dark-text-secondary mb-1.5">
                Amount
              </label>
              <input
                type="number"
                min="0"
                value={form.amount}
                onChange={(e) => updateField("amount", e.target.value)}
                placeholder="0"
                className="w-full px-4 py-2.5 rounded-xl border border-border dark:border-dark-border bg-white dark:bg-dark-surface2 text-sm text-text-primary dark:text-dark-text-primary placeholder-text-muted outline-none focus:ring-2 focus:ring-primary-400 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-text-secondary dark:text-dark-text-secondary mb-1.5">
                Beneficiary
              </label>
              <select
                value={form.beneficiary}
                onChange={(e) => updateField("beneficiary", e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-border dark:border-dark-border bg-white dark:bg-dark-surface2 text-sm text-text-primary dark:text-dark-text-primary outline-none focus:ring-2 focus:ring-primary-400 transition-colors"
              >
                <option value="general">General</option>
                <option value="student">Student</option>
                <option value="farmer">Farmer</option>
                <option value="women">Women</option>
                <option value="worker">Worker</option>
                <option value="business">Business</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-text-secondary dark:text-dark-text-secondary mb-1.5">
              Categories
            </label>
            <input
              value={form.category}
              onChange={(e) => updateField("category", e.target.value)}
              placeholder="education, scholarship, health"
              className="w-full px-4 py-2.5 rounded-xl border border-border dark:border-dark-border bg-white dark:bg-dark-surface2 text-sm text-text-primary dark:text-dark-text-primary placeholder-text-muted outline-none focus:ring-2 focus:ring-primary-400 transition-colors"
            />
            <p className="text-xs text-text-muted dark:text-dark-text-muted mt-1">
              Separate multiple categories with commas
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-text-secondary dark:text-dark-text-secondary mb-1.5">
              Eligibility
            </label>
            <textarea
              value={form.eligibility}
              onChange={(e) => updateField("eligibility", e.target.value)}
              rows={3}
              placeholder="Who is eligible for this scheme?"
              className="w-full px-4 py-2.5 rounded-xl border border-border dark:border-dark-border bg-white dark:bg-dark-surface2 text-sm text-text-primary dark:text-dark-text-primary placeholder-text-muted outline-none resize-none focus:ring-2 focus:ring-primary-400 transition-colors"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-text-secondary dark:text-dark-text-secondary mb-1.5">
                Required Documents
              </label>
              <textarea
                value={form.documents}
                onChange={(e) => updateField("documents", e.target.value)}
                rows={5}
                placeholder="Aadhaar Card&#10;Bank Passbook&#10;Residence Proof"
                className="w-full px-4 py-2.5 rounded-xl border border-border dark:border-dark-border bg-white dark:bg-dark-surface2 text-sm text-text-primary dark:text-dark-text-primary placeholder-text-muted outline-none resize-none focus:ring-2 focus:ring-primary-400 transition-colors"
              />
              <p className="text-xs text-text-muted dark:text-dark-text-muted mt-1">
                One document per line
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-text-secondary dark:text-dark-text-secondary mb-1.5">
                Application Steps
              </label>
              <textarea
                value={form.applicationSteps}
                onChange={(e) => updateField("applicationSteps", e.target.value)}
                rows={5}
                placeholder="Visit Gram Panchayat&#10;Submit documents&#10;Collect acknowledgement"
                className="w-full px-4 py-2.5 rounded-xl border border-border dark:border-dark-border bg-white dark:bg-dark-surface2 text-sm text-text-primary dark:text-dark-text-primary placeholder-text-muted outline-none resize-none focus:ring-2 focus:ring-primary-400 transition-colors"
              />
              <p className="text-xs text-text-muted dark:text-dark-text-muted mt-1">
                One step per line
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            {editingScheme && (
              <button
                type="button"
                onClick={cancelEdit}
                disabled={saving}
                className="w-full sm:w-auto px-6 py-2.5 border border-border dark:border-dark-border text-text-secondary dark:text-dark-text-secondary text-sm font-semibold rounded-xl hover:bg-accent-mist transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              disabled={saving}
              className="w-full sm:w-auto px-6 py-2.5 bg-primary-600 hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-400 text-white text-sm font-semibold rounded-xl transition-colors shadow-soft disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {saving ? (
                <>
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  {editingScheme ? "Updating..." : "Adding..."}
                </>
              ) : (
                editingScheme ? "Update Scheme" : "Add Scheme"
              )}
            </button>
          </div>
        </div>
      </form>

      {/* Scheme List */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h2 className="text-lg font-bold text-text-primary dark:text-dark-text-primary">
              Your Village Schemes
            </h2>
            <p className="text-sm text-text-muted dark:text-dark-text-muted">
              {schemes.length} scheme{schemes.length !== 1 ? "s" : ""} for your village
            </p>
          </div>
          <button
            onClick={fetchVillageSchemes}
            disabled={loadingSchemes}
            className="px-4 py-2 text-sm font-semibold text-text-secondary dark:text-dark-text-secondary border border-border dark:border-dark-border rounded-xl hover:bg-accent-mist transition-colors disabled:opacity-50"
          >
            {loadingSchemes ? "Loading..." : "Refresh"}
          </button>
        </div>

        {loadingSchemes ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => <SchemeSkeleton key={i} />)}
          </div>
        ) : schemes.length === 0 ? (
          <div className="bg-white dark:bg-dark-surface border border-border dark:border-dark-border rounded-xl flex flex-col items-center justify-center py-12 gap-2 text-center">
            <div className="w-12 h-12 rounded-2xl bg-accent-mist dark:bg-dark-surface2 border border-border dark:border-dark-border flex items-center justify-center">
              <svg className="w-5 h-5 text-primary-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <p className="text-sm font-semibold text-text-primary dark:text-dark-text-primary">
              No schemes added yet
            </p>
            <p className="text-sm text-text-muted dark:text-dark-text-muted">
              Add your first village scheme using the form above
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {schemes.map((scheme) => (
              <div
                key={scheme._id}
                className="bg-white dark:bg-dark-surface border border-border dark:border-dark-border rounded-xl p-5 shadow-soft flex flex-col"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="text-base font-bold text-text-primary dark:text-dark-text-primary leading-snug">
                      {scheme.title}
                    </h3>
                    <p className="text-xs text-text-muted dark:text-dark-text-muted mt-1 capitalize">
                      {scheme.beneficiary || "general"}
                    </p>
                  </div>
                  <span className="shrink-0 px-2.5 py-1 rounded-full bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 text-xs font-semibold">
                    Village Only
                  </span>
                </div>

                <p className="text-sm text-text-secondary dark:text-dark-text-secondary mt-3 leading-relaxed line-clamp-3">
                  {scheme.shortDescription || scheme.description}
                </p>

                <div className="mt-3 flex flex-wrap gap-1.5">
                  {(scheme.category || []).slice(0, 3).map((category) => (
                    <span
                      key={category}
                      className="px-2.5 py-0.5 rounded-full bg-accent-mist dark:bg-dark-surface2 text-xs font-medium text-text-secondary dark:text-dark-text-secondary"
                    >
                      {category}
                    </span>
                  ))}
                </div>

                <div className="mt-auto pt-4 border-t border-border dark:border-dark-border">
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <p className="text-text-muted dark:text-dark-text-muted">Amount</p>
                      <p className="font-bold text-text-primary dark:text-dark-text-primary mt-0.5">
                        {Number(scheme.amount || 0) > 0 ? `₹${Number(scheme.amount).toLocaleString("en-IN")}` : "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-text-muted dark:text-dark-text-muted">Documents</p>
                      <p className="font-bold text-text-primary dark:text-dark-text-primary mt-0.5">
                        {(scheme.documents || []).length}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={() => startEdit(scheme)}
                      className="flex-1 px-3 py-2 border border-border dark:border-dark-border rounded-lg text-xs font-semibold text-text-secondary dark:text-dark-text-secondary hover:bg-accent-mist transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => setDeleteTarget(scheme)}
                      disabled={deletingId === scheme._id}
                      className="flex-1 px-3 py-2 border border-red-200 dark:border-red-800 rounded-lg text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-50"
                    >
                      {deletingId === scheme._id ? "..." : "Delete"}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <DeleteModal />
    </div>
  );
}