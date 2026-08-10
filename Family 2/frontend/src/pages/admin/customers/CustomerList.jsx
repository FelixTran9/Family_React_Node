import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import useAdminList from "../../../hooks/useAdminList";
import adminApi from "../../../services/adminApi";
import "../../../components/admin/admin.css";

const CustomerList = () => {
  const { data, total, page, setPage, q, handleSearch, loading, error, fetchData, totalPages, limit } = useAdminList("/customers");
  const navigate = useNavigate();
  const [deleting, setDeleting] = useState(null);

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Xóa khách hàng "${name}"?`)) return;
    setDeleting(id);
    try {
      await adminApi.delete(`/customers/${id}`);
      fetchData();
    } catch { alert("Lỗi xóa khách hàng"); }
    finally { setDeleting(null); }
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">👤 Quản lý Khách hàng</h1>
        <p className="page-subtitle">Danh sách tài khoản khách hàng</p>
      </div>
      <div className="admin-card">
        <div className="admin-card-header">
          <span className="admin-card-title">Khách hàng ({total})</span>
          <div className="search-bar">
            <input className="admin-input" placeholder="🔍 Tìm tên, SĐT, email..." value={q} onChange={e => handleSearch(e.target.value)} />
            <Link to="/admin/customers/create" className="btn btn-primary">+ Thêm khách hàng</Link>
          </div>
        </div>
        {error && <div className="admin-error" style={{ margin: "16px 24px" }}>{error}</div>}
        {loading ? (
          <div className="admin-loading"><div className="spinner"/>Đang tải...</div>
        ) : data.length === 0 ? (
          <div className="admin-empty"><div className="admin-empty-icon">👤</div><p>Chưa có khách hàng nào</p></div>
        ) : (
          <div className="table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Mã KH</th>
                  <th>Họ tên</th>
                  <th>SĐT</th>
                  <th>Email</th>
                  <th>Điểm tích lũy</th>
                  <th>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {data.map(kh => (
                  <tr key={kh.MaKH}>
                    <td className="td-primary">{kh.MaKH}</td>
                    <td>{kh.TenKH}</td>
                    <td>{kh.SDT || "—"}</td>
                    <td>{kh.Email || "—"}</td>
                    <td>
                      <span className="badge badge-info">{kh.DiemTichLuy || 0} điểm</span>
                    </td>
                    <td>
                      <div className="action-group">
                        <button className="btn btn-secondary btn-sm" onClick={() => navigate(`/admin/customers/${kh.MaKH}/edit`)}>✏️ Sửa</button>
                        <button className="btn btn-danger btn-sm" disabled={deleting===kh.MaKH} onClick={() => handleDelete(kh.MaKH, kh.TenKH)}>
                          {deleting===kh.MaKH ? "..." : "🗑️"}
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
            <span className="pagination-info">{(page-1)*limit+1}–{Math.min(page*limit,total)} / {total}</span>
            <div className="pagination-btns">
              <button className="page-btn" onClick={()=>setPage(p=>p-1)} disabled={page===1}>◀</button>
              {Array.from({length:totalPages},(_,i)=>i+1).map(n=>(
                <button key={n} className={`page-btn ${n===page?"active":""}`} onClick={()=>setPage(n)}>{n}</button>
              ))}
              <button className="page-btn" onClick={()=>setPage(p=>p+1)} disabled={page===totalPages}>▶</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
export default CustomerList;
