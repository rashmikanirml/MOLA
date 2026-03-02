function BookingCard({ booking, onApprove, role }) {

  return (
    <div className="booking-card">
      <h4>{booking.purpose}</h4>
      <p>Status: {booking.status}</p>
      <p>Start: {booking.startTime}</p>
      <p>End: {booking.endTime}</p>
      <p>Attendees: {booking.attendees}</p>

      {booking.status === "PENDING" && role === "ROLE_ADMIN" && (
        <button onClick={() => onApprove(booking.id)}>
          Approve
        </button>
      )}
    </div>
  );
}

export default BookingCard;