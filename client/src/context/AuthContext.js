import React, { createContext, useState, useContext, useEffect } from "react";
import axios from "../utils/axios";

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      // Fetch user data
      axios
        .get("/api/auth/me")
        .then((res) => {
          setUser(res.data);
        })
        .catch(() => {
          localStorage.removeItem("token");
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    const res = await axios.post("/api/auth/login", { email, password });
    const { token } = res.data;
    localStorage.setItem("token", token);
    const userRes = await axios.get("/api/auth/me");
    setUser(userRes.data);
    return userRes.data;
  };

  const register = async (username, email, password) => {
    const res = await axios.post("/api/auth/register", {
      username,
      email,
      password,
    });
    const { token } = res.data;
    localStorage.setItem("token", token);
    const userRes = await axios.get("/api/auth/me");
    setUser(userRes.data);
    return userRes.data;
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
