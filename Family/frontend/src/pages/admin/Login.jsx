import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAdminAuth } from "../../context/AdminAuthContext";
import "../../components/admin/admin.css";

const AdminLogin = () => {
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const { login, loading } = useAdminAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.username || !form.password) {
      setError("Vui lòng điền đầy đủ thông tin");
      return;
    }
    const result = await login(form.username, form.password);
    if (result.success) {
      navigate("/admin/dashboard");
    } else {
      setError(result.message);
    }
  };

  return (
    <div className="admin-login-page">
      <div className="login-card">
        <div className="login-logo">
          <span className="login-logo-icon">🏪</span>
          <h1>FAMILY MART</h1>
          <p>Trang quản trị hệ thống</p>
        </div>

        {error && <div className="admin-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="username">
              Tài khoản
            </label>
            <input
              id="username"
              name="username"
              type="text"
              className="admin-form-input"
              placeholder="Nhập tài khoản admin..."
              value={form.username}
              onChange={handleChange}
              autoComplete="username"
            />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="password">
              Mật khẩu
            </label>
            <input
              id="password"
              name="password"
              type="password"
              className="admin-form-input"
              placeholder="Nhập mật khẩu..."
              value={form.password}
              onChange={handleChange}
              autoComplete="current-password"
            />
          </div>
          <button type="submit" className="login-submit" disabled={loading}>
            {loading ? "Đang đăng nhập..." : "🔐 Đăng nhập"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
