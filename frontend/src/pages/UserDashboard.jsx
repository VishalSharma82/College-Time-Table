import React, { useState, useEffect } from "react";
import api from "../api/axios";

export default function UserDashboard({ user }) {
  const [visibleResources, setVisibleResources] = useState([]);
  const [availableGroups, setAvailableGroups] = useState([]);
  const [joinPassword, setJoinPassword] = useState({});

  useEffect(() => {
    fetchVisible();
    fetchAvailableGroups();
  }, []);

  async function fetchVisible() {
    try {
      const res = await api.get("/resources/visible", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setVisibleResources(res.data);
    } catch (err) {
      console.error(err);
    }
  }

  async function fetchAvailableGroups() {
    try {
      const res = await api.get("/groups/available", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setAvailableGroups(res.data);
    } catch (err) {
      console.error(err);
    }
  }

  async function handleJoin(groupId) {
    try {
      const password = joinPassword[groupId];
      const res = await api.post(
        "/groups/join",
        { groupId, password },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      alert(res.data.message);
      fetchAvailableGroups(); // refresh groups
    } catch (err) {
      alert(err.response?.data?.message || "Error joining group");
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Welcome {user.name}</h1>

      {/* Visible Resources */}
      <h2 className="text-lg font-semibold mb-2">Visible resources</h2>
      <ul>
        {visibleResources.map((r) => (
          <li key={r._id}>{r.title}</li>
        ))}
      </ul>

      {/* Groups Join Section */}
      <h2 className="text-lg font-semibold mt-6 mb-2">Join a Group</h2>
      {availableGroups.length === 0 && <p>No groups available to join</p>}
      {availableGroups.map((g) => (
        <div key={g._id} className="mb-3 p-3 border rounded">
          <h3 className="font-semibold">{g.name}</h3>
          <input
            type="password"
            placeholder="Group Password"
            value={joinPassword[g._id] || ""}
            onChange={(e) =>
              setJoinPassword({ ...joinPassword, [g._id]: e.target.value })
            }
            className="border p-1 rounded mr-2"
          />
          <button
            onClick={() => handleJoin(g._id)}
            className="bg-indigo-600 text-white px-3 py-1 rounded"
          >
            Join
          </button>
        </div>
      ))}
    </div>
  );
}
