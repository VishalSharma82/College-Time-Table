import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axios";

export default function AdminGroupDetails({ user: initialUser }) {
  const { id } = useParams();
  const navigate = useNavigate();

  const [user, setUser] = useState(initialUser || null);
  const [group, setGroup] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [constraints, setConstraints] = useState({});
  const [timetable, setTimetable] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const init = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("User not logged in");
        setLoading(false);
        return;
      }

      // If user prop not passed → fetch from backend
      if (!initialUser?._id) {
        try {
          const res = await api.get("/auth/me", {
            headers: { Authorization: `Bearer ${token}` },
          });
          setUser(res.data);
        } catch (err) {
          setError("User not logged in");
          setLoading(false);
          return;
        }
      } else {
        setUser(initialUser);
      }
    };

    init();
  }, [initialUser]);

  // ✅ now call group fetch only when user is ready
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token && user?._id) {
      fetchGroupDetails(token);
    }
  }, [id, user]);

  const fetchGroupDetails = async (token) => {
    try {
      const res = await api.get(`/groups/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const groupData = res.data;

      if (groupData.owner?._id.toString() !== (user?._id || initialUser?._id)) {
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
      setError(err.response?.data?.message || "Failed to fetch group details.");
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
      <button
        onClick={() => navigate("/admin/dashboard")}
        className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 mb-4"
      >
        &larr; Back to Dashboard
      </button>

      <h1 className="text-3xl font-bold text-indigo-700">{group.name}</h1>
      <p className="text-gray-500">
        Created on: {new Date(group.createdAt).toLocaleDateString()}
      </p>
      <p className="text-gray-400 text-sm">Owner: {group.owner?.name}</p>

      {/* Timetable + Details UI (same as before) */}
    </div>
  );
}
