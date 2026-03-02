import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function MainLayout({ children, role }) {
  const [open, setOpen] = useState(true);
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen bg-slate-900 text-white">

      {/* Sidebar */}
      <div
        className={`bg-slate-950 transition-all duration-300 
        ${open ? "w-64" : "w-20"} 
        flex flex-col shadow-xl`}
      >
        {/* Logo */}
        <div className="p-6 font-bold text-xl border-b border-slate-800 flex justify-between items-center">
          {open ? "MOLA" : "M"}
          <button
            onClick={() => setOpen(!open)}
            className="text-sm text-slate-400"
          >
            ☰
          </button>
        </div>

        {/* Nav Items */}
        <nav className="flex-1 p-4 space-y-3">

          <button
            onClick={() => navigate("/dashboard")}
            className="w-full text-left px-4 py-2 rounded-lg hover:bg-slate-800 transition"
          >
            📊 {open && "Dashboard"}
          </button>

          <button
            onClick={() => navigate("/bookings")}
            className="w-full text-left px-4 py-2 rounded-lg hover:bg-slate-800 transition"
          >
            📅 {open && "Bookings"}
          </button>

          <button
            onClick={() => navigate("/resources")}
            className="w-full text-left px-4 py-2 rounded-lg hover:bg-slate-800 transition"
          >
            🏢 {open && "Resources"}
          </button>

          {role === "ADMIN" && (
            <button
              onClick={() => navigate("/users")}
              className="w-full text-left px-4 py-2 rounded-lg hover:bg-slate-800 transition"
            >
              👤 {open && "Users"}
            </button>
          )}

        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800">
          <button
            onClick={() => navigate("/")}
            className="w-full bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg transition"
          >
            {open ? "Logout" : "🚪"}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-10">
        {children}
      </div>

    </div>
  );
}

export default MainLayout;