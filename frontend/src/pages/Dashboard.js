import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const { user, setUser } = useContext(AuthContext);
  const [visibleResources, setVisibleResources] = useState([]);
  const [joinedGroups, setJoinedGroups] = useState([]);
  const [showGroupForm, setShowGroupForm] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [groupPassword, setGroupPassword] = useState("");
  const [loadingGroup, setLoadingGroup] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      fetchVisible();
      fetchJoinedGroups();
    }
  }, [user]);

  async function fetchVisible() {
    try {
      const res = await api.get('/resources/visible', {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
      setVisibleResources(res.data);
    } catch (err) {
      console.error(err);
    }
  }

  async function fetchJoinedGroups() {
    try {
      const res = await api.get('/groups/joined', {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
      setJoinedGroups(res.data);
    } catch (err) {
      console.error(err);
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
    navigate('/login');
  };

  const handleGroupSubmit = async (e) => {
    e.preventDefault();
    setLoadingGroup(true);
    try {
      const res = await api.post(
        "/groups/create",
        { name: groupName, password: groupPassword },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      alert(res.data.message);
      setGroupName("");
      setGroupPassword("");
      setShowGroupForm(false);
      fetchJoinedGroups(); // refresh groups
    } catch (err) {
      alert(err.response?.data?.message || "Error creating group");
    } finally {
      setLoadingGroup(false);
    }
  };

  if (!user) return <div>Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Hi, {user.name}</h1>
            <p className="text-sm text-gray-600">Role: <span className="font-medium">{user.role}</span></p>
          </div>
          <div className="flex gap-2">
            {user.role === "admin" && (
              <button
                onClick={() => setShowGroupForm(!showGroupForm)}
                className="px-4 py-2 bg-indigo-600 text-white rounded"
              >
                {showGroupForm ? "Cancel" : "Create Group"}
              </button>
            )}
            {user.role !== "admin" && (
              <button
                onClick={() => navigate('/groups/join')}
                className="px-4 py-2 bg-white border rounded"
              >
                Join Group
              </button>
            )}
            <button onClick={handleLogout} className="px-4 py-2 bg-red-500 text-white rounded">Logout</button>
          </div>
        </div>

        {/* Admin Group Creation Form */}
        {showGroupForm && user.role === "admin" && (
          <div className="mb-6 p-6 bg-white rounded shadow">
            <h3 className="text-lg font-bold mb-4">Create New Group</h3>
            <form onSubmit={handleGroupSubmit} className="space-y-3">
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
          </div>
        )}

        {/* Joined Groups */}
        <section className="mb-6">
          <h2 className="text-lg font-semibold mb-2">Groups you are member of</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {joinedGroups.length === 0 && <p className="text-sm text-gray-500">Not a member of any groups yet.</p>}
            {joinedGroups.map(g => (
              <div key={g._id} className="p-4 bg-white rounded shadow">
                <h3 className="font-semibold">{g.name}</h3>
                <p className="text-sm text-gray-500">{g.description}</p>
                <p className="text-xs text-gray-400 mt-2">Owner: {g.owner?.name}</p>
                <div className="mt-3 flex gap-2">
                  <button
                    onClick={() => navigate(`/groups/${g._id}`)}
                    className="px-3 py-1 bg-indigo-600 text-white rounded text-sm"
                  >
                    Open
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Visible Resources */}
        <section>
          <h2 className="text-lg font-semibold mb-2">Visible resources</h2>
          <div className="space-y-3">
            {visibleResources.length === 0 && <p className="text-sm text-gray-500">No resources visible to you yet.</p>}
            {visibleResources.map(r => (
              <div key={r._id} className="p-4 bg-white rounded shadow">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold">{r.title}</h3>
                    <p className="text-sm text-gray-600">{r.content}</p>
                    <p className="text-xs text-gray-400 mt-2">
                      Owner: {r.owner?.toString() === user.id ? 'You' : (r.ownerName || 'Someone')}
                    </p>
                  </div>
                  <div className="text-xs text-gray-400">{new Date(r.createdAt).toLocaleString()}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

      </div>
    </div>
  );
}
