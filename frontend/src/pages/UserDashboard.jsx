import React, { useState, useEffect } from "react";
import api from "../api/axios";

export default function UserDashboard({ user }) {
  const [visibleResources, setVisibleResources] = useState([]);
  const [availableGroups, setAvailableGroups] = useState([]);
  const [joinedGroups, setJoinedGroups] = useState([]);
  const [joinForm, setJoinForm] = useState({ groupId: "", password: "" });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchVisible();
    fetchAvailableGroups();
    fetchJoinedGroups();
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

  async function handleJoin() {
    if (!joinForm.groupId || !joinForm.password) {
      alert("Please select a group and enter the password");
      return;
    }

    try {
      setLoading(true);
      const res = await api.post(
        "/groups/join",
        { groupId: joinForm.groupId, password: joinForm.password },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      alert(res.data.message);
      setJoinForm({ groupId: "", password: "" });
      fetchAvailableGroups();
      fetchJoinedGroups();
    } catch (err) {
      alert(err.response?.data?.message || "Error joining group");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold mb-4">Welcome {user.name}</h1>

      {/* Visible Resources */}
      <h2 className="text-lg font-semibold mb-2">Visible Resources</h2>
      {visibleResources.length === 0 ? (
        <p>No resources available</p>
      ) : (
        <ul>
          {visibleResources.map((r) => (
            <li key={r._id}>{r.title}</li>
          ))}
        </ul>
      )}

      {/* Available Groups to Join */}
      <h2 className="text-lg font-semibold mt-6 mb-2">Join a Group</h2>
      {availableGroups.length === 0 ? (
        <p>No groups available to join</p>
      ) : (
        <div className="flex items-center space-x-2">
          <select
            value={joinForm.groupId}
            onChange={(e) =>
              setJoinForm({ ...joinForm, groupId: e.target.value })
            }
            className="border p-2 rounded"
          >
            <option value="">Select a group</option>
            {availableGroups.map((g) => (
              <option key={g._id} value={g._id}>
                {g.name}
              </option>
            ))}
          </select>

          <input
            type="password"
            placeholder="Group Password"
            value={joinForm.password}
            onChange={(e) =>
              setJoinForm({ ...joinForm, password: e.target.value })
            }
            className="border p-2 rounded"
          />

          <button
            onClick={handleJoin}
            className="bg-indigo-600 text-white px-4 py-2 rounded"
            disabled={loading}
          >
            {loading ? "Joining..." : "Join"}
          </button>
        </div>
      )}

      {/* Joined Groups + Teacher View */}
      <h2 className="text-lg font-semibold mt-6 mb-2">Your Groups</h2>
      {joinedGroups.length === 0 ? (
        <p>You haven't joined any groups yet</p>
      ) : (
        joinedGroups.map((g) => (
          <div key={g._id} className="mb-4 p-3 border rounded">
            <h3 className="font-semibold">{g.name}</h3>
            <p>Owner: {g.owner?.name}</p>

            {g.timetable?.length ? (
              <table className="border-collapse border w-full text-sm mt-2">
                <thead>
                  <tr>
                    {Object.keys(g.timetable[0]).map((day, i) => (
                      <th key={i} className="border px-2 py-1">
                        {day}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {g.timetable.map((row, i) => (
                    <tr key={i}>
                      {Object.values(row).map((cell, j) => (
                        <td key={j} className="border px-2 py-1">
                          {cell || "-"}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="text-gray-500 mt-1">No timetable generated yet</p>
            )}
          </div>
        ))
      )}
    </div>
  );
}
