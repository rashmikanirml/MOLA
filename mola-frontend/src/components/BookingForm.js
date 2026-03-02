import React, { useState } from "react";
import api from "../api/api";

function BookingForm({ refresh }) {

  const [purpose, setPurpose] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [attendees, setAttendees] = useState("");

  const handleCreate = async () => {
    try {
      await api.post("/bookings/1", {
        purpose,
        startTime,
        endTime,
        attendees
      });

      refresh();
      setPurpose("");
      setStartTime("");
      setEndTime("");
      setAttendees("");

    } catch (error) {
      alert("Error creating booking");
    }
  };

  return (
    <div className="form-card">
      <h3>Create Booking</h3>

      <input placeholder="Purpose" value={purpose}
        onChange={(e) => setPurpose(e.target.value)} />

      <input type="datetime-local" value={startTime}
        onChange={(e) => setStartTime(e.target.value)} />

      <input type="datetime-local" value={endTime}
        onChange={(e) => setEndTime(e.target.value)} />

      <input type="number" placeholder="Attendees"
        value={attendees}
        onChange={(e) => setAttendees(e.target.value)} />

      <button onClick={handleCreate}>Create</button>
    </div>
  );
}

export default BookingForm;