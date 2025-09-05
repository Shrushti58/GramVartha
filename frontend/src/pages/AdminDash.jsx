import React from 'react'
import  { useState } from "react";
const AdminDash = () => {
      const [activeTab, setActiveTab] = useState("dashboard");
  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-green-800 text-white p-4">
        <h2 className="text-2xl font-bold mb-6">GramVartha Admin</h2>
        <ul className="space-y-4">
          <li>
            <button
              className={`w-full text-left ${
                activeTab === "dashboard" ? "font-bold" : ""
              }`}
              onClick={() => setActiveTab("dashboard")}
            >
              Dashboard
            </button>
          </li>
          <li>
            <button
              className={`w-full text-left ${
                activeTab === "members" ? "font-bold" : ""
              }`}
              onClick={() => setActiveTab("members")}
            >
              Members
            </button>
          </li>
          <li>
            <button
              className={`w-full text-left ${
                activeTab === "notices" ? "font-bold" : ""
              }`}
              onClick={() => setActiveTab("notices")}
            >
              Notices
            </button>
          </li>
          <li>
            <button
              className={`w-full text-left ${
                activeTab === "events" ? "font-bold" : ""
              }`}
              onClick={() => setActiveTab("events")}
            >
              Events
            </button>
          </li>
          <li>
            <button
              className={`w-full text-left ${
                activeTab === "settings" ? "font-bold" : ""
              }`}
              onClick={() => setActiveTab("settings")}
            >
              Settings
            </button>
          </li>
        </ul>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6">
        {activeTab === "dashboard" && <h1 className="text-xl font-bold">📊 Dashboard Overview</h1>}
        {activeTab === "members" && <h1 className="text-xl font-bold">👥 Manage Members</h1>}
        {activeTab === "notices" && <h1 className="text-xl font-bold">📜 Manage Notices</h1>}
        {activeTab === "events" && <h1 className="text-xl font-bold">📅 Manage Events</h1>}
        {activeTab === "settings" && <h1 className="text-xl font-bold">⚙️ Settings</h1>}
      </div>
    </div>
  )
}

export default AdminDash
