import { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import adminApi from "../../../services/adminApi";
import "../../../components/admin/admin.css";

const emptyItem = { MaSP: "", TenSP: "", GiaBan: 0, GiamGiaPhanTram: "", GiamGiaTien: "", MuaToiThieu: 1 };

const PromotionCreate = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ TenCT: "", text: "", TuNgay: "", DenNgay: "", kieuKM: "chiet_khau", soLuongMua: "", soLuongTang: "" });
  const [chiTiet, setChiTiet] = useState([]);
  const [spDropdown, setSpDropdown] = useState([]);
  const [spSearch, setSpSearch] = useState("");
  const [addingItem, setAddingItem] = useState({ ...emptyItem });
  const [imgFile, setImgFile] = useState(null);
  const [imgPreview, setImgPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const dropdownRef = useRef(null);
  const fileRef = useRef(null);

  const handleChange = (e) => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  // Tìm sản phẩm
  useEffect(() => {
    if (spSearch.length < 1) { setSpDropdown([]); return; }
    const timer = setTimeout(async () => {
      try {
        const res = await adminApi.get(`/promotions/san-pham?q=${encodeURIComponent(spSearch)}`);
        const added = chiTiet.map(c => c.MaSP);
        setSpDropdown(res.data.filter(sp => !added.includes(sp.MaSP)));
      } catch { setSpDropdown([]); }
    }, 300);
    return () => clearTimeout(timer);
  }, [spSearch, chiTiet]);

  const selectSanPham = (sp) => {
    setAddingItem(p => ({ ...p, MaSP: sp.MaSP, TenSP: sp.TenSP, GiaBan: sp.GiaBan }));
    setSpSearch(sp.TenSP);
    setSpDropdown([]);
  };

  const addChiTiet = () => {
    if (!addingItem.MaSP) { setError("Vui lòng chọn sản phẩm"); return; }
    if (form.kieuKM === "chiet_khau" && !addingItem.GiamGiaPhanTram && !addingItem.GiamGiaTien) {
      setError("Vui lòng nhập giảm giá (% hoặc tiền)"); return;
    }
    setChiTiet(p => [...p, { ...addingItem }]);
    setAddingItem({ ...emptyItem });
    setSpSearch("");
    setError("");
  };

  const removeChiTiet = (idx) => setChiTiet(p => p.filter((_, i) => i !== idx));

  // Chọn file ảnh
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImgFile(file);
    setImgPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.TenCT || !form.TuNgay || !form.DenNgay) { setError("Vui lòng nhập tên, ngày bắt đầu và kết thúc"); return; }
    if (new Date(form.DenNgay) <= new Date(form.TuNgay)) { setError("Ngày kết thúc phải sau ngày bắt đầu"); return; }
    setSaving(true);
    try {
      let imgPath = null;
      if (imgFile) {
        setUploading(true);
        const fd = new FormData();
        fd.append("image", imgFile);
        const upRes = await adminApi.post("/upload/promotion-image", fd, { headers: { "Content-Type": "multipart/form-data" } });
        imgPath = upRes.data.path;
        setUploading(false);
      }
      await adminApi.post("/promotions", {
        ...form,
        img: imgPath,
        chiTiet,
      });
      navigate("/admin/promotions");
    } catch (err) {
      setError(err.response?.data?.message || "Lỗi tạo khuyến mãi");
    } finally { setSaving(false); setUploading(false); }
  };

  const fmt = (n) => Number(n).toLocaleString("vi-VN");

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">🏷️+ Thêm Đợt Khuyến mãi</h1>
        <p className="page-subtitle"><Link to="/admin/promotions" style={{ color: "var(--admin-accent)" }}>Khuyến mãi</Link> / Thêm mới</p>
      </div>
      <div className="admin-form-card">
        {error && <div className="admin-error">{error}</div>}
        <form onSubmit={handleSubmit}>
          {/* Thông tin chương trình */}
          <div style={{ marginBottom: 8, fontWeight: 700, color: "var(--text-primary)", fontSize: "0.95rem" }}>📋 Thông tin chương trình</div>

          <div className="form-group">
            <label className="form-label">Tên chương trình KM<span className="required">*</span></label>
            <input name="TenCT" className="admin-form-input" value={form.TenCT} onChange={handleChange} placeholder="Ví dụ: Sale hè 2026" />
          </div>
          <div className="form-group">
            <label className="form-label">Mô tả</label>
            <textarea name="text" className="admin-form-input" rows={2} value={form.text} onChange={handleChange} placeholder="Mô tả chương trình khuyến mãi..." style={{ resize: "vertical" }} />
          </div>

          {/* Loại KM */}
          <div className="form-group">
            <label className="form-label">Loại chương trình</label>
            <div style={{ display: "flex", gap: 12 }}>
              {[["chiet_khau", "🏷️ Giảm giá (% hoặc tiền)"], ["mua_tang", "🎁 Mua X Tặng Y"]].map(([v, l]) => (
                <label key={v} style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 16px", border: `2px solid ${form.kieuKM === v ? "var(--admin-accent)" : "var(--border-color)"}`, borderRadius: 10, cursor: "pointer", background: form.kieuKM === v ? "rgba(108,99,255,0.07)" : "transparent", fontWeight: 600, fontSize: "0.9rem", flex: 1 }}>
                  <input type="radio" name="kieuKM" value={v} checked={form.kieuKM === v} onChange={handleChange} style={{ display: "none" }} />
                  {l}
                </label>
              ))}
            </div>
          </div>

          {/* Nếu là Mua X Tặng Y */}
          {form.kieuKM === "mua_tang" && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }} className="form-group">
              <div>
                <label className="form-label">Mua (số lượng)</label>
                <input type="number" min="1" name="soLuongMua" className="admin-form-input" value={form.soLuongMua} onChange={handleChange} placeholder="VD: 2" />
              </div>
              <div>
                <label className="form-label">Tặng (số lượng)</label>
                <input type="number" min="1" name="soLuongTang" className="admin-form-input" value={form.soLuongTang} onChange={handleChange} placeholder="VD: 1" />
              </div>
            </div>
          )}

          {/* Ngày */}
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

          {/* Upload ảnh */}
          <div className="form-group">
            <label className="form-label">Ảnh banner khuyến mãi</label>
            <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
              {imgPreview && <img src={imgPreview} alt="preview" style={{ width: 140, height: 90, objectFit: "cover", borderRadius: 10, border: "2px solid var(--border-color)" }} />}
              <div>
                <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleFileChange} />
                <button type="button" className="btn btn-secondary" onClick={() => fileRef.current.click()}>
                  📷 {imgPreview ? "Đổi ảnh" : "Chọn ảnh"}
                </button>
                <p style={{ fontSize: "0.78rem", color: "#888", marginTop: 6 }}>JPG, PNG, WebP — tối đa 5MB</p>
              </div>
            </div>
          </div>

          {/* Sản phẩm KM */}
          <div style={{ marginTop: 24, marginBottom: 12, fontWeight: 700, color: "var(--text-primary)", fontSize: "0.95rem", borderTop: "1px solid var(--border-color)", paddingTop: 20 }}>
            🛒 Sản phẩm trong đợt khuyến mãi
          </div>

          <div style={{ background: "var(--bg-secondary, #f8f9fa)", borderRadius: 10, padding: 16, marginBottom: 16, border: "1px dashed var(--border-color)" }}>
            <div style={{ display: "grid", gridTemplateColumns: form.kieuKM === "chiet_khau" ? "2fr 1fr 1fr 1fr auto" : "2fr 1fr auto", gap: 10, alignItems: "flex-end" }}>
              <div className="form-group" style={{ marginBottom: 0, position: "relative" }}>
                <label className="form-label" style={{ fontSize: "0.82rem" }}>Sản phẩm</label>
                <input className="admin-form-input" value={spSearch}
                  onChange={e => { setSpSearch(e.target.value); setAddingItem(p => ({ ...p, MaSP: "", TenSP: "" })); }}
                  placeholder="🔍 Tìm tên / mã SP..." autoComplete="off" />
                {spDropdown.length > 0 && (
                  <div ref={dropdownRef} style={{ position: "absolute", top: "100%", left: 0, right: 0, background: "#fff", border: "1px solid var(--border-color)", borderRadius: 8, zIndex: 999, maxHeight: 200, overflowY: "auto", boxShadow: "0 4px 16px rgba(0,0,0,0.12)" }}>
                    {spDropdown.map(sp => (
                      <div key={sp.MaSP} onClick={() => selectSanPham(sp)} style={{ padding: "8px 14px", cursor: "pointer", fontSize: "0.88rem", borderBottom: "1px solid #f0f0f0" }}
                        onMouseEnter={e => e.currentTarget.style.background = "#f0f4ff"}
                        onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                        <strong>{sp.TenSP}</strong> <span style={{ color: "#888", fontSize: "0.8rem" }}>({sp.MaSP}) — {fmt(sp.GiaBan)}đ</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              {form.kieuKM === "chiet_khau" && (
                <>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label" style={{ fontSize: "0.82rem" }}>Giảm (%)</label>
                    <input type="number" min="0" max="100" step="0.01" className="admin-form-input" value={addingItem.GiamGiaPhanTram}
                      onChange={e => setAddingItem(p => ({ ...p, GiamGiaPhanTram: e.target.value, GiamGiaTien: "" }))} placeholder="VD: 10" />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label" style={{ fontSize: "0.82rem" }}>Giảm (VNĐ)</label>
                    <input type="number" min="0" step="1000" className="admin-form-input" value={addingItem.GiamGiaTien}
                      onChange={e => setAddingItem(p => ({ ...p, GiamGiaTien: e.target.value, GiamGiaPhanTram: "" }))} placeholder="VD: 50000" />
                  </div>
                </>
              )}
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" style={{ fontSize: "0.82rem" }}>Mua tối thiểu</label>
                <input type="number" min="1" step="1" className="admin-form-input" value={addingItem.MuaToiThieu}
                  onChange={e => setAddingItem(p => ({ ...p, MuaToiThieu: e.target.value }))} placeholder="1" />
              </div>
              <button type="button" className="btn btn-primary" style={{ height: 40, whiteSpace: "nowrap" }} onClick={addChiTiet}>+ Thêm</button>
            </div>
            <p style={{ fontSize: "0.78rem", color: "#888", marginTop: 8, marginBottom: 0 }}>
              {form.kieuKM === "chiet_khau" ? "💡 Nhập giảm % hoặc giảm tiền. Mua tối thiểu: số SP khách cần mua để hưởng KM." : "💡 Thêm các sản phẩm áp dụng chương trình Mua X Tặng Y."}
            </p>
          </div>

          {chiTiet.length > 0 ? (
            <div className="table-wrapper" style={{ marginBottom: 20 }}>
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>#</th><th>Sản phẩm</th><th>Giá gốc</th>
                    {form.kieuKM === "chiet_khau" && <><th>Giảm %</th><th>Giảm tiền</th><th>Giá sau KM</th></>}
                    <th>Mua tối thiểu</th><th></th>
                  </tr>
                </thead>
                <tbody>
                  {chiTiet.map((item, idx) => {
                    const giaSauKM = item.GiamGiaPhanTram
                      ? item.GiaBan * (1 - parseFloat(item.GiamGiaPhanTram) / 100)
                      : item.GiaBan - parseFloat(item.GiamGiaTien || 0);
                    return (
                      <tr key={idx}>
                        <td>{idx + 1}</td>
                        <td className="td-primary">{item.TenSP}<br /><span style={{ fontSize: "0.78rem", color: "#888" }}>{item.MaSP}</span></td>
                        <td>{fmt(item.GiaBan)}đ</td>
                        {form.kieuKM === "chiet_khau" && (
                          <>
                            <td>{item.GiamGiaPhanTram ? <span className="badge badge-warning">{item.GiamGiaPhanTram}%</span> : "—"}</td>
                            <td>{item.GiamGiaTien ? <span className="badge badge-info">{fmt(item.GiamGiaTien)}đ</span> : "—"}</td>
                            <td style={{ color: "#e53e3e", fontWeight: 600 }}>{fmt(Math.max(0, giaSauKM))}đ</td>
                          </>
                        )}
                        <td style={{ textAlign: "center" }}>{item.MuaToiThieu} SP</td>
                        <td><button type="button" className="btn btn-danger btn-sm" onClick={() => removeChiTiet(idx)}>🗑️</button></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div style={{ textAlign: "center", padding: 20, color: "#aaa", fontSize: "0.88rem", marginBottom: 16, border: "1px solid var(--border-color)", borderRadius: 8 }}>
              Chưa có sản phẩm nào
            </div>
          )}

          <div className="form-actions">
            <button type="submit" className="btn btn-primary" disabled={saving || uploading}>{saving || uploading ? "Đang lưu..." : "💾 Lưu khuyến mãi"}</button>
            <Link to="/admin/promotions" className="btn btn-secondary">Hủy</Link>
          </div>
        </form>
      </div>
    </div>
  );
};
export default PromotionCreate;
