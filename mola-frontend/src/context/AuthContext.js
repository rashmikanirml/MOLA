import React, { createContext, useState } from "react";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {

  const [auth, setAuthState] = useState({
    username: "",
    password: "",
    role: ""
  });

  const setAuth = ({ username, password }) => {

    const role = username === "admin" ? "ADMIN" : "USER";

    setAuthState({
      username,
      password,
      role
    });
  };

  const logout = () => {
    setAuthState({
      username: "",
      password: "",
      role: ""
    });
  };

  return (
    <AuthContext.Provider value={{ auth, setAuth, logout }}>
      {children}
    </AuthContext.Provider>
  );
};