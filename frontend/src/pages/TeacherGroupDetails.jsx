import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api/axios";

export default function TeacherGroupDetails({ user }) {
  const { id } = useParams();
  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchGroup = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await api.get(`/groups/${id}/view`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setGroup(res.data);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to fetch group");
      } finally {
        setLoading(false);
      }
    };
    fetchGroup();
  }, [id]);

  if (loading) return <p>Loading group details...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold">{group.name}</h1>
      <p>Owner: {group.owner?.name}</p>

      <div>
        <h2 className="text-xl font-semibold">Subjects</h2>
        {group.subjects?.length ? (
          <ul>
            {group.subjects.map((s, i) => (
              <li key={i}>
                {s.name} ({s.abbreviation})
              </li>
            ))}
          </ul>
        ) : (
          <p>No subjects added</p>
        )}
      </div>

      <div>
        <h2 className="text-xl font-semibold">Generated Timetable</h2>
        {group.timetable?.length ? (
          <table className="border">
            <thead>
              <tr>
                {Object.keys(group.timetable[0]).map((day, i) => (
                  <th key={i} className="border px-2 py-1">
                    {day}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {group.timetable.map((row, i) => (
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
          <p>No timetable generated yet</p>
        )}
      </div>
    </div>
  );
}
