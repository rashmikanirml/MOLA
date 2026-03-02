import React, { useEffect, useState } from "react";
import api from "../api/api";
import MainLayout from "../layout/MainLayout";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

function DashboardPage() {

  const { auth } = useContext(AuthContext);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0
  });

  const loadStats = async () => {
    const response = await api.get("/bookings");
    const data = response.data;

    setStats({
      total: data.length,
      pending: data.filter(b => b.status === "PENDING").length,
      approved: data.filter(b => b.status === "APPROVED").length
    });
  };

  useEffect(() => {
    loadStats();
  }, []);

  return (
    <MainLayout role={auth.role}>

      <h1 className="text-3xl font-bold mb-8">
        Dashboard Overview
      </h1>

      <div className="grid md:grid-cols-3 gap-6">

        <div className="bg-slate-800 p-6 rounded-2xl shadow-lg">
          <h2 className="text-lg">Total Bookings</h2>
          <p className="text-3xl font-bold mt-2">{stats.total}</p>
        </div>

        <div className="bg-yellow-600 p-6 rounded-2xl shadow-lg">
          <h2 className="text-lg">Pending</h2>
          <p className="text-3xl font-bold mt-2">{stats.pending}</p>
        </div>

        <div className="bg-green-600 p-6 rounded-2xl shadow-lg">
          <h2 className="text-lg">Approved</h2>
          <p className="text-3xl font-bold mt-2">{stats.approved}</p>
        </div>

      </div>

    </MainLayout>
  );
}

export default DashboardPage;