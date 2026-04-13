import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import useAdminList from "../../../hooks/useAdminList";
import adminApi from "../../../services/adminApi";
import "../../../components/admin/admin.css";

const ProductList = () => {
  const { data, total, page, setPage, q, handleSearch, loading, error, fetchData, totalPages, limit } = useAdminList("/products");
  const [deleting, setDeleting] = useState(null);

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Xóa sản phẩm "${name}"?`)) return;
    setDeleting(id);
    try {
      await adminApi.delete(`/products/${id}`);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || "Lỗi xóa sản phẩm");
    }
    finally { setDeleting(null); }
  };

  const stockBadge = (ton) => {
    if (ton === 0) return <span className="badge badge-danger">Hết hàng</span>;
    if (ton < 10) return <span className="badge badge-warning">{ton} (Sắp hết)</span>;
    return <span className="badge badge-success">{ton}</span>;
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">📦 Quản lý Sản phẩm</h1>
        <p className="page-subtitle">Kho hàng và danh sách sản phẩm</p>
      </div>
      <div className="admin-card">
        <div className="admin-card-header">
          <span className="admin-card-title">Sản phẩm ({total})</span>
          <div className="search-bar">
            <input className="admin-input" placeholder="🔍 Tìm tên, mã sản phẩm..." value={q} onChange={(e) => handleSearch(e.target.value)} />
            <Link to="/admin/products/create" className="btn btn-primary">+ Thêm sản phẩm</Link>
          </div>
        </div>
        {error && <div className="admin-error" style={{ margin: "16px 24px" }}>{error}</div>}
        {loading ? <div className="admin-loading"><div className="spinner" />Đang tải...</div> : data.length === 0 ? (
          <div className="admin-empty"><div className="admin-empty-icon">📦</div><p>Không có sản phẩm nào</p></div>
        ) : (
          <div className="table-wrapper">
            <table className="admin-table">
              <thead><tr><th>Mã SP</th><th>Tên sản phẩm</th><th>Danh mục</th><th>Giá bán</th><th>Tồn kho</th><th>Hành động</th></tr></thead>
              <tbody>
                {data.map((sp) => (
                  <tr key={sp.MaSP}>
                    <td className="td-primary">{sp.MaSP}</td>
                    <td>{sp.TenSP}</td>
                    <td><span className="badge badge-info">{sp.TenDanhMuc || "—"}</span></td>
                    <td style={{ color: "var(--admin-success)", fontWeight: 600 }}>{Number(sp.GiaBan).toLocaleString("vi-VN")}đ</td>
                    <td>{stockBadge(sp.TonKho)}</td>
                    <td>
                      <div className="action-group">
                        <Link to={`/admin/products/${sp.MaSP}/edit`} className="btn btn-secondary btn-sm">✏️ Sửa</Link>
                        <button className="btn btn-danger btn-sm" disabled={deleting === sp.MaSP} onClick={() => handleDelete(sp.MaSP, sp.TenSP)}>{deleting === sp.MaSP ? "..." : "🗑️ Xóa"}</button>
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
export default ProductList;
