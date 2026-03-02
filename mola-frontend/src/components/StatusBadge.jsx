function StatusBadge({ status }) {

  const styles = {
    PENDING: "bg-yellow-500",
    APPROVED: "bg-green-600",
    REJECTED: "bg-red-600"
  };

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${styles[status]}`}>
      {status}
    </span>
  );
}

export default StatusBadge;