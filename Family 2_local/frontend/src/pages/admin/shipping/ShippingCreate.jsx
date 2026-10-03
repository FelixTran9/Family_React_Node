import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import adminApi from "../../../services/adminApi";
import "../../../components/admin/admin.css";

const ShippingCreate = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    MaDon: "", NgayGiao: "", DiaChiGiao: "",
    TenNguoiNhan: "", SDTNguoiNhan: "",
    MaVanDon: "", TenShipper: "", GhiChu: ""
  });
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    adminApi.get("/shipping/order-options").then(r => setOrders(r.data));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "MaDon") {
      const selectedOrder = orders.find(o => o.MaDon === value);
      if (selectedOrder) {
        setForm(p => ({
          ...p,
          MaDon: value,
          TenNguoiNhan: selectedOrder.TenKH || "",
          SDTNguoiNhan: selectedOrder.SDT || "",
          DiaChiGiao: selectedOrder.DiaChi || ""
        }));
        return;
      }
    }
    setForm(p => ({ ...p, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.MaDon || !form.DiaChiGiao || !form.TenNguoiNhan) {
      setError("Vui lòng điền đầy đủ thông tin bắt buộc (*)");
      return;
    }
    setSaving(true);
    try {
      await adminApi.post("/shipping", form);
      navigate("/admin/shipping");
    } catch (err) {
      setError(err.response?.data?.message || "Lỗi tạo phiếu giao");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">🚚+ Tạo Phiếu Giao Hàng</h1>
        <p className="page-subtitle"><Link to="/admin/shipping" style={{ color: "var(--admin-accent)" }}>Giao hàng</Link> / Tạo mới</p>
      </div>
      <div className="admin-form-card">
        {error && <div className="admin-error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Đơn hàng đã xác nhận<span className="required">*</span></label>
            {orders.length === 0 ? (
              <div style={{ padding: "12px 16px", borderRadius: 8, background: "rgba(251,191,36,0.1)", border: "1px solid rgba(251,191,36,0.4)", color: "#92400e", fontSize: "0.9rem" }}>
                ⚠️ Chưa có đơn hàng nào ở trạng thái "Đã xác nhận". Hãy vào <strong>Đơn hàng</strong> và xác nhận đơn trước.
              </div>
            ) : (
              <select name="MaDon" className="admin-form-input admin-select" value={form.MaDon} onChange={handleChange}>
                <option value="">-- Chọn đơn hàng cần giao --</option>
                {orders.map(o => (
                  <option key={o.MaDon} value={o.MaDon}>
                    {o.MaDon} — {o.TenKH || "Khách lẻ"} — {Number(o.TongThanhToan || 0).toLocaleString("vi-VN")}đ
                  </option>
                ))}
              </select>
            )}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div className="form-group">
              <label className="form-label">Người nhận<span className="required">*</span></label>
              <input name="TenNguoiNhan" className="admin-form-input" value={form.TenNguoiNhan} onChange={handleChange} placeholder="Tên người nhận hàng" />
            </div>
            <div className="form-group">
              <label className="form-label">SĐT người nhận</label>
              <input name="SDTNguoiNhan" className="admin-form-input" value={form.SDTNguoiNhan} onChange={handleChange} placeholder="Số điện thoại" />
            </div>
            <div className="form-group">
              <label className="form-label">Ngày giao</label>
              <input name="NgayGiao" type="date" className="admin-form-input" value={form.NgayGiao} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label className="form-label">Mã vận đơn</label>
              <input name="MaVanDon" className="admin-form-input" value={form.MaVanDon} onChange={handleChange} placeholder="Mã vận đơn (nếu có)" />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Địa chỉ giao<span className="required">*</span></label>
            <input name="DiaChiGiao" className="admin-form-input" value={form.DiaChiGiao} onChange={handleChange} placeholder="Địa chỉ giao hàng đầy đủ" />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div className="form-group">
              <label className="form-label">Tên shipper</label>
              <input name="TenShipper" className="admin-form-input" value={form.TenShipper} onChange={handleChange} placeholder="Tên nhân viên giao hàng" />
            </div>
            <div className="form-group">
              <label className="form-label">Ghi chú</label>
              <input name="GhiChu" className="admin-form-input" value={form.GhiChu} onChange={handleChange} placeholder="Ghi chú thêm..." />
            </div>
          </div>
          <div className="form-actions">
            <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? "Đang lưu..." : "💾 Tạo phiếu giao"}</button>
            <Link to="/admin/shipping" className="btn btn-secondary">Hủy</Link>
          </div>
        </form>
      </div>
    </div>
  );
};
export default ShippingCreate;
