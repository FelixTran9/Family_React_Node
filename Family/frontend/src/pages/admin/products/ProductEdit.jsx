import { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import adminApi from "../../../services/adminApi";
import "../../../components/admin/admin.css";

const BACKEND = "http://localhost:5002";

const ProductEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    TenSP: "", QuyCach: "", DonViTinh: "",
    GiaVon: "", GiaBan: "", TonKho: "",
    HinhAnh: "", MaDanhMuc: "", MaNCC: ""
  });
  const [categories, setCategories] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  // Upload ảnh
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => {
    Promise.all([
      adminApi.get(`/products/${id}`),
      adminApi.get("/products/categories"),
      adminApi.get("/suppliers")
    ]).then(([sp, cats, ncc]) => {
      const d = sp.data;
      setForm({
        TenSP: d.TenSP || "",
        QuyCach: d.QuyCach || "",
        DonViTinh: d.DonViTinh || "",
        GiaVon: d.GiaVon || "",
        GiaBan: d.GiaBan || "",
        TonKho: d.TonKho || "",
        HinhAnh: d.HinhAnh || "",
        MaDanhMuc: d.MaDanhMuc || "",
        MaNCC: d.MaNCC || ""
      });
      setCategories(cats.data);
      setSuppliers(ncc.data?.data || ncc.data);
    }).catch(() => setError("Không tìm thấy sản phẩm"));
  }, [id]);

  const handleChange = (e) => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    let finalImagePath = form.HinhAnh; // retain old image if no new image selected

    try {
      if (imageFile) {
        const fd = new FormData();
        fd.append("image", imageFile);
        const res = await adminApi.post("/upload/product-image", fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        finalImagePath = res.data.path;
      }

      await adminApi.put(`/products/${id}`, {
        ...form,
        HinhAnh: finalImagePath || null,
        GiaVon: Number(form.GiaVon) || 0,
        GiaBan: Number(form.GiaBan),
        TonKho: Number(form.TonKho)
      });
      navigate("/admin/products");
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Lỗi cập nhật sản phẩm");
    } finally {
      setSaving(false);
    }
  };

  // Hiển thị ảnh hiện tại
  const currentImageUrl = form.HinhAnh
    ? (form.HinhAnh.startsWith("http") ? form.HinhAnh : `${BACKEND}/uploads/${form.HinhAnh}`)
    : null;

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">✏️ Sửa Sản phẩm</h1>
        <p className="page-subtitle"><Link to="/admin/products" style={{ color: "var(--admin-accent)" }}>Sản phẩm</Link> / Chỉnh sửa: {id}</p>
      </div>
      <div className="admin-form-card">
        {error && <div className="admin-error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div className="form-group">
              <label className="form-label">Tên sản phẩm<span className="required">*</span></label>
              <input name="TenSP" className="admin-form-input" value={form.TenSP} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label className="form-label">Quy cách</label>
              <input name="QuyCach" className="admin-form-input" value={form.QuyCach} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label className="form-label">Đơn vị tính</label>
              <input name="DonViTinh" className="admin-form-input" value={form.DonViTinh} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label className="form-label">Giá vốn (VNĐ)</label>
              <input name="GiaVon" type="number" min="0" className="admin-form-input" value={form.GiaVon} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label className="form-label">Giá bán (VNĐ)<span className="required">*</span></label>
              <input name="GiaBan" type="number" min="0" className="admin-form-input" value={form.GiaBan} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label className="form-label">Tồn kho<span className="required">*</span></label>
              <input name="TonKho" type="number" min="0" className="admin-form-input" value={form.TonKho} onChange={handleChange} />
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
                {/* Ảnh hiện tại */}
                {currentImageUrl && !imagePreview && (
                  <div style={{ marginBottom: 8 }}>
                    <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: 4 }}>Ảnh hiện tại:</p>
                    <img
                      src={currentImageUrl}
                      alt="Current"
                      style={{ width: 120, height: 120, objectFit: "cover", borderRadius: 8, border: "2px solid var(--admin-border)" }}
                      onError={(e) => { e.target.style.display = "none"; }}
                    />
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  id="product-image-input-edit"
                  style={{ display: "none" }}
                  onChange={handleImageChange}
                />
                <label htmlFor="product-image-input-edit" className="btn btn-secondary" style={{ cursor: "pointer", display: "inline-block" }}>
                  📁 Đổi ảnh mới
                </label>
                <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: 4 }}>
                  Hỗ trợ: JPG, PNG, WEBP, GIF. Tối đa 5MB.
                </p>
              </div>
              {imagePreview && (
                <div>
                  <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: 4 }}>Ảnh mới:</p>
                  <img
                    src={imagePreview}
                    alt="Preview"
                    style={{ width: 120, height: 120, objectFit: "cover", borderRadius: 8, border: "2px dashed var(--admin-accent)" }}
                  />
                </div>
              )}
            </div>
          </div>

          <div className="form-actions">
            <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? "Đang lưu..." : "💾 Cập nhật"}</button>
            <Link to="/admin/products" className="btn btn-secondary">Hủy</Link>
          </div>
        </form>
      </div>
    </div>
  );
};
export default ProductEdit;
