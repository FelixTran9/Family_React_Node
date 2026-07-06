import { useState, useEffect, useCallback } from "react";
import adminApi from "../../../services/adminApi";
import "../../../components/admin/admin.css";

const HANG_CONFIG = {
  KimCuong: { label: "💎 Kim Cương", bg: "linear-gradient(135deg,#a78bfa,#7c3aed)", color: "#fff" },
  Vang:     { label: "🥇 Vàng",      bg: "linear-gradient(135deg,#fbbf24,#d97706)", color: "#fff" },
  Bac:      { label: "🥈 Bạc",       bg: "linear-gradient(135deg,#94a3b8,#64748b)", color: "#fff" },
  Dong:     { label: "🥉 Đồng",      bg: "linear-gradient(135deg,#fb923c,#c2410c)", color: "#fff" },
};

const fmtMoney = (n) => Number(n || 0).toLocaleString("vi-VN") + "₫";
const fmtDate  = (d) => (d ? new Date(d).toLocaleDateString("vi-VN") : "—");

export default function KhachHangVipPage() {
  const [data, setData]         = useState([]);
  const [total, setTotal]       = useState(0);
  const [page, setPage]         = useState(1);
  const [hang, setHang]         = useState("");
  const [ky, setKy]             = useState("");
  const [kyList, setKyList]     = useState([]);
  const [loading, setLoading]   = useState(false);
  const [running, setRunning]   = useState(false);
  const [runMsg, setRunMsg]     = useState(null);
  // Chăm sóc modal
  const [csModal, setCsModal]   = useState(null);
  const [saving, setSaving]     = useState(false);
  const limit = 15;
  const totalPages = Math.ceil(total / limit);

  const fetchKy = useCallback(async () => {
    try {
      const r = await adminApi.get("/phan-loai-khach-hang/ky");
      setKyList(r.data.data || []);
    } catch { /* ignore */ }
  }, []);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const p = new URLSearchParams({ hang, ky, page, limit });
      const r = await adminApi.get(`/phan-loai-khach-hang/khach-hang-vip?${p}`);
      setData(r.data.data || []);
      setTotal(r.data.total || 0);
    } catch { setData([]); }
    finally { setLoading(false); }
  }, [hang, ky, page]);

  useEffect(() => { fetchKy(); }, [fetchKy]);
  useEffect(() => { fetchData(); }, [fetchData]);

  const handleChayRFM = async () => {
    setRunning(true);
    setRunMsg(null);
    try {
      const r = await adminApi.post("/phan-loai-khach-hang/chay-rfm");
      setRunMsg({ type: "success", text: `✅ Phân tích xong! ${r.data.soKhachPhanLoai} khách hàng được phân loại (kỳ ${r.data.kyPhanTich}, ${r.data.thoiGianMs}ms)` });
      fetchKy();
      fetchData();
    } catch (e) {
      setRunMsg({ type: "error", text: "❌ Lỗi phân tích: " + (e.response?.data?.message || e.message) });
    } finally { setRunning(false); }
  };

  const handleSaveChamSoc = async () => {
    if (!csModal?.MaKH || !csModal?.LoaiTuongTac) {
      alert("Vui lòng chọn loại tương tác");
      return;
    }
    setSaving(true);
    try {
      await adminApi.post("/phan-loai-khach-hang/cham-soc", csModal);
      setCsModal(null);
      alert("✅ Đã ghi nhận chăm sóc khách hàng!");
    } catch (e) {
      alert("Lỗi: " + (e.response?.data?.message || e.message));
    } finally { setSaving(false); }
  };

  // Thống kê theo kỳ hiện tại
  const kyHienTai = kyList[0];

  return (
    <div className="admin-page-stack">
      {/* Header */}
      <div className="page-header page-header-row">
        <div>
          <h1 className="page-title">👑 Khách hàng VIP (RFM)</h1>
          <p className="page-subtitle">Phân tích Recency · Frequency · Monetary — xếp hạng tự động</p>
        </div>
        <button className={`btn btn-primary ${running ? "btn-loading" : ""}`} onClick={handleChayRFM} disabled={running}>
          {running ? "⏳ Đang phân tích..." : "🧮 Chạy phân tích RFM"}
        </button>
      </div>

      {runMsg && (
        <div style={{ padding: "12px 18px", borderRadius: 10, background: runMsg.type === "success" ? "#dcfce7" : "#fee2e2", color: runMsg.type === "success" ? "#166534" : "#7f1d1d", fontWeight: 600, fontSize: "0.9rem" }}>
          {runMsg.text}
        </div>
      )}

      {/* Kỳ phân tích */}
      {kyList.length > 0 && (
        <div className="stats-grid stats-grid-tight">
          {kyHienTai && [
            { icon: "💎", val: kyHienTai.kimCuong, label: "Kim Cương" },
            { icon: "🥇", val: kyHienTai.vang,      label: "Vàng"     },
            { icon: "🥈", val: kyHienTai.bac,        label: "Bạc"      },
            { icon: "🥉", val: kyHienTai.dong,        label: "Đồng"     },
            { icon: "👥", val: kyHienTai.soKhach,    label: "Tổng KH"  },
          ].map(s => (
            <div className="stat-card" key={s.label}>
              <div className="stat-icon-wrap primary">{s.icon}</div>
              <div>
                <div className="stat-number">{s.val}</div>
                <div className="stat-label">{s.label} · {kyHienTai.KyPhanTich}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Bảng danh sách */}
      <div className="admin-card">
        <div className="admin-card-header admin-card-header-stack">
          <span className="admin-card-title">Danh sách khách hàng được xếp hạng</span>
          <div className="filters-row">
            <div className="filter-field">
              <label className="filter-label">Hạng</label>
              <select className="admin-input" value={hang} onChange={e => { setHang(e.target.value); setPage(1); }}>
                <option value="">Tất cả</option>
                <option value="KimCuong">💎 Kim Cương</option>
                <option value="Vang">🥇 Vàng</option>
                <option value="Bac">🥈 Bạc</option>
                <option value="Dong">🥉 Đồng</option>
              </select>
            </div>
            <div className="filter-field">
              <label className="filter-label">Kỳ phân tích</label>
              <select className="admin-input" value={ky} onChange={e => { setKy(e.target.value); setPage(1); }}>
                <option value="">Mới nhất</option>
                {kyList.map(k => (
                  <option key={k.KyPhanTich} value={k.KyPhanTich}>{k.KyPhanTich}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="admin-loading"><div className="spinner" />Đang tải...</div>
        ) : data.length === 0 ? (
          <div className="admin-empty">
            <div className="admin-empty-icon">📊</div>
            <p>Chưa có dữ liệu. Bấm "Chạy phân tích RFM" để bắt đầu.</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Khách hàng</th>
                  <th className="text-center">Hạng</th>
                  <th className="text-right">Điểm RFM</th>
                  <th className="text-right">Tổng chi tiêu</th>
                  <th className="text-center">Số lần mua</th>
                  <th>Mua gần nhất</th>
                  <th style={{ maxWidth: 200 }}>Gợi ý ưu đãi</th>
                  <th className="text-center">Chăm sóc</th>
                </tr>
              </thead>
              <tbody>
                {data.map(kh => {
                  const hc = HANG_CONFIG[kh.HangKH] || {};
                  return (
                    <tr key={kh.MaPhanLoai}>
                      <td>
                        <div className="td-primary">{kh.TenKH}</div>
                        <div style={{ fontSize: "0.75rem", color: "#9ca3af" }}>{kh.SDT} · {kh.Email}</div>
                      </td>
                      <td className="text-center">
                        <span style={{ background: hc.bg, color: hc.color, padding: "3px 12px", borderRadius: 20, fontSize: "0.78rem", fontWeight: 700, whiteSpace: "nowrap" }}>
                          {hc.label}
                        </span>
                      </td>
                      <td className="text-right">
                        <span className="value-success value-strong">{Number(kh.DiemRFM || 0).toFixed(1)}</span>
                      </td>
                      <td className="text-right">{fmtMoney(kh.TongChiTieu)}</td>
                      <td className="text-center">
                        <span className="badge badge-primary">{kh.SoLanMua}</span>
                      </td>
                      <td>{fmtDate(kh.NgayMuaGanNhat)}</td>
                      <td style={{ fontSize: "0.78rem", color: "#64748b", maxWidth: 200 }}>
                        {kh.DeNghiUuDai || "—"}
                      </td>
                      <td className="text-center">
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => setCsModal({ MaKH: kh.MaKH, tenKH: kh.TenKH, LoaiTuongTac: "goi_dien", NoiDung: "", KetQua: "thanh_cong", GhiChu: "" })}
                        >
                          + Ghi nhận
                        </button>
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
            <span className="pagination-info">{(page - 1) * limit + 1}–{Math.min(page * limit, total)} / {total}</span>
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

      {/* Modal chăm sóc */}
      {csModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div style={{ background: "#fff", borderRadius: 16, padding: 32, width: 460, boxShadow: "0 20px 60px rgba(0,0,0,0.3)" }}>
            <h3 style={{ margin: "0 0 4px", fontSize: "1.1rem" }}>📞 Ghi nhận chăm sóc</h3>
            <p style={{ color: "#64748b", fontSize: "0.85rem", marginBottom: 20 }}>Khách hàng: <strong>{csModal.tenKH}</strong></p>

            <div className="filter-field" style={{ marginBottom: 12 }}>
              <label className="filter-label">Loại tương tác</label>
              <select className="admin-input" value={csModal.LoaiTuongTac} onChange={e => setCsModal(m => ({ ...m, LoaiTuongTac: e.target.value }))}>
                <option value="goi_dien">📞 Gọi điện</option>
                <option value="email">📧 Email</option>
                <option value="tang_qua">🎁 Tặng quà</option>
                <option value="uu_dai_rieng">💳 Ưu đãi riêng</option>
                <option value="chuc_mung">🎉 Chúc mừng</option>
              </select>
            </div>
            <div className="filter-field" style={{ marginBottom: 12 }}>
              <label className="filter-label">Nội dung</label>
              <textarea className="admin-input" rows={3} placeholder="Nội dung cuộc trao đổi..." value={csModal.NoiDung} onChange={e => setCsModal(m => ({ ...m, NoiDung: e.target.value }))} style={{ resize: "vertical" }} />
            </div>
            <div className="filter-field" style={{ marginBottom: 12 }}>
              <label className="filter-label">Kết quả</label>
              <select className="admin-input" value={csModal.KetQua} onChange={e => setCsModal(m => ({ ...m, KetQua: e.target.value }))}>
                <option value="thanh_cong">✅ Thành công</option>
                <option value="khong_lien_lac">📵 Không liên lạc được</option>
                <option value="tu_choi">❌ Từ chối</option>
              </select>
            </div>
            <div className="filter-field" style={{ marginBottom: 20 }}>
              <label className="filter-label">Ghi chú</label>
              <input className="admin-input" placeholder="Ghi chú thêm..." value={csModal.GhiChu} onChange={e => setCsModal(m => ({ ...m, GhiChu: e.target.value }))} />
            </div>
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button className="btn btn-secondary" onClick={() => setCsModal(null)}>Hủy</button>
              <button className="btn btn-primary" onClick={handleSaveChamSoc} disabled={saving}>
                {saving ? "Đang lưu..." : "Lưu"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
