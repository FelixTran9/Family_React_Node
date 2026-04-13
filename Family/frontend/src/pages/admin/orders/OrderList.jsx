import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import useAdminList from "../../../hooks/useAdminList";
import adminApi from "../../../services/adminApi";
import "../../../components/admin/admin.css";

const STATUS_BADGES = {
  "chờ_xác_nhận": ["badge-warning", "⏳ Chờ xác nhận"],
  "đã_xác_nhận":  ["badge-info",    "✅ Đã xác nhận"],
  "đang_giao":    ["badge-primary",  "🚚 Đang giao"],
  "đã_giao":      ["badge-success",  "✔️ Đã giao"],
  "đã_hủy":       ["badge-danger",   "❌ Đã hủy"],
};

const OrderList = () => {
  const { data, total, page, setPage, q, handleSearch, loading, error, fetchData, totalPages, limit } = useAdminList("/orders");
  const navigate = useNavigate();
  const [deleting, setDeleting] = useState(null);

  const handleDelete = async (id) => {
    if (!window.confirm(`Xóa vĩnh viễn đơn hàng ${id}?`)) return;
    setDeleting(id);
    try { await adminApi.delete(`/orders/${id}`); fetchData(); }
    catch { alert("Lỗi xóa đơn hàng"); }
    finally { setDeleting(null); }
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">🛒 Quản lý Đơn hàng</h1>
        <p className="page-subtitle">Xem và quản lý tất cả đơn hàng</p>
      </div>
      <div className="admin-card">
        <div className="admin-card-header">
          <span className="admin-card-title">Đơn hàng ({total})</span>
          <div className="search-bar">
            <input className="admin-input" placeholder="🔍 Tìm mã đơn, khách hàng..." value={q} onChange={e => handleSearch(e.target.value)} />
            <Link to="/admin/orders/create" className="btn btn-primary">+ Tạo đơn hàng</Link>
          </div>
        </div>
        {error && <div className="admin-error" style={{ margin: "16px 24px" }}>{error}</div>}
        {loading ? <div className="admin-loading"><div className="spinner" />Đang tải...</div> : data.length === 0 ? (
          <div className="admin-empty"><div className="admin-empty-icon">🛒</div><p>Chưa có đơn hàng nào</p></div>
        ) : (
          <div className="table-wrapper">
            <table className="admin-table">
              <thead><tr><th>Mã đơn</th><th>Khách hàng</th><th>Ngày đặt</th><th>Tổng tiền</th><th>TT thanh toán</th><th>Trạng thái</th><th>Hành động</th></tr></thead>
              <tbody>
                {data.map(d => {
                  const [cls, label] = STATUS_BADGES[d.TrangThai] || ["badge-muted", d.TrangThai];
                  return (
                    <tr key={d.MaDon}>
                      <td className="td-primary">{d.MaDon}</td>
                      <td>{d.TenKH || d.MaKH}</td>
                      <td style={{ color: "var(--text-muted)", fontSize: "0.83rem" }}>{d.NgayDat ? new Date(d.NgayDat).toLocaleDateString("vi-VN") : "—"}</td>
                      <td style={{ color: "var(--admin-success)", fontWeight: 600 }}>{Number(d.TongThanhToan).toLocaleString("vi-VN")}đ</td>
                      <td><span className="badge badge-muted">{d.HinhThucTT || "—"}</span></td>
                      <td><span className={`badge ${cls}`}>{label}</span></td>
                      <td>
                        <div className="action-group">
                          <button className="btn btn-secondary btn-sm" onClick={() => navigate(`/admin/orders/${d.MaDon}`)}>👁 Xem</button>
                          <button className="btn btn-secondary btn-sm" onClick={() => navigate(`/admin/orders/${d.MaDon}/edit`)}>✏️ Sửa</button>
                          <button className="btn btn-danger btn-sm" disabled={deleting === d.MaDon} onClick={() => handleDelete(d.MaDon)}>{deleting === d.MaDon ? "..." : "🗑️"}</button>
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
            <span className="pagination-info">Hiển thị {(page-1)*limit+1}–{Math.min(page*limit,total)} / {total}</span>
            <div className="pagination-btns">
              <button className="page-btn" onClick={() => setPage(p=>p-1)} disabled={page===1}>◀</button>
              {Array.from({length:totalPages},(_,i)=>i+1).map(n=><button key={n} className={`page-btn ${n===page?"active":""}`} onClick={()=>setPage(n)}>{n}</button>)}
              <button className="page-btn" onClick={() => setPage(p=>p+1)} disabled={page===totalPages}>▶</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
export default OrderList;
