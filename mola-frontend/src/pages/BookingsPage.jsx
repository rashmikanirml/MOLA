import React, { useCallback, useEffect, useState, useContext } from "react";
import api from "../api/api";
import { AuthContext } from "../context/AuthContext.jsx";
import MainLayout from "../layout/MainLayout";

function BookingsPage() {
  const { auth } = useContext(AuthContext);
  const isAdmin = auth.role === "ROLE_ADMIN";

  const [bookings, setBookings] = useState([]);
  const [resources, setResources] = useState([]);
  const [selectedResourceId, setSelectedResourceId] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [purpose, setPurpose] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [attendees, setAttendees] = useState("");
  const [feedback, setFeedback] = useState("");

  const fetchBookings = useCallback(async () => {
    try {
      const path = selectedResourceId
        ? `/bookings/resource/${selectedResourceId}`
        : "/bookings";
      const response = await api.get(path);
      setBookings(response.data);
      setFeedback("");
    } catch (error) {
      setFeedback(error.response?.data || "Error fetching bookings");
    }
  }, [selectedResourceId]);

  const fetchResources = useCallback(async () => {
    try {
      const response = await api.get("/resources");
      setResources(response.data);
      if (response.data.length > 0 && !selectedResourceId) {
        setSelectedResourceId(String(response.data[0].id));
      }
    } catch (error) {
      setFeedback(error.response?.data || "Error fetching resources");
    }
  }, [selectedResourceId]);

  const createBooking = async () => {
    try {
      if (!selectedResourceId) {
        setFeedback("Select a resource first.");
        return;
      }

      await api.post(`/bookings/${selectedResourceId}`, {
        purpose,
        startTime,
        endTime,
        attendees: Number(attendees),
      });

      setPurpose("");
      setStartTime("");
      setEndTime("");
      setAttendees("");

      setFeedback("Booking created successfully.");
      fetchBookings();
    } catch (error) {
      setFeedback(error.response?.data || "Error creating booking");
    }
  };

  const updateBookingStatus = async (id, status) => {
    try {
      await api.put(`/bookings/${id}/status?status=${status}`);
      setFeedback(`Booking updated to ${status}.`);
      fetchBookings();
    } catch (error) {
      setFeedback(error.response?.data || "Unable to update booking status");
    }
  };

  const deleteBooking = async (id) => {
    if (!window.confirm("Delete this booking?")) {
      return;
    }

    try {
      await api.delete(`/bookings/${id}`);
      setFeedback("Booking deleted.");
      fetchBookings();
    } catch (error) {
      setFeedback(error.response?.data || "Unable to delete booking");
    }
  };

  useEffect(() => {
    fetchResources();
  }, [fetchResources]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const visibleBookings = bookings.filter((item) =>
    statusFilter === "ALL" ? true : item.status === statusFilter
  );

  return (
    <MainLayout role={auth.role}>
      <div className="mb-6 rounded-3xl border border-orange-300/30 bg-gradient-to-r from-orange-400/20 to-cyan-400/20 p-6">
        <h2 className="text-3xl font-bold">Booking Command Center</h2>
        <p className="mt-2 text-slate-100">Schedule, review, and execute campus booking workflows.</p>
      </div>

      {feedback && <div className="mb-4 rounded-xl bg-black/30 p-3 text-sm">{feedback}</div>}

      <div className="mb-5 grid gap-3 rounded-2xl border border-white/10 bg-white/10 p-4 md:grid-cols-3">
        <select
          className="rounded-lg border border-white/20 bg-black/20 p-2"
          value={selectedResourceId}
          onChange={(e) => setSelectedResourceId(e.target.value)}
        >
          <option value="">All Resources</option>
          {resources.map((resource) => (
            <option key={resource.id} value={resource.id}>{resource.name}</option>
          ))}
        </select>

        <select
          className="rounded-lg border border-white/20 bg-black/20 p-2"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="ALL">All Statuses</option>
          <option value="PENDING">PENDING</option>
          <option value="APPROVED">APPROVED</option>
          <option value="REJECTED">REJECTED</option>
          <option value="CANCELLED">CANCELLED</option>
        </select>

        <button className="rounded-lg bg-cyan-600 px-4 py-2 font-semibold hover:bg-cyan-500" onClick={fetchBookings}>
          Refresh
        </button>
      </div>

      <div className="mb-6 rounded-2xl border border-white/10 bg-white/10 p-5">
        <h3 className="mb-4 text-lg font-semibold">Create Booking</h3>

        <div className="grid gap-3 md:grid-cols-2">
          <input
            className="rounded-lg border border-white/20 bg-black/20 p-2"
            placeholder="Purpose"
            value={purpose}
            onChange={(e) => setPurpose(e.target.value)}
          />

          <input
            className="rounded-lg border border-white/20 bg-black/20 p-2"
            type="datetime-local"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
          />

          <input
            className="rounded-lg border border-white/20 bg-black/20 p-2"
            type="datetime-local"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
          />

          <input
            className="rounded-lg border border-white/20 bg-black/20 p-2"
            type="number"
            placeholder="Attendees"
            value={attendees}
            onChange={(e) => setAttendees(e.target.value)}
          />
        </div>

        <button onClick={createBooking} className="mt-4 rounded-lg bg-emerald-600 px-4 py-2 font-semibold hover:bg-emerald-500">
          Create Booking
        </button>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {visibleBookings.map((b) => (
          <div key={b.id} className="rounded-2xl border border-white/10 bg-black/20 p-4">
            <div className="mb-2 flex items-center justify-between gap-2">
              <h4 className="font-semibold">{b.purpose || "Untitled"}</h4>
              <span className="rounded-full bg-white/15 px-2 py-1 text-xs">{b.status}</span>
            </div>
            <p className="text-sm text-slate-200">Resource: {b.resource?.name || "-"}</p>
            <p className="text-sm text-slate-200">Start: {b.startTime?.replace("T", " ")}</p>
            <p className="text-sm text-slate-200">End: {b.endTime?.replace("T", " ")}</p>
            <p className="text-sm text-slate-200">Attendees: {b.attendees}</p>

            {isAdmin && (
              <div className="mt-3 flex flex-wrap gap-2">
                {b.status === "PENDING" && (
                  <>
                    <button className="rounded bg-emerald-600 px-3 py-1" onClick={() => updateBookingStatus(b.id, "APPROVED")}>Approve</button>
                    <button className="rounded bg-amber-500 px-3 py-1 text-black" onClick={() => updateBookingStatus(b.id, "REJECTED")}>Reject</button>
                  </>
                )}
                {b.status === "APPROVED" && (
                  <button className="rounded bg-slate-500 px-3 py-1" onClick={() => updateBookingStatus(b.id, "CANCELLED")}>Cancel</button>
                )}
                <button className="rounded bg-rose-600 px-3 py-1" onClick={() => deleteBooking(b.id)}>Delete</button>
              </div>
            )}
          </div>
        ))}
      </div>
    </MainLayout>
  );
}

export default BookingsPage;