import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext.jsx";

function MainLayout({ children, role }) {
  const [open, setOpen] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const navigate = useNavigate();
  const { logout } = useContext(AuthContext);

  const navItems = [
    { path: "/dashboard", label: "Overview" },
    { path: "/bookings", label: "Bookings" },
    { path: "/resources", label: "Resources" },
    { path: "/tickets", label: "Tickets" },
    { path: "/live-ops", label: "Live Ops" },
  ];

  if (role === "ROLE_ADMIN") {
    navItems.push({ path: "/users", label: "Users" });
  }

  const loadNotifications = async () => {
    try {
      const response = await api.get("/notifications?unreadOnly=true");
      setNotifications(response.data || []);
    } catch (_error) {
      setNotifications([]);
    }
  };

  useEffect(() => {
    loadNotifications();
    const interval = setInterval(loadNotifications, 15000);
    return () => clearInterval(interval);
  }, []);

  const markAllNotificationsRead = async () => {
    try {
      await api.put("/notifications/read-all");
      setNotifications([]);
    } catch (_error) {
      // no-op UI fallback
    }
  };

  return (
    <div className="flex min-h-screen bg-[radial-gradient(circle_at_top_right,#0f2a3d,transparent_40%),radial-gradient(circle_at_bottom_left,#20152f,transparent_35%),#081018] text-white">
      <div
        className={`border-r border-white/10 bg-black/25 backdrop-blur-xl transition-all duration-300 ${open ? "w-64" : "w-20"} flex flex-col shadow-xl`}
      >
        <div className="p-6 font-bold text-xl border-b border-white/10 flex justify-between items-center">
          {open ? "MOLA" : "M"}
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
            onClick={() => {
              logout();
              navigate("/");
            }}
            className="w-full bg-rose-600 hover:bg-rose-700 px-4 py-2 rounded-lg transition"
          >
            {open ? "Logout" : "Out"}
          </button>
        </div>
      </div>

      <div className="relative flex-1 p-6 md:p-10">
        <div className="mb-4 flex justify-end">
          <button
            type="button"
            onClick={() => setShowNotifications((item) => !item)}
            className="rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm hover:bg-white/20"
          >
            Notifications ({notifications.length})
          </button>
        </div>

        {showNotifications && (
          <div className="absolute right-6 top-16 z-40 w-full max-w-sm rounded-xl border border-white/10 bg-slate-950/95 p-3 shadow-xl md:right-10">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-sm font-semibold">Unread Notifications</p>
              <button type="button" className="text-xs text-cyan-300" onClick={markAllNotificationsRead}>
                Mark all read
              </button>
            </div>
            {notifications.length === 0 && <p className="text-xs text-slate-300">No unread notifications.</p>}
            {notifications.slice(0, 8).map((item) => (
              <div key={item.id} className="mb-2 rounded-lg border border-white/10 bg-white/5 p-2">
                <p className="text-sm font-medium">{item.title}</p>
                <p className="text-xs text-slate-300">{item.message}</p>
              </div>
            ))}
          </div>
        )}

        {children}
      </div>
    </div>
  );
}

export default MainLayout;