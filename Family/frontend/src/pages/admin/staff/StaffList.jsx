import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import useAdminList from "../../../hooks/useAdminList";
import adminApi from "../../../services/adminApi";
import "../../../components/admin/admin.css";

const StaffList = () => {
  const { data, total, page, setPage, q, handleSearch, loading, error, fetchData, totalPages, limit } = useAdminList("/staff");
  const navigate = useNavigate();
  const [deleting, setDeleting] = useState(null);

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Vô hiệu hóa nhân viên "${name}"?`)) return;
    setDeleting(id);
    try {
      await adminApi.delete(`/staff/${id}`);
      fetchData();
    } catch {
      alert("Lỗi vô hiệu hóa nhân viên");
    } finally {
      setDeleting(null);
    }
  };

  const statusBadge = (s) => {
    if (s === "active") return <span className="badge badge-success">Hoạt động</span>;
    if (s === "inactive") return <span className="badge badge-danger">Đã khóa</span>;
    return <span className="badge badge-muted">—</span>;
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">👥 Quản lý Nhân viên</h1>
        <p className="page-subtitle">Danh sách nhân viên và trợ lý cửa hàng</p>
      </div>

      <div className="admin-card">
        <div className="admin-card-header">
          <span className="admin-card-title">Danh sách nhân viên ({total})</span>
          <div className="search-bar">
            <input
              className="admin-input"
              placeholder="🔍 Tìm tên, tài khoản, SĐT..."
              value={q}
              onChange={(e) => handleSearch(e.target.value)}
            />
            <Link to="/admin/staff/create" className="btn btn-primary">+ Thêm nhân viên</Link>
          </div>
        </div>

        {error && <div className="admin-error" style={{ margin: "16px 24px" }}>{error}</div>}

        {loading ? (
          <div className="admin-loading"><div className="spinner" /> Đang tải...</div>
        ) : data.length === 0 ? (
          <div className="admin-empty"><div className="admin-empty-icon">👥</div><p>Không có nhân viên nào</p></div>
        ) : (
          <div className="table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Mã NV</th><th>Họ tên</th><th>Tài khoản</th>
                  <th>SĐT</th><th>Trợ lý</th><th>Trạng thái</th><th>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {data.map((nv) => (
                  <tr key={nv.MaNV}>
                    <td className="td-primary">{nv.MaNV}</td>
                    <td>{nv.TenNV}</td>
                    <td><code style={{ color: "var(--admin-accent)", fontSize: "0.82rem" }}>{nv.TaiKhoan}</code></td>
                    <td>{nv.SDT || "—"}</td>
                    <td>{nv.TenTL || "—"}</td>
                    <td>{statusBadge(nv.TrangThai)}</td>
                    <td>
                      <div className="action-group">
                        <button className="btn btn-secondary btn-sm" onClick={() => navigate(`/admin/staff/${nv.MaNV}/edit`)}>✏️ Sửa</button>
                        <button className="btn btn-danger btn-sm" disabled={deleting === nv.MaNV} onClick={() => handleDelete(nv.MaNV, nv.TenNV)}>
                          {deleting === nv.MaNV ? "..." : "🚫 Khóa"}
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
            <span className="pagination-info">Hiển thị {(page - 1) * limit + 1}–{Math.min(page * limit, total)} / {total}</span>
            <div className="pagination-btns">
              <button className="page-btn" onClick={() => setPage((p) => p - 1)} disabled={page === 1}>◀</button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                <button key={n} className={`page-btn ${n === page ? "active" : ""}`} onClick={() => setPage(n)}>{n}</button>
              ))}
              <button className="page-btn" onClick={() => setPage((p) => p + 1)} disabled={page === totalPages}>▶</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StaffList;
