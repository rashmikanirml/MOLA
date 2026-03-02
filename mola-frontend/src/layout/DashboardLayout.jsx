import React from "react";
import { useNavigate } from "react-router-dom";

function DashboardLayout({ children, role }) {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white">

      {/* Top Navbar */}
      <div className="flex justify-between items-center px-10 py-4 bg-slate-950/50 backdrop-blur-lg shadow-lg">
        <h1 className="text-2xl font-bold tracking-wide">
          MOLA Booking System
        </h1>

        <div className="flex items-center gap-4">
          <span className={`px-3 py-1 rounded-full text-sm font-semibold 
            ${role === "ADMIN" ? "bg-purple-600" : "bg-gray-600"}`}>
            {role}
          </span>

          <button
            onClick={() => navigate("/")}
            className="bg-red-500 hover:bg-red-600 transition px-4 py-1 rounded-lg"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-10">
        {children}
      </div>
    </div>
  );
}

export default DashboardLayout;