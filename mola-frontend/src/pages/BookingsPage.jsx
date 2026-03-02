import React, { useEffect, useState, useContext } from "react";
import api from "../api/api";
import { AuthContext } from "../context/AuthContext";
import DashboardLayout from "../layout/DashboardLayout";
import BookingCard from "../components/BookingCard";

function BookingsPage() {

  const { auth } = useContext(AuthContext);
  const [bookings, setBookings] = useState([]);

  const fetchBookings = async () => {
    const response = await api.get("/bookings");
    setBookings(response.data);
  };

  const approveBooking = async (id) => {
    await api.put(`/bookings/${id}/status?status=APPROVED`);
    fetchBookings();
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  return (
    <DashboardLayout role={auth.role}>

      <h2 className="text-3xl font-bold mb-6">
        Bookings Dashboard
      </h2>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {bookings.map(b => (
          <BookingCard
            key={b.id}
            booking={b}
            role={auth.role}
            onApprove={approveBooking}
          />
        ))}
      </div>

    </DashboardLayout>
  );
}

export default BookingsPage;