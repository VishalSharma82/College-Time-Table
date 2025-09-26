import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axios";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

export default function AdminGroupDetails({ user: initialUser }) {
  const { id } = useParams();
  const navigate = useNavigate();

  const [user, setUser] = useState(initialUser || null);
  const [group, setGroup] = useState(null);
  const [timetable, setTimetable] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Local state for new subject/teacher
  const [newSubject, setNewSubject] = useState({
    name: "",
    abbreviation: "",
    isLab: false,
  });
  const [newTeacher, setNewTeacher] = useState({ name: "", subjects: "" });

  useEffect(() => {
    const init = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("User not logged in");
        setLoading(false);
        return;
      }

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
      const isOwner =
        groupData.owner?._id.toString() === (user?._id || initialUser?._id);

      if (!isOwner) {
        alert("You do not have permission to view this group");
        navigate("/admin/dashboard");
        return;
      }

      setGroup(groupData);
      setTimetable(groupData.timetable || []);
    } catch (err) {
      console.error("Fetch group error:", err.response?.data || err.message);
      setError(err.response?.data?.message || "Failed to fetch group details.");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveTimetable = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem("token");
      await api.patch(
        `/groups/${id}/timetable`,
        { timetable },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      alert("Timetable saved successfully!");
    } catch (err) {
      console.error("Save timetable error:", err.response?.data || err.message);
      alert(err.response?.data?.message || "Error saving timetable.");
    } finally {
      setSaving(false);
    }
  };

  // ✅ Clean drag & drop (reorder)
  const onDragEnd = ({ source, destination }) => {
    if (!destination) return;

    const sourceDayIndex = timetable.findIndex(
      (d) => d.day === source.droppableId
    );
    const destDayIndex = timetable.findIndex(
      (d) => d.day === destination.droppableId
    );

    const newTimetable = [...timetable];
    const [moved] = newTimetable[sourceDayIndex].slots.splice(source.index, 1);
    newTimetable[destDayIndex].slots.splice(destination.index, 0, moved);

    setTimetable(newTimetable);
  };

  // ➕ Add Subject
  const handleAddSubject = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await api.post(`/groups/${id}/subjects`, newSubject, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setGroup({ ...group, subjects: res.data.subjects });
      setNewSubject({ name: "", abbreviation: "", isLab: false });
    } catch (err) {
      alert(err.response?.data?.message || "Error adding subject.");
    }
  };

  // ❌ Delete Subject
  const handleDeleteSubject = async (subjectId) => {
    try {
      const token = localStorage.getItem("token");
      const res = await api.delete(`/groups/${id}/subjects/${subjectId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setGroup({ ...group, subjects: res.data.subjects });
    } catch (err) {
      alert(err.response?.data?.message || "Error deleting subject.");
    }
  };

  // ➕ Add Teacher
  const handleAddTeacher = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await api.post(
        `/groups/${id}/teachers`,
        {
          ...newTeacher,
          subjects: newTeacher.subjects.split(",").map((s) => s.trim()),
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setGroup({ ...group, teachers: res.data.teachers }); // ✅ FIXED
      setNewTeacher({ name: "", subjects: "" });
    } catch (err) {
      alert(err.response?.data?.message || "Error adding teacher.");
    }
  };

  // ❌ Delete Teacher
  const handleDeleteTeacher = async (teacherId) => {
    try {
      const token = localStorage.getItem("token");
      const res = await api.delete(`/groups/${id}/teachers/${teacherId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setGroup({ ...group, teachers: res.data.teachers }); // ✅ FIXED
    } catch (err) {
      alert(err.response?.data?.message || "Error deleting teacher.");
    }
  };

  if (loading)
    return (
      <div className="flex justify-center items-center min-h-screen text-gray-500 text-lg">
        Loading...
      </div>
    );

  if (error)
    return (
      <div className="flex justify-center items-center min-h-screen text-red-500 text-lg">
        {error}
      </div>
    );

  const isOwner = group?.owner?._id.toString() === user?._id;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <button
        onClick={() => navigate("/admin/dashboard")}
        className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 mb-4"
      >
        &larr; Back to Dashboard
      </button>

      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-indigo-700">{group.name}</h1>
        {isOwner && (
          <div className="space-x-2">
            <button
              onClick={() => navigate(`/groups/${id}/timetable-wizard`)}
              className="px-6 py-3 bg-indigo-600 text-white rounded-lg shadow-md hover:bg-indigo-700 transition-colors"
            >
              Generate Timetable ⚡️
            </button>
            <button
              onClick={handleSaveTimetable}
              disabled={saving}
              className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
                saving
                  ? "bg-green-300 cursor-not-allowed"
                  : "bg-green-600 hover:bg-green-700"
              }`}
            >
              {saving ? "Saving..." : "Save Edits"}
            </button>
          </div>
        )}
      </div>

      <p className="text-gray-500">
        Created on: {new Date(group.createdAt).toLocaleDateString()}
      </p>
      <p className="text-gray-400 text-sm">Owner: {group.owner?.name}</p>

      {/* Subjects Manager */}
      {isOwner && (
        <div className="mt-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            Subjects
          </h2>
          <div className="flex space-x-2 mb-4">
            <input
              type="text"
              placeholder="Name"
              value={newSubject.name}
              onChange={(e) =>
                setNewSubject({ ...newSubject, name: e.target.value })
              }
              className="border p-2 rounded"
            />
            <input
              type="text"
              placeholder="Abbr."
              value={newSubject.abbreviation}
              onChange={(e) =>
                setNewSubject({ ...newSubject, abbreviation: e.target.value })
              }
              className="border p-2 rounded w-24"
            />
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={newSubject.isLab}
                onChange={(e) =>
                  setNewSubject({ ...newSubject, isLab: e.target.checked })
                }
              />
              <span>Lab</span>
            </label>
            <button
              onClick={handleAddSubject}
              className="px-4 py-2 bg-blue-600 text-white rounded"
            >
              Add
            </button>
          </div>
          <ul className="space-y-2">
            {group.subjects?.map((subj) => (
              <li
                key={subj._id}
                className="flex justify-between items-center border p-2 rounded"
              >
                <span>
                  {subj.name} ({subj.abbreviation})
                  {subj.isLab ? " [Lab]" : ""}
                </span>
                <button
                  onClick={() => handleDeleteSubject(subj._id)}
                  className="px-2 py-1 bg-red-500 text-white rounded"
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Teachers Manager */}
      {isOwner && (
        <div className="mt-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            Teachers
          </h2>
          <div className="flex space-x-2 mb-4">
            <input
              type="text"
              placeholder="Name"
              value={newTeacher.name}
              onChange={(e) =>
                setNewTeacher({ ...newTeacher, name: e.target.value })
              }
              className="border p-2 rounded"
            />
            <input
              type="text"
              placeholder="Subjects (comma separated)"
              value={newTeacher.subjects}
              onChange={(e) =>
                setNewTeacher({ ...newTeacher, subjects: e.target.value })
              }
              className="border p-2 rounded w-64"
            />
            <button
              onClick={handleAddTeacher}
              className="px-4 py-2 bg-blue-600 text-white rounded"
            >
              Add
            </button>
          </div>
          <ul className="space-y-2">
            {group.teachers?.map((teach) => (
              <li
                key={teach._id}
                className="flex justify-between items-center border p-2 rounded"
              >
                <span>
                  {teach.name} - {teach.subjects.join(", ")}
                </span>
                <button
                  onClick={() => handleDeleteTeacher(teach._id)}
                  className="px-2 py-1 bg-red-500 text-white rounded"
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Timetable Section */}
      <h2 className="text-2xl font-semibold text-gray-800 mt-8 mb-4">
        Timetable Editor
      </h2>
      {timetable.length > 0 ? (
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="bg-white rounded-lg shadow-md p-4 overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Day
                  </th>
                  {Array.from({ length: 6 }, (_, i) => (
                    <th
                      key={i}
                      className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Period {i + 1}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {timetable.map((day) => (
                  <tr key={day.day}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {day.day}
                    </td>
                    <Droppable droppableId={day.day} direction="horizontal">
                      {(provided) => (
                        <td
                          ref={provided.innerRef}
                          {...provided.droppableProps}
                          className="flex"
                        >
                          {day.slots.map((slot, slotIndex) => (
                            <Draggable
                              key={`${day.day}-${slotIndex}`}
                              draggableId={`${day.day}-${slotIndex}`}
                              index={slotIndex}
                            >
                              {(provided, snapshot) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  className={`p-4 m-2 text-center rounded-lg shadow-sm border border-gray-200 ${
                                    snapshot.isDragging
                                      ? "bg-indigo-100"
                                      : "bg-gray-100"
                                  } min-w-[120px]`}
                                >
                                  <p className="font-semibold text-gray-700">
                                    {slot.subject || "Free"}
                                  </p>
                                  <p className="text-xs text-gray-500 mt-1">
                                    {slot.teacher || "N/A"}
                                  </p>
                                </div>
                              )}
                            </Draggable>
                          ))}
                          {provided.placeholder}
                        </td>
                      )}
                    </Droppable>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </DragDropContext>
      ) : (
        <p className="text-gray-500">
          No timetable available. Click "Generate Timetable" to create one.
        </p>
      )}
    </div>
  );
}
