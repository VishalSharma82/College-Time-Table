import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axios";

export default function AdminGroupDetails({ user }) {
  const { id } = useParams();
  const navigate = useNavigate();

  const [group, setGroup] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [constraints, setConstraints] = useState({});
  const [timetable, setTimetable] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user?._id) {
      setError("User not logged in");
      setLoading(false);
      return;
    }
    fetchGroupDetails();
    // eslint-disable-next-line
  }, [id, user]);

  const fetchGroupDetails = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Missing auth token");

      const res = await api.get(`/groups/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const groupData = res.data;

      // Owner check (backend already does this too)
      if (groupData.owner?._id.toString() !== user._id.toString()) {
        alert("You do not have permission to view this group");
        navigate("/admin/dashboard");
        return;
      }

      setGroup(groupData);
      setSubjects(groupData.subjects || []);
      setTeachers(groupData.teachers || []);
      setConstraints(groupData.constraints || {});
      setTimetable(groupData.timetable || []);
    } catch (err) {
      console.error("Fetch group error:", err.response?.data || err.message);
      setError(
        err.response?.data?.message || "Failed to fetch group details."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateTimetable = async () => {
    setGenerating(true);
    try {
      const token = localStorage.getItem("token");
      const res = await api.post(
        `/groups/${id}/generate-timetable`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setTimetable(res.data.timetable || []);
      alert("Timetable generated successfully!");
    } catch (err) {
      console.error("Generate timetable error:", err.response || err.message);
      alert(err.response?.data?.message || "Error generating timetable");
    } finally {
      setGenerating(false);
    }
  };

  if (loading)
    return (
      <div className="flex justify-center items-center min-h-screen text-gray-500 text-lg">
        Loading group details...
      </div>
    );

  if (error)
    return (
      <div className="flex justify-center items-center min-h-screen text-red-500 text-lg">
        {error}
      </div>
    );

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Back Button */}
      <button
        onClick={() => navigate("/admin/dashboard")}
        className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 mb-4"
      >
        &larr; Back to Dashboard
      </button>

      {/* Group Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-indigo-700">{group.name}</h1>
        <p className="text-gray-500">
          Created on: {new Date(group.createdAt).toLocaleDateString()}
        </p>
        <p className="text-gray-400 text-sm">Owner: {group.owner?.name}</p>
      </div>

      {/* Subjects Table */}
      {subjects.length > 0 && (
        <div className="bg-white p-4 rounded shadow overflow-x-auto">
          <h2 className="font-semibold mb-2 text-lg">Subjects</h2>
          <table className="min-w-full text-left border">
            <thead>
              <tr>
                <th className="border px-3 py-2">Name</th>
                <th className="border px-3 py-2">Category</th>
                <th className="border px-3 py-2">Abbreviation</th>
              </tr>
            </thead>
            <tbody>
              {subjects.map((subj, idx) => (
                <tr key={idx} className="hover:bg-gray-50">
                  <td className="border px-3 py-2">{subj.name}</td>
                  <td className="border px-3 py-2">{subj.category}</td>
                  <td className="border px-3 py-2">{subj.abbreviation}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Teachers Table */}
      {teachers.length > 0 && (
        <div className="bg-white p-4 rounded shadow overflow-x-auto">
          <h2 className="font-semibold mb-2 text-lg">Teachers</h2>
          <table className="min-w-full text-left border">
            <thead>
              <tr>
                <th className="border px-3 py-2">Teacher Name</th>
                <th className="border px-3 py-2">Subjects</th>
              </tr>
            </thead>
            <tbody>
              {teachers.map((teacher, idx) => (
                <tr key={idx} className="hover:bg-gray-50">
                  <td className="border px-3 py-2">{teacher.name}</td>
                  <td className="border px-3 py-2">
                    {(teacher.subjects || []).join(", ")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Constraints */}
      <div className="bg-white p-4 rounded shadow">
        <h2 className="font-semibold mb-2 text-lg">Constraints</h2>
        <pre className="bg-gray-50 p-3 rounded overflow-auto">
          {JSON.stringify(constraints, null, 2)}
        </pre>
      </div>

      {/* Timetable */}
      <div className="bg-white p-4 rounded shadow overflow-x-auto">
        <h2 className="font-semibold mb-2 text-lg">Generated Timetable</h2>
        {timetable.length === 0 ? (
          <p className="text-sm text-gray-500">No timetable generated yet.</p>
        ) : (
          <table className="min-w-full text-left border">
            <thead>
              <tr>
                {Object.keys(timetable[0]).map((day, idx) => (
                  <th key={idx} className="border px-3 py-2">
                    {day}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {timetable.map((row, i) => (
                <tr key={i}>
                  {Object.values(row).map((cell, j) => (
                    <td key={j} className="border px-3 py-2">
                      {cell || "-"}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Generate Timetable Button */}
      <div className="text-center mt-4">
        <button
          onClick={handleGenerateTimetable}
          disabled={generating}
          className="px-6 py-3 bg-red-600 text-white rounded hover:bg-red-700 transition"
        >
          {generating ? "Generating..." : "Generate Timetable"}
        </button>
      </div>
    </div>
  );
}
