import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import adminApi from "../../../services/adminApi";
import "../../../components/admin/admin.css";

const CustomerCreate = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ TenKH: "", MatKhau: "", SDT: "", DiaChi: "", Email: "" });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const handleChange = (e) => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.TenKH) { setError("Vui lòng nhập họ tên khách hàng"); return; }
    setSaving(true);
    try {
      await adminApi.post("/customers", form);
      navigate("/admin/customers");
    } catch (err) {
      setError(err.response?.data?.message || "Lỗi tạo khách hàng");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">👤+ Thêm Khách hàng</h1>
        <p className="page-subtitle"><Link to="/admin/customers" style={{ color: "var(--admin-accent)" }}>Khách hàng</Link> / Thêm mới</p>
      </div>
      <div className="admin-form-card">
        {error && <div className="admin-error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            {[
              ["TenKH", "Họ và tên", "text", true],
              ["Email", "Email", "email", false],
              ["SDT", "Số điện thoại", "text", false],
              ["MatKhau", "Mật khẩu", "password", false],
            ].map(([name, label, type, req]) => (
              <div className="form-group" key={name}>
                <label className="form-label">{label}{req && <span className="required">*</span>}</label>
                <input name={name} type={type} className="admin-form-input" value={form[name]} onChange={handleChange} placeholder={`Nhập ${label.toLowerCase()}...`} />
              </div>
            ))}
          </div>
          <div className="form-group">
            <label className="form-label">Địa chỉ</label>
            <input name="DiaChi" className="admin-form-input" value={form.DiaChi} onChange={handleChange} placeholder="Nhập địa chỉ..." />
          </div>
          <div className="form-actions">
            <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? "Đang lưu..." : "💾 Lưu khách hàng"}</button>
            <Link to="/admin/customers" className="btn btn-secondary">Hủy</Link>
          </div>
        </form>
      </div>
    </div>
  );
};
export default CustomerCreate;
