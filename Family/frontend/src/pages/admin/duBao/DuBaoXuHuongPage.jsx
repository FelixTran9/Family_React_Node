import { useState, useEffect, useCallback } from "react";
import adminApi from "../../../services/adminApi";
import "../../../components/admin/admin.css";

const XU_HUONG_CONFIG = {
  tang_manh: { label: "↑↑ Tăng mạnh", color: "#059669", bg: "#d1fae5" },
  tang:       { label: "↑ Tăng",       color: "#10b981", bg: "#ecfdf5" },
  on_dinh:    { label: "→ Ổn định",    color: "#6366f1", bg: "#ede9fe" },
  giam:       { label: "↓ Giảm",       color: "#f59e0b", bg: "#fef3c7" },
  giam_manh:  { label: "↓↓ Giảm mạnh", color: "#ef4444", bg: "#fee2e2" },
};

const TRANG_THAI_DN = {
  cho_duyet:   { label: "Chờ duyệt",    color: "#f59e0b" },
  da_duyet:    { label: "Đã duyệt",     color: "#10b981" },
  da_dat_hang: { label: "Đã đặt hàng",  color: "#6366f1" },
  huy:         { label: "Đã hủy",       color: "#9ca3af" },
};

const fmtMoney = (n) => Number(n || 0).toLocaleString("vi-VN") + "₫";

