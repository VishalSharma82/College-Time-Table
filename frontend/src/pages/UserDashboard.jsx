import React, { useState, useEffect } from "react";
import api from "../api/axios";
import TimetableDisplay from "../components/TimetableDisplay";

export default function UserDashboard({ user }) {
  const [visibleResources, setVisibleResources] = useState([]);
  const [availableGroups, setAvailableGroups] = useState([]);
  const [joinedGroups, setJoinedGroups] = useState([]);
  const [joinForm, setJoinForm] = useState({ groupId: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [expandedGroupId, setExpandedGroupId] = useState(null);

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
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold mb-4">Welcome {user.name}</h1>

      {/* Visible Resources */}
      <h2 className="text-lg font-semibold mb-2">Visible Resources</h2>
      {visibleResources.length === 0 ? (
        <p>No resources available</p>
      ) : (
        <ul className="list-disc list-inside">
          {visibleResources.map((r) => (
            <li key={r._id}>{r.title}</li>
          ))}
        </ul>
      )}

      {/* Available Groups */}
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

      {/* Joined Groups + Timetable */}
      <h2 className="text-lg font-semibold mt-6 mb-2">Your Groups</h2>
      {joinedGroups.length === 0 ? (
        <p>You haven't joined any groups yet</p>
      ) : (
        joinedGroups.map((g) => (
          <div
            key={g._id}
            className="mb-6 p-3 border rounded-lg bg-gray-50 shadow-sm"
          >
            <div className="flex justify-between items-center mb-2">
              <div>
                <h3 className="font-semibold">{g.name}</h3>
                <p className="text-sm text-gray-600">Owner: {g.owner?.name}</p>
              </div>
              {g.timetable && (
                <button
                  onClick={() =>
                    setExpandedGroupId(expandedGroupId === g._id ? null : g._id)
                  }
                  className="bg-indigo-600 text-white px-3 py-1 rounded"
                >
                  {expandedGroupId === g._id ? "Hide Timetable" : "View Timetable"}
                </button>
              )}
            </div>

            {expandedGroupId === g._id && g.timetable && (
              <div className="overflow-x-auto mt-4">
                {Object.keys(g.timetable).map((className) => {
                  const schedule = g.timetable[className];
                  if (!schedule || !Array.isArray(schedule)) return null;

                  const days = schedule.map((d) => d.day || "-");

                  return (
                    <div key={className} className="mb-6">
                      <h4 className="font-medium mb-2">{className}</h4>
                      <table className="min-w-full border border-gray-300 text-sm text-center">
                        <thead>
                          <tr className="bg-gray-200">
                            <th className="border px-2 py-1">Period</th>
                            {days.map((day) => (
                              <th key={day} className="border px-2 py-1">
                                {day}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {Array.from({
                            length: schedule[0]?.slots?.length || 0,
                          }).map((_, periodIndex) => (
                            <tr key={periodIndex} className="hover:bg-gray-50">
                              <td className="border px-2 py-1 font-semibold">
                                {periodIndex + 1}
                              </td>
                              {schedule.map((dayObj) => {
                                const slot = dayObj.slots?.[periodIndex] || {};
                                return (
                                  <td
                                    key={dayObj.day}
                                    className="border px-2 py-1"
                                  >
                                    <div className="font-semibold">
                                      {slot.subject || "Free"}
                                    </div>
                                    <div className="text-xs text-gray-500">
                                      {slot.teacher || "-"} | {slot.room || "-"}
                                    </div>
                                  </td>
                                );
                              })}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
}
