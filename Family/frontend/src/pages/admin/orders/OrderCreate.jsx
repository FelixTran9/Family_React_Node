import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import adminApi from "../../../services/adminApi";
import "../../../components/admin/admin.css";

const OrderCreate = () => {
  const navigate = useNavigate();
  const [options, setOptions] = useState({ khachhangs: [], nhanviens: [], sanphams: [] });
  const [form, setForm] = useState({ MaKH: "", NguoiBan: "", HinhThucTT: "Tiền mặt" });
  const [items, setItems] = useState([{ MaSP: "", SoLuong: 1, DonGia: 0 }]);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => { adminApi.get("/orders/form-options").then(r => setOptions(r.data)); }, []);

  const handleItemChange = (idx, field, value) => {
    const newItems = [...items];
    newItems[idx][field] = value;
    if (field === "MaSP") {
      const sp = options.sanphams.find(s => s.MaSP === value);
      if (sp) newItems[idx].DonGia = sp.GiaBan;
    }
    setItems(newItems);
  };

  const addItem = () => setItems([...items, { MaSP: "", SoLuong: 1, DonGia: 0 }]);
  const removeItem = (idx) => setItems(items.filter((_, i) => i !== idx));

  const total = items.reduce((sum, it) => sum + (Number(it.DonGia) * Number(it.SoLuong) * 1.1), 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.MaKH || !form.NguoiBan || items.some(it => !it.MaSP)) {
      setError("Vui lòng điền đầy đủ thông tin và chọn sản phẩm");
      return;
    }
    setSaving(true);
    try {
      await adminApi.post("/orders", { ...form, items: items.map(it => ({ ...it, SoLuong: Number(it.SoLuong), DonGia: Number(it.DonGia) })) });
      navigate("/admin/orders");
    } catch (err) { setError(err.response?.data?.message || "Lỗi tạo đơn hàng"); }
    finally { setSaving(false); }
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">🛒+ Tạo Đơn hàng</h1>
        <p className="page-subtitle"><Link to="/admin/orders" style={{ color: "var(--admin-accent)" }}>Đơn hàng</Link> / Tạo mới</p>
      </div>
      <div style={{ maxWidth: 800 }}>
        {error && <div className="admin-error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="admin-form-card" style={{ maxWidth: "100%", marginBottom: 20 }}>
            <h3 style={{ marginBottom: 16, fontWeight: 700, color: "var(--text-primary)" }}>Thông tin đơn hàng</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <div className="form-group">
                <label className="form-label">Khách hàng<span className="required">*</span></label>
                <select className="admin-form-input admin-select" value={form.MaKH} onChange={e => setForm(p => ({...p, MaKH: e.target.value}))}>
                  <option value="">-- Chọn khách hàng --</option>
                  {options.khachhangs.map(k => <option key={k.MaKH} value={k.MaKH}>{k.TenKH} ({k.MaKH})</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Người bán<span className="required">*</span></label>
                <select className="admin-form-input admin-select" value={form.NguoiBan} onChange={e => setForm(p => ({...p, NguoiBan: e.target.value}))}>
                  <option value="">-- Chọn nhân viên --</option>
                  {options.nhanviens.map(nv => <option key={nv.MaNV} value={nv.MaNV}>{nv.TenNV}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Hình thức thanh toán</label>
                <select className="admin-form-input admin-select" value={form.HinhThucTT} onChange={e => setForm(p => ({...p, HinhThucTT: e.target.value}))}>
                  {["Tiền mặt","Chuyển khoản","Thẻ tín dụng","Ví điện tử"].map(v => <option key={v} value={v}>{v}</option>)}
                </select>
              </div>
            </div>
          </div>

          <div className="admin-card" style={{ marginBottom: 20, padding: 20 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <h3 style={{ fontWeight: 700, color: "var(--text-primary)" }}>Sản phẩm ({items.length})</h3>
              <button type="button" className="btn btn-secondary btn-sm" onClick={addItem}>+ Thêm dòng</button>
            </div>
            {items.map((item, idx) => (
              <div key={idx} style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr auto", gap: 10, marginBottom: 10, alignItems: "end" }}>
                <div>
                  <label className="form-label" style={{ fontSize: "0.78rem" }}>Sản phẩm</label>
                  <select className="admin-form-input admin-select" value={item.MaSP} onChange={e => handleItemChange(idx, "MaSP", e.target.value)}>
                    <option value="">-- Chọn SP --</option>
                    {options.sanphams.map(sp => <option key={sp.MaSP} value={sp.MaSP}>{sp.TenSP} (còn: {sp.TonKho})</option>)}
                  </select>
                </div>
                <div>
                  <label className="form-label" style={{ fontSize: "0.78rem" }}>Số lượng</label>
                  <input type="number" min="1" className="admin-form-input" value={item.SoLuong} onChange={e => handleItemChange(idx, "SoLuong", e.target.value)} />
                </div>
                <div>
                  <label className="form-label" style={{ fontSize: "0.78rem" }}>Đơn giá</label>
                  <input type="number" min="0" className="admin-form-input" value={item.DonGia} onChange={e => handleItemChange(idx, "DonGia", e.target.value)} />
                </div>
                <button type="button" className="btn btn-danger btn-sm" onClick={() => removeItem(idx)} disabled={items.length === 1}>🗑️</button>
              </div>
            ))}
            <div style={{ textAlign: "right", marginTop: 12, padding: "12px 0", borderTop: "1px solid var(--admin-border)" }}>
              <span style={{ color: "var(--text-muted)", marginRight: 8, fontSize: "0.9rem" }}>Ước tính (gồm VAT 10%):</span>
              <span style={{ color: "var(--admin-success)", fontWeight: 800, fontSize: "1.1rem" }}>{total.toLocaleString("vi-VN")}đ</span>
            </div>
          </div>

          <div className="form-actions">
            <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? "Đang tạo..." : "💾 Tạo đơn hàng"}</button>
            <Link to="/admin/orders" className="btn btn-secondary">Hủy</Link>
          </div>
        </form>
      </div>
    </div>
  );
};
export default OrderCreate;
