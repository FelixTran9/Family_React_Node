import { useEffect, useState, useRef } from "react";
import adminApi from "../../services/adminApi";
import "../../components/admin/admin.css";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  AreaChart, Area, PieChart, Pie, Cell, ComposedChart, Line
} from "recharts";

/* ── helpers ── */
const fmtVND = (v) => Number(v || 0).toLocaleString("vi-VN", { style: "currency", currency: "VND" });
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

const COLORS_PIE = ["#6c63ff", "#22c55e", "#f59e0b", "#38bdf8", "#ef4444", "#ec4899"];

/* ══════════════════════════════════════════════════════════
   MAIN REPORT PAGE
═══════════════════════════════════════════════════════════ */
const tabs = [
  { key: "revenue",   label: "💰 Doanh thu",        icon: "💰" },
  { key: "orders",    label: "🛒 Đơn hàng",          icon: "🛒" },
  { key: "inventory", label: "📦 Nhập xuất kho",     icon: "📦" },
  { key: "promotion", label: "🏷️ Khuyến mãi",       icon: "🏷️" },
];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{ background: "#fff", padding: "12px", border: "1px solid #e2e8f0", borderRadius: "8px", boxShadow: "0 4px 6px rgba(0,0,0,0.1)", fontSize: "0.85rem" }}>
        <p style={{ margin: "0 0 8px 0", fontWeight: "bold", color: "#1e293b" }}>{label}</p>
        {payload.map((entry, index) => (
          <p key={index} style={{ margin: "4px 0", color: entry.color, display: "flex", justifyContent: "space-between", gap: "16px" }}>
            <span>{entry.name}:</span> 
            <span style={{ fontWeight: 600 }}>{entry.name.includes("Doanh thu") || entry.name.includes("Giá trị") ? fmtVND(entry.value) : fmtNum(entry.value)}</span>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

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

  /* ── DATA TRANSFORM FOR RECHARTS ── */
  const monthChartData = revenueMonth.map((r, i) => ({ 
    name: MONTHS[i], 
    "Doanh thu": r.revenue, 
    "Số đơn": r.orderCount 
  }));

  const dayChartData = dayData.map(d => ({ 
    name: d.day?.slice(5) || "", 
    "Doanh thu": d.revenue 
  }));

  const topProductsChartData = topProducts.slice(0, 7).map(p => ({ 
    name: p.TenSP?.slice(0, 15) || p.MaSP, 
    "Đã bán": p.totalSold,
    "Doanh thu": p.totalRevenue 
  }));

  const orderStatusPieData = orderStatus.map(o => ({
    name: STATUS_LABEL[o.TrangThai] || o.TrangThai,
    value: Number(o.total),
    color: STATUS_COLOR[o.TrangThai] || "#94a3b8"
  }));

  const paymentPieData = payments.map((p, i) => ({ 
    name: p.HinhThucTT || "Khác", 
    value: Number(p.total),
    color: COLORS_PIE[i % COLORS_PIE.length]
  }));

  return (
    <div ref={printRef}>
      {/* Header */}
      <div className="page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 className="page-title">📊 Báo cáo & Thống kê</h1>
          <p className="page-subtitle">Phân tích doanh thu, đơn hàng, kho và hiệu quả khuyến mãi với biểu đồ trực quan</p>
        </div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <select
            className="admin-select"
            value={year}
            onChange={e => setYear(Number(e.target.value))}
            style={{ fontWeight: 600, color: "#1e293b", padding: "8px 16px" }}
          >
            {[2023, 2024, 2025, 2026].map(y => <option key={y} value={y}>Năm {y}</option>)}
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
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 20, marginBottom: 28 }}>
        {summaryCards.map((c, i) => (
          <div key={i} className="admin-card" style={{ padding: "20px 24px", transition: "transform 0.2s", cursor: "default" }} onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'none'}>
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <div style={{ width: 56, height: 56, borderRadius: 14, background: `linear-gradient(135deg, ${c.color}20, ${c.color}40)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.8rem", flexShrink: 0, boxShadow: `0 4px 12px ${c.color}30` }}>
                {c.icon}
              </div>
              <div>
                <div style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--text-muted)", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.5px" }}>{c.label}</div>
                <div style={{ fontSize: "1.35rem", fontWeight: 900, color: c.color, letterSpacing: "-0.5px" }}>{loading ? "..." : c.value}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Tab Navigation */}
      <div style={{ display: "flex", gap: 8, marginBottom: 28, flexWrap: "wrap" }}>
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={activeTab === t.key ? "btn btn-primary" : "btn btn-secondary"}
            style={{ fontSize: "0.9rem", padding: "10px 20px", borderRadius: "10px", boxShadow: activeTab === t.key ? "0 4px 12px rgba(99, 102, 241, 0.3)" : "none", border: activeTab === t.key ? "none" : "1px solid #e2e8f0" }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading && (
        <div className="admin-loading" style={{ padding: 120 }}>
          <div className="spinner" style={{ width: 40, height: 40, borderWidth: 4 }} />
          <span style={{ fontSize: "1.1rem", fontWeight: 500, marginTop: 16, color: "#64748b" }}>Đang tải dữ liệu báo cáo...</span>
        </div>
      )}

      {!loading && (
        <>
          {/* ═══ TAB: DOANH THU ═══ */}
          {activeTab === "revenue" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
              
              <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 24 }}>
                {/* Monthly Revenue Chart */}
                <div className="admin-card" style={{ padding: 24, boxShadow: "0 4px 20px rgba(0,0,0,0.03)" }}>
                  <div className="admin-card-header" style={{ padding: "0 0 20px 0", border: 0 }}>
                    <div>
                      <div className="admin-card-title" style={{ fontSize: "1.15rem" }}>📊 Tương quan Doanh thu & Đơn hàng các tháng ({year})</div>
                      <div style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginTop: 4 }}>So sánh giữa tổng doanh thu đạt được và lượng đơn hàng bán ra</div>
                    </div>
                  </div>
                  <div style={{ width: "100%", height: 350 }}>
                    <ResponsiveContainer>
                      <ComposedChart data={monthChartData} margin={{ top: 10, right: 10, left: 20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#64748b" }} dy={10} />
                        <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#64748b" }} tickFormatter={(v) => (v/1000000).toFixed(1) + "M"} />
                        <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#64748b" }} />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend wrapperStyle={{ paddingTop: 20 }} />
                        <Bar yAxisId="left" dataKey="Doanh thu" fill="#6c63ff" radius={[6, 6, 0, 0]} maxBarSize={50} animationDuration={1500} />
                        <Line yAxisId="right" type="monotone" dataKey="Số đơn" stroke="#f59e0b" strokeWidth={3} dot={{ r: 5, fill: "#f59e0b", stroke: "#fff", strokeWidth: 2 }} activeDot={{ r: 8 }} animationDuration={1500} />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 24, alignItems: "start" }}>
                {/* 30 Days Trend Area Chart */}
                <div className="admin-card" style={{ padding: 24, boxShadow: "0 4px 20px rgba(0,0,0,0.03)" }}>
                  <div className="admin-card-title" style={{ marginBottom: 20, fontSize: "1.15rem" }}>📈 Xu hướng doanh thu 30 ngày qua</div>
                  <div style={{ width: "100%", height: 260 }}>
                    <ResponsiveContainer>
                      <AreaChart data={dayChartData} margin={{ top: 10, right: 0, left: 10, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#22c55e" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#94a3b8" }} dy={10} minTickGap={20} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#94a3b8" }} tickFormatter={(v) => (v/1000).toFixed(0) + "k"} />
                        <Tooltip content={<CustomTooltip />} />
                        <Area type="monotone" dataKey="Doanh thu" stroke="#22c55e" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" animationDuration={1500} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                  {dayData.length > 0 && (
                    <div style={{ marginTop: 20, display: "flex", gap: 24, flexWrap: "wrap", padding: "16px", background: "#f8fafc", borderRadius: 12 }}>
                      <div>
                        <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>Tổng 30 ngày: </span>
                        <strong style={{ color: "#22c55e", fontSize: "1.1rem" }}>{fmtVND(dayData.reduce((a,b)=>a+b.revenue,0))}</strong>
                      </div>
                      <div>
                        <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>Ngày cao nhất: </span>
                        <strong style={{ color: "#22c55e", fontSize: "1.1rem" }}>{fmtVND(Math.max(...dayData.map(d=>d.revenue)))}</strong>
                      </div>
                    </div>
                  )}
                </div>

                {/* Payment Breakdown */}
                <div className="admin-card" style={{ padding: 24, boxShadow: "0 4px 20px rgba(0,0,0,0.03)" }}>
                  <div className="admin-card-title" style={{ marginBottom: 12, fontSize: "1.15rem" }}>💳 Thanh toán</div>
                  <div style={{ width: "100%", height: 260 }}>
                    <ResponsiveContainer>
                      <PieChart>
                        <Pie data={paymentPieData} cx="50%" cy="50%" innerRadius={65} outerRadius={90} paddingAngle={4} dataKey="value" animationDuration={1200}>
                          {paymentPieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                        <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: "0.85rem" }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* ═══ TAB: ĐƠN HÀNG ═══ */}
          {activeTab === "orders" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 24, alignItems: "start" }}>
                
                {/* Order status donut */}
                <div className="admin-card" style={{ padding: 24, boxShadow: "0 4px 20px rgba(0,0,0,0.03)" }}>
                  <div className="admin-card-title" style={{ marginBottom: 16, fontSize: "1.15rem" }}>📦 Phân bổ trạng thái đơn</div>
                  <div style={{ width: "100%", height: 300 }}>
                    <ResponsiveContainer>
                      <PieChart>
                        <Pie data={orderStatusPieData} cx="50%" cy="50%" innerRadius={70} outerRadius={100} paddingAngle={3} dataKey="value" labelLine={false} animationDuration={1200}>
                          {orderStatusPieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                        <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: "0.85rem" }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Top products BarChart */}
                <div className="admin-card" style={{ padding: 24, boxShadow: "0 4px 20px rgba(0,0,0,0.03)" }}>
                  <div className="admin-card-title" style={{ marginBottom: 16, fontSize: "1.15rem" }}>🔥 Top 7 Sản phẩm bán chạy</div>
                  <div style={{ width: "100%", height: 300 }}>
                    <ResponsiveContainer>
                      <BarChart data={topProductsChartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                        <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#94a3b8" }} />
                        <YAxis type="category" dataKey="name" width={110} axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#475569" }} />
                        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(245, 158, 11, 0.1)' }} />
                        <Bar dataKey="Đã bán" fill="#f59e0b" radius={[0, 6, 6, 0]} maxBarSize={30} animationDuration={1200}>
                          {topProductsChartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={index === 0 ? "#ea580c" : "#f59e0b"} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* Top products table */}
              <div className="admin-card" style={{ boxShadow: "0 4px 20px rgba(0,0,0,0.03)" }}>
                <div className="admin-card-header" style={{ padding: "20px 24px" }}>
                  <div className="admin-card-title">🏆 Bảng xếp hạng sản phẩm bán chạy chi tiết</div>
                </div>
                <div className="table-wrapper">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Mã SP</th>
                        <th>Tên sản phẩm</th>
                        <th>Đã bán</th>
                        <th>Doanh thu sinh ra</th>
                      </tr>
                    </thead>
                    <tbody>
                      {topProducts.map((p, i) => (
                        <tr key={p.MaSP} style={{ transition: "background 0.2s" }} onMouseEnter={e => e.currentTarget.style.background="#f8fafc"} onMouseLeave={e => e.currentTarget.style.background="transparent"}>
                          <td>
                            <span style={{
                              display: "inline-flex", alignItems: "center", justifyContent: "center",
                              width: 28, height: 28, borderRadius: 8, fontSize: "0.85rem", fontWeight: 700,
                              background: i < 3 ? ["#f59e0b30","#94a3b830","#cd7f3230"][i] : "var(--admin-surface-2)",
                              color: i < 3 ? ["#f59e0b","#94a3b8","#cd7f32"][i] : "var(--text-muted)",
                            }}>
                              {i < 3 ? ["🥇","🥈","🥉"][i] : i + 1}
                            </span>
                          </td>
                          <td className="td-primary">{p.MaSP}</td>
                          <td style={{ fontWeight: 500, color: "#334155" }}>{p.TenSP}</td>
                          <td>
                            <span style={{ fontWeight: 800, color: "#f59e0b", background: "#fef3c7", padding: "4px 10px", borderRadius: "20px", fontSize: "0.85rem" }}>
                              {fmtNum(p.totalSold)}
                            </span>
                          </td>
                          <td style={{ color: "#22c55e", fontWeight: 700, fontSize: "0.95rem" }}>{fmtVND(p.totalRevenue)}</td>
                        </tr>
                      ))}
                      {topProducts.length === 0 && (
                        <tr><td colSpan={5} className="admin-empty" style={{ padding: 60 }}>Chưa có dữ liệu</td></tr>
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
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(220px,1fr))", gap: 20 }}>
                {[
                  { label: "Tổng sản phẩm", value: fmtNum(inventory.length), icon: "📦", color: "#6c63ff" },
                  { label: "Tổng tồn kho", value: fmtNum(inventory.reduce((a,b)=>a+b.TonKho,0)), icon: "🏭", color: "#22c55e" },
                  { label: "Tổng xuất bán", value: fmtNum(inventory.reduce((a,b)=>a+b.totalExport,0)), icon: "📤", color: "#06b6d4" },
                  { label: "SP sắp hết (<10)", value: fmtNum(inventory.filter(p=>p.TonKho<10).length), icon: "⚠️", color: "#ef4444" },
                ].map((c,i) => (
                  <div key={i} className="admin-card" style={{ padding: 20, boxShadow: "0 4px 12px rgba(0,0,0,0.02)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                      <div style={{ width: 52, height: 52, borderRadius: 12, background: `linear-gradient(135deg, ${c.color}20, ${c.color}40)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.5rem", flexShrink: 0 }}>{c.icon}</div>
                      <div>
                        <div style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase" }}>{c.label}</div>
                        <div style={{ fontSize: "1.3rem", fontWeight: 800, color: c.color }}>{c.value}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Low stock warning */}
              {inventory.filter(p=>p.TonKho<10).length > 0 && (
                <div style={{ background: "linear-gradient(to right, #fef2f2, #fff)", borderLeft: "4px solid #ef4444", borderRadius: "0 12px 12px 0", padding: 20, boxShadow: "0 2px 10px rgba(239, 68, 68, 0.05)" }}>
                  <div style={{ fontWeight: 800, color: "#ef4444", marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: "1.2rem" }}>⚠️</span> Cảnh báo: Các sản phẩm sắp hết hàng
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                    {inventory.filter(p=>p.TonKho<10).map(p=>(
                      <span key={p.MaSP} style={{ background: "#fff", border: "1px solid #fca5a5", color: "#b91c1c", borderRadius: 20, padding: "4px 12px", fontSize: "0.85rem", fontWeight: 600, boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
                        {p.TenSP}: <strong style={{ color: "#ef4444" }}>Còn {p.TonKho}</strong>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Inventory table */}
              <div className="admin-card" style={{ boxShadow: "0 4px 20px rgba(0,0,0,0.03)" }}>
                <div className="admin-card-header" style={{ padding: "20px 24px" }}>
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
                          <tr key={p.MaSP} style={{ transition: "background 0.2s" }} onMouseEnter={e => e.currentTarget.style.background="#f8fafc"} onMouseLeave={e => e.currentTarget.style.background="transparent"}>
                            <td className="td-primary">{p.MaSP}</td>
                            <td style={{ fontWeight: 500, color: "#334155" }}>{p.TenSP}</td>
                            <td>
                              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                <div style={{ width: 70, height: 6, background: "var(--admin-surface-2)", borderRadius: 3 }}>
                                  <div style={{
                                    width: `${Math.min((p.TonKho / Math.max(...inventory.map(x=>x.TonKho),1))*100,100)}%`,
                                    height: "100%",
                                    background: p.TonKho < 10 ? "#ef4444" : "#22c55e",
                                    borderRadius: 3
                                  }} />
                                </div>
                                <span style={{ fontWeight: 800, color: p.TonKho < 10 ? "#ef4444" : "#22c55e" }}>{fmtNum(p.TonKho)}</span>
                              </div>
                            </td>
                            <td><span style={{ fontWeight: 600, color: "#64748b" }}>{fmtNum(p.totalExport)}</span></td>
                            <td>{fmtVND(p.GiaBan)}</td>
                            <td style={{ color: "#6c63ff", fontWeight: 700 }}>{fmtVND(p.TonKho * p.GiaBan)}</td>
                            <td><span className={`badge ${stockStatus.cls}`} style={{ padding: "4px 10px", fontSize: "0.75rem" }}>{stockStatus.label}</span></td>
                          </tr>
                        );
                      })}
                      {inventory.length === 0 && (
                        <tr><td colSpan={7}><div className="admin-empty" style={{ padding: 60 }}>Chưa có dữ liệu</div></td></tr>
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
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(220px,1fr))", gap: 20 }}>
                {[
                  { label: "Tổng chương trình", value: fmtNum(promotions.length), icon: "🏷️", color: "#6c63ff" },
                  { label: "Đang hoạt động", value: fmtNum(promotions.filter(p=>p.isActive).length), icon: "✅", color: "#22c55e" },
                  { label: "Đã kết thúc", value: fmtNum(promotions.filter(p=>!p.isActive).length), icon: "⏹️", color: "#94a3b8" },
                  { label: "SP áp dụng KM", value: fmtNum(promotions.reduce((a,b)=>a+b.productCount,0)), icon: "🎁", color: "#ec4899" },
                ].map((c,i) => (
                  <div key={i} className="admin-card" style={{ padding: 20, boxShadow: "0 4px 12px rgba(0,0,0,0.02)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                      <div style={{ width: 52, height: 52, borderRadius: 12, background: `linear-gradient(135deg, ${c.color}20, ${c.color}40)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.5rem", flexShrink: 0 }}>{c.icon}</div>
                      <div>
                        <div style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase" }}>{c.label}</div>
                        <div style={{ fontSize: "1.3rem", fontWeight: 800, color: c.color }}>{c.value}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Promotions table */}
              <div className="admin-card" style={{ boxShadow: "0 4px 20px rgba(0,0,0,0.03)" }}>
                <div className="admin-card-header" style={{ padding: "20px 24px" }}>
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
                        <tr key={p.MaKM} style={{ transition: "background 0.2s" }} onMouseEnter={e => e.currentTarget.style.background="#f8fafc"} onMouseLeave={e => e.currentTarget.style.background="transparent"}>
                          <td className="td-primary">{p.MaKM}</td>
                          <td style={{ fontWeight: 600, color: "#334155" }}>{p.TenKM}</td>
                          <td style={{ fontSize: "0.85rem", color: "#64748b" }}>{p.MoTa || "—"}</td>
                          <td style={{ fontSize: "0.85rem", fontWeight: 500 }}>{p.TuNgay ? new Date(p.TuNgay).toLocaleDateString("vi-VN") : "—"}</td>
                          <td style={{ fontSize: "0.85rem", fontWeight: 500 }}>{p.DenNgay ? new Date(p.DenNgay).toLocaleDateString("vi-VN") : "—"}</td>
                          <td>
                            <span style={{ fontWeight: 800, color: "#ec4899", background: "#fdf2f8", padding: "4px 10px", borderRadius: "20px", fontSize: "0.85rem" }}>
                              {fmtNum(p.productCount)}
                            </span>
                          </td>
                          <td>
                            {p.avgDiscount > 0 ? (
                              <span className="badge badge-warning" style={{ fontWeight: 800 }}>{Number(p.avgDiscount).toFixed(1)}%</span>
                            ) : "—"}
                          </td>
                          <td>
                            <span className={`badge ${p.isActive ? "badge-success" : "badge-muted"}`} style={{ padding: "5px 12px", fontSize: "0.8rem", borderRadius: "20px", border: p.isActive ? "1px solid #86efac" : "none" }}>
                              {p.isActive ? "🟢 Đang diễn ra" : "⏹️ Kết thúc"}
                            </span>
                          </td>
                        </tr>
                      ))}
                      {promotions.length === 0 && (
                        <tr><td colSpan={8}><div className="admin-empty" style={{ padding: 60 }}>Chưa có dữ liệu khuyến mãi</div></td></tr>
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
          .admin-card { border: 1px solid #ddd !important; background: white !important; box-shadow: none !important; }
          .page-title, .admin-card-title { color: black !important; }
          .admin-table th, .admin-table td { color: black !important; border-color: #ddd !important; }
        }
      `}</style>
    </div>
  );
};

export default ReportPage;