export default function DuBaoXuHuongPage() {
  const [tab, setTab]           = useState("dubao"); // "dubao" | "denghi"
  const [data, setData]         = useState([]);
  const [deNghi, setDeNghi]     = useState([]);
  const [total, setTotal]       = useState(0);
  const [totalDN, setTotalDN]   = useState(0);
  const [page, setPage]         = useState(1);
  const [pageDN, setPageDN]     = useState(1);
  const [kyList, setKyList]     = useState([]);
  const [ky, setKy]             = useState("");
  const [xuHuong, setXuHuong]   = useState("");
  const [trangThaiDN, setTrangThaiDN] = useState("cho_duyet");
  const [loading, setLoading]   = useState(false);
  const [running, setRunning]   = useState(false);
  const [runMsg, setRunMsg]     = useState(null);
  const [duyetId, setDuyetId]   = useState(null);
  const limit = 15;
  const totalPages   = Math.ceil(total / limit);
  const totalPagesDN = Math.ceil(totalDN / limit);

  const fetchKy = useCallback(async () => {
    try {
      const r = await adminApi.get("/du-bao/ky");
      setKyList(r.data.data || []);
    } catch { /* ignore */ }
  }, []);

  const fetchDuBao = useCallback(async () => {
    if (tab !== "dubao") return;
    setLoading(true);
    try {
      const p = new URLSearchParams({ ky, xuHuong, page, limit });
      const r = await adminApi.get(`/du-bao?${p}`);
      setData(r.data.data || []);
      setTotal(r.data.total || 0);
    } catch { setData([]); }
    finally { setLoading(false); }
  }, [tab, ky, xuHuong, page]);

  const fetchDeNghi = useCallback(async () => {
    if (tab !== "denghi") return;
    setLoading(true);
    try {
      const p = new URLSearchParams({ trangThai: trangThaiDN, page: pageDN, limit });
      const r = await adminApi.get(`/du-bao/de-nghi/danh-sach?${p}`);
      setDeNghi(r.data.data || []);
      setTotalDN(r.data.total || 0);
    } catch { setDeNghi([]); }
    finally { setLoading(false); }
  }, [tab, trangThaiDN, pageDN]);

  useEffect(() => { fetchKy(); }, [fetchKy]);
  useEffect(() => { fetchDuBao(); }, [fetchDuBao]);
  useEffect(() => { fetchDeNghi(); }, [fetchDeNghi]);

  const handleChayDuBao = async () => {
    setRunning(true);
    setRunMsg(null);
    try {
      const r = await adminApi.post("/du-bao/chay");
      setRunMsg({ type: "success", text: `✅ Hoàn tất! ${r.data.soSanPhamPhanTich} sản phẩm, ${r.data.soDuBaoTao} dự báo mới, ${r.data.soDeNghiTao} đề nghị đặt hàng (${r.data.thoiGianMs}ms)` });
      fetchKy();
      fetchDuBao();
      fetchDeNghi();
    } catch (e) {
      setRunMsg({ type: "error", text: "❌ Lỗi: " + (e.response?.data?.message || e.message) });
    } finally { setRunning(false); }
  };

  const handleDuyet = async (id, trangThai) => {
    setDuyetId(id);
    try {
      await adminApi.patch(`/du-bao/de-nghi/${id}`, { TrangThai: trangThai });
      fetchDeNghi();
    } catch (e) {
      alert("Lỗi: " + (e.response?.data?.message || e.message));
    } finally { setDuyetId(null); }
  };

  const kyHienTai = kyList[0];

  return (
    <div className="admin-page-stack">
      {/* Header */}
      <div className="page-header page-header-row">
        <div>
          <h1 className="page-title">📈 Dự báo xu hướng bán hàng</h1>
          <p className="page-subtitle">Phân tích doanh số theo tháng · Gợi ý nhập thêm hàng khi sản phẩm tăng trưởng</p>
        </div>
        <button className={`btn btn-primary ${running ? "btn-loading" : ""}`} onClick={handleChayDuBao} disabled={running}>
          {running ? "⏳ Đang phân tích..." : "🚀 Chạy dự báo"}
        </button>
      </div>

      {runMsg && (
        <div style={{ padding: "12px 18px", borderRadius: 10, background: runMsg.type === "success" ? "#dcfce7" : "#fee2e2", color: runMsg.type === "success" ? "#166534" : "#7f1d1d", fontWeight: 600, fontSize: "0.9rem" }}>
          {runMsg.text}
        </div>
      )}

      {/* Stats kỳ gần nhất */}
      {kyHienTai && (
        <div className="stats-grid stats-grid-tight">
          {[
            { icon: "📦", val: kyHienTai.soSanPham, label: "SP phân tích" },
            { icon: "📈", val: kyHienTai.soTang,    label: "Xu hướng tăng" },
            { icon: "📉", val: kyHienTai.soGiam,    label: "Xu hướng giảm" },
            { icon: "🛒", val: kyHienTai.tongDeNghiNhap, label: "Tổng đề nghị nhập" },
          ].map(s => (
            <div className="stat-card" key={s.label}>
              <div className="stat-icon-wrap primary">{s.icon}</div>
              <div>
                <div className="stat-number">{s.val}</div>
                <div className="stat-label">{s.label} · {kyHienTai.KyDuBao}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: "flex", gap: 8, borderBottom: "2px solid #e5e7eb", paddingBottom: 0 }}>
        {[
          { key: "dubao",  label: "📊 Kết quả dự báo" },
          { key: "denghi", label: "📋 Đề nghị đặt hàng" },
        ].map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            style={{
              padding: "10px 20px", border: "none", borderRadius: "8px 8px 0 0", cursor: "pointer", fontWeight: 600, fontSize: "0.9rem",
              background: tab === t.key ? "#6366f1" : "transparent",
              color: tab === t.key ? "#fff" : "#64748b",
              borderBottom: tab === t.key ? "2px solid #6366f1" : "none",
              transition: "all 0.2s",
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab: Dự báo */}
      {tab === "dubao" && (
        <div className="admin-card">
          <div className="admin-card-header admin-card-header-stack">
            <span className="admin-card-title">Dự báo theo sản phẩm</span>
            <div className="filters-row">
              <div className="filter-field">
                <label className="filter-label">Kỳ</label>
                <select className="admin-input" value={ky} onChange={e => { setKy(e.target.value); setPage(1); }}>
                  <option value="">Mới nhất</option>
                  {kyList.map(k => <option key={k.KyDuBao} value={k.KyDuBao}>{k.KyDuBao}</option>)}
                </select>
              </div>
              <div className="filter-field">
                <label className="filter-label">Xu hướng</label>
                <select className="admin-input" value={xuHuong} onChange={e => { setXuHuong(e.target.value); setPage(1); }}>
                  <option value="">Tất cả</option>
                  <option value="tang_manh">↑↑ Tăng mạnh</option>
                  <option value="tang">↑ Tăng</option>
                  <option value="on_dinh">→ Ổn định</option>
                  <option value="giam">↓ Giảm</option>
                  <option value="giam_manh">↓↓ Giảm mạnh</option>
                </select>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="admin-loading"><div className="spinner" />Đang tải...</div>
          ) : data.length === 0 ? (
            <div className="admin-empty">
              <div className="admin-empty-icon">📊</div>
              <p>Chưa có dữ liệu. Bấm "Chạy dự báo" để bắt đầu.</p>
            </div>
          ) : (
            <div className="table-wrapper">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Sản phẩm</th>
                    <th>Danh mục</th>
                    <th className="text-center">Xu hướng</th>
                    <th className="text-right">SL dự báo</th>
                    <th className="text-right">Độ tin cậy</th>
                    <th className="text-right">Tồn kho</th>
                    <th className="text-right">Đề nghị nhập</th>
                    <th style={{ maxWidth: 220 }}>Lý do</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map(db => {
                    const xh = XU_HUONG_CONFIG[db.XuHuong] || { label: db.XuHuong, color: "#6b7280", bg: "#f3f4f6" };
                    return (
                      <tr key={db.MaDuBao}>
                        <td>
                          <div className="td-primary">{db.TenSP}</div>
                          <div style={{ fontSize: "0.73rem", color: "#9ca3af" }}>{db.MaSP} · {db.DonViTinh}</div>
                        </td>
                        <td><span className="badge badge-primary">{db.TenDanhMuc || "—"}</span></td>
                        <td className="text-center">
                          <span style={{ background: xh.bg, color: xh.color, padding: "3px 10px", borderRadius: 20, fontSize: "0.78rem", fontWeight: 700, whiteSpace: "nowrap" }}>
                            {xh.label}
                          </span>
                        </td>
                        <td className="text-right value-strong">{db.SoLuongDuBao}</td>
                        <td className="text-right">
                          <span style={{ color: db.DoTinCay >= 80 ? "#10b981" : db.DoTinCay >= 60 ? "#f59e0b" : "#ef4444", fontWeight: 700 }}>
                            {Number(db.DoTinCay || 0).toFixed(0)}%
                          </span>
                        </td>
                        <td className="text-right">
                          <span className={db.TonKho < db.DeNghiNhapThem ? "value-danger" : "value-success"} style={{ fontWeight: 700 }}>
                            {db.TonKho}
                          </span>
                        </td>
                        <td className="text-right">
                          {db.DeNghiNhapThem > 0 ? (
                            <span className="badge badge-danger">{db.DeNghiNhapThem}</span>
                          ) : (
                            <span style={{ color: "#9ca3af" }}>—</span>
                          )}
                        </td>
                        <td style={{ fontSize: "0.78rem", color: "#64748b", maxWidth: 220 }}>{db.LyDo || "—"}</td>
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
      )}

      {/* Tab: Đề nghị đặt hàng */}
      {tab === "denghi" && (
        <div className="admin-card">
          <div className="admin-card-header admin-card-header-stack">
            <span className="admin-card-title">Đề nghị đặt hàng từ dự báo</span>
            <div className="filters-row">
              <div className="filter-field">
                <label className="filter-label">Trạng thái</label>
                <select className="admin-input" value={trangThaiDN} onChange={e => { setTrangThaiDN(e.target.value); setPageDN(1); }}>
                  <option value="">Tất cả</option>
                  <option value="cho_duyet">Chờ duyệt</option>
                  <option value="da_duyet">Đã duyệt</option>
                  <option value="da_dat_hang">Đã đặt hàng</option>
                  <option value="huy">Đã hủy</option>
                </select>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="admin-loading"><div className="spinner" />Đang tải...</div>
          ) : deNghi.length === 0 ? (
            <div className="admin-empty">
              <div className="admin-empty-icon">📋</div>
              <p>Chưa có đề nghị đặt hàng nào.</p>
            </div>
          ) : (
            <div className="table-wrapper">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Sản phẩm</th>
                    <th className="text-center">Xu hướng</th>
                    <th className="text-right">SL đề nghị</th>
                    <th className="text-right">Giá vốn</th>
                    <th className="text-right">Tồn kho</th>
                    <th className="text-right">Độ tin cậy</th>
                    <th>Lý do</th>
                    <th className="text-center">Trạng thái</th>
                    <th className="text-center">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {deNghi.map(dn => {
                    const xh = XU_HUONG_CONFIG[dn.XuHuong] || {};
                    const tt = TRANG_THAI_DN[dn.TrangThai] || {};
                    return (
                      <tr key={dn.MaDeNghi}>
                        <td>
                          <div className="td-primary">{dn.TenSP}</div>
                          <div style={{ fontSize: "0.73rem", color: "#9ca3af" }}>{dn.MaSP}</div>
                        </td>
                        <td className="text-center">
                          <span style={{ background: xh.bg, color: xh.color, padding: "2px 8px", borderRadius: 20, fontSize: "0.75rem", fontWeight: 700 }}>
                            {xh.label || dn.XuHuong}
                          </span>
                        </td>
                        <td className="text-right value-strong">{dn.SoLuongDeNghi}</td>
                        <td className="text-right">{fmtMoney(dn.GiaVon)}</td>
                        <td className="text-right">
                          <span className={dn.TonKho < dn.SoLuongDeNghi ? "value-danger" : "value-success"} style={{ fontWeight: 700 }}>
                            {dn.TonKho}
                          </span>
                        </td>
                        <td className="text-right">{Number(dn.DoTinCay || 0).toFixed(0)}%</td>
                        <td style={{ fontSize: "0.78rem", color: "#64748b", maxWidth: 200 }}>{dn.LyDoDeNghi || "—"}</td>
                        <td className="text-center">
                          <span style={{ color: tt.color, fontWeight: 600, fontSize: "0.8rem" }}>{tt.label}</span>
                        </td>
                        <td className="text-center">
                          {dn.TrangThai === "cho_duyet" && (
                            <div className="table-actions-center">
                              <button
                                className="btn btn-primary btn-sm"
                                onClick={() => handleDuyet(dn.MaDeNghi, "da_duyet")}
                                disabled={duyetId === dn.MaDeNghi}
                              >
                                Duyệt
                              </button>
                              <button
                                className="btn btn-danger btn-sm"
                                onClick={() => handleDuyet(dn.MaDeNghi, "huy")}
                                disabled={duyetId === dn.MaDeNghi}
                              >
                                Hủy
                              </button>
                            </div>
                          )}
                          {dn.TrangThai === "da_duyet" && (
                            <button
                              className="btn btn-secondary btn-sm"
                              onClick={() => handleDuyet(dn.MaDeNghi, "da_dat_hang")}
                              disabled={duyetId === dn.MaDeNghi}
                            >
                              Đặt hàng
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {totalPagesDN > 1 && (
            <div className="pagination">
              <span className="pagination-info">{(pageDN - 1) * limit + 1}–{Math.min(pageDN * limit, totalDN)} / {totalDN}</span>
              <div className="pagination-btns">
                <button className="page-btn" onClick={() => setPageDN(p => p - 1)} disabled={pageDN === 1}>←</button>
                {Array.from({ length: Math.min(totalPagesDN, 7) }, (_, i) => i + 1).map(n => (
                  <button key={n} className={`page-btn ${n === pageDN ? "active" : ""}`} onClick={() => setPageDN(n)}>{n}</button>
                ))}
                <button className="page-btn" onClick={() => setPageDN(p => p + 1)} disabled={pageDN === totalPagesDN}>→</button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
