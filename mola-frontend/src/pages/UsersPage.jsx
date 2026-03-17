import { useEffect, useState } from "react";
import MainLayout from "../layout/MainLayout";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext.jsx";
import api from "../api/api";

function UsersPage() {
  const { auth } = useContext(AuthContext);
  const [users, setUsers] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const response = await api.get("/auth/users");
        setUsers(response.data);
        setError("");
      } catch (err) {
        setError(err.response?.data || "Unable to load users");
      }
    };

    loadUsers();
  }, []);

  return (
    <MainLayout role={auth.role}>
      <div className="mb-6 rounded-3xl border border-fuchsia-300/30 bg-gradient-to-r from-fuchsia-500/20 to-indigo-500/20 p-6">
        <h1 className="text-3xl font-bold">Users & Access Control</h1>
        <p className="mt-2 text-slate-100">System access matrix for campus operations.</p>
      </div>

      {error && <div className="mb-4 rounded-xl bg-rose-500/20 p-3">{error}</div>}

      <div className="rounded-2xl border border-white/10 bg-white/10 p-5">
        <h2 className="mb-4 text-xl font-semibold">Provisioned Accounts</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-white/15 text-slate-300">
                <th className="px-2 py-2">Username</th>
                <th className="px-2 py-2">Role</th>
                <th className="px-2 py-2">Access Scope</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.username} className="border-b border-white/10">
                  <td className="px-2 py-3 font-semibold">{user.username}</td>
                  <td className="px-2 py-3">{user.role}</td>
                  <td className="px-2 py-3">
                    {user.role === "ROLE_ADMIN" ? "Full platform administration" : "Bookings and resource visibility"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </MainLayout>
  );
}

export default UsersPage;