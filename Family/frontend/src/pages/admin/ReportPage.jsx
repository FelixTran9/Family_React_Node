import { useEffect, useState, useRef } from "react";
import adminApi from "../../services/adminApi";
import "../../components/admin/admin.css";

/* ── helpers ── */
const fmtVND = (v) =>
  Number(v || 0).toLocaleString("vi-VN", { style: "currency", currency: "VND" });

const fmtNum = (v) => Number(v || 0).toLocaleString("vi-VN");

const MONTHS = ["T1","T2","T3","T4","T5","T6","T7","T8","T9","T10","T11","T12"];
const MONTHS_FULL = ["Tháng 1","Tháng 2","Tháng 3","Tháng 4","Tháng 5","Tháng 6","Tháng 7","Tháng 8","Tháng 9","Tháng 10","Tháng 11","Tháng 12"];

const STATUS_LABEL = {
  "chờ_xác_nhận": "Chờ xác nhận",
  "đã_xác_nhận": "Đã xác nhận",
  "đang_giao": "Đang giao",
  "đã_giao": "Đã giao",
  "đã_hủy": "Đã hủy",
};
const STATUS_COLOR = {
  "chờ_xác_nhận": "#f59e0b",
  "đã_xác_nhận": "#38bdf8",
  "đang_giao": "#a78bfa",
  "đã_giao": "#22c55e",
  "đã_hủy": "#ef4444",
};

