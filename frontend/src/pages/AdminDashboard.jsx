import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

export default function AdminDashboard({ user }) {
  const [myGroups, setMyGroups] = useState([]);
  const [showGroupForm, setShowGroupForm] = useState(false);
  const [editingGroup, setEditingGroup] = useState(null);
  const [groupName, setGroupName] = useState("");
  const [groupPassword, setGroupPassword] = useState("");
  const [loadingGroup, setLoadingGroup] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    fetchMyGroups();
    // eslint-disable-next-line
  }, []);

  // Fetch admin-owned groups
  async function fetchMyGroups() {
    try {
      const res = await api.get("/groups/mine", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setMyGroups(res.data);
    } catch (err) {
      console.error("Failed to fetch groups:", err);
    }
  }

  const handleGroupSubmit = async (e) => {
    e.preventDefault();
    setLoadingGroup(true);
    try {
      if (editingGroup) {
        // Update existing group
        await api.patch(
          `/groups/${editingGroup._id}`,
          { name: groupName, password: groupPassword },
          { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
        );
        alert("Group updated successfully");
        setEditingGroup(null);
      } else {
        // Create new group
        await api.post(
          "/groups",
          { name: groupName, password: groupPassword },
          { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
        );
        alert("Group created successfully");
      }

      setGroupName("");
      setGroupPassword("");
      setShowGroupForm(false);
      fetchMyGroups();
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
      fetchMyGroups();
    } catch (err) {
      alert(err.response?.data?.message || "Error deleting group");
    }
  };

  const handleView = async (group) => {
    try {
      // Fetch detailed view from /groups/:id/view
      const res = await api.get(`/groups/${group._id}/view`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      // Pass the group details to the group page
      navigate(`/groups/${group._id}`, { state: { group: res.data } });
    } catch (err) {
      alert(err.response?.data?.message || "You do not have permission to view this group");
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto bg-gray-50 min-h-screen">
      <h1 className="text-4xl font-bold mb-6 text-center text-indigo-700">
        Admin Dashboard
      </h1>

      {/* Create / Edit Group Button */}
      <div className="flex justify-center mb-6">
        <button
          onClick={() => {
            setShowGroupForm(!showGroupForm);
            setEditingGroup(null);
            setGroupName("");
            setGroupPassword("");
          }}
          className="px-5 py-2 bg-indigo-600 text-white rounded-lg shadow hover:bg-indigo-700 transition"
        >
          {showGroupForm
            ? "Cancel"
            : editingGroup
            ? "Edit Group"
            : "Create Group"}
        </button>
      </div>

      {/* Create / Edit Form */}
      {showGroupForm && (
        <form
          onSubmit={handleGroupSubmit}
          className="bg-white p-6 rounded-lg shadow-md mb-6 space-y-4"
        >
          <input
            type="text"
            placeholder="Group Name"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:ring focus:ring-indigo-200"
            required
          />
          <input
            type="password"
            placeholder="Group Password"
            value={groupPassword}
            onChange={(e) => setGroupPassword(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:ring focus:ring-indigo-200"
            required={!editingGroup}
          />
          <button
            type="submit"
            disabled={loadingGroup}
            className="w-full bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
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

      {/* Groups List */}
      <h2 className="text-2xl font-semibold mb-4">My Groups</h2>
      {myGroups.length === 0 ? (
        <p className="text-gray-500 text-center">No groups created yet.</p>
      ) : (
        <ul className="space-y-4">
          {myGroups.map((group) => (
            <li
              key={group._id}
              className="flex justify-between items-center bg-white shadow-md p-4 rounded-lg hover:shadow-lg transition"
            >
              <div>
                <h3 className="text-lg font-semibold">{group.name}</h3>
                <span className="text-sm text-gray-500">
                  Created on: {new Date(group.createdAt).toLocaleDateString()}
                </span>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handleView(group)}
                  className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                >
                  View
                </button>
                <button
                  onClick={() => handleEdit(group)}
                  className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(group._id)}
                  className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition"
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
