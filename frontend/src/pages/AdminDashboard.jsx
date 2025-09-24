import React, { useState, useEffect } from "react";
import api from "../api/axios";

export default function AdminDashboard({ user }) {
  const [joinedGroups, setJoinedGroups] = useState([]);
  const [showGroupForm, setShowGroupForm] = useState(false);
  const [editingGroup, setEditingGroup] = useState(null);
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
      if (editingGroup) {
        // Edit mode
        await api.patch(
          `/groups/${editingGroup._id}`,
          { name: groupName, password: groupPassword },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        alert("Group updated successfully");
        setEditingGroup(null);
      } else {
        // Create mode
        await api.post(
          "/groups",
          { name: groupName, password: groupPassword },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        alert("Group created successfully");
      }

      setGroupName("");
      setGroupPassword("");
      setShowGroupForm(false);
      fetchJoinedGroups();
    } catch (err) {
      alert(err.response?.data?.message || "Error saving group");
    } finally {
      setLoadingGroup(false);
    }
  };

  const handleEdit = (group) => {
    setEditingGroup(group);
    setGroupName(group.name);
    setGroupPassword("");
    setShowGroupForm(true);
  };

  const handleDelete = async (groupId) => {
    if (!window.confirm("Are you sure you want to delete this group?")) return;
    try {
      await api.delete(`/groups/${groupId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      alert("Group deleted successfully");
      fetchJoinedGroups();
    } catch (err) {
      alert(err.response?.data?.message || "Error deleting group");
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>

      <button
        onClick={() => {
          setShowGroupForm(!showGroupForm);
          setEditingGroup(null);
          setGroupName("");
          setGroupPassword("");
        }}
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
            required={!editingGroup} // required only for create
          />
          <button
            type="submit"
            disabled={loadingGroup}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
          >
            {loadingGroup
              ? editingGroup
                ? "Updating..."
                : "Creating..."
              : editingGroup
              ? "Update Group"
              : "Create Group"}
          </button>
        </form>
      )}

      <h2 className="text-lg font-semibold mb-2">Groups</h2>
      <ul>
        {joinedGroups.map((g) => (
          <li key={g._id} className="flex items-center justify-between mb-2">
            <span>{g.name}</span>
            <div className="flex gap-2">
              <button
                onClick={() => handleEdit(g)}
                className="px-2 py-1 bg-yellow-500 text-white rounded"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(g._id)}
                className="px-2 py-1 bg-red-500 text-white rounded"
              >
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
