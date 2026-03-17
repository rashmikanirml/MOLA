import React, { useEffect, useMemo, useState } from "react";
import api from "../api/api";
import MainLayout from "../layout/MainLayout";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext.jsx";

function DashboardPage() {

  const { auth } = useContext(AuthContext);
  const [stats, setStats] = useState({ TOTAL: 0, PENDING: 0, APPROVED: 0, REJECTED: 0, CANCELLED: 0 });
  const [resources, setResources] = useState([]);
  const [recentBookings, setRecentBookings] = useState([]);
  const [error, setError] = useState("");

  const loadStats = async () => {
    try {
      const [statsResponse, resourcesResponse, bookingsResponse] = await Promise.all([
        api.get("/bookings/stats"),
        api.get("/resources"),
        api.get("/bookings"),
      ]);

      setStats(statsResponse.data);
      setResources(resourcesResponse.data);

      const sorted = [...bookingsResponse.data].sort(
        (a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
      );
      setRecentBookings(sorted.slice(0, 5));
      setError("");
    } catch (err) {
      setError(err.response?.data || "Unable to load dashboard data");
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  const activeResources = useMemo(
    () => resources.filter((item) => item.status === "ACTIVE").length,
    [resources]
  );

  return (
    <MainLayout role={auth.role}>
      <div className="mb-8 rounded-3xl border border-cyan-300/30 bg-gradient-to-r from-cyan-500/20 to-amber-500/20 p-8">
        <h1 className="text-3xl font-bold">MOLA Operations Hub</h1>
        <p className="mt-2 text-slate-200">Live operations snapshot for bookings, spaces, and service reliability.</p>
      </div>

      {error && (
        <div className="mb-6 rounded-xl border border-rose-500/50 bg-rose-500/20 p-4 text-rose-100">
          {error}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-5">
        <div className="rounded-2xl border border-white/10 bg-white/10 p-4">
          <p className="text-sm text-slate-300">Total Bookings</p>
          <p className="mt-1 text-3xl font-bold">{stats.TOTAL || 0}</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-amber-300/20 p-4">
          <p className="text-sm text-slate-100">Pending</p>
          <p className="mt-1 text-3xl font-bold">{stats.PENDING || 0}</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-emerald-300/20 p-4">
          <p className="text-sm text-slate-100">Approved</p>
          <p className="mt-1 text-3xl font-bold">{stats.APPROVED || 0}</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-sky-300/20 p-4">
          <p className="text-sm text-slate-100">Resources</p>
          <p className="mt-1 text-3xl font-bold">{resources.length}</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-lime-300/20 p-4">
          <p className="text-sm text-slate-100">Active Resources</p>
          <p className="mt-1 text-3xl font-bold">{activeResources}</p>
        </div>
      </div>

      <div className="mt-8 rounded-2xl border border-white/10 bg-white/10 p-6">
        <h2 className="mb-4 text-xl font-semibold">Recent Bookings</h2>
        {recentBookings.length === 0 && <p className="text-slate-300">No bookings found.</p>}
        {recentBookings.map((booking) => (
          <div key={booking.id} className="mb-3 rounded-xl border border-white/10 bg-black/20 p-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="font-semibold">{booking.purpose || "Untitled booking"}</p>
              <span className="rounded-full bg-white/15 px-2 py-1 text-xs">{booking.status}</span>
            </div>
            <p className="text-sm text-slate-200">{booking.resource?.name} | {booking.startTime?.replace("T", " ")}</p>
          </div>
        ))}
      </div>
    </MainLayout>
  );
}

export default DashboardPage;