import React, { useState, useEffect } from "react";
import api from "../api/axios";

export default function AdminDashboard({ user }) {
  const [joinedGroups, setJoinedGroups] = useState([]);
  const [showGroupForm, setShowGroupForm] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [groupPassword, setGroupPassword] = useState("");
  const [loadingGroup, setLoadingGroup] = useState(false);

  useEffect(() => {
    fetchJoinedGroups();
  }, []);

  async function fetchJoinedGroups() {
    try {
      const res = await api.get("/groups/joined", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setJoinedGroups(res.data);
    } catch (err) {
      console.error(err);
    }
  }

  const handleGroupSubmit = async (e) => {
    e.preventDefault();
    setLoadingGroup(true);
    try {
      const res = await api.post(
        "/groups", // ← backend me yahi route hai
        { name: groupName, password: groupPassword },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );

      alert("Group created successfully");
      setGroupName("");
      setGroupPassword("");
      setShowGroupForm(false);
      fetchJoinedGroups();
    } catch (err) {
      alert(err.response?.data?.message || "Error creating group");
    } finally {
      setLoadingGroup(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>

      <button
        onClick={() => setShowGroupForm(!showGroupForm)}
        className="px-4 py-2 bg-indigo-600 text-white rounded mb-4"
      >
        {showGroupForm ? "Cancel" : "Create Group"}
      </button>

      {showGroupForm && (
        <form onSubmit={handleGroupSubmit} className="space-y-3 mb-4">
          <input
            type="text"
            placeholder="Group Name"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg"
            required
          />
          <input
            type="password"
            placeholder="Group Password"
            value={groupPassword}
            onChange={(e) => setGroupPassword(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg"
            required
          />
          <button
            type="submit"
            disabled={loadingGroup}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
          >
            {loadingGroup ? "Creating..." : "Create Group"}
          </button>
        </form>
      )}

      <h2 className="text-lg font-semibold mb-2">Groups</h2>
      <ul>
        {joinedGroups.map((g) => (
          <li key={g._id}>{g.name}</li>
        ))}
      </ul>
    </div>
  );
}
