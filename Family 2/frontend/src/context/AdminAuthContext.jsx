import { createContext, useContext, useState, useEffect } from "react";
import adminApi from "../services/adminApi";

const AdminAuthContext = createContext(null);

export const AdminAuthProvider = ({ children }) => {
  const [adminUser, setAdminUser] = useState(() => {
    const stored = localStorage.getItem("adminUser");
    return stored ? JSON.parse(stored) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem("adminToken") || null);
  const [loading, setLoading] = useState(false);

  const login = async (username, password) => {
    setLoading(true);
    try {
      const res = await adminApi.post("/auth/login", { username, password });
      const { token: newToken, user } = res.data;
      localStorage.setItem("adminToken", newToken);
      localStorage.setItem("adminUser", JSON.stringify(user));
      setToken(newToken);
      setAdminUser(user);
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.message || "Đăng nhập thất bại";
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminUser");
    setToken(null);
    setAdminUser(null);
  };

  const isAuthenticated = !!token && !!adminUser;

  return (
    <AdminAuthContext.Provider value={{ adminUser, token, isAuthenticated, login, logout, loading }}>
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) throw new Error("useAdminAuth must be inside AdminAuthProvider");
  return ctx;
};
