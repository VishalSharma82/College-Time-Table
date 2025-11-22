import React from "react";

const TimetableTable = ({
  timetable, // अब यह Array of Day Objects है
  classes,
  onEdit,
  onDelete,
  onDownload,
}) => {
  // यदि classes Array में कोई क्लास नहीं है, या timetable खाली है, तो कुछ भी प्रदर्शित न करें
  if (!classes || classes.length === 0 || !timetable || timetable.length === 0) {
    return (
      <p className="text-gray-500">
        No timetable data or classes available for display.
      </p>
    );
  }

  // चूंकि generateTimetable केवल एक क्लास का टाइमटेबल देता है, हम केवल पहली क्लास को दिखाते हैं
  const mainClass = classes[0];

  // यह सुनिश्चित करने के लिए कि हम सही संख्या में पीरियड हेडर दिखा रहे हैं
  const periodsToShow = timetable[0]?.slots.length || 6;

  return (
    <div className="overflow-x-auto">
      {/* 🚀 FIX: केवल पहली क्लास के नाम का उपयोग करें, क्योंकि timetable state एक एकल Array है */}
      <div key={mainClass.name} className="mb-8">
        <h2 className="text-xl font-bold mb-4">{mainClass.name}</h2>
        <table className="min-w-full border border-gray-300 rounded-lg overflow-hidden">
          <thead className="bg-gray-100">
            <tr>
              <th className="border px-4 py-2">Day</th>
              {Array.from({ length: periodsToShow }, (_, i) => (
                <th key={i} className="border px-4 py-2">
                  Period {i + 1}
                </th>
              ))}
              <th className="border px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {/* 🚀 FIX APPLIED: timetable Array पर सीधे map करें */}
            {timetable.map((day) => (
              <tr key={day.day} className="text-center">
                <td className="border px-4 py-2 font-medium">{day.day}</td>
                {day.slots.map((slot, index) => (
                  <td key={index} className="border px-4 py-2">
                    {slot.subject || "-"}
                    {slot.teacher && (
                      <div className="text-sm text-gray-500">
                        {slot.teacher}
                      </div>
                    )}
                    {slot.room && (
                      <div className="text-sm text-gray-500">{slot.room}</div>
                    )}
                  </td>
                ))}
                <td className="border px-4 py-2 flex flex-col gap-1 justify-center items-center">
                  <button
                    onClick={() => onEdit(mainClass.name, day.day)}
                    className="bg-yellow-500 hover:bg-yellow-600 text-white px-2 py-1 rounded"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => onDelete(mainClass.name, day.day)}
                    className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded"
                  >
                    Delete
                  </button>
                  <button
                    onClick={() => onDownload(mainClass.name, day.day)}
                    className="bg-green-500 hover:bg-green-600 text-white px-2 py-1 rounded"
                  >
                    Download
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TimetableTable;