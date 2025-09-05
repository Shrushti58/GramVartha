import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function AdminLogin() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:3000/admin/login", formData);

      setMessage(res.data.message);

      if (res.data.message === "Login Sucessful") {
        // redirect after short delay
        setTimeout(() => {
          navigate("/admin/dashboard");
        }, 1000);
      }
    } catch (err) {
      setMessage(err.response?.data?.message || "Something went wrong, try again!");
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <div className="bg-white shadow-lg rounded-xl p-8 w-96">
        <h2 className="text-2xl font-bold mb-6 text-center">Admin Login</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            className="w-full p-2 border rounded-lg"
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            className="w-full p-2 border rounded-lg"
            required
          />
          <button
            type="submit"
            className="w-full bg-green-700 text-white p-2 rounded-lg hover:bg-green-800"
          >
            Login
          </button>
        </form>

        {/* message display */}
        {message && (
          <p
            className={`text-center mt-4 text-sm ${
              message === "Login successful" ? "text-green-600" : "text-red-500"
            }`}
          >
            {message}
          </p>
        )}

        <p className="text-sm mt-4 text-center">
          Don’t have an account?{" "}
          <a href="/admin/register" className="text-green-700 font-semibold">
            Register
          </a>
        </p>
      </div>
    </div>
  );
}
