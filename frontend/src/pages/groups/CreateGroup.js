import React, { useState, useContext } from "react";
import api from "../../api/axios";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";

export default function CreateGroup() {
  const { user } = useContext(AuthContext); // ensure user info is available
  const [form, setForm] = useState({ name: "", description: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Include token in headers for auth
      const token = localStorage.getItem("token");
      // The authorization logic (admin role check) is handled by the backend (requireRole middleware)
      if (!token) throw new Error("You must be logged in as admin to create a group");

      const res = await api.post(
        "/groups",
        form,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true, // required if backend uses cookies
        }
      );

      // Navigate to the newly created group's details page
      navigate(`/admin/groups/${res.data._id}`); // Assuming admin pages start with /admin/groups
    } catch (err) {
      console.error("Create Group Error:", err);
      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to create group. Make sure you are admin."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <div className="w-full max-w-md bg-white p-6 rounded shadow">
        <h2 className="text-xl font-semibold mb-4">Create Private Group</h2>
        {error && <p className="text-red-500 mb-3">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            required
            placeholder="Group name"
            className="w-full p-2 border rounded"
          />
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Description"
            className="w-full p-2 border rounded"
          />
          <input
            name="password"
            type="password" // Added type password for security
            value={form.password}
            onChange={handleChange}
            required
            placeholder="Group password (for members)"
            className="w-full p-2 border rounded"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:bg-gray-400"
          >
            {loading ? "Creating..." : "Create"}
          </button>
        </form>
      </div>
    </div>
  );
}