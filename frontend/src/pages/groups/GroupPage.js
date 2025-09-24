import React, { useEffect, useState } from "react";
import api from "../../api/axios";
import { useParams, useNavigate } from "react-router-dom";

export default function GroupPage({ user }) {
  const { id } = useParams();
  const navigate = useNavigate();

  const [group, setGroup] = useState(null);
  const [resources, setResources] = useState([]);
  const [error, setError] = useState("");
  const [loadingResources, setLoadingResources] = useState(true);
  const [loadingGroup, setLoadingGroup] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");

    // Fetch group details
    (async () => {
      try {
        const res = await api.get(`/groups/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const grp = res.data;

        // Owner-only access check
        if (grp.owner?._id !== user._id) {
          setError("You do not have permission to view this group.");
          setLoadingGroup(false);
          return;
        }

        setGroup(grp);
        setLoadingGroup(false);
      } catch (err) {
        setError(err.response?.data?.message || "Cannot open group");
        setLoadingGroup(false);
      }
    })();

    // Fetch resources
    (async () => {
      try {
        const res = await api.get("/resources/visible", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const filtered = res.data.filter(
          (r) => r.group && (r.group === id || r.group._id === id)
        );
        setResources(filtered);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingResources(false);
      }
    })();
  }, [id, user._id]);

  if (error) return <div className="p-6 text-red-500">{error}</div>;
  if (loadingGroup) return <div className="p-6">Loading group...</div>;

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <div className="max-w-3xl mx-auto bg-white p-6 rounded shadow">
        <h2 className="text-2xl font-semibold">{group.name}</h2>
        <p className="text-sm text-gray-600">{group.description}</p>
        <p className="text-xs text-gray-400 mt-2">
          Owner: {group.owner?.name}
        </p>

        {/* Timetable Section */}
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-2">Timetable</h3>
          {group.timetable ? (
            <div className="p-3 border rounded mb-2">
              {/* Render timetable details */}
              {group.timetable.map((slot, idx) => (
                <div key={idx} className="text-sm text-gray-700">
                  {slot.day}: {slot.subject} ({slot.startTime} - {slot.endTime})
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">
              No timetable yet. Click the button below to generate.
            </p>
          )}
          <button
            onClick={async () => {
              try {
                const res = await api.post(
                  `/groups/${id}/generate-timetable`,
                  {},
                  {
                    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
                  }
                );
                setGroup(res.data); // Update group with timetable
                alert("Timetable generated successfully!");
              } catch (err) {
                alert(err.response?.data?.message || "Error generating timetable");
              }
            }}
            className="mt-2 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition"
          >
            Generate Timetable
          </button>
        </div>

        {/* Resources Section */}
        <div className="mt-6">
          <h3 className="font-semibold mb-2">Resources</h3>
          {loadingResources ? (
            <p className="text-sm text-gray-500">Loading resources...</p>
          ) : resources.length === 0 ? (
            <p className="text-sm text-gray-500">No resources yet.</p>
          ) : (
            resources.map((r) => (
              <div key={r._id} className="p-3 border rounded mb-2">
                <h4 className="font-medium">{r.title}</h4>
                <p className="text-sm text-gray-600">{r.content}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
