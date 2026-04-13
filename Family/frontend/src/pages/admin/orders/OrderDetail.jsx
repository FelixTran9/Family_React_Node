import { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import adminApi from "../../../services/adminApi";
import "../../../components/admin/admin.css";

const STATUS_ORDER = ["chờ_xác_nhận","đã_xác_nhận","đang_giao","đã_giao"];
const STATUS_LABELS = {
  "chờ_xác_nhận": "⏳ Chờ xác nhận",
  "đã_xác_nhận":  "✅ Đã xác nhận",
  "đang_giao":    "🚚 Đang giao",
  "đã_giao":      "✔️ Đã giao",
  "đã_hủy":       "❌ Đã hủy",
};

const OrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchOrder = () => {
    setLoading(true);
    adminApi.get(`/orders/${id}`)
      .then(r => setData(r.data))
      .catch(() => setError("Không tìm thấy đơn hàng"))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchOrder(); }, [id]);

  const handleAdvance = async () => {
    const currentIdx = STATUS_ORDER.indexOf(data.don.TrangThai);
    if (currentIdx === -1 || currentIdx >= STATUS_ORDER.length - 1) return;
    const nextStatus = STATUS_ORDER[currentIdx + 1];
    if (!window.confirm(`Chuyển sang "${STATUS_LABELS[nextStatus]}"?`)) return;
    setUpdating(true);
    try {
      await adminApi.put(`/orders/${id}`, { TrangThai: nextStatus });
      setSuccess(`Đã chuyển trạng thái: ${STATUS_LABELS[nextStatus]}`);
      fetchOrder();
    } catch (err) { setError(err.response?.data?.message || "Lỗi cập nhật"); }
    finally { setUpdating(false); }
  };

  const handleCancel = async () => {
    if (!window.confirm("Hủy đơn hàng này?")) return;
    setUpdating(true);
    try {
      await adminApi.put(`/orders/${id}`, { TrangThai: "đã_hủy" });
      setSuccess("Đã hủy đơn hàng và hoàn kho");
      fetchOrder();
    } catch (err) { setError(err.response?.data?.message || "Lỗi hủy đơn"); }
    finally { setUpdating(false); }
  };

  if (loading) return <div className="admin-loading"><div className="spinner"/>Đang tải...</div>;

  const { don, chiTiet } = data || {};
  const currentIdx = STATUS_ORDER.indexOf(don?.TrangThai);

  return (
    <div>
      <div className="page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 className="page-title">📋 Chi tiết Đơn hàng</h1>
          <p className="page-subtitle"><Link to="/admin/orders" style={{ color: "var(--admin-accent)" }}>Đơn hàng</Link> / {id}</p>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {don?.TrangThai !== "đã_hủy" && don?.TrangThai !== "đã_giao" && (
            <>
              {currentIdx < STATUS_ORDER.length - 1 && (
                <button className="btn btn-success" onClick={handleAdvance} disabled={updating}>
                  ▶ Chuyển sang: {STATUS_LABELS[STATUS_ORDER[currentIdx + 1]]}
                </button>
              )}
              <button className="btn btn-danger" onClick={handleCancel} disabled={updating}>❌ Hủy đơn</button>
            </>
          )}
          <button className="btn btn-secondary" onClick={() => navigate("/admin/orders")}>← Quay lại</button>
        </div>
      </div>

      {error && <div className="admin-error">{error}</div>}
      {success && <div className="admin-success">{success}</div>}

      {/* Order Status Flow */}
      <div className="admin-card" style={{ marginBottom: 20, padding: 20 }}>
        <div style={{ display: "flex", gap: 0, alignItems: "center", flexWrap: "wrap" }}>
          {STATUS_ORDER.map((s, idx) => {
            const isDone = currentIdx >= idx;
            const isCurrent = currentIdx === idx;
            return (
              <div key={s} style={{ display: "flex", alignItems: "center" }}>
                <div style={{
                  padding: "8px 16px", borderRadius: 20, fontSize: "0.82rem", fontWeight: 600,
                  background: isCurrent ? "var(--admin-accent)" : isDone ? "rgba(108,99,255,0.15)" : "var(--admin-surface-2)",
                  color: isCurrent ? "white" : isDone ? "var(--admin-accent)" : "var(--text-muted)",
                  transition: "all 0.2s"
                }}>{STATUS_LABELS[s]}</div>
                {idx < STATUS_ORDER.length - 1 && <div style={{ width: 24, height: 2, background: isDone ? "var(--admin-accent)" : "var(--admin-border)", margin: "0 4px" }} />}
              </div>
            );
          })}
          {don?.TrangThai === "đã_hủy" && <span className="badge badge-danger" style={{ marginLeft: 12 }}>❌ Đã hủy</span>}
        </div>
      </div>

      {/* Order Info */}
      <div className="detail-grid">
        {[
          ["Mã đơn hàng", don?.MaDon], ["Khách hàng", don?.TenKH || don?.MaKH],
          ["Người bán", don?.NguoiBan], ["Ngày đặt", don?.NgayDat ? new Date(don.NgayDat).toLocaleDateString("vi-VN") : "—"],
          ["Hình thức TT", don?.HinhThucTT || "—"], ["Trạng thái", STATUS_LABELS[don?.TrangThai] || don?.TrangThai],
          ["Tiền hàng", `${Number(don?.TongTienHang||0).toLocaleString("vi-VN")}đ`],
          ["VAT", `${Number(don?.TongThueVAT||0).toLocaleString("vi-VN")}đ`],
          ["Chiết khấu", `${Number(don?.TongChietKhau||0).toLocaleString("vi-VN")}đ`],
          ["Tổng thanh toán", `${Number(don?.TongThanhToan||0).toLocaleString("vi-VN")}đ`],
        ].map(([label, value]) => (
          <div className="detail-field" key={label}>
            <div className="detail-field-label">{label}</div>
            <div className="detail-field-value">{value}</div>
          </div>
        ))}
      </div>

      {/* Items Table */}
      <div className="admin-card">
        <div className="admin-card-header"><span className="admin-card-title">Chi tiết sản phẩm ({chiTiet?.length || 0})</span></div>
        <div className="table-wrapper">
          <table className="admin-table">
            <thead><tr><th>Mã SP</th><th>Tên sản phẩm</th><th>Số lượng</th><th>Đơn giá</th><th>VAT</th><th>Thành tiền</th></tr></thead>
            <tbody>
              {chiTiet?.map(ct => (
                <tr key={ct.MaSP}>
                  <td className="td-primary">{ct.MaSP}</td>
                  <td>{ct.TenSP}</td>
                  <td>{ct.SoLuong}</td>
                  <td>{Number(ct.DonGia).toLocaleString("vi-VN")}đ</td>
                  <td>{Number(ct.ThueVAT).toLocaleString("vi-VN")}đ</td>
                  <td style={{ color: "var(--admin-success)", fontWeight: 600 }}>{Number(ct.ThanhTien).toLocaleString("vi-VN")}đ</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
export default OrderDetail;
