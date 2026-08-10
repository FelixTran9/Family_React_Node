import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import adminApi from "../../../services/adminApi";
import "../../../components/admin/admin.css";

const NhapHangList = () => {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [q, setQ] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const limit = 15;
  const totalPages = Math.ceil(total / limit);

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ q, page, limit, from, to });
      const res = await adminApi.get(`/nhap-hang?${params}`);
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
  }, [page, q, from, to]);

  const handleDelete = async (id) => {
    if (!window.confirm("Xóa phiếu nhập hàng này? Tồn kho sẽ được hoàn lại.")) return;
    setDeleting(id);
    try {
      await adminApi.delete(`/nhap-hang/${id}`);
      fetchData();
    } catch {
      alert("Lỗi xóa phiếu nhập");
    } finally {
      setDeleting(null);
    }
  };

  const fmtMoney = (n) => Number(n || 0).toLocaleString("vi-VN") + "₫";
  const fmtDate = (d) => (d ? new Date(d).toLocaleDateString("vi-VN") : "—");
  const totalMoney = data.reduce((sum, item) => sum + (Number(item.TongTien) || 0), 0);

  return (
    <div className="admin-page-stack">
      <div className="page-header page-header-row">
        <div>
          <h1 className="page-title">📦 Quản lý Nhập hàng</h1>
          <p className="page-subtitle">Theo dõi và kiểm soát toàn bộ phiếu nhập từ nhà phân phối</p>
        </div>
        <Link to="/admin/nhap-hang/create" className="btn btn-primary">
          + Tạo phiếu nhập
        </Link>
      </div>

      <div className="stats-grid stats-grid-tight">
        <div className="stat-card">
          <div className="stat-icon-wrap primary">📄</div>
          <div>
            <div className="stat-number">{data.length}</div>
            <div className="stat-label">Tổng phiếu trang này</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon-wrap success">💵</div>
          <div>
            <div className="stat-number value-success">{fmtMoney(totalMoney)}</div>
            <div className="stat-label">Tổng giá trị trang này</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon-wrap info">🏷️</div>
          <div>
            <div className="stat-number">{total}</div>
            <div className="stat-label">Tổng số phiếu hệ thống</div>
          </div>
        </div>
      </div>

      <div className="admin-card">
        <div className="admin-card-header admin-card-header-stack">
          <div>
            <span className="admin-card-title">Bộ lọc tìm kiếm</span>
            <p className="card-caption">Tìm theo mã phiếu, nhà cung cấp, nhân viên và khoảng ngày.</p>
          </div>
          <div className="filters-row">
            <div className="search-input-wrap">
              <span className="search-input-icon">🔍</span>
              <input
                type="text"
                className="admin-input search-input-with-icon"
                placeholder="Tìm mã phiếu, nhà cung cấp, nhân viên..."
                value={q}
                onChange={(e) => {
                  setQ(e.target.value);
                  setPage(1);
                }}
              />
            </div>
            <div className="filter-field">
              <label className="filter-label">Từ ngày</label>
              <input
                type="date"
                className="admin-input"
                value={from}
                onChange={(e) => {
                  setFrom(e.target.value);
                  setPage(1);
                }}
              />
            </div>
            <div className="filter-field">
              <label className="filter-label">Đến ngày</label>
              <input
                type="date"
                className="admin-input"
                value={to}
                onChange={(e) => {
                  setTo(e.target.value);
                  setPage(1);
                }}
              />
            </div>
            <div className="filter-actions">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => {
                  setQ("");
                  setFrom("");
                  setTo("");
                  setPage(1);
                }}
              >
                Xóa lọc
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
            <div className="admin-empty-icon">📦</div>
            <p>Chưa có dữ liệu nhập hàng phù hợp với bộ lọc hiện tại.</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Mã phiếu</th>
                  <th>Ngày nhập</th>
                  <th>Nhà cung cấp</th>
                  <th>Nhân viên</th>
                  <th className="text-center">Số dòng</th>
                  <th className="text-right">Tổng tiền</th>
                  <th className="text-center">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {data.map((nh) => (
                  <tr key={nh.MaNH}>
                    <td className="td-primary nowrap">{nh.MaNH}</td>
                    <td>{fmtDate(nh.NgayNhap)}</td>
                    <td>
                      {nh.TenNCC ? <span className="td-primary">{nh.TenNCC}</span> : <span className="badge badge-muted">Trống</span>}
                    </td>
                    <td>{nh.TenNV || "—"}</td>
                    <td className="text-center">
                      <span className="badge badge-primary">{nh.SoLuongDong} SP</span>
                    </td>
                    <td className="text-right">
                      <span className="value-success value-strong">{fmtMoney(nh.TongTien)}</span>
                    </td>
                    <td>
                      <div className="table-actions-center">
                        <button
                          type="button"
                          onClick={() => navigate(`/admin/nhap-hang/${nh.MaNH}`)}
                          className="btn btn-secondary btn-sm"
                        >
                          Chi tiết
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(nh.MaNH)}
                          disabled={deleting === nh.MaNH}
                          className="btn btn-danger btn-sm"
                        >
                          {deleting === nh.MaNH ? "..." : "Xóa"}
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
            <span className="pagination-info">
              Hiển thị {(page - 1) * limit + 1}–{Math.min(page * limit, total)} / {total}
            </span>
            <div className="pagination-btns">
              <button type="button" className="page-btn" onClick={() => setPage((p) => p - 1)} disabled={page === 1}>
                ←
              </button>
              {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => i + 1).map((n) => (
                <button
                  type="button"
                  key={n}
                  className={`page-btn ${n === page ? "active" : ""}`}
                  onClick={() => setPage(n)}
                >
                  {n}
                </button>
              ))}
              <button
                type="button"
                className="page-btn"
                onClick={() => setPage((p) => p + 1)}
                disabled={page === totalPages}
              >
                →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NhapHangList;
