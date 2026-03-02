import StatusBadge from "./StatusBadge";

function BookingCard({ booking, role, onApprove }) {

  return (
    <div className="bg-slate-800 rounded-2xl p-6 shadow-xl hover:scale-[1.02] transition transform">

      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">{booking.purpose}</h3>
        <StatusBadge status={booking.status} />
      </div>

      <p className="text-sm text-slate-400">
        {booking.startTime} → {booking.endTime}
      </p>

      <p className="mt-2 text-sm">
        Attendees: <span className="font-semibold">{booking.attendees}</span>
      </p>

      {role === "ADMIN" && booking.status === "PENDING" && (
        <button
          onClick={() => onApprove(booking.id)}
          className="mt-4 bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg transition"
        >
          Approve
        </button>
      )}
    </div>
  );
}

export default BookingCard;