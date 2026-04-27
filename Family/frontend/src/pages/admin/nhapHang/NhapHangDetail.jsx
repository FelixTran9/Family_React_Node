import { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import adminApi from "../../../services/adminApi";
import "../../../components/admin/admin.css";

const NhapHangDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    adminApi
      .get(`/nhap-hang/${id}`)
      .then((r) => setData(r.data))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [id]);

  const handleDelete = async () => {
    if (!window.confirm("Xóa phiếu nhập này? Tồn kho sẽ được hoàn lại.")) return;
    setDeleting(true);
    try {
      await adminApi.delete(`/nhap-hang/${id}`);
      navigate("/admin/nhap-hang");
    } catch {
      alert("Lỗi xóa phiếu nhập");
      setDeleting(false);
    }
  };

  const fmtMoney = (n) => Number(n || 0).toLocaleString("vi-VN") + "₫";
  const fmtDate = (d) =>
    d
      ? new Date(d).toLocaleString("vi-VN", {
          hour: "2-digit",
          minute: "2-digit",
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        })
      : "—";

  if (loading) {
    return (
      <div className="admin-page-stack">
        <div className="admin-card">
          <div className="admin-loading">
            <div className="spinner" />
            Đang tải dữ liệu phiếu nhập...
          </div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="admin-page-stack">
        <div className="admin-card">
          <div className="admin-empty">
            <div className="admin-empty-icon">⚠️</div>
            <p>Không tìm thấy phiếu nhập hoặc phiếu đã bị xóa khỏi hệ thống.</p>
            <div className="summary-actions" style={{ maxWidth: 260, margin: "20px auto 0" }}>
              <Link to="/admin/nhap-hang" className="btn btn-primary">
                Quay lại danh sách
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page-stack">
      <div className="page-header page-header-row">
        <div>
          <h1 className="page-title">📄 Chi Tiết Phiếu Nhập</h1>
          <p className="page-subtitle">
            <Link to="/admin/nhap-hang">Nhập hàng</Link> / {data.MaNH}
          </p>
        </div>
        <div className="page-actions">
          <span className="info-pill">🕒 {fmtDate(data.NgayNhap)}</span>
          <button type="button" onClick={handleDelete} disabled={deleting} className="btn btn-danger">
            {deleting ? "Đang xử lý..." : "🗑️ Hủy & Xóa phiếu"}
          </button>
        </div>
      </div>

      <div className="admin-two-column">
        <div className="admin-main-column">
          <div className="admin-card">
            <div className="admin-card-header">
              <div>
                <span className="admin-card-title">Chi tiết hạch toán</span>
                <p className="card-caption">{data.chiTiet?.length || 0} mặt hàng thuộc phiếu nhập hiện tại.</p>
              </div>
              <span className="badge badge-info">{data.MaNH}</span>
            </div>

            {data.chiTiet?.length ? (
              <div className="detail-list">
                {data.chiTiet.map((ct, idx) => (
                  <div key={ct.MaCTNH} className="detail-row">
                    <div className="detail-row-index">{idx + 1}</div>
                    <div className="detail-row-main">
                      <div className="detail-row-title">{ct.TenSP || ct.MaSP}</div>
                      <div className="detail-row-meta">
                        Mã SP: {ct.MaSP} • ĐVT: {ct.DonViTinh || "—"}
                      </div>
                    </div>
                    <div className="detail-row-side">
                      <div className="detail-row-stat">
                        <div className="detail-row-stat-label">SL / Đơn giá</div>
                        <div className="detail-row-stat-value">
                          {ct.SoLuong} x {fmtMoney(ct.DonGiaNhap)}
                        </div>
                      </div>
                      <div className="detail-row-stat">
                        <div className="detail-row-stat-label">Thành tiền</div>
                        <div className="detail-row-stat-value value-success">{fmtMoney(ct.SoLuong * ct.DonGiaNhap)}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="admin-empty">
                <div className="admin-empty-icon">📦</div>
                <p>Phiếu nhập này chưa có dòng chi tiết sản phẩm.</p>
              </div>
            )}
          </div>
        </div>

        <div className="admin-side-column">
          <div className="side-stack">
            <div className="admin-form-card">
              <div className="admin-card-title">Thông tin phiếu</div>
              <p className="card-caption">Nhà cung cấp, người lập phiếu và ghi chú đi kèm.</p>

              <div className="info-list">
                <div className="info-list-item">
                  <span className="info-list-label">Nhà cung cấp</span>
                  <span className="info-list-value">{data.TenNCC || "Không có dữ liệu"}</span>
                </div>
                <div className="info-list-item">
                  <span className="info-list-label">Người lập phiếu</span>
                  <span className="info-list-value">{data.TenNV || "Không có dữ liệu"}</span>
                </div>
                <div className="info-list-item">
                  <span className="info-list-label">Ghi chú</span>
                  {data.GhiChu ? (
                    <div className="note-block">{data.GhiChu}</div>
                  ) : (
                    <span className="info-list-value">Không có ghi chú.</span>
                  )}
                </div>
              </div>
            </div>

            <div className="summary-card">
              <div className="summary-kicker">Tổng thanh toán</div>
              <div className="summary-value">{fmtMoney(data.TongTien)}</div>
              <div className="summary-meta">{data.chiTiet?.length || 0} mặt hàng sản phẩm</div>

              <div className="summary-actions">
                <Link to="/admin/nhap-hang" className="btn btn-secondary">
                  Quay lại danh sách
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NhapHangDetail;
