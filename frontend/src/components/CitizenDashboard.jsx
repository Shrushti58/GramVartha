import React, { useState } from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const CitizenDashboard = () => {
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);

  // Demo data
  const demoNotices = [
    { title: "Water Supply Interruption", date: "2025-10-08" },
    { title: "Garbage Collection Schedule", date: "2025-10-05" },
    { title: "New Streetlight Installation", date: "2025-10-02" },
  ];

  const demoEvents = [
    { title: "Health Camp", date: "2025-10-15", location: "Community Hall" },
    { title: "Tree Plantation Drive", date: "2025-10-22", location: "City Park" },
  ];

  const activityData = [
    { name: "Notices Viewed", count: 12 },
    { name: "Feedback Given", count: 4 },
    { name: "Events Attended", count: 3 },
    { name: "Suggestions Made", count: 2 },
  ];

  const monthlyEngagement = [
    { month: "Jan", engagement: 30 },
    { month: "Feb", engagement: 50 },
    { month: "Mar", engagement: 80 },
    { month: "Apr", engagement: 60 },
    { month: "May", engagement: 90 },
    { month: "Jun", engagement: 120 },
    { month: "Jul", engagement: 150 },
    { month: "Aug", engagement: 130 },
    { month: "Sep", engagement: 140 },
    { month: "Oct", engagement: 180 },
  ];

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      {/* Welcome */}
      <h1 className="text-3xl font-bold mb-4">Welcome, Shrushti 👋</h1>
      <p className="text-gray-600 mb-6">
        Here’s your personalized citizen dashboard overview.
      </p>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total Notices", value: 24 },
          { label: "Announcements", value: 8 },
          { label: "Upcoming Events", value: 3 },
          { label: "Feedback Given", value: 5 },
        ].map((item) => (
          <div
            key={item.label}
            className="bg-white shadow-md rounded-xl p-4 text-center hover:shadow-lg transition-all"
          >
            <h2 className="text-xl font-semibold">{item.value}</h2>
            <p className="text-gray-500">{item.label}</p>
          </div>
        ))}
      </div>

      {/* Analytics Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Activity Bar Chart */}
        <div className="bg-white shadow-md rounded-xl p-5">
          <h2 className="text-xl font-semibold mb-3">📊 Activity Overview</h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={activityData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#3B82F6" radius={8} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Engagement Line Chart */}
        <div className="bg-white shadow-md rounded-xl p-5">
          <h2 className="text-xl font-semibold mb-3">📈 Monthly Engagement</h2>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={monthlyEngagement}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="engagement"
                stroke="#10B981"
                strokeWidth={3}
                dot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Notices & Events */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Latest Notices */}
        <div className="bg-white shadow-md rounded-xl p-5">
          <h2 className="text-xl font-semibold mb-3">📜 Latest Notices</h2>
          <ul className="divide-y divide-gray-200">
            {demoNotices.map((n, i) => (
              <li key={i} className="py-2 flex justify-between">
                <span>{n.title}</span>
                <span className="text-sm text-gray-500">{n.date}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Upcoming Events */}
        <div className="bg-white shadow-md rounded-xl p-5">
          <h2 className="text-xl font-semibold mb-3">📅 Upcoming Events</h2>
          {demoEvents.map((e, i) => (
            <div
              key={i}
              className="border-l-4 border-blue-500 pl-4 mb-3 bg-gray-50 p-3 rounded"
            >
              <h3 className="font-semibold">{e.title}</h3>
              <p className="text-sm text-gray-500">
                {e.date} • {e.location}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Feedback Section */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-3">💬 Feedback</h2>
        <p className="text-gray-600 mb-3">
          Have suggestions or concerns? Let us know!
        </p>
        <button
          onClick={() => setShowFeedbackModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-all"
        >
          Give Feedback
        </button>
      </div>

      {/* Feedback Modal */}
      {showFeedbackModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg p-6 w-96">
            <h3 className="text-xl font-semibold mb-3">Submit Feedback</h3>
            <textarea
              className="w-full border rounded-md p-2 h-24 mb-4 focus:ring-2 focus:ring-blue-400"
              placeholder="Write your feedback here..."
            />
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowFeedbackModal(false)}
                className="px-4 py-2 rounded-md bg-gray-200 hover:bg-gray-300"
              >
                Cancel
              </button>
              <button className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700">
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CitizenDashboard;
