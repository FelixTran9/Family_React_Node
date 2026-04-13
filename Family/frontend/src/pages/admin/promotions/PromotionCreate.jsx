import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import adminApi from "../../../services/adminApi";
import "../../../components/admin/admin.css";

const PromotionCreate = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ TenCT: "", MoTa: "", TuNgay: "", DenNgay: "" });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const handleChange = (e) => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.TenCT || !form.TuNgay || !form.DenNgay) {
      setError("Vui lòng nhập tên chương trình, ngày bắt đầu và ngày kết thúc");
      return;
    }
    if (new Date(form.DenNgay) <= new Date(form.TuNgay)) {
      setError("Ngày kết thúc phải sau ngày bắt đầu");
      return;
    }
    setSaving(true);
    try {
      await adminApi.post("/promotions", form);
      navigate("/admin/promotions");
    } catch (err) {
      setError(err.response?.data?.message || "Lỗi tạo khuyến mãi");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">🏷️+ Thêm Đợt Khuyến mãi</h1>
        <p className="page-subtitle"><Link to="/admin/promotions" style={{ color: "var(--admin-accent)" }}>Khuyến mãi</Link> / Thêm mới</p>
      </div>
      <div className="admin-form-card">
        {error && <div className="admin-error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Tên chương trình KM<span className="required">*</span></label>
            <input name="TenCT" className="admin-form-input" value={form.TenCT} onChange={handleChange} placeholder="Ví dụ: Sale hè 2026" />
          </div>
          <div className="form-group">
            <label className="form-label">Mô tả</label>
            <textarea name="MoTa" className="admin-form-input" rows={3} value={form.MoTa} onChange={handleChange} placeholder="Mô tả chương trình khuyến mãi..." style={{ resize: "vertical" }} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div className="form-group">
              <label className="form-label">Từ ngày<span className="required">*</span></label>
              <input name="TuNgay" type="date" className="admin-form-input" value={form.TuNgay} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label className="form-label">Đến ngày<span className="required">*</span></label>
              <input name="DenNgay" type="date" className="admin-form-input" value={form.DenNgay} onChange={handleChange} />
            </div>
          </div>
          <div className="form-actions">
            <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? "Đang lưu..." : "💾 Lưu khuyến mãi"}</button>
            <Link to="/admin/promotions" className="btn btn-secondary">Hủy</Link>
          </div>
        </form>
      </div>
    </div>
  );
};
export default PromotionCreate;
