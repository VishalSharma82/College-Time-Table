import React from "react";

const TimetableDisplay = ({ timetable, groupName }) => {
  if (!timetable || timetable.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="font-semibold text-gray-800">Timetable for {groupName}</h3>
        <p className="mt-2 text-gray-500">No timetable has been generated yet.</p>
      </div>
    );
  }

  // Get the number of periods from the first day
  const periods = timetable[0].slots.length;
  
  return (
    <div className="overflow-x-auto bg-white rounded-xl shadow-lg p-6">
      <h3 className="font-semibold text-gray-800">Timetable for {groupName}</h3>
      <table className="min-w-full divide-y divide-gray-200 mt-4 text-sm">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-3 py-2 text-left font-semibold text-gray-700 uppercase tracking-wider">Day</th>
            {Array.from({ length: periods }, (_, i) => (
              <th key={i} className="px-3 py-2 text-center font-semibold text-gray-700 uppercase tracking-wider">
                Period {i + 1}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {timetable.map((day) => (
            <tr key={day.day} className="hover:bg-gray-50">
              <td className="px-3 py-2 whitespace-nowrap font-medium text-gray-900">
                {day.day}
              </td>
              {day.slots.map((slot, index) => (
                <td key={index} className="px-3 py-2 whitespace-nowrap text-center">
                  <div className="font-semibold text-gray-800">{slot.subject || "Free"}</div>
                  {slot.teacher && (
                    <div className="text-xs text-gray-500">{slot.teacher}</div>
                  )}
                  {slot.room && (
                    <div className="text-xs text-gray-500">{slot.room}</div>
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TimetableDisplay;