/* ── SVG Bar Chart ── */
const BarChart = ({ data, maxVal, color = "#6c63ff", labelKey = "label", valueKey = "value", height = 200 }) => {
  if (!data || data.length === 0) return <div className="admin-empty" style={{ padding: 40 }}><div className="admin-empty-icon">📊</div><p>Chưa có dữ liệu</p></div>;
  return (
    <div style={{ overflowX: "auto" }}>
      <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: height + 30, minWidth: data.length * 36, padding: "4px 0 0 0" }}>
        {data.map((d, i) => {
          const val = d[valueKey];
          const h = maxVal > 0 ? (val / maxVal) * height : 0;
          const isHighlight = i === data.length - 1 || Math.max(...data.map(x => x[valueKey])) === val;
          return (
            <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4, minWidth: 28 }}>
              <span style={{ fontSize: "0.62rem", color: "var(--text-muted)", whiteSpace: "nowrap", transform: "rotate(-30deg)", transformOrigin: "bottom center", display: "block", marginBottom: 2 }}>
                {fmtNum(val)}
              </span>
              <div
                title={`${d[labelKey]}: ${fmtNum(val)}`}
                style={{
                  width: "100%",
                  height: `${Math.max(h, val > 0 ? 4 : 0)}px`,
                  background: isHighlight
                    ? `linear-gradient(180deg,${color},${color}99)`
                    : `${color}60`,
                  borderRadius: "4px 4px 0 0",
                  transition: "height 0.5s cubic-bezier(.4,0,.2,1)",
                  cursor: "default",
                  border: isHighlight ? `1px solid ${color}` : "none",
                }}
              />
              <span style={{ fontSize: "0.65rem", color: "var(--text-muted)", whiteSpace: "nowrap", maxWidth: 44, overflow: "hidden", textOverflow: "ellipsis", textAlign: "center" }}>
                {d[labelKey]}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

/* ── SVG Donut/Pie Chart ── */
const DonutChart = ({ data, colors, labelKey = "label", valueKey = "value" }) => {
  if (!data || data.length === 0) return <div className="admin-empty" style={{ padding: 40 }}><div className="admin-empty-icon">🍩</div><p>Chưa có dữ liệu</p></div>;
  const total = data.reduce((a, d) => a + (d[valueKey] || 0), 0);
  if (total === 0) return <div className="admin-empty" style={{ padding: 40 }}><div className="admin-empty-icon">📊</div><p>Tất cả đều là 0</p></div>;
  const R = 70, r = 38, cx = 90, cy = 90;
  let cumulative = 0;
  const slices = data.map((d, i) => {
    const val = d[valueKey] || 0;
    const angle = (val / total) * 2 * Math.PI;
    const startAngle = cumulative - Math.PI / 2;
    const endAngle = startAngle + angle;
    cumulative += angle;
    const x1 = cx + R * Math.cos(startAngle), y1 = cy + R * Math.sin(startAngle);
    const x2 = cx + R * Math.cos(endAngle), y2 = cy + R * Math.sin(endAngle);
    const xi1 = cx + r * Math.cos(startAngle), yi1 = cy + r * Math.sin(startAngle);
    const xi2 = cx + r * Math.cos(endAngle), yi2 = cy + r * Math.sin(endAngle);
    const large = angle > Math.PI ? 1 : 0;
    const path = `M ${x1} ${y1} A ${R} ${R} 0 ${large} 1 ${x2} ${y2} L ${xi2} ${yi2} A ${r} ${r} 0 ${large} 0 ${xi1} ${yi1} Z`;
    return { path, color: colors[i % colors.length], label: d[labelKey], val, pct: ((val / total) * 100).toFixed(1) };
  });
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap" }}>
      <svg viewBox="0 0 180 180" width={160} height={160} style={{ flexShrink: 0 }}>
        {slices.map((s, i) => (
          <path key={i} d={s.path} fill={s.color} stroke="var(--admin-bg)" strokeWidth={2} />
        ))}
        <text x={cx} y={cy - 4} textAnchor="middle" fontSize={11} fill="var(--text-muted)">Tổng</text>
        <text x={cx} y={cy + 12} textAnchor="middle" fontSize={13} fontWeight="bold" fill="var(--text-primary)">{fmtNum(total)}</text>
      </svg>
      <div style={{ display: "flex", flexDirection: "column", gap: 8, flex: 1, minWidth: 140 }}>
        {slices.map((s, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 12, height: 12, borderRadius: 3, background: s.color, flexShrink: 0 }} />
            <div style={{ fontSize: "0.8rem" }}>
              <span style={{ color: "var(--text-secondary)" }}>{s.label}</span>
              <span style={{ color: "var(--text-muted)", marginLeft: 6 }}>{s.pct}%</span>
              <span style={{ color: "var(--text-primary)", marginLeft: 6, fontWeight: 600 }}>{fmtNum(s.val)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ── Line Chart ── */
const LineChart = ({ data, valueKey = "value", labelKey = "label", color = "#22c55e", height = 160 }) => {
  if (!data || data.length < 2) return <div className="admin-empty" style={{ padding: 40 }}><div className="admin-empty-icon">📈</div><p>Chưa đủ dữ liệu</p></div>;
  const vals = data.map(d => d[valueKey]);
  const max = Math.max(...vals, 1);
  const W = 560, H = height;
  const pts = data.map((d, i) => {
    const x = (i / (data.length - 1)) * (W - 20) + 10;
    const y = H - (d[valueKey] / max) * (H - 16) - 8;
    return { x, y, ...d };
  });
  const polyline = pts.map(p => `${p.x},${p.y}`).join(" ");
  const area = `10,${H} ${pts.map(p => `${p.x},${p.y}`).join(" ")} ${W - 10},${H}`;
  return (
    <div style={{ overflowX: "auto" }}>
      <svg viewBox={`0 0 ${W} ${H + 20}`} style={{ width: "100%", minWidth: 320, display: "block" }}>
        <defs>
          <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.3" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        {[0, 0.25, 0.5, 0.75, 1].map((r, i) => {
          const y = H - r * (H - 16) - 8;
          return (
            <g key={i}>
              <line x1="10" y1={y} x2={W - 10} y2={y} stroke="var(--admin-border)" strokeDasharray="4 4" />
              <text x="8" y={y - 2} fontSize={9} fill="var(--text-muted)" textAnchor="end">{fmtNum(Math.round(max * r))}</text>
            </g>
          );
        })}
        <polygon points={area} fill="url(#lineGrad)" />
        <polyline points={polyline} fill="none" stroke={color} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
        {pts.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r={3} fill={color} stroke="var(--admin-bg)" strokeWidth={1.5}>
            <title>{`${p[labelKey]}: ${fmtNum(p[valueKey])}`}</title>
          </circle>
        ))}
        {pts.filter((_, i) => i % Math.ceil(pts.length / 8) === 0).map((p, i) => (
          <text key={i} x={p.x} y={H + 14} fontSize={9} fill="var(--text-muted)" textAnchor="middle">
            {p[labelKey]}
          </text>
        ))}
      </svg>
    </div>
  );
};

