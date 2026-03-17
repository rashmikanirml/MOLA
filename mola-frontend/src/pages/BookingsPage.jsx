import React, { useEffect, useState, useContext } from "react";
import api from "../api/api";
import { AuthContext } from "../context/AuthContext.jsx";
import { useNavigate } from "react-router-dom";

function BookingsPage() {
  const { auth, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const [bookings, setBookings] = useState([]);
  const [purpose, setPurpose] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [attendees, setAttendees] = useState("");

  const fetchBookings = async () => {
    try {
      const response = await api.get("/bookings");
      setBookings(response.data);
    } catch (error) {
      alert("Unauthorized or error fetching bookings");
      handleLogout();
    }
  };

  const createBooking = async () => {
    try {
      await api.post("/bookings/1", {
        purpose,
        startTime,
        endTime,
        attendees,
      });

      setPurpose("");
      setStartTime("");
      setEndTime("");
      setAttendees("");

      fetchBookings();
    } catch (error) {
      alert("Error creating booking");
    }
  };

  const approveBooking = async (id) => {
    try {
      await api.put(`/bookings/${id}/status?status=APPROVED`);
      fetchBookings();
    } catch (error) {
      alert("Only ADMIN can approve");
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">
          Bookings Dashboard
          <span className="ml-3 bg-purple-600 text-white px-3 py-1 rounded text-sm">
            {auth.role}
          </span>
        </h2>

        <button
          onClick={handleLogout}
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
        >
          Logout
        </button>
      </div>

      {auth.role === "ROLE_USER" && (
        <div className="bg-white p-6 rounded shadow mb-6">
          <h3 className="text-lg font-semibold mb-4">Create Booking</h3>

          <input
            className="border p-2 w-full mb-3"
            placeholder="Purpose"
            value={purpose}
            onChange={(e) => setPurpose(e.target.value)}
          />

          <input
            className="border p-2 w-full mb-3"
            type="datetime-local"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
          />

          <input
            className="border p-2 w-full mb-3"
            type="datetime-local"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
          />

          <input
            className="border p-2 w-full mb-3"
            type="number"
            placeholder="Attendees"
            value={attendees}
            onChange={(e) => setAttendees(e.target.value)}
          />

          <button
            onClick={createBooking}
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            Create Booking
          </button>
        </div>
      )}

      <div>
        <h3 className="text-lg font-semibold mb-4">All Bookings</h3>

        {bookings.map((b) => (
          <div
            key={b.id}
            className="bg-white p-4 rounded shadow mb-3"
          >
            <p><b>Purpose:</b> {b.purpose}</p>
            <p><b>Status:</b> {b.status}</p>
            <p><b>Start:</b> {b.startTime}</p>
            <p><b>End:</b> {b.endTime}</p>
            <p><b>Attendees:</b> {b.attendees}</p>

            {b.status === "PENDING" &&
              auth.role === "ROLE_ADMIN" && (
                <button
                  onClick={() => approveBooking(b.id)}
                  className="mt-2 bg-green-600 text-white px-3 py-1 rounded"
                >
                  Approve
                </button>
              )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default BookingsPage;