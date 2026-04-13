import { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import adminApi from "../../../services/adminApi";
import "../../../components/admin/admin.css";

const STATUSES = ["đang_giao", "đã_giao", "giao_thất_bại"];

const ShippingEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    NgayGiao: "", DiaChiGiao: "", TenNguoiNhan: "",
    SDTNguoiNhan: "", MaVanDon: "", TenShipper: "",
    GhiChu: "", TrangThaiGiao: "đang_giao"
  });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    adminApi.get(`/shipping/${id}`).then(r => {
      const d = r.data;
      setForm({
        NgayGiao: d.NgayGiao ? d.NgayGiao.slice(0, 10) : "",
        DiaChiGiao: d.DiaChiGiao || "",
        TenNguoiNhan: d.TenNguoiNhan || "",
        SDTNguoiNhan: d.SDTNguoiNhan || "",
        MaVanDon: d.MaVanDon || "",
        TenShipper: d.TenShipper || "",
        GhiChu: d.GhiChu || "",
        TrangThaiGiao: d.TrangThaiGiao || "đang_giao"
      });
    }).catch(() => setError("Không tìm thấy phiếu giao"));
  }, [id]);

  const handleChange = (e) => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await adminApi.put(`/shipping/${id}`, form);
      navigate("/admin/shipping");
    } catch (err) {
      setError(err.response?.data?.message || "Lỗi cập nhật");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">✏️ Sửa Phiếu Giao Hàng</h1>
        <p className="page-subtitle"><Link to="/admin/shipping" style={{ color: "var(--admin-accent)" }}>Giao hàng</Link> / {id}</p>
      </div>
      <div className="admin-form-card">
        {error && <div className="admin-error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Trạng thái giao hàng</label>
            <select
              name="TrangThaiGiao"
              className="admin-form-input admin-select"
              value={form.TrangThaiGiao}
              onChange={handleChange}
              disabled={form.TrangThaiGiao !== "đang_giao"}
            >
              {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            {form.TrangThaiGiao !== "đang_giao" && (
              <p style={{ fontSize: "0.85rem", color: "var(--admin-warning)", marginTop: 8 }}>
                ⚠️ Phiếu giao này đã kết thúc, không thể đổi lại trạng thái.
              </p>
            )}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div className="form-group">
              <label className="form-label">Người nhận</label>
              <input name="TenNguoiNhan" className="admin-form-input" value={form.TenNguoiNhan} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label className="form-label">SĐT người nhận</label>
              <input name="SDTNguoiNhan" className="admin-form-input" value={form.SDTNguoiNhan} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label className="form-label">Ngày giao</label>
              <input name="NgayGiao" type="date" className="admin-form-input" value={form.NgayGiao} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label className="form-label">Mã vận đơn</label>
              <input name="MaVanDon" className="admin-form-input" value={form.MaVanDon} onChange={handleChange} />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Địa chỉ giao</label>
            <input name="DiaChiGiao" className="admin-form-input" value={form.DiaChiGiao} onChange={handleChange} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div className="form-group">
              <label className="form-label">Tên shipper</label>
              <input name="TenShipper" className="admin-form-input" value={form.TenShipper} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label className="form-label">Ghi chú</label>
              <input name="GhiChu" className="admin-form-input" value={form.GhiChu} onChange={handleChange} />
            </div>
          </div>
          <div className="form-actions">
            <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? "Đang lưu..." : "💾 Cập nhật"}</button>
            <Link to="/admin/shipping" className="btn btn-secondary">Hủy</Link>
          </div>
        </form>
      </div>
    </div>
  );
};
export default ShippingEdit;
