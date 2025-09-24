import React, { useState, useEffect } from "react";
import api from "../../api/axios";
import { useNavigate } from "react-router-dom";

export default function JoinGroup() {
  const [groups, setGroups] = useState([]);
  const [selected, setSelected] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch all groups that the user can join (not already a member)
    const fetchAvailableGroups = async () => {
      try {
        const res = await api.get("/groups/available", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        setGroups(res.data);
      } catch (err) {
        console.error("Error fetching available groups:", err);
        setGroups([]);
      }
    };
    fetchAvailableGroups();
  }, []);

  const handleJoin = async (e) => {
    e.preventDefault();
    setMsg("");
    if (!selected) {
      setMsg("Please select a group to join");
      return;
    }
    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      const res = await api.post(
        "/groups/join",
        { groupId: selected, password },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMsg(res.data.message || "Joined successfully!");
      // Optionally redirect to group page
      setTimeout(() => navigate(`/groups/${selected}`), 1000);
    } catch (err) {
      setMsg(err.response?.data?.message || "Failed to join group");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <div className="w-full max-w-md bg-white p-6 rounded shadow">
        <h2 className="text-xl font-semibold mb-4">Join Private Group</h2>

        <form onSubmit={handleJoin} className="space-y-3">
          <label className="block text-sm text-gray-500">Select group</label>
          <select
            value={selected}
            onChange={(e) => setSelected(e.target.value)}
            className="w-full p-2 border rounded"
            required
          >
            <option value="">-- Choose Group --</option>
            {groups.map((g) => (
              <option key={g._id} value={g._id}>
                {g.name}
              </option>
            ))}
          </select>

          <input
            type="password"
            placeholder="Group password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-2 border rounded"
            required
          />

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2 rounded text-white ${
              loading ? "bg-gray-400" : "bg-indigo-600 hover:bg-indigo-700"
            }`}
          >
            {loading ? "Joining..." : "Join"}
          </button>
        </form>

        {msg && <p className="mt-3 text-sm text-red-500">{msg}</p>}
      </div>
    </div>
  );
}
