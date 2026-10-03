import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import adminApi from "../../../services/adminApi";
import "../../../components/admin/admin.css";

const StaffCreate = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ TenNV: "", TaiKhoan: "", MatKhau: "", SDT: "", DiaChi: "", MaTL: "" });
  const [trolys, setTrolys] = useState([]);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    adminApi.get("/staff/options").then((res) => setTrolys(res.data));
  }, []);

  const handleChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.TenNV || !form.TaiKhoan || !form.MatKhau || !form.MaTL) {
      setError("Vui lòng điền đầy đủ thông tin bắt buộc");
      return;
    }
    setSaving(true);
    try {
      await adminApi.post("/staff", form);
      navigate("/admin/staff");
    } catch (err) {
      setError(err.response?.data?.message || "Lỗi tạo nhân viên");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">👤+ Thêm Nhân viên</h1>
        <p className="page-subtitle"><Link to="/admin/staff" style={{ color: "var(--admin-accent)" }}>Nhân viên</Link> / Thêm mới</p>
      </div>
      <div className="admin-form-card">
        {error && <div className="admin-error">{error}</div>}
        <form onSubmit={handleSubmit}>
          {[["TenNV","Họ và tên","text",true],["TaiKhoan","Tài khoản","text",true],["MatKhau","Mật khẩu","password",true],["SDT","Số điện thoại","text",false],["DiaChi","Địa chỉ","text",false]].map(([name, label, type, req]) => (
            <div className="form-group" key={name}>
              <label className="form-label">{label}{req && <span className="required">*</span>}</label>
              <input name={name} type={type} className="admin-form-input" value={form[name]} onChange={handleChange} placeholder={`Nhập ${label.toLowerCase()}...`} />
            </div>
          ))}
          <div className="form-group">
            <label className="form-label">Trợ lý quản lý<span className="required">*</span></label>
            <select name="MaTL" className="admin-form-input admin-select" value={form.MaTL} onChange={handleChange}>
              <option value="">-- Chọn trợ lý --</option>
              {trolys.map((t) => <option key={t.MaTL} value={t.MaTL}>{t.TenTL}</option>)}
            </select>
          </div>
          <div className="form-actions">
            <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? "Đang lưu..." : "💾 Lưu nhân viên"}</button>
            <Link to="/admin/staff" className="btn btn-secondary">Hủy</Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StaffCreate;
