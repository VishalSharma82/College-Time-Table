import React, { useEffect, useState } from "react";
import api from "../../api/axios";
import { useParams } from "react-router-dom";

export default function GroupPage() {
  const { id } = useParams();
  const [group, setGroup] = useState(null);
  const [resources, setResources] = useState([]);
  const [error, setError] = useState('');

  useEffect(()=> {
    (async () => {
      try {
        const res = await api.get(`/groups/${id}`);
        setGroup(res.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Cannot open group');
      }
    })();

    (async () => {
      try {
        const res = await api.get('/resources/visible'); // resources from groups you're member of are included
        const gres = res.data.filter(r => r.group && r.group === id || (r.group && r.group._id === id));
        setResources(gres);
      } catch (err) {
        console.error(err);
      }
    })();
  }, [id]);

  if (error) return <div className="p-6 text-red-500">{error}</div>;
  if (!group) return <div className="p-6">Loading...</div>;

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <div className="max-w-3xl mx-auto bg-white p-6 rounded shadow">
        <h2 className="text-xl font-semibold">{group.name}</h2>
        <p className="text-sm text-gray-600">{group.description}</p>
        <p className="text-xs text-gray-400 mt-2">Owner: {group.owner?.name}</p>

        <div className="mt-4">
          <h3 className="font-semibold mb-2">Resources</h3>
          {resources.length === 0 && <p className="text-sm text-gray-500">No resources yet.</p>}
          {resources.map(r=> (
            <div key={r._id} className="p-3 border rounded mb-2">
              <h4 className="font-medium">{r.title}</h4>
              <p className="text-sm text-gray-600">{r.content}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
