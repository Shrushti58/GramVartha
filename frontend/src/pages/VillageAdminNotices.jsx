import React, { useState } from 'react';
import PublishNotice from '../components/PublishNotice';
import Notices from '../components/Notices';

export default function VillageAdminNotices() {
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold">Village Admin — Notices</h1>
          <p className="text-text-muted mt-2">Publish and manage notices for your village.</p>
        </div>

        <PublishNotice onPublished={() => setRefreshKey(k => k + 1)} />

        {/* Reuse the public Notices listing below; it will show existing notices */}
        <div key={refreshKey}>
          <Notices />
        </div>
      </div>
    </div>
  );
}
