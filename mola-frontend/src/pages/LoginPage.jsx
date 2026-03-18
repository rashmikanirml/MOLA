import React, { useState, useContext, useEffect } from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext.jsx";

function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useContext(AuthContext);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get("token");
    const role = params.get("role");
    const username = params.get("username");

    if (token && role) {
      login(token, role, username || "oauth-user");
      navigate("/dashboard", { replace: true });
    }
  }, [location.search, login, navigate]);

  const handleLogin = async () => {
    try {
      const response = await axios.post(
        "http://localhost:8080/api/auth/login",
        { username, password }
      );

      const { token, role, username: authUsername } = response.data;

      login(token, role, authUsername || username);
      setError("");
      navigate("/dashboard");
    } catch (error) {
      setError("Invalid credentials");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top_left,#17385a,transparent_45%),radial-gradient(circle_at_bottom_right,#643d18,transparent_45%),#060c14] p-6">
      <div className="w-full max-w-md rounded-3xl border border-white/15 bg-black/35 p-8 shadow-2xl backdrop-blur-xl">
        <p className="mb-2 text-sm uppercase tracking-[0.2em] text-cyan-300">MOLA</p>
        <h2 className="mb-2 text-3xl font-bold text-white">Operations Hub</h2>
        <p className="mb-6 text-slate-300">Sign in to manage bookings, resources, and campus services.</p>

        {error && <div className="mb-4 rounded-lg bg-rose-500/20 p-2 text-sm text-rose-100">{error}</div>}

        <input
          className="mb-4 w-full rounded-lg border border-white/20 bg-white/10 p-3 text-white placeholder-slate-300"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        <input
          className="mb-6 w-full rounded-lg border border-white/20 bg-white/10 p-3 text-white placeholder-slate-300"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          onClick={handleLogin}
          className="w-full rounded-lg bg-cyan-500 p-3 font-semibold text-slate-950 transition hover:bg-cyan-400"
        >
          Enter Hub
        </button>

        <a
          href="http://localhost:8080/oauth2/authorization/google"
          className="mt-3 block w-full rounded-lg border border-white/25 bg-white/10 p-3 text-center font-semibold text-white transition hover:bg-white/20"
        >
          Continue with Google (OAuth2)
        </a>

        <p className="mt-4 text-xs text-slate-400">Demo users: admin/1234, user/1234, tech/1234</p>
      </div>
    </div>
  );
}

export default LoginPage;