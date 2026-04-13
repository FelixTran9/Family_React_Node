import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import adminApi from "../../services/adminApi";
import { useAdminAuth } from "../../context/AdminAuthContext";
import "../../components/admin/admin.css";

const statCards = [
  { key: "staffCount",    label: "Nhân viên",     icon: "👥", color: "primary",  to: "/admin/staff" },
  { key: "productCount",  label: "Sản phẩm",      icon: "📦", color: "success",  to: "/admin/products" },
  { key: "orderCount",    label: "Đơn hàng",      icon: "🛒", color: "warning",  to: "/admin/orders" },
  { key: "shippingCount", label: "Giao hàng",     icon: "🚚", color: "danger",   to: "/admin/shipping" },
];

const quickActions = [
  { to: "/admin/staff/create",     icon: "👤+", label: "Thêm nhân viên" },
  { to: "/admin/products/create",  icon: "📦+", label: "Thêm sản phẩm" },
  { to: "/admin/orders/create",    icon: "🛒+", label: "Tạo đơn hàng" },
  { to: "/admin/shipping/create",  icon: "🚚+", label: "Tạo phiếu giao" },
  { to: "/admin/promotions/create",icon: "🏷️+", label: "Thêm khuyến mãi" },
  { to: "/admin/customers/create", icon: "👤+", label: "Thêm khách hàng" },
  { to: "/admin/suppliers/create", icon: "🏭+", label: "Thêm nhà cung cấp" },
];

const modules = [
  { to: "/admin/staff",      icon: "👥", label: "Quản lý Nhân viên",     desc: "Thêm, sửa, xóa thông tin nhân viên và trợ lý cửa hàng." },
  { to: "/admin/products",   icon: "📦", label: "Quản lý Sản phẩm",      desc: "Cập nhật kho, thêm sản phẩm, quản lý giá và tồn kho." },
  { to: "/admin/orders",     icon: "🛒", label: "Quản lý Đơn hàng",      desc: "Xem, tạo và cập nhật trạng thái đơn hàng theo quy trình." },
  { to: "/admin/shipping",   icon: "🚚", label: "Quản lý Giao hàng",     desc: "Tạo phiếu giao hàng và theo dõi trạng thái vận chuyển." },
  { to: "/admin/promotions", icon: "🏷️", label: "Quản lý Khuyến mãi",   desc: "Tạo và quản lý các chương trình khuyến mãi cho cửa hàng." },
  { to: "/admin/customers",  icon: "👤", label: "Quản lý Khách hàng",   desc: "Xem và quản lý thông tin tài khoản khách hàng." },
  { to: "/admin/suppliers",  icon: "🏭", label: "Quản lý Nhà cung cấp", desc: "Quản lý thông tin và liên hệ các nhà cung cấp." },
];

const AdminDashboard = () => {
  const { adminUser } = useAdminAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi.get("/dashboard")
      .then((res) => setStats(res.data))
      .catch(() => setStats({ staffCount: 0, productCount: 0, orderCount: 0, shippingCount: 0 }))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Xin chào, {adminUser?.name || "Admin"}! 👋</h1>
        <p className="page-subtitle">Quản lý toàn bộ hoạt động của cửa hàng Family Mart</p>
      </div>

      {/* Stat Cards */}
      <div className="stats-grid">
        {statCards.map((s) => (
          <Link to={s.to} key={s.key} style={{ textDecoration: "none" }}>
            <div className="stat-card">
              <div className={`stat-icon-wrap ${s.color}`}>{s.icon}</div>
              <div>
                <div className="stat-number">
                  {loading ? "..." : (stats?.[s.key] ?? 0).toLocaleString("vi-VN")}
                </div>
                <div className="stat-label">{s.label}</div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Module Cards */}
      <div style={{ marginBottom: 12 }}>
        <h2 style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: 16 }}>
          📋 Các chức năng quản lý
        </h2>
        <div className="feature-grid">
          {modules.map((m) => (
            <div key={m.to} className="feature-card">
              <h3>{m.icon} {m.label}</h3>
              <p>{m.desc}</p>
              <div className="feature-actions">
                <Link to={m.to} className="btn btn-primary btn-sm">📋 Danh sách</Link>
                <Link to={`${m.to}/create`} className="btn btn-secondary btn-sm">+ Thêm mới</Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="admin-card" style={{ padding: 24 }}>
        <h3 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: 16, color: "var(--text-primary)" }}>
          ⚡ Hành động nhanh
        </h3>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
          {quickActions.map((a) => (
            <Link key={a.to} to={a.to} className="btn btn-secondary">
              {a.icon} {a.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
