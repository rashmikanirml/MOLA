import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function MainLayout({ children, role }) {
  const [open, setOpen] = useState(true);
  const navigate = useNavigate();

  const navItems = [
    { path: "/dashboard", label: "Overview" },
    { path: "/bookings", label: "Bookings" },
    { path: "/resources", label: "Resources" },
  ];

  if (role === "ROLE_ADMIN") {
    navItems.push({ path: "/users", label: "Users" });
  }

  return (
    <div className="flex min-h-screen bg-[radial-gradient(circle_at_top_right,#0f2a3d,transparent_40%),radial-gradient(circle_at_bottom_left,#20152f,transparent_35%),#081018] text-white">
      <div
        className={`border-r border-white/10 bg-black/25 backdrop-blur-xl transition-all duration-300 ${open ? "w-64" : "w-20"} flex flex-col shadow-xl`}
      >
        <div className="p-6 font-bold text-xl border-b border-white/10 flex justify-between items-center">
          {open ? "Campus Hub" : "CH"}
          <button
            onClick={() => setOpen(!open)}
            className="text-sm text-slate-300"
          >
            |||
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-3">
          {navItems.map((item) => (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className="w-full text-left px-4 py-2 rounded-lg hover:bg-white/10 transition"
            >
              {open && item.label}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-white/10">
          <div className="mb-3 rounded-lg bg-white/10 px-3 py-2 text-xs">
            Role: {role || "N/A"}
          </div>
          <button
            onClick={() => navigate("/")}
            className="w-full bg-rose-600 hover:bg-rose-700 px-4 py-2 rounded-lg transition"
          >
            {open ? "Logout" : "Out"}
          </button>
        </div>
      </div>

      <div className="flex-1 p-6 md:p-10">
        {children}
      </div>
    </div>
  );
}

export default MainLayout;