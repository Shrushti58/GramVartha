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
  const [deletingId, setDeletingId] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);

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
      toast.error(error.response?.data?.message || error.response?.data?.error || "Failed to load village schemes");
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
      } else {
        await api.post("/schemes/village", payload);
      }

      toast.success(editingScheme ? "Village scheme updated successfully" : "Village scheme added successfully");
      setForm(initialForm);
      setEditingScheme(null);
      fetchVillageSchemes();
    } catch (error) {
      toast.error(error.response?.data?.message || error.response?.data?.error || "Failed to add village scheme");
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
      toast.success("Village scheme deleted");
      if (editingScheme?._id === deleteTarget._id) {
        cancelEdit();
      }
      setDeleteTarget(null);
      fetchVillageSchemes();
    } catch (error) {
      toast.error(error.response?.data?.message || error.response?.data?.error || "Failed to delete village scheme");
    } finally {
      setDeletingId("");
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-text-primary dark:text-dark-text-primary">
          Village Schemes
        </h1>
        <p className="text-sm text-text-muted dark:text-dark-text-muted mt-2">
          Create and review schemes available only to your assigned village.
        </p>
      </div>

      <form
        onSubmit={submitScheme}
        className="bg-white dark:bg-dark-surface border border-border dark:border-dark-border rounded-2xl p-5 sm:p-6 shadow-soft space-y-5"
      >
        <div>
          <h2 className="text-lg font-bold text-text-primary dark:text-dark-text-primary">
            {editingScheme ? "Edit Scheme" : "Add New Scheme"}
          </h2>
          <p className="text-xs text-text-muted dark:text-dark-text-muted mt-1">
            {editingScheme
              ? "Update this village-specific scheme for your citizens."
              : "This scheme will be visible only to citizens from your village."}
          </p>
        </div>

        <div>
          <label className="block text-xs font-semibold text-text-secondary dark:text-dark-text-secondary mb-1.5">
            Scheme Title *
          </label>
          <input
            value={form.title}
            onChange={(event) => updateField("title", event.target.value)}
            placeholder="Example: Village Student Support Scheme"
            className="w-full px-4 py-3 rounded-xl border border-border dark:border-dark-border bg-white dark:bg-dark-surface2 text-sm text-text-primary dark:text-dark-text-primary outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/10"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-text-secondary dark:text-dark-text-secondary mb-1.5">
            Description *
          </label>
          <textarea
            value={form.description}
            onChange={(event) => updateField("description", event.target.value)}
            rows={4}
            placeholder="Describe who this scheme is for and what support is provided."
            className="w-full px-4 py-3 rounded-xl border border-border dark:border-dark-border bg-white dark:bg-dark-surface2 text-sm text-text-primary dark:text-dark-text-primary outline-none resize-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/10"
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
              onChange={(event) => updateField("amount", event.target.value)}
              placeholder="0"
              className="w-full px-4 py-3 rounded-xl border border-border dark:border-dark-border bg-white dark:bg-dark-surface2 text-sm text-text-primary dark:text-dark-text-primary outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/10"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-text-secondary dark:text-dark-text-secondary mb-1.5">
              Beneficiary
            </label>
            <select
              value={form.beneficiary}
              onChange={(event) => updateField("beneficiary", event.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-border dark:border-dark-border bg-white dark:bg-dark-surface2 text-sm text-text-primary dark:text-dark-text-primary outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/10"
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
            onChange={(event) => updateField("category", event.target.value)}
            placeholder="education, scholarship"
            className="w-full px-4 py-3 rounded-xl border border-border dark:border-dark-border bg-white dark:bg-dark-surface2 text-sm text-text-primary dark:text-dark-text-primary outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/10"
          />
          <p className="text-xs text-text-muted dark:text-dark-text-muted mt-1">
            Separate multiple categories with commas.
          </p>
        </div>

        <div>
          <label className="block text-xs font-semibold text-text-secondary dark:text-dark-text-secondary mb-1.5">
            Eligibility
          </label>
          <textarea
            value={form.eligibility}
            onChange={(event) => updateField("eligibility", event.target.value)}
            rows={3}
            placeholder="Example: Applicant must be a resident of the village."
            className="w-full px-4 py-3 rounded-xl border border-border dark:border-dark-border bg-white dark:bg-dark-surface2 text-sm text-text-primary dark:text-dark-text-primary outline-none resize-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/10"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-text-secondary dark:text-dark-text-secondary mb-1.5">
              Required Documents
            </label>
            <textarea
              value={form.documents}
              onChange={(event) => updateField("documents", event.target.value)}
              rows={5}
              placeholder={"Aadhaar Card\nBank Passbook\nResidence Proof"}
              className="w-full px-4 py-3 rounded-xl border border-border dark:border-dark-border bg-white dark:bg-dark-surface2 text-sm text-text-primary dark:text-dark-text-primary outline-none resize-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/10"
            />
            <p className="text-xs text-text-muted dark:text-dark-text-muted mt-1">
              Add one document per line.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-text-secondary dark:text-dark-text-secondary mb-1.5">
              Application Steps
            </label>
            <textarea
              value={form.applicationSteps}
              onChange={(event) => updateField("applicationSteps", event.target.value)}
              rows={5}
              placeholder={"Visit Gram Panchayat office\nSubmit documents\nCollect acknowledgement"}
              className="w-full px-4 py-3 rounded-xl border border-border dark:border-dark-border bg-white dark:bg-dark-surface2 text-sm text-text-primary dark:text-dark-text-primary outline-none resize-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/10"
            />
            <p className="text-xs text-text-muted dark:text-dark-text-muted mt-1">
              Add one step per line.
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-end gap-3 pt-2">
          {editingScheme && (
            <button
              type="button"
              onClick={cancelEdit}
              disabled={saving}
              className="w-full sm:w-auto px-6 py-3 border border-border dark:border-dark-border text-text-secondary dark:text-dark-text-secondary text-sm font-semibold rounded-xl hover:bg-accent-mist dark:hover:bg-dark-surface2 transition-all disabled:opacity-60"
            >
              Cancel Edit
            </button>
          )}
          <button
            type="submit"
            disabled={saving}
            className="w-full sm:w-auto px-6 py-3 bg-primary-600 hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-400 text-white text-sm font-semibold rounded-xl transition-all shadow-soft disabled:opacity-60"
          >
            {saving
              ? editingScheme
                ? "Updating..."
                : "Adding..."
              : editingScheme
              ? "Update Scheme"
              : "Add Village Scheme"}
          </button>
        </div>
      </form>

      <section>
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-4">
          <div>
            <h2 className="text-xl font-bold text-text-primary dark:text-dark-text-primary">
              Your Village Schemes
            </h2>
            <p className="text-sm text-text-muted dark:text-dark-text-muted mt-1">
              {schemes.length} scheme{schemes.length === 1 ? "" : "s"} added for your village.
            </p>
          </div>
          <button
            type="button"
            onClick={fetchVillageSchemes}
            disabled={loadingSchemes}
            className="inline-flex items-center justify-center px-4 py-2.5 border border-border dark:border-dark-border text-sm font-semibold text-text-secondary dark:text-dark-text-secondary rounded-xl hover:bg-accent-mist dark:hover:bg-dark-surface2 transition-all disabled:opacity-60"
          >
            {loadingSchemes ? "Refreshing..." : "Refresh"}
          </button>
        </div>

        {loadingSchemes ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="bg-white dark:bg-dark-surface border border-border dark:border-dark-border rounded-2xl p-5 shadow-soft animate-pulse"
              >
                <div className="h-5 w-2/3 bg-primary-100 dark:bg-primary-900/40 rounded mb-3" />
                <div className="h-4 w-full bg-primary-100 dark:bg-primary-900/30 rounded mb-2" />
                <div className="h-4 w-4/5 bg-primary-100 dark:bg-primary-900/30 rounded mb-5" />
                <div className="flex gap-2">
                  <div className="h-6 w-20 bg-primary-100 dark:bg-primary-900/30 rounded-full" />
                  <div className="h-6 w-16 bg-primary-100 dark:bg-primary-900/30 rounded-full" />
                </div>
              </div>
            ))}
          </div>
        ) : schemes.length === 0 ? (
          <div className="bg-white dark:bg-dark-surface border border-border dark:border-dark-border rounded-2xl p-8 text-center shadow-soft">
            <p className="text-sm font-semibold text-text-primary dark:text-dark-text-primary">
              No village schemes added yet
            </p>
            <p className="text-xs text-text-muted dark:text-dark-text-muted mt-1">
              Add your first village-specific scheme using the form above.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {schemes.map((scheme) => (
              <article
                key={scheme._id}
                className="bg-white dark:bg-dark-surface border border-border dark:border-dark-border rounded-2xl p-5 shadow-soft flex flex-col min-h-[260px]"
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
                  <span className="shrink-0 px-2.5 py-1 rounded-full bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 text-[11px] font-semibold">
                    Village Only
                  </span>
                </div>

                <p className="text-sm text-text-secondary dark:text-dark-text-secondary mt-4 leading-relaxed line-clamp-3">
                  {scheme.shortDescription || scheme.description}
                </p>

                <div className="mt-4 flex flex-wrap gap-2">
                  {(scheme.category || []).slice(0, 3).map((category) => (
                    <span
                      key={category}
                      className="px-2.5 py-1 rounded-full bg-accent-mist dark:bg-dark-surface2 text-[11px] font-semibold text-text-secondary dark:text-dark-text-secondary"
                    >
                      {category}
                    </span>
                  ))}
                </div>

                <div className="mt-auto pt-5 border-t border-border dark:border-dark-border">
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <p className="text-text-muted dark:text-dark-text-muted">Amount</p>
                      <p className="font-bold text-text-primary dark:text-dark-text-primary mt-0.5">
                        {Number(scheme.amount || 0) > 0 ? `Rs. ${Number(scheme.amount).toLocaleString("en-IN")}` : "Not specified"}
                      </p>
                    </div>
                    <div>
                      <p className="text-text-muted dark:text-dark-text-muted">Documents</p>
                      <p className="font-bold text-text-primary dark:text-dark-text-primary mt-0.5">
                        {(scheme.documents || []).length}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <button
                      type="button"
                      onClick={() => startEdit(scheme)}
                      className="flex-1 px-3 py-2 border border-border dark:border-dark-border rounded-xl text-xs font-semibold text-text-secondary dark:text-dark-text-secondary hover:bg-accent-mist dark:hover:bg-dark-surface2 transition-all"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteTarget(scheme)}
                      disabled={deletingId === scheme._id}
                      className="flex-1 px-3 py-2 border border-red-200 dark:border-red-800 rounded-xl text-xs font-semibold text-red-600 dark:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all disabled:opacity-60"
                    >
                      {deletingId === scheme._id ? "Deleting..." : "Delete"}
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <button
            type="button"
            aria-label="Close delete confirmation"
            onClick={() => setDeleteTarget(null)}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          />
          <div className="relative w-full max-w-md bg-white dark:bg-dark-surface border border-border dark:border-dark-border rounded-2xl shadow-large p-5 sm:p-6">
            <div className="w-11 h-11 rounded-2xl bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 flex items-center justify-center mb-4">
              <svg className="w-5 h-5 text-red-600 dark:text-red-300" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-text-primary dark:text-dark-text-primary">
              Delete village scheme?
            </h3>
            <p className="text-sm text-text-secondary dark:text-dark-text-secondary mt-2 leading-relaxed">
              This will remove <span className="font-semibold">{deleteTarget.title}</span> from your village schemes.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 mt-6">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                disabled={deletingId === deleteTarget._id}
                className="flex-1 px-4 py-2.5 border border-border dark:border-dark-border rounded-xl text-sm font-semibold text-text-secondary dark:text-dark-text-secondary hover:bg-accent-mist dark:hover:bg-dark-surface2 transition-all disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={deleteScheme}
                disabled={deletingId === deleteTarget._id}
                className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-semibold transition-all disabled:opacity-60"
              >
                {deletingId === deleteTarget._id ? "Deleting..." : "Delete Scheme"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
