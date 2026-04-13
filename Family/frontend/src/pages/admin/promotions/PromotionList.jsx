import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import useAdminList from "../../../hooks/useAdminList";
import adminApi from "../../../services/adminApi";
import "../../../components/admin/admin.css";

const PromotionList = () => {
  const { data, total, page, setPage, q, handleSearch, loading, error, fetchData, totalPages, limit } = useAdminList("/promotions");
  const navigate = useNavigate();
  const [deleting, setDeleting] = useState(null);

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Xóa đợt khuyến mãi "${name}"?`)) return;
    setDeleting(id);
    try {
      await adminApi.delete(`/promotions/${id}`);
      fetchData();
    } catch { alert("Lỗi xóa"); }
    finally { setDeleting(null); }
  };

  const isActive = (tu, den) => {
    const now = new Date();
    return new Date(tu) <= now && now <= new Date(den);
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">🏷️ Quản lý Khuyến mãi</h1>
        <p className="page-subtitle">Các đợt chương trình giảm giá</p>
      </div>
      <div className="admin-card">
        <div className="admin-card-header">
          <span className="admin-card-title">Khuyến mãi ({total})</span>
          <div className="search-bar">
            <input className="admin-input" placeholder="🔍 Tìm mã, tên khuyến mãi..." value={q} onChange={e => handleSearch(e.target.value)} />
            <Link to="/admin/promotions/create" className="btn btn-primary">+ Thêm khuyến mãi</Link>
          </div>
        </div>
        {error && <div className="admin-error" style={{ margin: "16px 24px" }}>{error}</div>}
        {loading ? (
          <div className="admin-loading"><div className="spinner"/>Đang tải...</div>
        ) : data.length === 0 ? (
          <div className="admin-empty"><div className="admin-empty-icon">🏷️</div><p>Chưa có khuyến mãi nào</p></div>
        ) : (
          <div className="table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Mã KM</th>
                  <th>Tên chương trình</th>
                  <th>Từ ngày</th>
                  <th>Đến ngày</th>
                  <th>Trạng thái</th>
                  <th>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {data.map(km => {
                  const active = isActive(km.TuNgay, km.DenNgay);
                  return (
                    <tr key={km.MaKM}>
                      <td className="td-primary">{km.MaKM}</td>
                      <td>{km.TenCT}</td>
                      <td style={{ fontSize: "0.83rem", color: "var(--text-muted)" }}>
                        {km.TuNgay ? new Date(km.TuNgay).toLocaleDateString("vi-VN") : "—"}
                      </td>
                      <td style={{ fontSize: "0.83rem", color: "var(--text-muted)" }}>
                        {km.DenNgay ? new Date(km.DenNgay).toLocaleDateString("vi-VN") : "—"}
                      </td>
                      <td>
                        <span className={`badge ${active ? "badge-success" : "badge-muted"}`}>
                          {active ? "🟢 Đang diễn ra" : "⚪ Không hoạt động"}
                        </span>
                      </td>
                      <td>
                        <div className="action-group">
                          <button className="btn btn-secondary btn-sm" onClick={() => navigate(`/admin/promotions/${km.MaKM}/edit`)}>✏️ Sửa</button>
                          <button className="btn btn-danger btn-sm" disabled={deleting===km.MaKM} onClick={() => handleDelete(km.MaKM, km.TenCT)}>
                            {deleting===km.MaKM ? "..." : "🗑️"}
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
export default PromotionList;
