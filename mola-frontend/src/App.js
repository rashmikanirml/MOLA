import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import BookingsPage from "./pages/BookingsPage.jsx";
import DashboardPage from "./pages/DashboardPage.jsx";
import ResourcesPage from "./pages/ResourcesPage.jsx";
import UsersPage from "./pages/UsersPage.jsx";
import LiveOpsPage from "./pages/LiveOpsPage.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";

function App() {
  const bubbles = Array.from({ length: 14 });

  return (
    <div className="app-shell">
      <div className="bubble-field" aria-hidden="true">
        {bubbles.map((_, index) => (
          <span key={index} className="bubble" />
        ))}
      </div>

      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/" element={<LoginPage />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/bookings"
              element={
                <ProtectedRoute>
                  <BookingsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/resources"
              element={
                <ProtectedRoute>
                  <ResourcesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/live-ops"
              element={
                <ProtectedRoute>
                  <LiveOpsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/users"
              element={
                <ProtectedRoute requiredRole="ROLE_ADMIN">
                  <UsersPage />
                </ProtectedRoute>
              }
            />
          </Routes>
        </Router>
      </AuthProvider>
    </div>
  );
}

export default App;