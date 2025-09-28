import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axios";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

// Reusable UI components for a modern look
const InputCard = ({ children }) => (
  <div className="bg-white p-8 rounded-2xl shadow-xl space-y-6">{children}</div>
);

const SectionTitle = ({ children }) => (
  <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-2">
    {children}
  </h2>
);

const ProgressBar = ({ step, totalSteps }) => (
  <div className="mb-8">
    <div className="flex justify-between text-sm font-medium text-gray-600">
      <span>
        Step {step} of {totalSteps}
      </span>
      <span>
        {step === 1
          ? "Subjects"
          : step === 2
          ? "Teachers"
          : step === 3
          ? "Classes"
          : "Review"}
      </span>
    </div>
    <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
      <div
        className="bg-indigo-600 h-2 rounded-full transition-all duration-500 ease-in-out"
        style={{ width: `${(step / totalSteps) * 100}%` }}
      ></div>
    </div>
  </div>
);

const ItemList = ({ items, renderItem, onDelete, onEdit }) => (
  <div className="space-y-4">
    {items.map((item, index) => (
      <div
        key={index}
        className="flex items-center justify-between p-4 bg-gray-100 rounded-lg shadow-sm border border-gray-200"
      >
        <div className="flex-1">{renderItem(item)}</div>
        <div className="flex gap-2">
          {onEdit && (
            <button
              onClick={() => onEdit(index)}
              className="p-2 text-yellow-500 hover:text-yellow-600 transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
              </svg>
            </button>
          )}
          <button
            onClick={() => onDelete(index)}
            className="p-2 text-red-500 hover:text-red-700 transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm6 0a1 1 0 012 0v6a1 1 0 11-2 0V8z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>
      </div>
    ))}
  </div>
);

const ActionButton = ({
  onClick,
  children,
  disabled = false,
  loading = false,
  className = "",
}) => (
  <button
    onClick={onClick}
    disabled={disabled || loading}
    className={`w-full py-3 rounded-lg font-semibold transition-colors ${
      disabled || loading
        ? "bg-gray-300 text-gray-500 cursor-not-allowed"
        : "bg-indigo-600 text-white hover:bg-indigo-700"
    } ${className}`}
  >
    {loading ? "Loading..." : children}
  </button>
);

