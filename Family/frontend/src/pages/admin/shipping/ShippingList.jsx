import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import useAdminList from "../../../hooks/useAdminList";
import adminApi from "../../../services/adminApi";
import "../../../components/admin/admin.css";

// TrangThaiGiao values từ DB: đang_giao, đã_giao, giao_thất_bại
const shippingStatus = {
  "đang_giao":     ["badge-primary",  "🚚 Đang giao"],
  "đã_giao":       ["badge-success",  "✔️ Đã giao"],
  "giao_thất_bại": ["badge-danger",   "❌ Thất bại"],
};

const ShippingList = () => {
  const { data, total, page, setPage, q, handleSearch, loading, error, fetchData, totalPages, limit } = useAdminList("/shipping");
  const navigate = useNavigate();
  const [deleting, setDeleting] = useState(null);

  const handleDelete = async (id) => {
    if (!window.confirm(`Xóa phiếu giao ${id}?`)) return;
    setDeleting(id);
    try {
      await adminApi.delete(`/shipping/${id}`);
      fetchData();
    } catch { alert("Lỗi xóa"); }
    finally { setDeleting(null); }
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">🚚 Quản lý Giao hàng</h1>
        <p className="page-subtitle">Danh sách phiếu giao hàng</p>
      </div>
      <div className="admin-card">
        <div className="admin-card-header">
          <span className="admin-card-title">Phiếu giao ({total})</span>
          <div className="search-bar">
            <input className="admin-input" placeholder="🔍 Tìm mã, đơn hàng, người nhận..." value={q} onChange={e => handleSearch(e.target.value)} />
            <Link to="/admin/shipping/create" className="btn btn-primary">+ Tạo phiếu giao</Link>
          </div>
        </div>
        {error && <div className="admin-error" style={{ margin: "16px 24px" }}>{error}</div>}
        {loading ? (
          <div className="admin-loading"><div className="spinner"/>Đang tải...</div>
        ) : data.length === 0 ? (
          <div className="admin-empty"><div className="admin-empty-icon">🚚</div><p>Chưa có phiếu giao nào</p></div>
        ) : (
          <div className="table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Mã phiếu</th>
                  <th>Mã đơn</th>
                  <th>Người nhận</th>
                  <th>SĐT</th>
                  <th>Ngày giao</th>
                  <th>Trạng thái</th>
                  <th>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {data.map(pgh => {
                  const [cls, label] = shippingStatus[pgh.TrangThaiGiao] || ["badge-muted", pgh.TrangThaiGiao || "—"];
                  return (
                    <tr key={pgh.MaPhieuGiao}>
                      <td className="td-primary">{pgh.MaPhieuGiao}</td>
                      <td><Link to={`/admin/orders/${pgh.MaDon}`} style={{ color: "var(--admin-accent)" }}>{pgh.MaDon}</Link></td>
                      <td>{pgh.TenNguoiNhan}</td>
                      <td>{pgh.SDTNguoiNhan || "—"}</td>
                      <td style={{ color: "var(--text-muted)", fontSize: "0.83rem" }}>
                        {pgh.NgayGiao ? new Date(pgh.NgayGiao).toLocaleDateString("vi-VN") : "—"}
                      </td>
                      <td><span className={`badge ${cls}`}>{label}</span></td>
                      <td>
                        <div className="action-group">
                          <button className="btn btn-secondary btn-sm" onClick={() => navigate(`/admin/shipping/${pgh.MaPhieuGiao}/edit`)}>✏️ Sửa</button>
                          <button className="btn btn-danger btn-sm" disabled={deleting===pgh.MaPhieuGiao} onClick={() => handleDelete(pgh.MaPhieuGiao)}>
                            {deleting===pgh.MaPhieuGiao ? "..." : "🗑️"}
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
export default ShippingList;
