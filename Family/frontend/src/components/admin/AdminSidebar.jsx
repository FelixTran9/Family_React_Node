import { NavLink, useNavigate } from "react-router-dom";
import { useAdminAuth } from "../../context/AdminAuthContext";
import "./admin.css";

const menuItems = [
  { to: "/admin/dashboard", icon: "📊", label: "Tổng quan" },
  { to: "/admin/products", icon: "📦", label: "Sản phẩm" },
  { to: "/admin/orders", icon: "🛒", label: "Đơn hàng" },
  { to: "/admin/staff", icon: "👥", label: "Nhân viên" },
  { to: "/admin/shipping", icon: "🚚", label: "Vận chuyển" },
  { to: "/admin/promotions", icon: "🏷️", label: "Khuyến mãi" },
  { to: "/admin/customers", icon: "👤", label: "Khách hàng" },
  { to: "/admin/suppliers", icon: "🏭", label: "Nhà cung cấp" },
];

const AdminSidebar = () => {
  const { adminUser, logout } = useAdminAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/admin/login");
  };

  const roleLabel = adminUser?.role === "truong" ? "Trưởng cửa hàng" : "Trợ lý cửa hàng";
  const initial = adminUser?.name?.charAt(0)?.toUpperCase() || "A";

  return (
    <aside className="admin-sidebar">
      <div className="sidebar-brand">
        <span className="brand-icon">🏪</span>
        <span className="brand-name">FAMILY MART</span>
      </div>

      <nav className="sidebar-nav">
        {menuItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => `sidebar-link ${isActive ? "active" : ""}`}
          >
            <span className="link-icon">{item.icon}</span>
            <span className="link-label">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="user-info">
          <div className="user-avatar">{initial}</div>
          <div className="user-details">
            <div className="user-name">{adminUser?.name || "Admin"}</div>
            <div className="user-role">{roleLabel}</div>
          </div>
        </div>
        <button className="logout-btn" onClick={handleLogout}>
          <span>🚪</span> Đăng xuất
        </button>
      </div>
    </aside>
  );
};

export default AdminSidebar;
