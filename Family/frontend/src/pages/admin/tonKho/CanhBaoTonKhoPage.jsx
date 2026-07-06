import { useState, useEffect, useCallback } from "react";
import adminApi from "../../../services/adminApi";
import "../../../components/admin/admin.css";

const LOAI_LABEL = {
  ton_kho_lau: { label: "Tồn kho lâu", color: "#f59e0b", bg: "#fef3c7" },
  sap_het_han: { label: "Sắp hết hạn", color: "#ef4444", bg: "#fee2e2" },
  da_het_han:  { label: "Đã hết hạn",  color: "#7f1d1d", bg: "#fca5a5" },
};

const MUC_DO_LABEL = {
  1: { label: "Thấp",     color: "#6b7280" },
  2: { label: "TB",       color: "#f59e0b" },
  3: { label: "Cao",      color: "#ef4444" },
  4: { label: "Khẩn cấp", color: "#7f1d1d" },
};

const TRANG_THAI_LABEL = {
  chua_xu_ly: { label: "Chưa xử lý", color: "#ef4444" },
  dang_xu_ly: { label: "Đang xử lý", color: "#f59e0b" },
  da_xu_ly:   { label: "Đã xử lý",   color: "#10b981" },
  bo_qua:     { label: "Bỏ qua",     color: "#9ca3af" },
};

const fmtDate = (d) => (d ? new Date(d).toLocaleDateString("vi-VN") : "—");

