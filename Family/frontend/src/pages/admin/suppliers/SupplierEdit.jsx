import { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import adminApi from "../../../services/adminApi";
import "../../../components/admin/admin.css";

const SupplierEdit = () => {
  const { id } = useParams(); const navigate = useNavigate();
  const [form, setForm] = useState({ TenNCC: "", DiaChi: "", SDT: "", Email: "" });
  const [error, setError] = useState(""); const [saving, setSaving] = useState(false);
  useEffect(() => { adminApi.get(`/suppliers/${id}`).then(r => { const d = r.data; setForm({ TenNCC: d.TenNCC||"", DiaChi: d.DiaChi||"", SDT: d.SDT||"", Email: d.Email||"" }); }).catch(() => setError("Không tìm thấy nhà cung cấp")); }, [id]);
  const handleChange = (e) => setForm(p => ({ ...p, [e.target.name]: e.target.value }));
  const handleSubmit = async (e) => { e.preventDefault(); if (!form.TenNCC) { setError("Vui lòng nhập tên NCC"); return; } setSaving(true); try { await adminApi.put(`/suppliers/${id}`, form); navigate("/admin/suppliers"); } catch (err) { setError(err.response?.data?.message || "Lỗi cập nhật"); } finally { setSaving(false); } };
  return (
    <div>
      <div className="page-header"><h1 className="page-title">✏️ Sửa Nhà cung cấp</h1><p className="page-subtitle"><Link to="/admin/suppliers" style={{ color: "var(--admin-accent)" }}>Nhà cung cấp</Link> / {id}</p></div>
      <div className="admin-form-card">
        {error && <div className="admin-error">{error}</div>}
        <form onSubmit={handleSubmit}>
          {[["TenNCC","Tên NCC"],["DiaChi","Địa chỉ"],["SDT","SĐT"],["Email","Email"]].map(([name,label]) => (
            <div className="form-group" key={name}><label className="form-label">{label}</label><input name={name} className="admin-form-input" value={form[name]} onChange={handleChange} /></div>
          ))}
          <div className="form-actions"><button type="submit" className="btn btn-primary" disabled={saving}>{saving ? "Đang lưu..." : "💾 Cập nhật"}</button><Link to="/admin/suppliers" className="btn btn-secondary">Hủy</Link></div>
        </form>
      </div>
    </div>
  );
};
export default SupplierEdit;
