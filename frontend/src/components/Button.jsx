// components/Button.jsx
import React from "react";

export default function Button({ children, onClick, className }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-lg font-semibold bg-indigo-500 hover:bg-indigo-600 text-white ${className}`}
    >
      {children}
    </button>
  );
}