export default function TimetableWizard() {
  const { id: groupId } = useParams();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [subjects, setSubjects] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [newSubject, setNewSubject] = useState({
    name: "",
    abbreviation: "",
    periodsPerWeek: "",
    isLab: false,
  });
  const [newTeacher, setNewTeacher] = useState({ name: "", subjects: [] });
  const [newClass, setNewClass] = useState({
    name: "",
    periodsPerDay: { Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0 },
    subjectsAssigned: [],
  });
  const [editingClassIndex, setEditingClassIndex] = useState(null);

  const [generatedTimetable, setGeneratedTimetable] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await api.get(`/groups/${groupId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSubjects(res.data.subjects || []);
        setTeachers(res.data.teachers || []);
        setClasses(res.data.classes || []);
      } catch (err) {
        console.error("Failed to fetch group data:", err);
        setError("Failed to load subjects, teachers, and classes from group.");
      }
    };
    fetchData();
  }, [groupId]);

  const handleAddSubject = () => {
    if (
      newSubject.name &&
      newSubject.abbreviation &&
      newSubject.periodsPerWeek
    ) {
      setSubjects([
        ...subjects,
        { ...newSubject, periodsPerWeek: parseInt(newSubject.periodsPerWeek) },
      ]);
      setNewSubject({
        name: "",
        abbreviation: "",
        periodsPerWeek: "",
        isLab: false,
      });
      setError(null);
    } else {
      setError("Please fill all fields for the subject.");
    }
  };

  const handleAddTeacher = () => {
    if (newTeacher.name && newTeacher.subjects.length > 0) {
      setTeachers([...teachers, newTeacher]);
      setNewTeacher({ name: "", subjects: [] });
      setError(null);
    } else {
      setError("Please fill all fields for the teacher.");
    }
  };

  const handleAddClass = () => {
    if (!newClass.name.trim()) return;

    if (editingClassIndex !== null) {
      const updatedClasses = [...classes];
      updatedClasses[editingClassIndex] = { ...newClass };
      setClasses(updatedClasses);
      setEditingClassIndex(null);
    } else {
      setClasses([...classes, { ...newClass }]);
    }

    setNewClass({
      name: "",
      periodsPerDay: { Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0 },
      subjectsAssigned: [],
    });
  };

  const handleEditClass = (index) => {
    const cls = classes[index];
    if (!cls) {
      console.error("⚠️ handleEditClass: Invalid index", index, classes);
      return;
    }

    setNewClass({
      name: cls.name || "",
      periodsPerDay: cls.periodsPerDay || {
        Mon: 0,
        Tue: 0,
        Wed: 0,
        Thu: 0,
        Fri: 0,
      },
      subjectsAssigned: cls.subjectsAssigned || [],
    });

    setEditingClassIndex(index);
    setStep(3);
  };

  const handleDeleteSubject = (index) => {
    setSubjects(subjects.filter((_, i) => i !== index));
  };

  const handleDeleteTeacher = (index) => {
    setTeachers(teachers.filter((_, i) => i !== index));
  };

  const handleDeleteClass = (index) => {
    setClasses(classes.filter((_, i) => i !== index));
  };

  const handleUpdateSubjectAssignment = (subAbbreviation, field, value) => {
    const updatedSubjects = [...newClass.subjectsAssigned];
    const existingIndex = updatedSubjects.findIndex(
      (s) => s.subject === subAbbreviation
    );

    if (existingIndex > -1) {
      if (field === "periods" && value === 0) {
        updatedSubjects.splice(existingIndex, 1);
      } else {
        updatedSubjects[existingIndex][field] = value;
      }
    } else {
      updatedSubjects.push({
        subject: subAbbreviation,
        periods: value,
        teacher: null,
      });
    }
    setNewClass({ ...newClass, subjectsAssigned: updatedSubjects });
  };

  const validateInputs = () => {
    if (subjects.length === 0) return "Please add at least one subject.";
    if (teachers.length === 0) return "Please add at least one teacher.";
    if (classes.length === 0) return "Please add at least one class.";

    for (const cls of classes) {
      for (const assignment of cls.subjectsAssigned) {
        if (!assignment.teacher) {
          const subjectName = subjects.find(
            (s) => s.abbreviation === assignment.subject
          )?.name;
          return `In class '${cls.name}', the subject '${subjectName}' has no teacher assigned.`;
        }
      }
    }

    const totalAssignedPeriods = classes.reduce(
      (sum, cls) =>
        sum + Object.values(cls.periodsPerDay).reduce((acc, p) => acc + p, 0),
      0
    );
    const totalSubjectPeriods = classes.reduce(
      (sum, cls) =>
        sum + cls.subjectsAssigned.reduce((acc, sa) => acc + sa.periods, 0),
      0
    );

    if (totalAssignedPeriods !== totalSubjectPeriods) {
      return `Total periods per day (${totalAssignedPeriods}) do not match total periods assigned to subjects (${totalSubjectPeriods}).`;
    }

    return null;
  };

  const handlePreviewTimetable = async () => {
    setError(null);
    const validationError = validateInputs();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("User not authenticated.");

      const configData = { subjects, teachers, classes };
      await api.post(`/groups/${groupId}/configure-timetable`, configData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const res = await api.post(
        `/groups/${groupId}/generate-timetable`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setGeneratedTimetable(res.data.timetable);
      setLoading(false);
      setStep(4);
    } catch (err) {
      console.error(
        "Error during generation:",
        err.response?.data || err.message
      );
      setError(
        err.response?.data?.message ||
          "Failed to generate timetable. Please check your inputs."
      );
      setLoading(false);
    }
  };

  const handleSaveFinalTimetable = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("User not authenticated.");

      await api.patch(
        `/groups/${groupId}/timetable`,
        { timetable: generatedTimetable },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      alert("Timetable saved successfully!");
      navigate(`/admin/groups/${groupId}`);
    } catch (err) {
      console.error(
        "Error saving final timetable:",
        err.response?.data || err.message
      );
      setError(
        err.response?.data?.message || "Failed to save final timetable."
      );
    } finally {
      setLoading(false);
    }
  };

  const onDragEnd = (result) => {
    if (!result.destination) {
      return;
    }

    const newTimetable = [...generatedTimetable];
    const sourceDay = newTimetable.find(
      (d) => d.day === result.source.droppableId
    );
    const destinationDay = newTimetable.find(
      (d) => d.day === result.destination.droppableId
    );

    if (!sourceDay || !destinationDay) return;

    const [removedSlot] = sourceDay.slots.splice(result.source.index, 1, {
      period: sourceDay.slots[result.source.index].period,
      subject: "Free",
      teacher: "N/A",
      room: "N/A",
    });

    const [destinationSlot] = destinationDay.slots.splice(
      result.destination.index,
      1,
      removedSlot
    );
    sourceDay.slots[result.source.index] = destinationSlot;

    setGeneratedTimetable(newTimetable);
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <InputCard>
            <SectionTitle>Step 1: Subjects</SectionTitle>
            <div className="flex flex-col gap-4 mb-6">
              <input
                type="text"
                placeholder="Subject Name (e.g., Hindi)"
                value={newSubject.name}
                onChange={(e) =>
                  setNewSubject({ ...newSubject, name: e.target.value })
                }
                className="p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <input
                type="text"
                placeholder="Abbreviation (e.g., HIN)"
                value={newSubject.abbreviation}
                onChange={(e) =>
                  setNewSubject({ ...newSubject, abbreviation: e.target.value })
                }
                className="p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <input
                type="number"
                placeholder="Periods/Week (e.g., 4)"
                value={newSubject.periodsPerWeek}
                onChange={(e) =>
                  setNewSubject({
                    ...newSubject,
                    periodsPerWeek: e.target.value,
                  })
                }
                className="p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <div className="flex items-center gap-2 text-gray-700">
                <input
                  type="checkbox"
                  checked={newSubject.isLab}
                  onChange={(e) =>
                    setNewSubject({ ...newSubject, isLab: e.target.checked })
                  }
                  className="form-checkbox h-5 w-5 text-indigo-600 rounded"
                />
                <label>Is this a Lab Subject?</label>
              </div>
              <ActionButton onClick={handleAddSubject}>
                Add Subject
              </ActionButton>
            </div>
            <ItemList
              items={subjects}
              onDelete={handleDeleteSubject}
              renderItem={(sub) => (
                <>
                  <span className="font-medium text-gray-900">
                    {sub.name} ({sub.abbreviation})
                  </span>
                  <p className="text-sm text-gray-500 mt-1">
                    {sub.periodsPerWeek} periods/week {sub.isLab && " (Lab)"}
                  </p>
                </>
              )}
            />
            <div className="flex justify-end mt-8">
              <ActionButton onClick={() => setStep(2)}>
                Next: Add Teachers
              </ActionButton>
            </div>
          </InputCard>
        );
      case 2:
        return (
          <InputCard>
            <SectionTitle>Step 2: Teachers</SectionTitle>
            <div className="flex flex-col gap-4 mb-6">
              <input
                type="text"
                placeholder="Teacher Name (e.g., Ms. Nikita)"
                value={newTeacher.name}
                onChange={(e) =>
                  setNewTeacher({ ...newTeacher, name: e.target.value })
                }
                className="p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <div className="p-3 border rounded-lg">
                <span className="text-sm text-gray-500">Subjects Taught:</span>
                <div className="mt-2 flex flex-wrap gap-2">
                  {subjects.map((sub) => (
                    <div key={sub.abbreviation} className="flex items-center">
                      <input
                        type="checkbox"
                        id={sub.abbreviation}
                        checked={newTeacher.subjects.includes(sub.abbreviation)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setNewTeacher({
                              ...newTeacher,
                              subjects: [
                                ...newTeacher.subjects,
                                sub.abbreviation,
                              ],
                            });
                          } else {
                            setNewTeacher({
                              ...newTeacher,
                              subjects: newTeacher.subjects.filter(
                                (s) => s !== sub.abbreviation
                              ),
                            });
                          }
                        }}
                        className="form-checkbox h-4 w-4 text-indigo-600 rounded"
                      />
                      <label
                        htmlFor={sub.abbreviation}
                        className="ml-1 text-sm text-gray-700"
                      >
                        {sub.abbreviation}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
              <ActionButton onClick={handleAddTeacher}>
                Add Teacher
              </ActionButton>
            </div>
            <ItemList
              items={teachers}
              onDelete={handleDeleteTeacher}
              renderItem={(teacher) => (
                <>
                  <span className="font-medium text-gray-900">
                    {teacher.name}
                  </span>
                  <p className="text-sm text-gray-500 mt-1">
                    Teaches: {teacher.subjects.join(", ")}
                  </p>
                </>
              )}
            />
            <div className="flex justify-between mt-8">
              <ActionButton
                onClick={() => setStep(1)}
                className="bg-gray-500 text-white"
              >
                Back
              </ActionButton>
              <ActionButton
                onClick={() => setStep(3)}
                className="bg-green-500 text-white"
              >
                Next: Add Classes
              </ActionButton>
            </div>
          </InputCard>
        );
      case 3:
        return (
          <InputCard>
            <SectionTitle>Step 3: Classes</SectionTitle>
            <div className="flex flex-col gap-4 mb-6">
              <input
                type="text"
                placeholder="Class Name (e.g., 10)"
                value={newClass.name}
                onChange={(e) =>
                  setNewClass({ ...newClass, name: e.target.value })
                }
                className="p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />

              <h3 className="text-lg font-semibold text-gray-800">
                Classes per day:
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {["Mon", "Tue", "Wed", "Thu", "Fri"].map((day) => (
                  <div
                    key={day}
                    className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 text-center"
                  >
                    <label className="block font-medium text-gray-900 mb-2">
                      {day}
                    </label>
                    <div className="flex items-center justify-center space-x-2">
                      <button
                        onClick={() =>
                          setNewClass({
                            ...newClass,
                            periodsPerDay: {
                              ...newClass.periodsPerDay,
                              [day]: Math.max(
                                0,
                                newClass.periodsPerDay[day] - 1
                              ),
                            },
                          })
                        }
                        className="p-1 text-indigo-600 border border-indigo-600 rounded-full hover:bg-indigo-100"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M20 12H4"
                          />
                        </svg>
                      </button>
                      <span className="text-xl font-semibold">
                        {newClass.periodsPerDay[day]}
                      </span>
                      <button
                        onClick={() =>
                          setNewClass({
                            ...newClass,
                            periodsPerDay: {
                              ...newClass.periodsPerDay,
                              [day]: newClass.periodsPerDay[day] + 1,
                            },
                          })
                        }
                        className="p-1 text-indigo-600 border border-indigo-600 rounded-full hover:bg-indigo-100"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 4v16m8-8H4"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <h3 className="text-lg font-semibold text-gray-800 mt-4">
                Subjects & Teachers:
              </h3>
              <div className="space-y-4">
                {subjects.map((sub) => {
                  const assignment = newClass.subjectsAssigned.find(
                    (s) => s.subject === sub.abbreviation
                  );
                  const periods = assignment ? assignment.periods : 0;
                  const teacher = assignment ? assignment.teacher : "";
                  // TimetableWizard.jsx - part of renderStep() case 3
                  const availableTeachers = teachers.filter(
                    (t) =>
                      t.subjects.includes(sub.name) ||
                      t.subjects.includes(sub.abbreviation)
                  );

                  return (
                    <div
                      key={sub.abbreviation}
                      className="bg-white p-4 rounded-lg shadow-sm border border-gray-200"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-gray-900">
                          {sub.name}
                        </span>
                        <input
                          type="checkbox"
                          checked={assignment !== undefined}
                          onChange={(e) =>
                            handleUpdateSubjectAssignment(
                              sub.abbreviation,
                              "periods",
                              e.target.checked ? 1 : 0
                            )
                          }
                          className="form-checkbox h-5 w-5 text-indigo-600"
                        />
                      </div>
                      {assignment && (
                        <div className="mt-2 pl-4">
                          <div className="flex items-center space-x-2 mb-2">
                            <button
                              onClick={() =>
                                handleUpdateSubjectAssignment(
                                  sub.abbreviation,
                                  "periods",
                                  Math.max(0, periods - 1)
                                )
                              }
                              className="p-1 text-red-600 rounded-full hover:bg-red-100"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-4 w-4"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M20 12H4"
                                />
                              </svg>
                            </button>
                            <span className="text-xl font-semibold">
                              {periods}
                            </span>
                            <button
                              onClick={() =>
                                handleUpdateSubjectAssignment(
                                  sub.abbreviation,
                                  "periods",
                                  periods + 1
                                )
                              }
                              className="p-1 text-green-600 rounded-full hover:bg-green-100"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-4 w-4"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M12 4v16m8-8H4"
                                />
                              </svg>
                            </button>
                            <span className="text-sm text-gray-500">
                              classes
                            </span>
                          </div>
                          <select
                            className="w-full p-2 border rounded-lg"
                            value={teacher}
                            onChange={(e) =>
                              handleUpdateSubjectAssignment(
                                sub.abbreviation,
                                "teacher",
                                e.target.value
                              )
                            }
                          >
                            <option value="">Select Teacher</option>
                            {availableTeachers.map((t) => (
                              <option key={t.name} value={t.name}>
                                {t.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <ActionButton onClick={handleAddClass}>
                {editingClassIndex !== null ? "Update Class" : "Add Class"}
              </ActionButton>
            </div>

            <ItemList
              items={classes}
              onDelete={handleDeleteClass}
              onEdit={handleEditClass}
              renderItem={(cls) => (
                <span className="font-medium text-gray-900">{cls.name}</span>
              )}
            />

            <div className="flex justify-between mt-8">
              <ActionButton
                onClick={() => setStep(2)}
                className="bg-gray-500 text-white"
              >
                Back
              </ActionButton>
              <ActionButton
                onClick={() => setStep(4)}
                className="bg-green-500 text-white"
              >
                Next: Review & Generate
              </ActionButton>
            </div>
          </InputCard>
        );
      case 4:
        return (
          <InputCard>
            <SectionTitle>Review & Generate</SectionTitle>
            <div className="space-y-6">
              {generatedTimetable ? (
                <>
                  <div className="p-6 bg-gray-100 rounded-lg shadow-inner">
                    <h3 className="font-semibold text-xl mb-4">
                      Timetable Preview
                    </h3>
                    {/* Display the generated timetable here */}
                    <DragDropContext onDragEnd={onDragEnd}>
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Day
                              </th>
                              {generatedTimetable[0]?.slots.map((_, i) => (
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
                            {Object.values(generatedTimetable)[0]?.map((day) => (
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
                                                snapshot.isDragging ? "bg-indigo-100" : "bg-gray-100"
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
                  </div>
                  <div className="flex justify-between mt-8">
                    <ActionButton onClick={() => setStep(3)} className="bg-gray-500 text-white">
                      Back
                    </ActionButton>
                    <ActionButton onClick={handleSaveFinalTimetable} loading={loading}>
                      Save Timetable
                    </ActionButton>
                  </div>
                </>
              ) : (
                <>
                  <div className="bg-gray-100 p-6 rounded-lg">
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">
                      Summary
                    </h3>
                    <p>
                      <strong>Subjects:</strong> {subjects.length}
                    </p>
                    <p>
                      <strong>Teachers:</strong> {teachers.length}
                    </p>
                    <p>
                      <strong>Classes:</strong> {classes.length}
                    </p>
                  </div>

                  {error && (
                    <div
                      className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6"
                      role="alert"
                    >
                      <strong className="font-bold">Error! </strong>
                      <span className="block sm:inline">{error}</span>
                    </div>
                  )}

                  <div className="flex justify-between mt-8">
                    <ActionButton onClick={() => setStep(3)} className="bg-gray-500 text-white">
                      Back
                    </ActionButton>
                    <ActionButton onClick={handlePreviewTimetable} loading={loading}>
                      Generate Timetable
                    </ActionButton>
                  </div>
                </>
              )}
            </div>
          </InputCard>
        );
      default:
        return null;
    }
  };

  return (
    <div className="p-8 max-w-2xl mx-auto bg-gray-100 min-h-screen font-sans">
      <div className="max-w-2xl mx-auto bg-white p-8 rounded-2xl shadow-xl">
        <h1 className="text-3xl font-bold text-center text-indigo-700 mb-2">
          Timetable Wizard
        </h1>
        <p className="text-center text-gray-500 mb-8">
          Follow the steps to configure your timetable.
        </p>
        <ProgressBar step={step} totalSteps={4} />
        {error && (
          <div
            className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6"
            role="alert"
          >
            <strong className="font-bold">Error: </strong>
            <span className="block sm:inline">{error}</span>
          </div>
        )}
        {renderStep()}
      </div>
    </div>
  );
}