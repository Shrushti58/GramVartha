import React, { useState } from 'react';
import { uploadNotice } from '../services/api';
import { toast } from 'react-toastify';

export default function PublishNotice({ onPublished }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('general');
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !description) {
      toast.error('Title and description are required');
      return;
    }

    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('category', category);
    if (file) formData.append('file', file);

    try {
      setLoading(true);
      await uploadNotice(formData);
      toast.success('Notice published');
      setTitle('');
      setDescription('');
      setFile(null);
      if (onPublished) onPublished();
    } catch (err) {
      console.error(err);
      toast.error('Failed to publish notice');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-surface rounded-xl shadow-soft-earth p-6 mb-6">
      <h2 className="text-lg font-semibold mb-3">Publish Notice</h2>
      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title"
          className="w-full px-3 py-2 border rounded-lg"
          required
        />
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Description"
          className="w-full px-3 py-2 border rounded-lg"
          rows={4}
          required
        />
        <select value={category} onChange={(e) => setCategory(e.target.value)} className="px-3 py-2 border rounded-lg">
          <option value="general">General</option>
          <option value="development">Development</option>
          <option value="health">Health</option>
          <option value="education">Education</option>
          <option value="agriculture">Agriculture</option>
        </select>
        <input type="file" accept="image/*,application/pdf" onChange={(e) => setFile(e.target.files?.[0] || null)} />

        <div>
          <button disabled={loading} className="px-4 py-2 bg-button-primary text-white rounded-lg">
            {loading ? 'Publishing...' : 'Publish Notice'}
          </button>
        </div>
      </form>
    </div>
  );
}
