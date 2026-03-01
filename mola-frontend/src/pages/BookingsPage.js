import React, { useEffect, useState, useContext } from "react";
import api from "../api/api";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

function BookingsPage() {

  const { auth, setAuth } = useContext(AuthContext);
  const navigate = useNavigate();

  const [bookings, setBookings] = useState([]);

  // Create booking form state
  const [resourceId] = useState(1); // default resource
  const [purpose, setPurpose] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [attendees, setAttendees] = useState("");

  // ---------------- FETCH BOOKINGS ----------------
  const fetchBookings = async () => {
    try {
      const response = await api.get("/bookings", {
        auth: {
          username: auth.username,
          password: auth.password
        }
      });

      setBookings(response.data);

    } catch (error) {
      alert("Unauthorized or error fetching bookings");
      handleLogout();
    }
  };

  // ---------------- CREATE BOOKING (USER) ----------------
  const createBooking = async () => {
    try {
      await api.post(
        `/bookings/${resourceId}`,
        {
          purpose,
          startTime,
          endTime,
          attendees
        },
        {
          auth: {
            username: auth.username,
            password: auth.password
          }
        }
      );

      // Clear form
      setPurpose("");
      setStartTime("");
      setEndTime("");
      setAttendees("");

      fetchBookings();

    } catch (error) {
      alert("Error creating booking");
    }
  };

  // ---------------- APPROVE BOOKING (ADMIN) ----------------
  const approveBooking = async (id) => {
    try {
      await api.put(
        `/bookings/${id}/status?status=APPROVED`,
        {},
        {
          auth: {
            username: auth.username,
            password: auth.password
          }
        }
      );

      fetchBookings();

    } catch (error) {
      alert("Only admin can approve bookings");
    }
  };

  // ---------------- LOGOUT ----------------
  const handleLogout = () => {
    setAuth({ username: "", password: "" });
    navigate("/");
  };

  // ---------------- LOAD DATA ----------------
  useEffect(() => {
    if (auth.username && auth.password) {
      fetchBookings();
    } else {
      navigate("/");
    }
  }, [auth]);

  return (
    <div style={{ padding: "20px" }}>

      {/* HEADER */}
      <h2>
        Bookings Dashboard
        <span
          style={{
            marginLeft: "10px",
            fontSize: "14px",
            background: auth.role === "ADMIN" ? "purple" : "gray",
            color: "white",
            padding: "4px 8px",
            borderRadius: "4px"
          }}
        >
          {auth.role}
        </span>
      </h2>

      <button onClick={handleLogout}>Logout</button>

      <hr />

      {/* CREATE BOOKING SECTION (ONLY USER) */}
      {auth.role === "USER" && (
        <>
          <h3>Create Booking</h3>

          <div style={{ marginBottom: "20px" }}>

            <input
              placeholder="Purpose"
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
            />

            <br /><br />

            <input
              type="datetime-local"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
            />

            <br /><br />

            <input
              type="datetime-local"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
            />

            <br /><br />

            <input
              type="number"
              placeholder="Attendees"
              value={attendees}
              onChange={(e) => setAttendees(e.target.value)}
            />

            <br /><br />

            <button onClick={createBooking}>
              Create Booking
            </button>
          </div>

          <hr />
        </>
      )}

      {/* BOOKINGS LIST */}
      <h3>All Bookings</h3>

      {bookings.map((b) => (
        <div
          key={b.id}
          style={{
            border: "1px solid gray",
            margin: "10px 0",
            padding: "10px"
          }}
        >
          <p><b>Purpose:</b> {b.purpose}</p>
          <p><b>Status:</b> {b.status}</p>
          <p><b>Start:</b> {b.startTime}</p>
          <p><b>End:</b> {b.endTime}</p>
          <p><b>Attendees:</b> {b.attendees}</p>

          {/* ADMIN APPROVE BUTTON */}
          {b.status === "PENDING" && auth.role === "ADMIN" && (
            <button onClick={() => approveBooking(b.id)}>
              Approve
            </button>
          )}
        </div>
      ))}

    </div>
  );
}

export default BookingsPage;