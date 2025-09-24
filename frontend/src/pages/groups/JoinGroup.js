import React, { useState, useEffect } from "react";
import api from "../../api/axios";
import { useNavigate } from "react-router-dom";

export default function JoinGroup() {
  const [groups, setGroups] = useState([]);
  const [selected, setSelected] = useState('');
  const [password, setPassword] = useState('');
  const [msg, setMsg] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // fetch all groups summary (public listing). For privacy, you might only list groups you know the id of.
    // Here we call a simple endpoint (not provided) — but we can list all groups' names that are public.
    (async () => {
      try {
        const res = await api.get('/groups/public'); // optional server endpoint; if absent, fetch from /groups/joined or provide group IDs yourself
        setGroups(res.data);
      } catch (err) {
        // fallback: user can paste group id manually
        setGroups([]);
      }
    })();
  }, []);

  const handleJoin = async (e) => {
    e.preventDefault();
    setMsg('');
    try {
      const res = await api.post('/groups/join', { groupId: selected, password });
      setMsg('Joined! Redirecting...');
      navigate(`/groups/${selected}`);
    } catch (err) {
      setMsg(err.response?.data?.message || 'Failed to join');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <div className="w-full max-w-md bg-white p-6 rounded shadow">
        <h2 className="text-xl font-semibold mb-4">Join Private Group</h2>
        <form onSubmit={handleJoin} className="space-y-3">
          <label className="block text-sm text-gray-500">Select group (or paste group id)</label>
          <select value={selected} onChange={e=>setSelected(e.target.value)} className="w-full p-2 border rounded">
            <option value="">-- Choose Group --</option>
            {groups.map(g=> <option key={g._id} value={g._id}>{g.name}</option>)}
          </select>
          <input placeholder="Group password" value={password} onChange={e=>setPassword(e.target.value)} className="w-full p-2 border rounded" required />
          <button className="w-full py-2 bg-indigo-600 text-white rounded">Join</button>
        </form>
        {msg && <p className="mt-3 text-sm">{msg}</p>}
      </div>
    </div>
  );
}
