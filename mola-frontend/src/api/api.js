import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8080/api"
});

// Manually attach Basic Auth header
export const setAuthHeader = (username, password) => {
  const token = btoa(`${username}:${password}`);
  api.defaults.headers.common["Authorization"] = `Basic ${token}`;
};

export const clearAuthHeader = () => {
  delete api.defaults.headers.common["Authorization"];
};

export default api;