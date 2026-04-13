import { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import adminApi from "../../../services/adminApi";
import "../../../components/admin/admin.css";

const StaffEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    TenNV: "", TaiKhoan: "", MatKhau: "",
    SDT: "", DiaChi: "", MaTL: "", TrangThai: "active"
  });
  const [trolys, setTrolys] = useState([]);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    Promise.all([adminApi.get(`/staff/${id}`), adminApi.get("/staff/options")]).then(([nv, tl]) => {
      const d = nv.data;
      setForm({
        TenNV: d.TenNV || "",
        TaiKhoan: d.TaiKhoan || "",
        MatKhau: "",
        SDT: d.SDT || "",
        DiaChi: d.DiaChi || "",
        MaTL: d.MaTL || "",
        TrangThai: d.TrangThai || "active",
      });
      setTrolys(tl.data);
    }).catch(() => setError("Không tìm thấy nhân viên"));
  }, [id]);

  const handleChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await adminApi.put(`/staff/${id}`, form);
      navigate("/admin/staff");
    } catch (err) {
      setError(err.response?.data?.message || "Lỗi cập nhật nhân viên");
    } finally {
      setSaving(false);
    }
  };

  const isLocked = form.TrangThai === "inactive";

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">✏️ Sửa Nhân viên</h1>
        <p className="page-subtitle">
          <Link to="/admin/staff" style={{ color: "var(--admin-accent)" }}>Nhân viên</Link> / Chỉnh sửa: {id}
        </p>
      </div>
      <div className="admin-form-card">
        {error && <div className="admin-error">{error}</div>}
        <form onSubmit={handleSubmit}>
          {[
            ["TenNV", "Họ và tên", "text", true],
            ["TaiKhoan", "Tài khoản", "text", true],
            ["MatKhau", "Mật khẩu mới (để trống nếu không đổi)", "password", false],
            ["SDT", "Số điện thoại", "text", false],
            ["DiaChi", "Địa chỉ", "text", false],
          ].map(([name, label, type, req]) => (
            <div className="form-group" key={name}>
              <label className="form-label">{label}{req && <span className="required">*</span>}</label>
              <input
                name={name}
                type={type}
                className="admin-form-input"
                value={form[name]}
                onChange={handleChange}
                placeholder={name === "MatKhau" ? "Để trống nếu không đổi..." : `Nhập ${label.toLowerCase()}...`}
              />
            </div>
          ))}

          <div className="form-group">
            <label className="form-label">Trợ lý quản lý<span className="required">*</span></label>
            <select name="MaTL" className="admin-form-input admin-select" value={form.MaTL} onChange={handleChange}>
              <option value="">-- Chọn trợ lý --</option>
              {trolys.map((t) => <option key={t.MaTL} value={t.MaTL}>{t.TenTL}</option>)}
            </select>
          </div>

          {/* Toggle Trạng thái tài khoản */}
          <div className="form-group">
            <label className="form-label">Trạng thái tài khoản</label>
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: 16,
              padding: "12px 16px",
              borderRadius: 8,
              background: isLocked ? "rgba(239,68,68,0.08)" : "rgba(34,197,94,0.08)",
              border: `1px solid ${isLocked ? "rgba(239,68,68,0.3)" : "rgba(34,197,94,0.3)"}`,
            }}>
              <span style={{ fontWeight: 600, color: isLocked ? "var(--admin-danger)" : "var(--admin-success)", fontSize: "0.95rem" }}>
                {isLocked ? "🔒 Đang bị khóa" : "✅ Đang hoạt động"}
              </span>
              <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", marginLeft: "auto" }}>
                <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
                  {isLocked ? "Bấm để mở khóa" : "Bấm để khóa tài khoản"}
                </span>
                <button
                  type="button"
                  onClick={() => setForm(p => ({ ...p, TrangThai: p.TrangThai === "active" ? "inactive" : "active" }))}
                  style={{
                    width: 52,
                    height: 28,
                    borderRadius: 14,
                    border: "none",
                    cursor: "pointer",
                    position: "relative",
                    background: isLocked ? "#ef4444" : "#22c55e",
                    transition: "background 0.2s",
                  }}
                >
                  <span style={{
                    position: "absolute",
                    top: 3,
                    left: isLocked ? 3 : 27,
                    width: 22,
                    height: 22,
                    borderRadius: "50%",
                    background: "#fff",
                    transition: "left 0.2s",
                  }} />
                </button>
              </label>
            </div>
            <input type="hidden" name="TrangThai" value={form.TrangThai} />
          </div>

          <div className="form-actions">
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? "Đang lưu..." : "💾 Cập nhật"}
            </button>
            <Link to="/admin/staff" className="btn btn-secondary">Hủy</Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StaffEdit;
