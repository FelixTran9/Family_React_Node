import { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import adminApi from "../../../services/adminApi";
import "../../../components/admin/admin.css";

const PromotionEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({ TenCT: "", MoTa: "", TuNgay: "", DenNgay: "" });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    adminApi.get(`/promotions/${id}`).then(r => {
      const d = r.data;
      setForm({
        TenCT: d.TenCT || "",
        MoTa: d.MoTa || "",
        TuNgay: d.TuNgay ? d.TuNgay.slice(0, 10) : "",
        DenNgay: d.DenNgay ? d.DenNgay.slice(0, 10) : ""
      });
    }).catch(() => setError("Không tìm thấy khuyến mãi"));
  }, [id]);

  const handleChange = (e) => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.TenCT || !form.TuNgay || !form.DenNgay) {
      setError("Vui lòng điền đầy đủ thông tin bắt buộc");
      return;
    }
    setSaving(true);
    try {
      await adminApi.put(`/promotions/${id}`, form);
      navigate("/admin/promotions");
    } catch (err) {
      setError(err.response?.data?.message || "Lỗi cập nhật");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">✏️ Sửa Đợt Khuyến mãi</h1>
        <p className="page-subtitle"><Link to="/admin/promotions" style={{ color: "var(--admin-accent)" }}>Khuyến mãi</Link> / {id}</p>
      </div>
      <div className="admin-form-card">
        {error && <div className="admin-error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Tên chương trình KM<span className="required">*</span></label>
            <input name="TenCT" className="admin-form-input" value={form.TenCT} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label className="form-label">Mô tả</label>
            <textarea name="MoTa" className="admin-form-input" rows={3} value={form.MoTa} onChange={handleChange} style={{ resize: "vertical" }} />
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
            <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? "Đang lưu..." : "💾 Cập nhật"}</button>
            <Link to="/admin/promotions" className="btn btn-secondary">Hủy</Link>
          </div>
        </form>
      </div>
    </div>
  );
};
export default PromotionEdit;
