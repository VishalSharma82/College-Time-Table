import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axios";

// Reusable UI components
const InputCard = ({ children }) => (
  <div className="bg-gray-50 p-6 rounded-lg shadow-inner">
    {children}
  </div>
);

const SectionTitle = ({ children }) => (
  <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-2">
    {children}
  </h2>
);

const ProgressBar = ({ step, totalSteps }) => (
  <div className="mb-8">
    <div className="flex justify-between text-sm font-medium text-gray-600">
      <span>Step {step} of {totalSteps}</span>
      <span>{step === 1 ? 'Subjects' : step === 2 ? 'Teachers' : step === 3 ? 'Classes' : 'Review'}</span>
    </div>
    <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
      <div
        className="bg-indigo-600 h-2 rounded-full transition-all duration-500 ease-in-out"
        style={{ width: `${(step / totalSteps) * 100}%` }}
      ></div>
    </div>
  </div>
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

  const [newSubject, setNewSubject] = useState({ name: "", abbreviation: "", periodsPerWeek: "", isLab: false });
  const [newTeacher, setNewTeacher] = useState({ name: "", subject: "" });
  const [newClass, setNewClass] = useState({ name: "" });

  const handleAddSubject = () => {
    if (newSubject.name && newSubject.abbreviation && newSubject.periodsPerWeek) {
      setSubjects([...subjects, { ...newSubject, periodsPerWeek: parseInt(newSubject.periodsPerWeek) }]);
      setNewSubject({ name: "", abbreviation: "", periodsPerWeek: "", isLab: false });
    }
  };

  const handleAddTeacher = () => {
    if (newTeacher.name && newTeacher.subject) {
      setTeachers([...teachers, newTeacher]);
      setNewTeacher({ name: "", subject: "" });
    }
  };

  const handleAddClass = () => {
    if (newClass.name) {
      setClasses([...classes, newClass]);
      setNewClass({ name: "" });
    }
  };

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("User not authenticated.");

      const configData = { subjects, teachers, classes };
      await api.post(`/groups/${groupId}/configure-timetable`, configData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const res = await api.post(`/groups/${groupId}/generate-timetable`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });

      alert("Timetable generated successfully!");
      console.log("Generated Timetable:", res.data.timetable);
      navigate(`/groups/${groupId}`);
    } catch (err) {
      console.error("Error during generation:", err.response?.data || err.message);
      setError(err.response?.data?.message || "Failed to generate timetable. Please check your inputs.");
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <InputCard>
            <SectionTitle>Step 1: Subjects</SectionTitle>
            <div className="flex flex-col gap-4 mb-6">
              <input type="text" placeholder="Subject Name (e.g., Hindi)" value={newSubject.name} onChange={(e) => setNewSubject({ ...newSubject, name: e.target.value })} className="p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              <input type="text" placeholder="Abbreviation (e.g., HIN)" value={newSubject.abbreviation} onChange={(e) => setNewSubject({ ...newSubject, abbreviation: e.target.value })} className="p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              <input type="number" placeholder="Periods/Week (e.g., 4)" value={newSubject.periodsPerWeek} onChange={(e) => setNewSubject({ ...newSubject, periodsPerWeek: e.target.value })} className="p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              <div className="flex items-center gap-2 text-gray-700">
                <input type="checkbox" checked={newSubject.isLab} onChange={(e) => setNewSubject({ ...newSubject, isLab: e.target.checked })} className="form-checkbox h-5 w-5 text-indigo-600 rounded" />
                <label>Is this a Lab Subject?</label>
              </div>
              <button onClick={handleAddSubject} className="w-full py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors">Add Subject</button>
            </div>
            <div className="space-y-2">
              {subjects.map((sub, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-white rounded-lg shadow-sm border border-gray-200">
                  <span className="font-medium text-gray-900">{sub.name} ({sub.abbreviation})</span>
                  <span className="text-sm text-gray-500">{sub.periodsPerWeek} periods/week {sub.isLab && ' (Lab)'}</span>
                </div>
              ))}
            </div>
            <button onClick={() => setStep(2)} className="mt-8 w-full py-3 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600 transition-colors">
              Next: Add Teachers
            </button>
          </InputCard>
        );
      case 2:
        return (
          <InputCard>
            <SectionTitle>Step 2: Teachers</SectionTitle>
            <div className="flex flex-col gap-4 mb-6">
              <input type="text" placeholder="Teacher Name (e.g., Ms. Nikita)" value={newTeacher.name} onChange={(e) => setNewTeacher({ ...newTeacher, name: e.target.value })} className="p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              <input type="text" placeholder="Subject (e.g., Hindi)" value={newTeacher.subject} onChange={(e) => setNewTeacher({ ...newTeacher, subject: e.target.value })} className="p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              <button onClick={handleAddTeacher} className="w-full py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors">Add Teacher</button>
            </div>
            <div className="space-y-2">
              {teachers.map((teacher, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-white rounded-lg shadow-sm border border-gray-200">
                  <span className="font-medium text-gray-900">{teacher.name}</span>
                  <span className="text-sm text-gray-500">Teaches: {teacher.subject}</span>
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-8">
              <button onClick={() => setStep(1)} className="px-6 py-3 bg-gray-500 text-white rounded-lg font-semibold hover:bg-gray-600 transition-colors">Back</button>
              <button onClick={() => setStep(3)} className="px-6 py-3 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600 transition-colors">Next: Add Classes</button>
            </div>
          </InputCard>
        );
      case 3:
        return (
          <InputCard>
            <SectionTitle>Step 3: Classes</SectionTitle>
            <div className="flex flex-col gap-4 mb-6">
              <input type="text" placeholder="Class Name (e.g., CSE 7A)" value={newClass.name} onChange={(e) => setNewClass({ ...newClass, name: e.target.value })} className="p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              <button onClick={handleAddClass} className="w-full py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors">Add Class</button>
            </div>
            <div className="space-y-2">
              {classes.map((cls, index) => (
                <div key={index} className="p-4 bg-white rounded-lg shadow-sm border border-gray-200">
                  <span className="font-medium text-gray-900">{cls.name}</span>
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-8">
              <button onClick={() => setStep(2)} className="px-6 py-3 bg-gray-500 text-white rounded-lg font-semibold hover:bg-gray-600 transition-colors">Back</button>
              <button onClick={() => setStep(4)} className="px-6 py-3 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600 transition-colors">Next: Review & Generate</button>
            </div>
          </InputCard>
        );
      case 4:
        return (
          <InputCard>
            <SectionTitle>Review & Generate</SectionTitle>
            <div className="space-y-6">
              <div className="bg-gray-100 p-6 rounded-lg">
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Summary</h3>
                <p><strong>Subjects:</strong> {subjects.length}</p>
                <p><strong>Teachers:</strong> {teachers.length}</p>
                <p><strong>Classes:</strong> {classes.length}</p>
              </div>

              {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative" role="alert">
                  <strong className="font-bold">Error! </strong>
                  <span className="block sm:inline">{error}</span>
                </div>
              )}

              <div className="flex justify-between mt-8">
                <button onClick={() => setStep(3)} className="px-6 py-3 bg-gray-500 text-white rounded-lg font-semibold hover:bg-gray-600 transition-colors">
                  Back
                </button>
                <button onClick={handleGenerate} disabled={loading} className={`px-8 py-3 text-white rounded-lg font-semibold transition-colors ${loading ? 'bg-indigo-300 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'}`}>
                  {loading ? "Generating..." : "Generate Timetable"}
                </button>
              </div>
            </div>
          </InputCard>
        );
      default:
        return null;
    }
  };

  return (
    <div className="p-8 max-w-2xl mx-auto bg-gray-50 min-h-screen">
      <div className="bg-white p-8 rounded-2xl shadow-xl">
        <h1 className="text-3xl font-bold text-center text-indigo-700 mb-2">
          Timetable Wizard for Group {groupId}
        </h1>
        <p className="text-center text-gray-500 mb-8">
          Follow the steps to configure your timetable.
        </p>
        <ProgressBar step={step} totalSteps={4} />
        {renderStep()}
      </div>
    </div>
  );
}