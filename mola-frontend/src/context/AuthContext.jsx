import React, { createContext, useState } from "react";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState({
    role: localStorage.getItem("role") || null,
    username: localStorage.getItem("username") || null,
  });

  const login = (token, role, username) => {
    localStorage.setItem("token", token);
    localStorage.setItem("role", role);
    if (username) {
      localStorage.setItem("username", username);
    }
    setAuth({ role, username: username || null });
  };

  const logout = () => {
    localStorage.clear();
    setAuth({ role: null, username: null });
  };

  return (
    <AuthContext.Provider value={{ auth, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};