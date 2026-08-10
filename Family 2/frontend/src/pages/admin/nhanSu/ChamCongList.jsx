import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import adminApi from "../../../services/adminApi";
import "../../../components/admin/admin.css";

const TRANG_THAI_MAP = {
  di_lam: { label: "Đi làm", icon: "☀️", cls: "badge-success" },
  nghi_phep: { label: "Nghỉ phép", icon: "🌴", cls: "badge-warning" },
  vang_mat: { label: "Vắng mặt", icon: "❌", cls: "badge-danger" },
  lam_them: { label: "Làm thêm", icon: "🌙", cls: "badge-primary" },
};

const now = new Date();

const ChamCongList = () => {
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [staffs, setStaffs] = useState([]);
  const [filters, setFilters] = useState({
    thang: String(now.getMonth() + 1),
    nam: String(now.getFullYear()),
    maNV: "",
  });
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ MaNV: "", NgayLam: "", GioVao: "", GioRa: "", TrangThai: "di_lam", GhiChu: "" });
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const limit = 20;
  const totalPages = Math.ceil(total / limit);

  useEffect(() => {
    adminApi.get("/staff?limit=200").then((r) => setStaffs(r.data.data || []));
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ ...filters, page, limit });
      const res = await adminApi.get(`/nhan-su/cham-cong?${params}`);
      setData(res.data.data || []);
      setTotal(res.data.total || 0);
    } catch {
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [filters, page]);

  const openCreate = () => {
    setEditId(null);
    setForm({ MaNV: "", NgayLam: "", GioVao: "", GioRa: "", TrangThai: "di_lam", GhiChu: "" });
    setFormError("");
    setShowForm(true);
  };

  const openEdit = (row) => {
    setEditId(row.MaCC);
    setForm({
      MaNV: row.MaNV,
      NgayLam: row.NgayLam?.substring(0, 10) || "",
      GioVao: row.GioVao || "",
      GioRa: row.GioRa || "",
      TrangThai: row.TrangThai,
      GhiChu: row.GhiChu || "",
    });
    setFormError("");
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.MaNV || !form.NgayLam || !form.TrangThai) {
      setFormError("Vui lòng điền nhân viên, ngày làm và trạng thái");
      return;
    }
    setSaving(true);
    try {
      if (editId) {
        await adminApi.put(`/nhan-su/cham-cong/${editId}`, form);
      } else {
        await adminApi.post("/nhan-su/cham-cong", form);
      }
      setShowForm(false);
      fetchData();
    } catch (err) {
      setFormError(err.response?.data?.message || "Lỗi lưu dữ liệu");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Xóa bản ghi chấm công này?")) return;
    try {
      await adminApi.delete(`/nhan-su/cham-cong/${id}`);
      fetchData();
    } catch {
      alert("Lỗi xóa");
    }
  };

  const fmtDate = (d) => (d ? new Date(d).toLocaleDateString("vi-VN") : "—");

  const stats = {
    di_lam: data.filter((row) => row.TrangThai === "di_lam").length,
    nghi_phep: data.filter((row) => row.TrangThai === "nghi_phep").length,
    vang_mat: data.filter((row) => row.TrangThai === "vang_mat").length,
  };

  return (
    <div className="admin-page-stack">
      <div className="page-header page-header-row">
        <div>
          <h1 className="page-title">🕐 Quản lý Chấm Công</h1>
          <p className="page-subtitle">Theo dõi, quản lý giờ giấc làm việc của nhân viên</p>
        </div>
        <div className="page-actions">
          <Link to="/admin/nhan-su/bang-luong" className="btn btn-secondary">
            📊 Bảng lương
          </Link>
          <button type="button" onClick={openCreate} className="btn btn-primary">
            + Chấm công
          </button>
        </div>
      </div>

      <div className="stats-grid stats-grid-tight">
        <div className="stat-card column">
          <div className="stat-icon-wrap info">📋</div>
          <div>
            <div className="stat-number">{total}</div>
            <div className="stat-label">Tổng bản ghi</div>
          </div>
        </div>
        <div className="stat-card column">
          <div className="stat-icon-wrap success">☀️</div>
          <div>
            <div className="stat-number value-success">{stats.di_lam}</div>
            <div className="stat-label">Đi làm</div>
          </div>
        </div>
        <div className="stat-card column">
          <div className="stat-icon-wrap warning">🌴</div>
          <div>
            <div className="stat-number value-warning">{stats.nghi_phep}</div>
            <div className="stat-label">Nghỉ phép</div>
          </div>
        </div>
        <div className="stat-card column">
          <div className="stat-icon-wrap danger">❌</div>
          <div>
            <div className="stat-number value-danger">{stats.vang_mat}</div>
            <div className="stat-label">Vắng mặt</div>
          </div>
        </div>
      </div>

      <div className="admin-card">
        <div className="admin-card-header admin-card-header-stack">
          <div>
            <span className="admin-card-title">Bộ lọc chấm công</span>
            <p className="card-caption">Xem dữ liệu theo tháng, năm và nhân viên cụ thể.</p>
          </div>
          <div className="filters-row">
            <div className="filter-field">
              <label className="filter-label">Tháng</label>
              <select
                className="admin-form-input admin-select"
                value={filters.thang}
                onChange={(e) => {
                  setFilters((prev) => ({ ...prev, thang: e.target.value }));
                  setPage(1);
                }}
              >
                {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                  <option key={m} value={m}>
                    Tháng {m}
                  </option>
                ))}
              </select>
            </div>
            <div className="filter-field">
              <label className="filter-label">Năm</label>
              <select
                className="admin-form-input admin-select"
                value={filters.nam}
                onChange={(e) => {
                  setFilters((prev) => ({ ...prev, nam: e.target.value }));
                  setPage(1);
                }}
              >
                {[2024, 2025, 2026, 2027].map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>
            <div className="filter-field filter-field-grow">
              <label className="filter-label">Nhân viên</label>
              <select
                className="admin-form-input admin-select"
                value={filters.maNV}
                onChange={(e) => {
                  setFilters((prev) => ({ ...prev, maNV: e.target.value }));
                  setPage(1);
                }}
              >
                <option value="">-- Tất cả nhân viên --</option>
                {staffs.map((s) => (
                  <option key={s.MaNV} value={s.MaNV}>
                    {s.TenNV}
                  </option>
                ))}
              </select>
            </div>
            <div className="filter-actions">
              <button type="button" onClick={fetchData} className="btn btn-secondary">
                Áp dụng filter
              </button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="admin-loading">
            <div className="spinner" />
            Đang đồng bộ dữ liệu...
          </div>
        ) : data.length === 0 ? (
          <div className="admin-empty">
            <div className="admin-empty-icon">🕐</div>
            <p>Chưa có bản ghi chấm công phù hợp với bộ lọc hiện tại.</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Nhân viên</th>
                  <th className="text-center">Ngày làm</th>
                  <th className="text-center">In / Out</th>
                  <th className="text-center">Tổng giờ</th>
                  <th>Trạng thái</th>
                  <th>Ghi chú</th>
                  <th className="text-center">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {data.map((row) => {
                  const tt = TRANG_THAI_MAP[row.TrangThai] || { label: row.TrangThai, icon: "?", cls: "badge-muted" };

                  return (
                    <tr key={row.MaCC}>
                      <td className="td-primary">{row.TenNV}</td>
                      <td className="text-center">{fmtDate(row.NgayLam)}</td>
                      <td className="text-center">
                        <span className="inline-time">
                          <span className="value-success">{row.GioVao?.substring(0, 5) || "—"}</span>
                          <span>•</span>
                          <span className="value-warning">{row.GioRa?.substring(0, 5) || "—"}</span>
                        </span>
                      </td>
                      <td className="text-center">
                        <span className="value-info value-strong">{Number(row.SoGioLam || 0).toFixed(1)}h</span>
                      </td>
                      <td>
                        <span className={`badge ${tt.cls}`}>
                          {tt.icon} {tt.label}
                        </span>
                      </td>
                      <td className="cell-note" title={row.GhiChu || ""}>
                        {row.GhiChu || "—"}
                      </td>
                      <td>
                        <div className="table-actions-center">
                          <button type="button" onClick={() => openEdit(row)} className="icon-btn" title="Sửa">
                            ✏️
                          </button>
                          <button type="button" onClick={() => handleDelete(row.MaCC)} className="icon-btn icon-btn-danger" title="Xóa">
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {totalPages > 1 && (
          <div className="pagination">
            <span className="pagination-info">Trang {page} / {totalPages}</span>
            <div className="pagination-btns">
              <button type="button" className="page-btn" onClick={() => setPage((p) => p - 1)} disabled={page === 1}>
                ←
              </button>
              <button type="button" className="page-btn" onClick={() => setPage((p) => p + 1)} disabled={page === totalPages}>
                →
              </button>
            </div>
          </div>
        )}
      </div>

      {showForm && (
        <div className="admin-modal-wrap">
          <div className="admin-modal-backdrop" onClick={() => setShowForm(false)} />
          <div className="admin-modal admin-modal-sm">
            <div className="admin-modal-header">
              <div>
                <div className="admin-modal-title">{editId ? "✏️ Sửa Chấm Công" : "➕ Chấm Công Mới"}</div>
                <div className="admin-modal-subtitle">Nhập thông tin giờ làm, trạng thái và ghi chú</div>
              </div>
              <button type="button" onClick={() => setShowForm(false)} className="icon-btn" aria-label="Đóng">
                ✕
              </button>
            </div>

            <div className="admin-modal-body">
              {formError && <div className="admin-error">{formError}</div>}

              <div className="form-grid">
                <div className="form-group form-span-2">
                  <label className="form-label">
                    Nhân viên<span className="required">*</span>
                  </label>
                  <select
                    disabled={!!editId}
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
                  <label className="form-label">
                    Ngày làm<span className="required">*</span>
                  </label>
                  <input
                    type="date"
                    disabled={!!editId}
                    className="admin-form-input"
                    value={form.NgayLam}
                    onChange={(e) => setForm((prev) => ({ ...prev, NgayLam: e.target.value }))}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">
                    Trạng thái<span className="required">*</span>
                  </label>
                  <select
                    className="admin-form-input admin-select"
                    value={form.TrangThai}
                    onChange={(e) => setForm((prev) => ({ ...prev, TrangThai: e.target.value }))}
                  >
                    <option value="di_lam">Đi làm</option>
                    <option value="nghi_phep">Nghỉ phép</option>
                    <option value="vang_mat">Vắng mặt</option>
                    <option value="lam_them">Làm thêm</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Giờ IN</label>
                  <input
                    type="time"
                    className="admin-form-input"
                    value={form.GioVao}
                    onChange={(e) => setForm((prev) => ({ ...prev, GioVao: e.target.value }))}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Giờ OUT</label>
                  <input
                    type="time"
                    className="admin-form-input"
                    value={form.GioRa}
                    onChange={(e) => setForm((prev) => ({ ...prev, GioRa: e.target.value }))}
                  />
                </div>

                <div className="form-group form-span-2">
                  <label className="form-label">Ghi chú thêm</label>
                  <textarea
                    className="admin-form-input admin-textarea"
                    placeholder="Diễn giải đi trễ, về sớm..."
                    value={form.GhiChu}
                    onChange={(e) => setForm((prev) => ({ ...prev, GhiChu: e.target.value }))}
                  />
                </div>
              </div>
            </div>

            <div className="admin-modal-footer">
              <button type="button" onClick={() => setShowForm(false)} className="btn btn-secondary">
                Hủy
              </button>
              <button type="button" onClick={handleSave} disabled={saving} className="btn btn-primary">
                {saving ? "Đang xử lý..." : "Lưu thay đổi"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChamCongList;
