import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import useAdminList from "../../../hooks/useAdminList";
import adminApi from "../../../services/adminApi";
import "../../../components/admin/admin.css";

const SupplierList = () => {
  const { data, total, page, setPage, q, handleSearch, loading, error, fetchData, totalPages, limit } = useAdminList("/suppliers");
  const navigate = useNavigate();
  const [deleting, setDeleting] = useState(null);
  const handleDelete = async (id, name) => { if (!window.confirm(`Xóa nhà cung cấp "${name}"?`)) return; setDeleting(id); try { await adminApi.delete(`/suppliers/${id}`); fetchData(); } catch { alert("Lỗi xóa"); } finally { setDeleting(null); } };
  return (
    <div>
      <div className="page-header"><h1 className="page-title">🏭 Quản lý Nhà cung cấp</h1><p className="page-subtitle">Danh sách nhà cung cấp hàng hóa</p></div>
      <div className="admin-card">
        <div className="admin-card-header"><span className="admin-card-title">Nhà cung cấp ({total})</span><div className="search-bar"><input className="admin-input" placeholder="🔍 Tìm tên, mã, SĐT..." value={q} onChange={e => handleSearch(e.target.value)} /><Link to="/admin/suppliers/create" className="btn btn-primary">+ Thêm NCC</Link></div></div>
        {error && <div className="admin-error" style={{ margin: "16px 24px" }}>{error}</div>}
        {loading ? <div className="admin-loading"><div className="spinner"/>Đang tải...</div> : data.length === 0 ? <div className="admin-empty"><div className="admin-empty-icon">🏭</div><p>Chưa có nhà cung cấp nào</p></div> : (
          <div className="table-wrapper">
            <table className="admin-table">
              <thead><tr><th>Mã NCC</th><th>Tên nhà cung cấp</th><th>SĐT</th><th>Email</th><th>Địa chỉ</th><th>Hành động</th></tr></thead>
              <tbody>{data.map(ncc => (<tr key={ncc.MaNCC}><td className="td-primary">{ncc.MaNCC}</td><td style={{ fontWeight: 600 }}>{ncc.TenNCC}</td><td>{ncc.SDT||"—"}</td><td>{ncc.Email||"—"}</td><td style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>{ncc.DiaChi||"—"}</td><td><div className="action-group"><button className="btn btn-secondary btn-sm" onClick={() => navigate(`/admin/suppliers/${ncc.MaNCC}/edit`)}>✏️ Sửa</button><button className="btn btn-danger btn-sm" disabled={deleting===ncc.MaNCC} onClick={() => handleDelete(ncc.MaNCC, ncc.TenNCC)}>{deleting===ncc.MaNCC?"...":"🗑️"}</button></div></td></tr>))}</tbody>
            </table>
          </div>
        )}
        {totalPages > 1 && <div className="pagination"><span className="pagination-info">{(page-1)*limit+1}–{Math.min(page*limit,total)} / {total}</span><div className="pagination-btns"><button className="page-btn" onClick={()=>setPage(p=>p-1)} disabled={page===1}>◀</button>{Array.from({length:totalPages},(_,i)=>i+1).map(n=><button key={n} className={`page-btn ${n===page?"active":""}`} onClick={()=>setPage(n)}>{n}</button>)}<button className="page-btn" onClick={()=>setPage(p=>p+1)} disabled={page===totalPages}>▶</button></div></div>}
      </div>
    </div>
  );
};
export default SupplierList;
