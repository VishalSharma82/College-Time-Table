import React from "react";

const TimetableTable = ({
  timetable,
  classes,
  onEdit,
  onDelete,
  onDownload,
}) => {
  return (
    <div className="overflow-x-auto">
      {classes.map((cls) => (
        <div key={cls.name} className="mb-8">
          <h2 className="text-xl font-bold mb-4">{cls.name}</h2>
          <table className="min-w-full border border-gray-300 rounded-lg overflow-hidden">
            <thead className="bg-gray-100">
              <tr>
                <th className="border px-4 py-2">Day</th>
                {Array.from({ length: 6 }, (_, i) => (
                  <th key={i} className="border px-4 py-2">
                    Period {i + 1}
                  </th>
                ))}
                <th className="border px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {timetable[cls.name].map((day) => (
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
                      onClick={() => onEdit(cls.name, day.day)}
                      className="bg-yellow-500 hover:bg-yellow-600 text-white px-2 py-1 rounded"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => onDelete(cls.name, day.day)}
                      className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded"
                    >
                      Delete
                    </button>
                    <button
                      onClick={() => onDownload(cls.name, day.day)}
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
      ))}
    </div>
  );
};

export default TimetableTable;
