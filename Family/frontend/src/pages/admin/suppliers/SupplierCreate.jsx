import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import adminApi from "../../../services/adminApi";
import "../../../components/admin/admin.css";

const SupplierCreate = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ TenNCC: "", DiaChi: "", SDT: "", Email: "" });
  const [error, setError] = useState(""); const [saving, setSaving] = useState(false);
  const handleChange = (e) => setForm(p => ({ ...p, [e.target.name]: e.target.value }));
  const handleSubmit = async (e) => { e.preventDefault(); if (!form.TenNCC) { setError("Vui lòng nhập tên nhà cung cấp"); return; } setSaving(true); try { await adminApi.post("/suppliers", form); navigate("/admin/suppliers"); } catch (err) { setError(err.response?.data?.message || "Lỗi tạo NCC"); } finally { setSaving(false); } };
  return (
    <div>
      <div className="page-header"><h1 className="page-title">🏭+ Thêm Nhà cung cấp</h1><p className="page-subtitle"><Link to="/admin/suppliers" style={{ color: "var(--admin-accent)" }}>Nhà cung cấp</Link> / Thêm mới</p></div>
      <div className="admin-form-card">
        {error && <div className="admin-error">{error}</div>}
        <form onSubmit={handleSubmit}>
          {[["TenNCC","Tên nhà cung cấp",true],["DiaChi","Địa chỉ",false],["SDT","Số điện thoại",false],["Email","Email",false]].map(([name,label,req]) => (
            <div className="form-group" key={name}><label className="form-label">{label}{req && <span className="required">*</span>}</label><input name={name} className="admin-form-input" value={form[name]} onChange={handleChange} placeholder={`Nhập ${label.toLowerCase()}...`} /></div>
          ))}
          <div className="form-actions"><button type="submit" className="btn btn-primary" disabled={saving}>{saving ? "Đang lưu..." : "💾 Lưu NCC"}</button><Link to="/admin/suppliers" className="btn btn-secondary">Hủy</Link></div>
        </form>
      </div>
    </div>
  );
};
export default SupplierCreate;