/* ══════════════════════════════════════════════════════════
   MAIN REPORT PAGE
═══════════════════════════════════════════════════════════ */
const tabs = [
  { key: "revenue",   label: "💰 Doanh thu",        icon: "💰" },
  { key: "orders",    label: "🛒 Đơn hàng",          icon: "🛒" },
  { key: "inventory", label: "📦 Nhập xuất kho",     icon: "📦" },
  { key: "promotion", label: "🏷️ Khuyến mãi",       icon: "🏷️" },
];

const ReportPage = () => {
  const [activeTab, setActiveTab] = useState("revenue");
  const [year, setYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(false);

  // Data states
  const [revenueMonth, setRevenueMonth] = useState([]);
  const [dayData, setDayData]           = useState([]);
  const [orderStatus, setOrderStatus]   = useState([]);
  const [topProducts, setTopProducts]   = useState([]);
  const [inventory, setInventory]       = useState([]);
  const [promotions, setPromotions]     = useState([]);
  const [payments, setPayments]         = useState([]);

  const printRef = useRef(null);

  /* fetch all data — tách riêng từng call để lỗi 1 cái không block cái khác */
  const fetchAll = async () => {
    setLoading(true);
    const safe = (p) => p.catch(() => ({ data: null }));
    const [rm, rd, os, tp, iv, pm, py] = await Promise.all([
      safe(adminApi.get(`/dashboard/revenue-by-month?year=${year}`)),
      safe(adminApi.get("/dashboard/revenue-by-day")),
      safe(adminApi.get("/dashboard/order-status")),
      safe(adminApi.get("/dashboard/top-products")),
      safe(adminApi.get("/dashboard/inventory-report")),
      safe(adminApi.get("/dashboard/promotion-stats")),
      safe(adminApi.get("/dashboard/payment-stats")),
    ]);
    if (rm.data && Array.isArray(rm.data)) setRevenueMonth(rm.data);
    if (rd.data && Array.isArray(rd.data)) setDayData(rd.data);
    if (os.data && Array.isArray(os.data)) setOrderStatus(os.data);
    if (tp.data && Array.isArray(tp.data)) setTopProducts(tp.data);
    if (iv.data && Array.isArray(iv.data)) setInventory(iv.data);
    if (pm.data && Array.isArray(pm.data)) setPromotions(pm.data);
    if (py.data && Array.isArray(py.data)) setPayments(py.data);
    setLoading(false);
  };

  useEffect(() => { fetchAll(); }, [year]);

  /* ── PRINT ── */
  const handlePrint = () => window.print();

  /* ── EXPORT CSV ── */
  const handleExportCSV = () => {
    let csv = "", filename = "";
    if (activeTab === "revenue") {
      csv = "Tháng,Doanh thu (VND),Số đơn hàng\n"
        + revenueMonth.map((r, i) => `${MONTHS_FULL[i]},${r.revenue},${r.orderCount}`).join("\n");
      filename = `doanh-thu-${year}.csv`;
    } else if (activeTab === "orders") {
      csv = "Trạng thái,Số đơn hàng\n"
        + orderStatus.map(o => `${STATUS_LABEL[o.TrangThai] || o.TrangThai},${o.total}`).join("\n");
      filename = `don-hang-${year}.csv`;
    } else if (activeTab === "inventory") {
      csv = "Mã SP,Tên sản phẩm,Tồn kho,Đã xuất,Đơn giá (VND)\n"
        + inventory.map(r => `${r.MaSP},"${r.TenSP}",${r.TonKho},${r.totalExport},${r.GiaBan}`).join("\n");
      filename = "bao-cao-kho.csv";
    } else if (activeTab === "promotion") {
      csv = "Mã KM,Tên khuyến mãi,% Giảm,Trạng thái,Số đơn,Tổng chiết khấu\n"
        + promotions.map(p => `${p.MaKM},"${p.TenKM}",${p.PhanTramGiam},${p.TrangThai},${p.orderCount},${p.totalDiscount}`).join("\n");
      filename = "khoa-ma-khuyen-mai.csv";
    }
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = filename; a.click();
    URL.revokeObjectURL(url);
  };

  /* ── SUMMARY CARDS ── */
  const totalRevenue = revenueMonth.reduce((a, b) => a + b.revenue, 0);
  const totalOrders  = revenueMonth.reduce((a, b) => a + b.orderCount, 0);
  const totalDelivered = orderStatus.find(o => o.TrangThai === "đã_giao")?.total || 0;
  const totalCancelled = orderStatus.find(o => o.TrangThai === "đã_hủy")?.total  || 0;

  const summaryCards = [
    { label: "Tổng doanh thu", value: fmtVND(totalRevenue), icon: "💰", color: "#6c63ff" },
    { label: "Tổng đơn hàng",  value: fmtNum(totalOrders),  icon: "🛒", color: "#22c55e" },
    { label: "Đã giao thành công", value: fmtNum(totalDelivered), icon: "✅", color: "#38bdf8" },
    { label: "Đơn bị hủy",    value: fmtNum(totalCancelled), icon: "❌", color: "#ef4444" },
  ];

  const monthBarData = revenueMonth.map((r, i) => ({ label: MONTHS[i], value: r.revenue, count: r.orderCount }));
  const maxMonthRevenue = Math.max(...monthBarData.map(d => d.value), 1);

  const dayBarData = dayData.map(d => ({ label: d.day?.slice(5) || "", value: d.revenue }));
  const maxDayRevenue = Math.max(...dayBarData.map(d => d.value), 1);

  const topProductsData = topProducts.slice(0, 8).map(p => ({ label: p.TenSP?.slice(0, 10) || p.MaSP, value: p.totalSold }));
  const maxSold = Math.max(...topProductsData.map(d => d.value), 1);

  const orderStatusData = orderStatus.map(o => ({
    label: STATUS_LABEL[o.TrangThai] || o.TrangThai,
    value: Number(o.total),
  }));
  const statusColors = orderStatus.map(o => STATUS_COLOR[o.TrangThai] || "#94a3b8");

  const paymentData = payments.map(p => ({ label: p.HinhThucTT || "Khác", value: Number(p.total) }));
  const paymentColors = ["#6c63ff", "#22c55e", "#f59e0b", "#38bdf8", "#ef4444"];

  return (
    <div ref={printRef}>
      {/* Header */}
      <div className="page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 className="page-title">📊 Báo cáo & Thống kê</h1>
          <p className="page-subtitle">Phân tích doanh thu, đơn hàng, kho và hiệu quả khuyến mãi</p>
        </div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <select
            className="admin-select"
            value={year}
            onChange={e => setYear(Number(e.target.value))}
          >
            {[2023, 2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
          </select>
          <button className="btn btn-secondary" onClick={handleExportCSV} title="Xuất CSV">
            ⬇️ Xuất CSV
          </button>
          <button className="btn btn-primary" onClick={handlePrint} title="In báo cáo">
            🖨️ In báo cáo
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 16, marginBottom: 28 }}>
        {summaryCards.map((c, i) => (
          <div key={i} className="admin-card" style={{ padding: 20 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 48, height: 48, borderRadius: 10, background: `${c.color}20`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.4rem", flexShrink: 0 }}>
                {c.icon}
              </div>
              <div>
                <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: 2 }}>{c.label}</div>
                <div style={{ fontSize: "1.1rem", fontWeight: 800, color: c.color }}>{loading ? "..." : c.value}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Tab Navigation */}
      <div style={{ display: "flex", gap: 4, marginBottom: 24, flexWrap: "wrap" }}>
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={activeTab === t.key ? "btn btn-primary" : "btn btn-secondary"}
            style={{ fontSize: "0.85rem" }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading && (
        <div className="admin-loading" style={{ padding: 80 }}>
          <div className="spinner" />
          <span>Đang tải dữ liệu...</span>
        </div>
      )}

      {!loading && (
        <>
          {/* ═══ TAB: DOANH THU ═══ */}
          {activeTab === "revenue" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
              {/* Monthly Revenue Bar */}
              <div className="admin-card" style={{ padding: 24 }}>
                <div className="admin-card-header" style={{ padding: "0 0 16px 0", border: 0 }}>
                  <div>
                    <div className="admin-card-title">📊 Doanh thu theo tháng — Năm {year}</div>
                    <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: 2 }}>Đơn hàng trạng thái không bị hủy</div>
                  </div>
                </div>
                <BarChart data={monthBarData} maxVal={maxMonthRevenue} color="#6c63ff" labelKey="label" valueKey="value" height={180} />
                <div style={{ marginTop: 16, overflowX: "auto" }}>
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Tháng</th>
                        <th>Doanh thu</th>
                        <th>Số đơn</th>
                        <th>Trung bình/đơn</th>
                      </tr>
                    </thead>
                    <tbody>
                      {revenueMonth.map((r, i) => (
                        <tr key={i}>
                          <td className="td-primary">{MONTHS_FULL[i]}</td>
                          <td>{fmtVND(r.revenue)}</td>
                          <td>{fmtNum(r.orderCount)}</td>
                          <td>{r.orderCount > 0 ? fmtVND(r.revenue / r.orderCount) : "—"}</td>
                        </tr>
                      ))}
                      <tr style={{ background: "rgba(108,99,255,0.08)", fontWeight: 700 }}>
                        <td className="td-primary">Tổng cộng</td>
                        <td style={{ color: "#6c63ff", fontWeight: 800 }}>{fmtVND(totalRevenue)}</td>
                        <td style={{ color: "#6c63ff", fontWeight: 800 }}>{fmtNum(totalOrders)}</td>
                        <td>{totalOrders > 0 ? fmtVND(totalRevenue / totalOrders) : "—"}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Day trend */}
              <div className="admin-card" style={{ padding: 24 }}>
                <div className="admin-card-title" style={{ marginBottom: 16 }}>📈 Xu hướng 30 ngày gần nhất</div>
                <LineChart data={dayBarData} valueKey="value" labelKey="label" color="#22c55e" height={140} />
                {dayData.length > 0 && (
                  <div style={{ marginTop: 12, display: "flex", gap: 24, flexWrap: "wrap" }}>
                    <div>
                      <span style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>Tổng 30 ngày: </span>
                      <strong style={{ color: "#22c55e" }}>{fmtVND(dayData.reduce((a,b)=>a+b.revenue,0))}</strong>
                    </div>
                    <div>
                      <span style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>Trung bình/ngày: </span>
                      <strong style={{ color: "#22c55e" }}>{fmtVND(dayData.reduce((a,b)=>a+b.revenue,0)/Math.max(dayData.length,1))}</strong>
                    </div>
                    <div>
                      <span style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>Ngày cao nhất: </span>
                      <strong style={{ color: "#22c55e" }}>{fmtVND(Math.max(...dayData.map(d=>d.revenue)))}</strong>
                    </div>
                  </div>
                )}
              </div>

              {/* Payment breakdown */}
              <div className="admin-card" style={{ padding: 24 }}>
                <div className="admin-card-title" style={{ marginBottom: 16 }}>💳 Hình thức thanh toán</div>
                <DonutChart data={paymentData} colors={paymentColors} labelKey="label" valueKey="value" />
              </div>
            </div>
          )}

          {/* ═══ TAB: ĐƠN HÀNG ═══ */}
          {activeTab === "orders" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
                {/* Order status donut */}
                <div className="admin-card" style={{ padding: 24 }}>
                  <div className="admin-card-title" style={{ marginBottom: 16 }}>📦 Phân bổ trạng thái đơn</div>
                  <DonutChart data={orderStatusData} colors={statusColors} labelKey="label" valueKey="value" />
                </div>

                {/* Top products */}
                <div className="admin-card" style={{ padding: 24 }}>
                  <div className="admin-card-title" style={{ marginBottom: 16 }}>🔥 Top sản phẩm bán chạy</div>
                  <BarChart data={topProductsData} maxVal={maxSold} color="#f59e0b" labelKey="label" valueKey="value" height={160} />
                </div>
              </div>

              {/* Top products table */}
              <div className="admin-card">
                <div className="admin-card-header">
                  <div className="admin-card-title">🏆 Bảng xếp hạng sản phẩm bán chạy</div>
                </div>
                <div className="table-wrapper">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Mã SP</th>
                        <th>Tên sản phẩm</th>
                        <th>Đã bán</th>
                        <th>Doanh thu</th>
                      </tr>
                    </thead>
                    <tbody>
                      {topProducts.map((p, i) => (
                        <tr key={p.MaSP}>
                          <td>
                            <span style={{
                              display: "inline-flex", alignItems: "center", justifyContent: "center",
                              width: 24, height: 24, borderRadius: 6, fontSize: "0.75rem", fontWeight: 700,
                              background: i < 3 ? ["#f59e0b30","#94a3b830","#cd7f3230"][i] : "var(--admin-surface-2)",
                              color: i < 3 ? ["#f59e0b","#94a3b8","#cd7f32"][i] : "var(--text-muted)",
                            }}>
                              {i < 3 ? ["🥇","🥈","🥉"][i] : i + 1}
                            </span>
                          </td>
                          <td className="td-primary">{p.MaSP}</td>
                          <td>{p.TenSP}</td>
                          <td>
                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                              <div style={{ flex: 1, height: 6, background: "var(--admin-surface-2)", borderRadius: 3, minWidth: 60 }}>
                                <div style={{ width: `${maxSold > 0 ? (p.totalSold / maxSold) * 100 : 0}%`, height: "100%", background: "#f59e0b", borderRadius: 3 }} />
                              </div>
                              <span style={{ fontWeight: 600, color: "var(--text-primary)" }}>{fmtNum(p.totalSold)}</span>
                            </div>
                          </td>
                          <td style={{ color: "#22c55e", fontWeight: 600 }}>{fmtVND(p.totalRevenue)}</td>
                        </tr>
                      ))}
                      {topProducts.length === 0 && (
                        <tr><td colSpan={5} className="admin-empty" style={{ padding: 40 }}>Chưa có dữ liệu</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ═══ TAB: NHẬP XUẤT KHO ═══ */}
          {activeTab === "inventory" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
              {/* Summary */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(200px,1fr))", gap: 16 }}>
                {[
                  { label: "Tổng sản phẩm", value: fmtNum(inventory.length), icon: "📦", color: "#6c63ff" },
                  { label: "Tổng tồn kho", value: fmtNum(inventory.reduce((a,b)=>a+b.TonKho,0)), icon: "🏭", color: "#22c55e" },
                  { label: "Tổng đã xuất", value: fmtNum(inventory.reduce((a,b)=>a+b.totalExport,0)), icon: "📤", color: "#f59e0b" },
                  { label: "SP sắp hết (<10)", value: fmtNum(inventory.filter(p=>p.TonKho<10).length), icon: "⚠️", color: "#ef4444" },
                ].map((c,i) => (
                  <div key={i} className="admin-card" style={{ padding: 20 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <div style={{ width: 44, height: 44, borderRadius: 10, background: `${c.color}20`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.3rem", flexShrink: 0 }}>{c.icon}</div>
                      <div>
                        <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{c.label}</div>
                        <div style={{ fontSize: "1.2rem", fontWeight: 800, color: c.color }}>{c.value}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Low stock warning */}
              {inventory.filter(p=>p.TonKho<10).length > 0 && (
                <div style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.25)", borderRadius: 12, padding: 16 }}>
                  <div style={{ fontWeight: 700, color: "#ef4444", marginBottom: 8 }}>⚠️ Sản phẩm sắp hết hàng</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {inventory.filter(p=>p.TonKho<10).map(p=>(
                      <span key={p.MaSP} style={{ background: "rgba(239,68,68,0.15)", color: "#ef4444", borderRadius: 20, padding: "3px 10px", fontSize: "0.8rem" }}>
                        {p.TenSP}: còn {p.TonKho}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Inventory table */}
              <div className="admin-card">
                <div className="admin-card-header">
                  <div className="admin-card-title">📋 Báo cáo nhập xuất kho chi tiết</div>
                </div>
                <div className="table-wrapper">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Mã SP</th>
                        <th>Tên sản phẩm</th>
                        <th>Tồn kho</th>
                        <th>Đã xuất</th>
                        <th>Đơn giá</th>
                        <th>Giá trị tồn</th>
                        <th>Trạng thái</th>
                      </tr>
                    </thead>
                    <tbody>
                      {inventory.map((p) => {
                        const stockStatus = p.TonKho === 0 ? { label: "Hết hàng", cls: "badge-danger" }
                          : p.TonKho < 10 ? { label: "Sắp hết", cls: "badge-warning" }
                          : { label: "Còn hàng", cls: "badge-success" };
                        return (
                          <tr key={p.MaSP}>
                            <td className="td-primary">{p.MaSP}</td>
                            <td>{p.TenSP}</td>
                            <td>
                              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                <div style={{ width: 60, height: 5, background: "var(--admin-surface-2)", borderRadius: 3 }}>
                                  <div style={{
                                    width: `${Math.min((p.TonKho / Math.max(...inventory.map(x=>x.TonKho),1))*100,100)}%`,
                                    height: "100%",
                                    background: p.TonKho < 10 ? "#ef4444" : "#22c55e",
                                    borderRadius: 3
                                  }} />
                                </div>
                                <span style={{ fontWeight: 600 }}>{fmtNum(p.TonKho)}</span>
                              </div>
                            </td>
                            <td>{fmtNum(p.totalExport)}</td>
                            <td>{fmtVND(p.GiaBan)}</td>
                            <td style={{ color: "#6c63ff", fontWeight: 600 }}>{fmtVND(p.TonKho * p.GiaBan)}</td>
                            <td><span className={`badge ${stockStatus.cls}`}>{stockStatus.label}</span></td>
                          </tr>
                        );
                      })}
                      {inventory.length === 0 && (
                        <tr><td colSpan={7}><div className="admin-empty" style={{ padding: 40 }}>Chưa có dữ liệu</div></td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ═══ TAB: KHUYẾN MÃI ═══ */}
          {activeTab === "promotion" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
              {/* Summary */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(200px,1fr))", gap: 16 }}>
                {[
                  { label: "Tổng khuyến mãi", value: fmtNum(promotions.length), icon: "🏷️", color: "#6c63ff" },
                  { label: "Đang hoạt động", value: fmtNum(promotions.filter(p=>p.isActive).length), icon: "✅", color: "#22c55e" },
                  { label: "Đã kết thúc", value: fmtNum(promotions.filter(p=>!p.isActive).length), icon: "⏹️", color: "#94a3b8" },
                  { label: "SP được KM", value: fmtNum(promotions.reduce((a,b)=>a+b.productCount,0)), icon: "📦", color: "#38bdf8" },
                ].map((c,i) => (
                  <div key={i} className="admin-card" style={{ padding: 20 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <div style={{ width: 44, height: 44, borderRadius: 10, background: `${c.color}20`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.3rem", flexShrink: 0 }}>{c.icon}</div>
                      <div>
                        <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{c.label}</div>
                        <div style={{ fontSize: "1.1rem", fontWeight: 800, color: c.color }}>{c.value}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Promotions table */}
              <div className="admin-card">
                <div className="admin-card-header">
                  <div className="admin-card-title">📊 Hiệu quả các chương trình khuyến mãi</div>
                </div>
                <div className="table-wrapper">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Mã KM</th>
                        <th>Tên chương trình</th>
                        <th>Ghi chú</th>
                        <th>Từ ngày</th>
                        <th>Đến ngày</th>
                        <th>SP áp dụng</th>
                        <th>Giảm TB (%)</th>
                        <th>Trạng thái</th>
                      </tr>
                    </thead>
                    <tbody>
                      {promotions.map((p) => (
                        <tr key={p.MaKM}>
                          <td className="td-primary">{p.MaKM}</td>
                          <td>{p.TenKM}</td>
                          <td style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>{p.MoTa || "—"}</td>
                          <td>{p.TuNgay ? new Date(p.TuNgay).toLocaleDateString("vi-VN") : "—"}</td>
                          <td>{p.DenNgay ? new Date(p.DenNgay).toLocaleDateString("vi-VN") : "—"}</td>
                          <td>{fmtNum(p.productCount)}</td>
                          <td>
                            {p.avgDiscount > 0 ? (
                              <span className="badge badge-warning">{Number(p.avgDiscount).toFixed(1)}%</span>
                            ) : "—"}
                          </td>
                          <td>
                            <span className={`badge ${p.isActive ? "badge-success" : "badge-muted"}`}>
                              {p.isActive ? "🟢 Đang diễn ra" : "⏹️ Kết thúc"}
                            </span>
                          </td>
                        </tr>
                      ))}
                      {promotions.length === 0 && (
                        <tr><td colSpan={8}><div className="admin-empty" style={{ padding: 40 }}>Chưa có dữ liệu khuyến mãi</div></td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* Print styles */}
      <style>{`
        @media print {
          body { background: white !important; color: black !important; }
          .admin-sidebar, .btn, button, select { display: none !important; }
          .admin-card { border: 1px solid #ddd !important; background: white !important; }
          .page-title, .admin-card-title { color: black !important; }
          .admin-table th, .admin-table td { color: black !important; border-color: #ddd !important; }
        }
      `}</style>
    </div>
  );
};

export default ReportPage;
