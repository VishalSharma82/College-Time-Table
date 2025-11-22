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
        // /groups/:id/view route should return the full group details including timetable array
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

  // Determine the number of periods dynamically
  const periodCount = group.timetable?.[0]?.slots.length || 0;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold">{group.name}</h1>
      <p>Owner: {group.owner?.name}</p>

      {/* Subjects Display */}
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

      {/* Timetable Display (FIXED for Array of Day Objects) */}
      <div>
        <h2 className="text-xl font-semibold">Generated Timetable</h2>
        {group.timetable?.length ? (
          <div className="overflow-x-auto">
            <table className="border min-w-full">
              <thead>
                <tr>
                  <th className="border px-2 py-1 bg-gray-100">Day</th>
                  {/* 🚀 FIX: Headers should be Period numbers */}
                  {Array.from({ length: periodCount }, (_, i) => (
                    <th key={i} className="border px-2 py-1 bg-gray-100">
                      Period {i + 1}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {/* 🚀 FIX: Map over the timetable array (each item is a day) */}
                {group.timetable.map((dayEntry, i) => (
                  <tr key={i}>
                    {/* Display the Day name */}
                    <td className="border px-2 py-1 font-medium">{dayEntry.day}</td>

                    {/* Display the Slots for that day */}
                    {dayEntry.slots.map((slot, j) => (
                      <td key={j} className="border px-2 py-1 text-xs">
                        {slot.subject || "-"}
                        {slot.teacher && (
                          <div className="text-gray-500">{slot.teacher}</div>
                        )}
                        {slot.room && (
                          <div className="text-gray-500">[{slot.room}]</div>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p>No timetable generated yet</p>
        )}
      </div>
    </div>
  );
}