export default function CanhBaoTonKhoPage() {
  const [data, setData]       = useState([]);
  const [stats, setStats]     = useState(null);
  const [total, setTotal]     = useState(0);
  const [page, setPage]       = useState(1);
  const [loai, setLoai]       = useState("");
  const [trangThai, setTrangThai] = useState("chua_xu_ly");
  const [loading, setLoading] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [scanMsg, setScanMsg] = useState(null);
  const [xuLyId, setXuLyId]   = useState(null);
  const [modal, setModal]     = useState(null); // { id, trangThai, ghiChu }
  const limit = 15;
  const totalPages = Math.ceil(total / limit);

  const fetchStats = useCallback(async () => {
    try {
      const r = await adminApi.get("/canh-bao-ton-kho/thong-ke");
      setStats(r.data);
    } catch { /* ignore */ }
  }, []);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const p = new URLSearchParams({ loai, trangThai, page, limit });
      const r = await adminApi.get(`/canh-bao-ton-kho?${p}`);
      setData(r.data.data || []);
      setTotal(r.data.total || 0);
    } catch { setData([]); }
    finally { setLoading(false); }
  }, [loai, trangThai, page]);

  useEffect(() => { fetchStats(); }, [fetchStats]);
  useEffect(() => { fetchData(); }, [fetchData]);

  const handleQuet = async () => {
    setScanning(true);
    setScanMsg(null);
    try {
      const r = await adminApi.post("/canh-bao-ton-kho/quet");
      setScanMsg({ type: "success", text: `✅ Quét xong! ${r.data.soLoQuet} lô, tạo ${r.data.soCanhBaoTao} cảnh báo mới (${r.data.thoiGianMs}ms)` });
      fetchStats();
      fetchData();
    } catch (e) {
      setScanMsg({ type: "error", text: "❌ Lỗi quét: " + (e.response?.data?.message || e.message) });
    } finally { setScanning(false); }
  };

  const handleXuLy = async () => {
    if (!modal) return;
    setXuLyId(modal.id);
    try {
      await adminApi.patch(`/canh-bao-ton-kho/${modal.id}/xu-ly`, {
        TrangThai: modal.trangThai,
        GhiChuXuLy: modal.ghiChu,
      });
      setModal(null);
      fetchData();
      fetchStats();
    } catch (e) {
      alert("Lỗi xử lý: " + (e.response?.data?.message || e.message));
    } finally { setXuLyId(null); }
  };

  return (
    <div className="admin-page-stack">
      {/* Header */}
      <div className="page-header page-header-row">
        <div>
          <h1 className="page-title">⚠️ Cảnh báo tồn kho</h1>
          <p className="page-subtitle">Phát hiện hàng tồn lâu ngày, sắp hết hạn hoặc đã hết hạn sử dụng</p>
        </div>
        <button
          className={`btn btn-primary ${scanning ? "btn-loading" : ""}`}
          onClick={handleQuet}
          disabled={scanning}
        >
          {scanning ? "⏳ Đang quét..." : "🔍 Quét cảnh báo"}
        </button>
      </div>

      {/* Scan Message */}
      {scanMsg && (
        <div style={{
          padding: "12px 18px", borderRadius: 10,
          background: scanMsg.type === "success" ? "#dcfce7" : "#fee2e2",
          color: scanMsg.type === "success" ? "#166534" : "#7f1d1d",
          fontWeight: 600, fontSize: "0.9rem",
        }}>
          {scanMsg.text}
        </div>
      )}

      {/* Stats */}
      {stats && (
        <div className="stats-grid stats-grid-tight">
          {[
            { icon: "📋", val: stats.tong,     label: "Tổng cảnh báo", cls: "primary" },
            { icon: "🔴", val: stats.chuaXuLy, label: "Chưa xử lý",   cls: "danger"  },
            { icon: "⏰", val: stats.tonKhoLau, label: "Tồn kho lâu", cls: "warning" },
            { icon: "📅", val: stats.sapHetHan, label: "Sắp hết hạn", cls: "info"    },
            { icon: "💀", val: stats.daHetHan,  label: "Đã hết hạn",  cls: "danger"  },
            { icon: "🚨", val: stats.khanCap,   label: "Khẩn cấp",    cls: "danger"  },
          ].map(s => (
            <div className="stat-card" key={s.label}>
              <div className={`stat-icon-wrap ${s.cls}`}>{s.icon}</div>
              <div>
                <div className="stat-number">{s.val}</div>
                <div className="stat-label">{s.label}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Filters */}
      <div className="admin-card">
        <div className="admin-card-header admin-card-header-stack">
          <span className="admin-card-title">Danh sách cảnh báo</span>
          <div className="filters-row">
            <div className="filter-field">
              <label className="filter-label">Loại</label>
              <select className="admin-input" value={loai} onChange={e => { setLoai(e.target.value); setPage(1); }}>
                <option value="">Tất cả</option>
                <option value="ton_kho_lau">Tồn kho lâu</option>
                <option value="sap_het_han">Sắp hết hạn</option>
                <option value="da_het_han">Đã hết hạn</option>
              </select>
            </div>
            <div className="filter-field">
              <label className="filter-label">Trạng thái</label>
              <select className="admin-input" value={trangThai} onChange={e => { setTrangThai(e.target.value); setPage(1); }}>
                <option value="">Tất cả</option>
                <option value="chua_xu_ly">Chưa xử lý</option>
                <option value="dang_xu_ly">Đang xử lý</option>
                <option value="da_xu_ly">Đã xử lý</option>
                <option value="bo_qua">Bỏ qua</option>
              </select>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="admin-loading"><div className="spinner" />Đang tải...</div>
        ) : data.length === 0 ? (
          <div className="admin-empty">
            <div className="admin-empty-icon">✅</div>
            <p>Không có cảnh báo nào với bộ lọc hiện tại.</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Loại</th>
                  <th>Sản phẩm</th>
                  <th>Lô hàng</th>
                  <th>Nội dung</th>
                  <th className="text-center">Mức độ</th>
                  <th>Ngày tạo</th>
                  <th className="text-center">Trạng thái</th>
                  <th className="text-center">Xử lý</th>
                </tr>
              </thead>
              <tbody>
                {data.map(cb => {
                  const loaiInfo = LOAI_LABEL[cb.LoaiCanhBao] || {};
                  const mucDo   = MUC_DO_LABEL[cb.MucDoUuTien] || {};
                  const tt      = TRANG_THAI_LABEL[cb.TrangThai] || {};
                  return (
                    <tr key={cb.MaCanhBao}>
                      <td>
                        <span style={{ background: loaiInfo.bg, color: loaiInfo.color, padding: "2px 10px", borderRadius: 20, fontSize: "0.78rem", fontWeight: 700 }}>
                          {loaiInfo.label}
                        </span>
                      </td>
                      <td className="td-primary">{cb.TenSP || cb.MaSP}</td>
                      <td><span className="badge badge-primary">{cb.MaLo || "—"}</span></td>
                      <td style={{ maxWidth: 280, fontSize: "0.82rem", color: "#64748b" }}>{cb.NoiDung}</td>
                      <td className="text-center">
                        <span style={{ color: mucDo.color, fontWeight: 700, fontSize: "0.8rem" }}>{mucDo.label}</span>
                      </td>
                      <td>{fmtDate(cb.NgayCanhBao)}</td>
                      <td className="text-center">
                        <span style={{ color: tt.color, fontWeight: 600, fontSize: "0.8rem" }}>{tt.label}</span>
                      </td>
                      <td className="text-center">
                        {cb.TrangThai === "chua_xu_ly" || cb.TrangThai === "dang_xu_ly" ? (
                          <button
                            className="btn btn-secondary btn-sm"
                            onClick={() => setModal({ id: cb.MaCanhBao, trangThai: "da_xu_ly", ghiChu: "" })}
                            disabled={xuLyId === cb.MaCanhBao}
                          >
                            Xử lý
                          </button>
                        ) : (
                          <span style={{ color: "#9ca3af", fontSize: "0.78rem" }}>—</span>
                        )}
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
            <span className="pagination-info">
              {(page - 1) * limit + 1}–{Math.min(page * limit, total)} / {total}
            </span>
            <div className="pagination-btns">
              <button className="page-btn" onClick={() => setPage(p => p - 1)} disabled={page === 1}>←</button>
              {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => i + 1).map(n => (
                <button key={n} className={`page-btn ${n === page ? "active" : ""}`} onClick={() => setPage(n)}>{n}</button>
              ))}
              <button className="page-btn" onClick={() => setPage(p => p + 1)} disabled={page === totalPages}>→</button>
            </div>
          </div>
        )}
      </div>

      {/* Modal xử lý */}
      {modal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div style={{ background: "#fff", borderRadius: 16, padding: 32, width: 420, boxShadow: "0 20px 60px rgba(0,0,0,0.3)" }}>
            <h3 style={{ margin: "0 0 16px", fontSize: "1.1rem" }}>🔧 Xử lý cảnh báo #{modal.id}</h3>
            <div className="filter-field" style={{ marginBottom: 12 }}>
              <label className="filter-label">Kết quả xử lý</label>
              <select className="admin-input" value={modal.trangThai} onChange={e => setModal(m => ({ ...m, trangThai: e.target.value }))}>
                <option value="dang_xu_ly">Đang xử lý</option>
                <option value="da_xu_ly">Đã xử lý xong</option>
                <option value="bo_qua">Bỏ qua</option>
              </select>
            </div>
            <div className="filter-field" style={{ marginBottom: 20 }}>
              <label className="filter-label">Ghi chú</label>
              <textarea
                className="admin-input"
                rows={3}
                placeholder="Mô tả cách xử lý..."
                value={modal.ghiChu}
                onChange={e => setModal(m => ({ ...m, ghiChu: e.target.value }))}
                style={{ resize: "vertical" }}
              />
            </div>
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button className="btn btn-secondary" onClick={() => setModal(null)}>Hủy</button>
              <button className="btn btn-primary" onClick={handleXuLy} disabled={!!xuLyId}>
                {xuLyId ? "Đang lưu..." : "Lưu"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
