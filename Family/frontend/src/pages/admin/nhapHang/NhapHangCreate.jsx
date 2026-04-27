import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import adminApi from "../../../services/adminApi";
import "../../../components/admin/admin.css";

const NhapHangCreate = () => {
  const navigate = useNavigate();
  const [suppliers, setSuppliers] = useState([]);
  const [staffs, setStaffs] = useState([]);
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({ MaNCC: "", MaNV: "", GhiChu: "" });
  const [chiTiet, setChiTiet] = useState([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    adminApi.get("/suppliers?limit=200").then((r) => setSuppliers(r.data.data || []));
    adminApi.get("/staff?limit=200").then((r) => setStaffs(r.data.data?.filter((s) => s.TrangThai === "active") || []));
    adminApi.get("/products?limit=500").then((r) => setProducts(r.data.data || []));
  }, []);

  const addLine = () => setChiTiet((prev) => [...prev, { MaSP: "", SoLuong: 1, DonGiaNhap: 0 }]);
  const removeLine = (idx) => setChiTiet((prev) => prev.filter((_, i) => i !== idx));

  const updateLine = (idx, field, value) => {
    setChiTiet((prev) =>
      prev.map((ct, i) => {
        if (i !== idx) return ct;
        const updated = { ...ct, [field]: value };
        if (field === "MaSP") {
          const sp = products.find((p) => p.MaSP === value);
          if (sp) updated.DonGiaNhap = sp.GiaVon || 0;
        }
        return updated;
      })
    );
  };

  const tongTien = chiTiet.reduce((sum, ct) => sum + (Number(ct.SoLuong) || 0) * (Number(ct.DonGiaNhap) || 0), 0);
  const fmtMoney = (n) => Number(n || 0).toLocaleString("vi-VN") + "₫";

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.MaNCC || !form.MaNV) {
      setError("Vui lòng chọn nhà cung cấp và nhân viên");
      return;
    }
    if (chiTiet.length === 0) {
      setError("Vui lòng thêm ít nhất 1 sản phẩm");
      return;
    }
    if (chiTiet.some((ct) => !ct.MaSP || ct.SoLuong <= 0)) {
      setError("Vui lòng điền đầy đủ thông tin chi tiết sản phẩm");
      return;
    }
    setSaving(true);
    try {
      await adminApi.post("/nhap-hang", { ...form, chiTiet });
      navigate("/admin/nhap-hang");
    } catch (err) {
      setError(err.response?.data?.message || "Lỗi tạo phiếu");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="admin-page-stack">
      <div className="page-header">
        <h1 className="page-title">📥 Tạo Phiếu Nhập Hàng</h1>
        <p className="page-subtitle">
          <Link to="/admin/nhap-hang">Nhập hàng</Link> / Tạo mới
        </p>
      </div>

      {error && <div className="admin-error">{error}</div>}

      <form onSubmit={handleSubmit} className="admin-two-column">
        <div className="admin-main-column">
          <div className="admin-card">
            <div className="admin-card-header">
              <div>
                <span className="admin-card-title">Sản phẩm nhập ({chiTiet.length})</span>
                <p className="card-caption">Chi tiết mặt hàng sẽ được cộng vào tồn kho khi phiếu được lưu.</p>
              </div>
              <button type="button" onClick={addLine} className="btn btn-success">
                + Thêm SP
              </button>
            </div>

            {chiTiet.length === 0 ? (
              <div className="line-item-empty">
                <div className="admin-empty-icon">🛒</div>
                <p>Danh sách chi tiết đang trống. Bấm nút thêm sản phẩm để bắt đầu tạo phiếu.</p>
              </div>
            ) : (
              <div className="line-items-list">
                {chiTiet.map((ct, idx) => {
                  const sp = products.find((item) => item.MaSP === ct.MaSP);
                  const thanhTien = (Number(ct.SoLuong) || 0) * (Number(ct.DonGiaNhap) || 0);

                  return (
                    <div key={idx} className="line-item-row">
                      <div className="line-item-index">{idx + 1}</div>

                      <div className="line-item-field">
                        <label className="mini-label">Mặt hàng</label>
                        <select
                          className="admin-form-input admin-select"
                          value={ct.MaSP}
                          onChange={(e) => updateLine(idx, "MaSP", e.target.value)}
                        >
                          <option value="" disabled>
                            -- Chọn sản phẩm --
                          </option>
                          {products.map((p) => (
                            <option key={p.MaSP} value={p.MaSP}>
                              {p.TenSP}
                            </option>
                          ))}
                        </select>
                        {sp && (
                          <span className="field-hint">
                            Kho hiện tại: <span className="value-info">{sp.TonKho}</span> {sp.DonViTinh}
                          </span>
                        )}
                      </div>

                      <div className="line-item-field">
                        <label className="mini-label">Số lượng</label>
                        <input
                          type="number"
                          min="1"
                          className="admin-form-input"
                          value={ct.SoLuong}
                          onChange={(e) => updateLine(idx, "SoLuong", Number(e.target.value))}
                        />
                      </div>

                      <div className="line-item-field">
                        <label className="mini-label">Đơn giá nhập</label>
                        <input
                          type="number"
                          min="0"
                          step="1000"
                          className="admin-form-input"
                          value={ct.DonGiaNhap}
                          onChange={(e) => updateLine(idx, "DonGiaNhap", Number(e.target.value))}
                        />
                      </div>

                      <div className="line-item-total">
                        <span className="mini-label">Thành tiền</span>
                        <span className="line-item-total-value">{fmtMoney(thanhTien)}</span>
                      </div>

                      <button
                        type="button"
                        onClick={() => removeLine(idx)}
                        className="icon-btn icon-btn-danger line-item-remove"
                        aria-label={`Xóa dòng ${idx + 1}`}
                      >
                        ✕
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div className="admin-side-column sticky">
          <div className="side-stack">
            <div className="admin-form-card">
              <div className="admin-card-title">Thông tin phiếu</div>
              <p className="card-caption">Chọn nhà cung cấp, người tiếp nhận và ghi chú cho chứng từ.</p>

              <div className="form-group">
                <label className="form-label">
                  Nhà cung cấp<span className="required">*</span>
                </label>
                <select
                  className="admin-form-input admin-select"
                  value={form.MaNCC}
                  onChange={(e) => setForm((prev) => ({ ...prev, MaNCC: e.target.value }))}
                >
                  <option value="" disabled>
                    -- Chọn nhà cung cấp --
                  </option>
                  {suppliers.map((s) => (
                    <option key={s.MaNCC} value={s.MaNCC}>
                      {s.TenNCC}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">
                  Người tiếp nhận<span className="required">*</span>
                </label>
                <select
                  className="admin-form-input admin-select"
                  value={form.MaNV}
                  onChange={(e) => setForm((prev) => ({ ...prev, MaNV: e.target.value }))}
                >
                  <option value="" disabled>
                    -- Chọn nhân viên --
                  </option>
                  {staffs.map((s) => (
                    <option key={s.MaNV} value={s.MaNV}>
                      {s.TenNV}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Ghi chú thêm</label>
                <textarea
                  className="admin-form-input admin-textarea"
                  placeholder="Diễn giải, mã vận đơn..."
                  value={form.GhiChu}
                  onChange={(e) => setForm((prev) => ({ ...prev, GhiChu: e.target.value }))}
                />
              </div>
            </div>

            <div className="summary-card">
              <div className="summary-kicker">Tổng thanh toán</div>
              <div className="summary-value">{fmtMoney(tongTien)}</div>
              <div className="summary-meta">{chiTiet.length} mặt hàng trong phiếu nhập hiện tại</div>

              <div className="summary-actions">
                <button type="submit" disabled={saving || chiTiet.length === 0} className="btn btn-primary">
                  {saving ? "Đang xử lý..." : "💾 Lưu & Xác nhận phiếu"}
                </button>
                <button type="button" onClick={() => navigate("/admin/nhap-hang")} className="btn btn-secondary">
                  Hủy bỏ
                </button>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default NhapHangCreate;
