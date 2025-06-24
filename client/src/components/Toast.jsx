"use client";

import { useEffect } from "react";
import { FaCheckCircle, FaExclamationCircle, FaTimes } from "react-icons/fa";

export default function Toast({ message, type, onClose }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 5000);

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed top-4 right-4 z-50 animate-slide-in">
      <div
        className={`flex items-center p-4 rounded-lg shadow-lg max-w-sm ${
          type === "success"
            ? "bg-green-50 border border-green-200"
            : "bg-red-50 border border-red-200"
        }`}
      >
        <div className="flex-shrink-0">
          {type === "success" ? (
            <FaCheckCircle className="w-5 h-5 text-green-400" />
          ) : (
            <FaExclamationCircle className="w-5 h-5 text-red-400" />
          )}
        </div>
        <div className="ml-3">
          <p
            className={`text-sm font-medium ${
              type === "success" ? "text-green-800" : "text-red-800"
            }`}
          >
            {message}
          </p>
        </div>
        <div className="ml-auto pl-3">
          <button
            onClick={onClose}
            className={`inline-flex rounded-md p-1.5 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
              type === "success"
                ? "text-green-400 hover:bg-green-100 focus:ring-green-600"
                : "text-red-400 hover:bg-red-100 focus:ring-red-600"
            }`}
          >
            <FaTimes className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
}
