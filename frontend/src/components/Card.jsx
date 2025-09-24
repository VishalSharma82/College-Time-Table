// components/Card.jsx
import React from "react";

export default function Card({ children }) {
  return (
    <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 shadow-lg">
      {children}
    </div>
  );
}
