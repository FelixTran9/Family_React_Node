import { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import adminApi from "../../../services/adminApi";
import "../../../components/admin/admin.css";

const CustomerEdit = () => {
  const { id } = useParams(); const navigate = useNavigate();
  const [form, setForm] = useState({ TenKH: "", SDT: "", DiaChi: "", Email: "" });
  const [error, setError] = useState(""); const [saving, setSaving] = useState(false);
  useEffect(() => { adminApi.get(`/customers/${id}`).then(r => { const d = r.data; setForm({ TenKH: d.TenKH||"", SDT: d.SDT||"", DiaChi: d.DiaChi||"", Email: d.Email||"" }); }).catch(() => setError("Không tìm thấy khách hàng")); }, [id]);
  const handleChange = (e) => setForm(p => ({ ...p, [e.target.name]: e.target.value }));
  const handleSubmit = async (e) => { e.preventDefault(); setSaving(true); try { await adminApi.put(`/customers/${id}`, form); navigate("/admin/customers"); } catch (err) { setError(err.response?.data?.message || "Lỗi cập nhật"); } finally { setSaving(false); } };
  return (
    <div>
      <div className="page-header"><h1 className="page-title">✏️ Sửa Khách hàng</h1><p className="page-subtitle"><Link to="/admin/customers" style={{ color: "var(--admin-accent)" }}>Khách hàng</Link> / {id}</p></div>
      <div className="admin-form-card">
        {error && <div className="admin-error">{error}</div>}
        <form onSubmit={handleSubmit}>
          {[["TenKH","Họ và tên","text"],["SDT","Số điện thoại","text"],["DiaChi","Địa chỉ","text"],["Email","Email","email"]].map(([name,label,type]) => (
            <div className="form-group" key={name}><label className="form-label">{label}</label><input name={name} type={type} className="admin-form-input" value={form[name]} onChange={handleChange} /></div>
          ))}
          <div className="form-actions"><button type="submit" className="btn btn-primary" disabled={saving}>{saving ? "Đang lưu..." : "💾 Cập nhật"}</button><Link to="/admin/customers" className="btn btn-secondary">Hủy</Link></div>
        </form>
      </div>
    </div>
  );
};
export default CustomerEdit;
