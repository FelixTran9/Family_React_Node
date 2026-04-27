import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import adminApi from "../../../services/adminApi";
import "../../../components/admin/admin.css";

const now = new Date();

const BangLuongList = () => {
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

  const [showTinhLuong, setShowTinhLuong] = useState(false);
  const [tinhForm, setTinhForm] = useState({
    Thang: String(now.getMonth() + 1),
    Nam: String(now.getFullYear()),
    LuongCoBanMacDinh: 5000000,
    PhuCap: 300000,
    KhauTru: 0,
  });
  const [tinhLoading, setTinhLoading] = useState(false);
  const [tinhMsg, setTinhMsg] = useState("");

  const [editRow, setEditRow] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [editSaving, setEditSaving] = useState(false);
  const [editError, setEditError] = useState("");

  const limit = 20;
  const totalPages = Math.ceil(total / limit);

  useEffect(() => {
    adminApi.get("/staff?limit=200").then((r) => setStaffs(r.data.data || []));
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ ...filters, page, limit });
      const res = await adminApi.get(`/nhan-su/bang-luong?${params}`);
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

  const handleTinhLuong = async () => {
    if (!tinhForm.LuongCoBanMacDinh) {
      setTinhMsg("Vui lòng nhập lương cơ bản");
      return;
    }
    setTinhLoading(true);
    setTinhMsg("");
    try {
      const res = await adminApi.post("/nhan-su/bang-luong/tinh-luong", tinhForm);
      setTinhMsg(`✅ ${res.data.message}`);
      fetchData();
    } catch (err) {
      setTinhMsg(`❌ ${err.response?.data?.message || "Lỗi tính lương"}`);
    } finally {
      setTinhLoading(false);
    }
  };

  const handleThanhToan = async (id) => {
    if (!window.confirm("Xác nhận đã thanh toán lương cho nhân viên này?")) return;
    try {
      await adminApi.patch(`/nhan-su/bang-luong/${id}/thanh-toan`);
      fetchData();
    } catch {
      alert("Lỗi xác nhận thanh toán");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Xóa bảng lương này?")) return;
    try {
      await adminApi.delete(`/nhan-su/bang-luong/${id}`);
      fetchData();
    } catch {
      alert("Lỗi xóa");
    }
  };

  const openEdit = (row) => {
    setEditRow(row);
    setEditForm({
      SoNgayLam: row.SoNgayLam,
      SoGioLam: row.SoGioLam,
      LuongCoBan: row.LuongCoBan,
      PhuCap: row.PhuCap,
      KhauTru: row.KhauTru,
      TrangThai: row.TrangThai,
      GhiChu: row.GhiChu || "",
    });
    setEditError("");
  };

  const handleEditSave = async () => {
    setEditSaving(true);
    try {
      await adminApi.put(`/nhan-su/bang-luong/${editRow.MaBL}`, editForm);
      setEditRow(null);
      fetchData();
    } catch (err) {
      setEditError(err.response?.data?.message || "Lỗi cập nhật");
    } finally {
      setEditSaving(false);
    }
  };

  const fmtMoney = (n) => Number(n || 0).toLocaleString("vi-VN") + "₫";
  const tongLuong = data.reduce((sum, row) => sum + Number(row.TongLuong || 0), 0);
  const daTT = data.filter((row) => row.TrangThai === "da_thanh_toan").length;

  const previewTong =
    editForm.LuongCoBan !== undefined
      ? Math.round(
          (Number(editForm.SoNgayLam || 0) / 26) * Number(editForm.LuongCoBan) +
            Number(editForm.PhuCap || 0) -
            Number(editForm.KhauTru || 0)
        )
      : 0;

  return (
    <div className="admin-page-stack">
      <div className="page-header page-header-row">
        <div>
          <h1 className="page-title">💰 Bảng Lương</h1>
          <p className="page-subtitle">Tổng hợp, tính toán và thanh toán lương nhân sự</p>
        </div>
        <div className="page-actions">
          <Link to="/admin/nhan-su/cham-cong" className="btn btn-secondary">
            🕐 Chấm công
          </Link>
          <button type="button" onClick={() => { setShowTinhLuong(true); setTinhMsg(""); }} className="btn btn-primary">
            ⚡ Tính lương tự động
          </button>
        </div>
      </div>

      <div className="stats-grid stats-grid-tight">
        <div className="stat-card column">
          <div className="stat-icon-wrap primary">👥</div>
          <div>
            <div className="stat-number">{total}</div>
            <div className="stat-label">Mã NV trả lương</div>
          </div>
        </div>
        <div className="stat-card column">
          <div className="stat-icon-wrap success">✅</div>
          <div>
            <div className="stat-number value-success">{daTT}</div>
            <div className="stat-label">Đã thanh toán</div>
          </div>
        </div>
        <div className="stat-card column">
          <div className="stat-icon-wrap warning">⏳</div>
          <div>
            <div className="stat-number value-warning">{total - daTT}</div>
            <div className="stat-label">Chưa thanh toán</div>
          </div>
        </div>
        <div className="stat-card column">
          <div className="stat-icon-wrap info">💵</div>
          <div>
            <div className="stat-number value-accent">{fmtMoney(tongLuong)}</div>
            <div className="stat-label">Tổng quỹ lương trang này</div>
          </div>
        </div>
      </div>

      <div className="admin-card">
        <div className="admin-card-header admin-card-header-stack">
          <div>
            <span className="admin-card-title">Bộ lọc lương</span>
            <p className="card-caption">Xem bảng lương theo tháng, năm và nhân viên cụ thể.</p>
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
                Lọc dữ liệu
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
            <div className="admin-empty-icon">💵</div>
            <p>Chưa có bảng lương cho bộ lọc hiện tại.</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Nhân viên</th>
                  <th className="text-center">Ngày làm</th>
                  <th className="text-right">Lương cơ bản</th>
                  <th className="text-right">Phụ cấp</th>
                  <th className="text-right">Khấu trừ</th>
                  <th className="text-center">Trạng thái</th>
                  <th className="text-right">Thực nhận</th>
                  <th className="text-center">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {data.map((row) => (
                  <tr key={row.MaBL}>
                    <td>
                      <div className="td-primary">{row.TenNV}</div>
                      <div className="card-caption">{row.MaNV}</div>
                    </td>
                    <td className="text-center">
                      <div className="value-strong">{row.SoNgayLam} ngày</div>
                      <div className="card-caption">{Number(row.SoGioLam || 0).toFixed(1)}h</div>
                    </td>
                    <td className="text-right">{fmtMoney(row.LuongCoBan)}</td>
                    <td className="text-right value-success">+{fmtMoney(row.PhuCap)}</td>
                    <td className="text-right value-danger">-{fmtMoney(row.KhauTru)}</td>
                    <td className="text-center">
                      {row.TrangThai === "da_thanh_toan" ? (
                        <span className="badge badge-success">Đã TT</span>
                      ) : (
                        <span className="badge badge-warning">Chờ TT</span>
                      )}
                    </td>
                    <td className="text-right">
                      <span className="value-accent value-strong">{fmtMoney(row.TongLuong)}</span>
                    </td>
                    <td>
                      <div className="table-actions-center">
                        <button type="button" onClick={() => openEdit(row)} className="icon-btn" title="Sửa">
                          ✏️
                        </button>
                        {row.TrangThai === "chua_thanh_toan" && (
                          <button
                            type="button"
                            onClick={() => handleThanhToan(row.MaBL)}
                            className="icon-btn"
                            title="Xác nhận thanh toán"
                          >
                            💸
                          </button>
                        )}
                        <button type="button" onClick={() => handleDelete(row.MaBL)} className="icon-btn icon-btn-danger" title="Xóa">
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
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

      {showTinhLuong && (
        <div className="admin-modal-wrap">
          <div className="admin-modal-backdrop" onClick={() => setShowTinhLuong(false)} />
          <div className="admin-modal admin-modal-sm">
            <div className="admin-modal-header">
              <div>
                <div className="admin-modal-title">⚡ Tính Lương Hàng Loạt</div>
                <div className="admin-modal-subtitle">Tạo dữ liệu cho toàn bộ nhân viên theo tháng đã chọn</div>
              </div>
              <button type="button" onClick={() => setShowTinhLuong(false)} className="icon-btn" aria-label="Đóng">
                ✕
              </button>
            </div>
            <div className="admin-modal-body">
              <div className="info-banner">
                Tự động tạo bảng lương cho tất cả nhân viên dựa trên nhật ký chấm công của tháng được chọn.
              </div>

              {tinhMsg && <div className={tinhMsg.startsWith("✅") ? "admin-success" : "admin-error"}>{tinhMsg}</div>}

              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Tháng</label>
                  <select
                    className="admin-form-input admin-select"
                    value={tinhForm.Thang}
                    onChange={(e) => setTinhForm((prev) => ({ ...prev, Thang: e.target.value }))}
                  >
                    {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                      <option key={m} value={m}>
                        Tháng {m}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Năm</label>
                  <select
                    className="admin-form-input admin-select"
                    value={tinhForm.Nam}
                    onChange={(e) => setTinhForm((prev) => ({ ...prev, Nam: e.target.value }))}
                  >
                    {[2024, 2025, 2026, 2027].map((y) => (
                      <option key={y} value={y}>
                        {y}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group form-span-2">
                  <label className="form-label">
                    Lương cơ bản (26 ngày)<span className="required">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="100000"
                    className="admin-form-input"
                    value={tinhForm.LuongCoBanMacDinh}
                    onChange={(e) => setTinhForm((prev) => ({ ...prev, LuongCoBanMacDinh: Number(e.target.value) }))}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Phụ cấp chung</label>
                  <input
                    type="number"
                    min="0"
                    step="10000"
                    className="admin-form-input"
                    value={tinhForm.PhuCap}
                    onChange={(e) => setTinhForm((prev) => ({ ...prev, PhuCap: Number(e.target.value) }))}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Trừ quỹ/BHXH</label>
                  <input
                    type="number"
                    min="0"
                    step="10000"
                    className="admin-form-input"
                    value={tinhForm.KhauTru}
                    onChange={(e) => setTinhForm((prev) => ({ ...prev, KhauTru: Number(e.target.value) }))}
                  />
                </div>
              </div>
            </div>
            <div className="admin-modal-footer">
              <button type="button" onClick={() => setShowTinhLuong(false)} className="btn btn-secondary">
                Hủy
              </button>
              <button type="button" onClick={handleTinhLuong} disabled={tinhLoading} className="btn btn-primary">
                {tinhLoading ? "Hệ thống đang tính..." : "Chạy tính lương"}
              </button>
            </div>
          </div>
        </div>
      )}

      {editRow && (
        <div className="admin-modal-wrap">
          <div className="admin-modal-backdrop" onClick={() => setEditRow(null)} />
          <div className="admin-modal admin-modal-sm">
            <div className="admin-modal-header">
              <div>
                <div className="admin-modal-title">✏️ Điều Chỉnh Cá Nhân</div>
                <div className="admin-modal-subtitle">
                  {editRow.TenNV} • Tháng {editRow.Thang}/{editRow.Nam}
                </div>
              </div>
              <button type="button" onClick={() => setEditRow(null)} className="icon-btn" aria-label="Đóng">
                ✕
              </button>
            </div>
            <div className="admin-modal-body">
              {editError && <div className="admin-error">{editError}</div>}

              <div className="form-grid">
                {[
                  ["SoNgayLam", "Số ngày làm", "number"],
                  ["SoGioLam", "Số giờ làm", "number"],
                  ["LuongCoBan", "Lương cơ bản", "number"],
                  ["PhuCap", "Phụ cấp (+)", "number"],
                  ["KhauTru", "Khấu trừ (-)", "number"],
                ].map(([key, label, type]) => (
                  <div key={key} className={`form-group ${key === "LuongCoBan" ? "form-span-2" : ""}`}>
                    <label className="form-label">{label}</label>
                    <input
                      type={type}
                      min="0"
                      className="admin-form-input"
                      value={editForm[key] || 0}
                      onChange={(e) => setEditForm((prev) => ({ ...prev, [key]: Number(e.target.value) }))}
                    />
                  </div>
                ))}

                <div className="form-group form-span-2">
                  <label className="form-label">Trạng thái thanh toán</label>
                  <select
                    className="admin-form-input admin-select"
                    value={editForm.TrangThai}
                    onChange={(e) => setEditForm((prev) => ({ ...prev, TrangThai: e.target.value }))}
                  >
                    <option value="chua_thanh_toan">⏳ Chưa thanh toán</option>
                    <option value="da_thanh_toan">✅ Đã thanh toán</option>
                  </select>
                </div>

                <div className="form-group form-span-2">
                  <label className="form-label">Ghi chú</label>
                  <input
                    type="text"
                    placeholder="Thưởng lễ, phạt đi trễ..."
                    className="admin-form-input"
                    value={editForm.GhiChu}
                    onChange={(e) => setEditForm((prev) => ({ ...prev, GhiChu: e.target.value }))}
                  />
                </div>
              </div>

              <div className="preview-card">
                <span className="preview-card-label">Hạch toán tạm tính</span>
                <span className="preview-card-value">{Number(previewTong || 0).toLocaleString("vi-VN")}₫</span>
              </div>
            </div>
            <div className="admin-modal-footer">
              <button type="button" onClick={() => setEditRow(null)} className="btn btn-secondary">
                Hủy
              </button>
              <button type="button" onClick={handleEditSave} disabled={editSaving} className="btn btn-primary">
                {editSaving ? "Đang lưu..." : "💾 Cập nhật"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BangLuongList;
