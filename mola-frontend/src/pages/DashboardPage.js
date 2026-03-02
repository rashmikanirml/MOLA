import React, { useEffect, useState, useContext } from "react";
import api from "../api/api";
import { AuthContext } from "../context/AuthContext";
import BookingCard from "../components/BookingCard";
import BookingForm from "../components/BookingForm";

function DashboardPage() {

  const { auth, logout } = useContext(AuthContext);
  const [bookings, setBookings] = useState([]);

  const fetchBookings = async () => {
    const res = await api.get("/bookings");
    setBookings(res.data);
  };

  const approve = async (id) => {
    await api.put(`/bookings/${id}/status?status=APPROVED`);
    fetchBookings();
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  return (
    <div className="container">

      <div className="header">
        <h2>Dashboard ({auth.role})</h2>
        <button onClick={logout}>Logout</button>
      </div>

      {auth.role === "ROLE_USER" && (
        <BookingForm refresh={fetchBookings} />
      )}

      <div className="grid">
        {bookings.map(b => (
          <BookingCard
            key={b.id}
            booking={b}
            onApprove={approve}
            role={auth.role}
          />
        ))}
      </div>

    </div>
  );
}

export default DashboardPage;