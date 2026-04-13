import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import adminApi from "../../../services/adminApi";
import "../../../components/admin/admin.css";

const ProductCreate = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    TenSP: "", QuyCach: "", DonViTinh: "",
    GiaVon: "", GiaBan: "", TonKho: "",
    MaDanhMuc: "", MaNCC: ""
  });
  const [categories, setCategories] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  // Upload ảnh
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => {
    adminApi.get("/products/categories").then(r => setCategories(r.data));
    adminApi.get("/suppliers").then(r => setSuppliers(r.data?.data || r.data));
  }, []);

  const handleChange = (e) => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.TenSP || !form.GiaBan || !form.TonKho || !form.MaNCC) {
      setError("Vui lòng điền đầy đủ thông tin bắt buộc (*)");
      return;
    }
    
    setSaving(true);
    setError("");
    let finalImagePath = null;

    try {
      // 1. Nếu có chọn ảnh thì upload ảnh trước
      if (imageFile) {
        const fd = new FormData();
        fd.append("image", imageFile);
        const res = await adminApi.post("/upload/product-image", fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        finalImagePath = res.data.path;
      }

      // 2. Lưu sản phẩm
      await adminApi.post("/products", {
        ...form,
        HinhAnh: finalImagePath,
        GiaVon: Number(form.GiaVon) || 0,
        GiaBan: Number(form.GiaBan),
        TonKho: Number(form.TonKho)
      });
      navigate("/admin/products");
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Lỗi tạo sản phẩm");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">📦+ Thêm Sản phẩm</h1>
        <p className="page-subtitle"><Link to="/admin/products" style={{ color: "var(--admin-accent)" }}>Sản phẩm</Link> / Thêm mới</p>
      </div>
      <div className="admin-form-card">
        {error && <div className="admin-error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div className="form-group">
              <label className="form-label">Tên sản phẩm<span className="required">*</span></label>
              <input name="TenSP" className="admin-form-input" value={form.TenSP} onChange={handleChange} placeholder="Nhập tên sản phẩm..." />
            </div>
            <div className="form-group">
              <label className="form-label">Quy cách</label>
              <input name="QuyCach" className="admin-form-input" value={form.QuyCach} onChange={handleChange} placeholder="VD: 500ml" />
            </div>
            <div className="form-group">
              <label className="form-label">Đơn vị tính</label>
              <input name="DonViTinh" className="admin-form-input" value={form.DonViTinh} onChange={handleChange} placeholder="VD: Lon, Gói, Hộp" />
            </div>
            <div className="form-group">
              <label className="form-label">Giá vốn (VNĐ)</label>
              <input name="GiaVon" type="number" min="0" className="admin-form-input" value={form.GiaVon} onChange={handleChange} placeholder="Ví dụ: 8000" />
            </div>
            <div className="form-group">
              <label className="form-label">Giá bán (VNĐ)<span className="required">*</span></label>
              <input name="GiaBan" type="number" min="0" className="admin-form-input" value={form.GiaBan} onChange={handleChange} placeholder="Ví dụ: 15000" />
            </div>
            <div className="form-group">
              <label className="form-label">Tồn kho<span className="required">*</span></label>
              <input name="TonKho" type="number" min="0" className="admin-form-input" value={form.TonKho} onChange={handleChange} placeholder="Ví dụ: 100" />
            </div>
            <div className="form-group">
              <label className="form-label">Danh mục</label>
              <select name="MaDanhMuc" className="admin-form-input admin-select" value={form.MaDanhMuc} onChange={handleChange}>
                <option value="">-- Không có danh mục --</option>
                {categories.map(c => <option key={c.MaDanhMuc} value={c.MaDanhMuc}>{c.TenDanhMuc}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Nhà cung cấp<span className="required">*</span></label>
              <select name="MaNCC" className="admin-form-input admin-select" value={form.MaNCC} onChange={handleChange}>
                <option value="">-- Chọn nhà cung cấp --</option>
                {suppliers.map(s => <option key={s.MaNCC} value={s.MaNCC}>{s.TenNCC}</option>)}
              </select>
            </div>
          </div>

          {/* Upload ảnh */}
          <div className="form-group" style={{ marginTop: 16 }}>
            <label className="form-label">Hình ảnh sản phẩm</label>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 16, flexWrap: "wrap" }}>
              <div>
                <input
                  type="file"
                  accept="image/*"
                  id="product-image-input"
                  style={{ display: "none" }}
                  onChange={handleImageChange}
                />
                <label htmlFor="product-image-input" className="btn btn-secondary" style={{ cursor: "pointer", display: "inline-block" }}>
                  📁 Chọn ảnh
                </label>
                <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: 4 }}>
                  Hỗ trợ: JPG, PNG, WEBP, GIF. Tối đa 5MB.
                </p>
              </div>
              {imagePreview && (
                <img
                  src={imagePreview}
                  alt="Preview"
                  style={{ width: 120, height: 120, objectFit: "cover", borderRadius: 8, border: "2px solid var(--admin-border)" }}
                />
              )}
            </div>
          </div>

          <div className="form-actions">
            <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? "Đang lưu..." : "💾 Lưu sản phẩm"}</button>
            <Link to="/admin/products" className="btn btn-secondary">Hủy</Link>
          </div>
        </form>
      </div>
    </div>
  );
};
export default ProductCreate;

