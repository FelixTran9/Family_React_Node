import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import adminApi from "../../services/adminApi";
import { useAdminAuth } from "../../context/AdminAuthContext";
import "../../components/admin/admin.css";

/* ─── helpers ─── */
const fmtVND = (v) =>
  Number(v || 0).toLocaleString("vi-VN", { style: "currency", currency: "VND" });
const fmtNum = (v) => Number(v || 0).toLocaleString("vi-VN");

const MONTHS = ["T1","T2","T3","T4","T5","T6","T7","T8","T9","T10","T11","T12"];

const STATUS_MAP = {
  "chờ_xác_nhận": { label: "Chờ xác nhận", color: "#f59e0b" },
  "đã_xác_nhận":  { label: "Đã xác nhận",  color: "#38bdf8" },
  "đang_giao":    { label: "Đang giao",     color: "#a78bfa" },
  "đã_giao":      { label: "Đã giao",       color: "#22c55e" },
  "đã_hủy":       { label: "Đã hủy",        color: "#ef4444" },
};

const CATEGORY_PALETTE = [
  "#6c63ff","#22c55e","#f59e0b","#38bdf8","#ef4444",
  "#ec4899","#14b8a6","#f97316","#8b5cf6","#06b6d4",
];

/* ─── Donut Chart SVG ─── */
const DonutChart = ({ segments, size = 180 }) => {
  const r = 60, cx = size / 2, cy = size / 2, strokeW = 22;
  const circumference = 2 * Math.PI * r;
  const total = segments.reduce((a, s) => a + s.value, 0);
  if (total === 0) return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--admin-border)" strokeWidth={strokeW} />
      <text x={cx} y={cy + 5} textAnchor="middle" fontSize={12} fill="var(--text-muted)">Không có</text>
    </svg>
  );

  let offset = 0;
  const slices = segments.map((s) => {
    const dash = (s.value / total) * circumference;
    const gap  = circumference - dash;
    const slice = { ...s, dash, gap, offset };
    offset += dash;
    return slice;
  });

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: "rotate(-90deg)" }}>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--admin-surface-2)" strokeWidth={strokeW} />
      {slices.map((s, i) => (
        <circle
          key={i} cx={cx} cy={cy} r={r}
          fill="none"
          stroke={s.color}
          strokeWidth={strokeW}
          strokeDasharray={`${s.dash} ${s.gap}`}
          strokeDashoffset={-s.offset}
          strokeLinecap="butt"
        >
          <title>{s.label}: {s.raw || s.value} ({((s.value / total) * 100).toFixed(1)}%)</title>
        </circle>
      ))}
    </svg>
  );
};

/* ─── Bar Chart ─── */
const BarChart = ({ data, valueKey = "value", labelKey = "label", color = "#6c63ff", height = 140 }) => {
  const max = Math.max(...data.map(d => d[valueKey]), 1);
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 4, height: height + 28, paddingTop: 8 }}>
      {data.map((d, i) => {
        const h  = (d[valueKey] / max) * height;
        const isMax = d[valueKey] === Math.max(...data.map(x => x[valueKey]));
        const isCur = i === new Date().getMonth();
        const bg = isCur ? `linear-gradient(180deg,#6c63ff,#9f7aea)` : isMax ? `linear-gradient(180deg,${color},${color}99)` : `${color}45`;
        return (
          <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 3, minWidth: 0 }}>
            <div
              title={`${d[labelKey]}: ${fmtVND(d[valueKey])}`}
              style={{
                width: "100%", height: `${Math.max(h, d[valueKey] > 0 ? 4 : 0)}px`,
                background: bg, borderRadius: "4px 4px 0 0",
                transition: "height 0.6s cubic-bezier(.4,0,.2,1)",
                boxShadow: isCur ? "0 0 8px rgba(108,99,255,0.4)" : "none",
              }}
            />
            <span style={{ fontSize: "0.6rem", color: isCur ? "#6c63ff" : "var(--text-muted)", fontWeight: isCur ? 700 : 400, whiteSpace: "nowrap" }}>
              {d[labelKey]}
            </span>
          </div>
        );
      })}
    </div>
  );
};

/* ─── Main Dashboard ─── */
const AdminDashboard = () => {
  const { adminUser } = useAdminAuth();

  // State
  const [stats,        setStats]        = useState(null);
  const [revenueMonth, setRevenueMonth] = useState(Array.from({ length: 12 }, (_, i) => ({ month: i + 1, revenue: 0, orderCount: 0 })));
  const [orderStatus,  setOrderStatus]  = useState([]);
  const [topProducts,  setTopProducts]  = useState([]);
  const [categories,   setCategories]   = useState([]);
  const [payments,     setPayments]     = useState([]);
  const [loading,      setLoading]      = useState(true);

  useEffect(() => {
    const year = new Date().getFullYear();
    // Gọi tách biệt từng API → lỗi 1 cái không ảnh hưởng cái khác
    const safe = (p) => p.catch(() => ({ data: null }));
    Promise.all([
      safe(adminApi.get("/dashboard")),
      safe(adminApi.get(`/dashboard/revenue-by-month?year=${year}`)),
      safe(adminApi.get("/dashboard/order-status")),
      safe(adminApi.get("/dashboard/top-products")),
      safe(adminApi.get("/dashboard/category-stats")),
      safe(adminApi.get("/dashboard/payment-stats")),
    ]).then(([s, rm, os, tp, cat, pay]) => {
      if (s.data)   setStats(s.data);
      if (rm.data && Array.isArray(rm.data))  setRevenueMonth(rm.data);
      if (os.data && Array.isArray(os.data))  setOrderStatus(os.data);
      if (tp.data && Array.isArray(tp.data))  setTopProducts(tp.data);
      if (cat.data && Array.isArray(cat.data)) setCategories(cat.data);
      if (pay.data && Array.isArray(pay.data)) setPayments(pay.data);
    }).finally(() => setLoading(false));
  }, []);

  /* ── derived ── */
  const totalRevenue = revenueMonth.reduce((a, b) => a + b.revenue, 0);
  const totalOrders  = revenueMonth.reduce((a, b) => a + b.orderCount, 0);

  // Order status donut
  const orderStatusSegments = orderStatus.map(o => ({
    label: STATUS_MAP[o.TrangThai]?.label || o.TrangThai,
    value: o.total,
    color: STATUS_MAP[o.TrangThai]?.color || "#94a3b8",
  }));

  // Category donut
  const catTotal = categories.reduce((a, c) => a + c.totalRevenue, 0);
  const categorySegments = categories.slice(0, 8).map((c, i) => ({
    label: c.TenDanhMuc || "Khác",
    value: c.totalRevenue,
    raw: fmtVND(c.totalRevenue),
    color: CATEGORY_PALETTE[i % CATEGORY_PALETTE.length],
  }));

  // Payment donut
  const paymentSegments = payments.map((p, i) => ({
    label: p.HinhThucTT || "Khác",
    value: p.total,
    raw: `${p.total} đơn`,
    color: CATEGORY_PALETTE[i % CATEGORY_PALETTE.length],
  }));

  const statCards = [
    { key: "revenue",       label: "Doanh thu (đã giao)",  icon: "💰", color: "#6c63ff",   to: "/admin/reports",   isVND: true },
    { key: "orderCount",    label: "Tổng đơn hàng",        icon: "🛒", color: "#22c55e",   to: "/admin/orders"    },
    { key: "pendingCount",  label: "Chờ xác nhận",         icon: "⏳", color: "#f59e0b",   to: "/admin/orders"    },
    { key: "customerCount", label: "Khách hàng",           icon: "👤", color: "#38bdf8",   to: "/admin/customers" },
    { key: "productCount",  label: "Sản phẩm",             icon: "📦", color: "#a78bfa",   to: "/admin/products"  },
    { key: "lowStock",      label: "SP sắp hết (<10)",     icon: "⚠️", color: "#ef4444",   to: "/admin/products"  },
    { key: "staffCount",    label: "Nhân viên",            icon: "👥", color: "#14b8a6",   to: "/admin/staff"     },
    { key: "shippingCount", label: "Phiếu giao hàng",      icon: "🚚", color: "#ec4899",   to: "/admin/shipping"  },
  ];

  const now = new Date();
  const greeting = now.getHours() < 12 ? "Chào buổi sáng" : now.getHours() < 18 ? "Chào buổi chiều" : "Chào buổi tối";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* ── Header ── */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ fontSize: "1.6rem", fontWeight: 800, color: "var(--text-primary)", lineHeight: 1.2 }}>
            {greeting}, <span style={{ color: "#6c63ff" }}>{adminUser?.name || "Admin"}</span> 👋
          </h1>
          <p style={{ fontSize: "0.88rem", color: "var(--text-muted)", marginTop: 4 }}>
            {now.toLocaleDateString("vi-VN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })} — Family Mart Dashboard
          </p>
        </div>
        <Link to="/admin/reports" className="btn btn-primary">
          📊 Báo cáo chi tiết
        </Link>
      </div>

      {/* ── Stat Cards ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 14 }}>
        {statCards.map((s) => {
          const val = loading ? null : (stats?.[s.key] ?? 0);
          const isWarn = s.key === "lowStock" && !loading && Number(val) > 0;
          const isPending = s.key === "pendingCount" && !loading && Number(val) > 0;
          return (
            <Link to={s.to} key={s.key} style={{ textDecoration: "none" }}>
              <div
                className="stat-card"
                style={{
                  flexDirection: "column", alignItems: "flex-start", gap: 10, padding: 18,
                  borderColor: isWarn ? "rgba(239,68,68,0.4)" : isPending ? "rgba(245,158,11,0.4)" : "var(--admin-border)",
                  background: isWarn ? "rgba(239,68,68,0.05)" : isPending ? "rgba(245,158,11,0.05)" : "var(--admin-surface)",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%" }}>
                  <div style={{ width: 40, height: 40, borderRadius: 9, background: `${s.color}20`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.2rem", flexShrink: 0 }}>
                    {s.icon}
                  </div>
                  {(isWarn || isPending) && (
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: s.color, animation: "pulse 2s infinite" }} />
                  )}
                </div>
                <div>
                  <div style={{ fontSize: s.isVND ? "1rem" : "1.55rem", fontWeight: 800, color: s.color, lineHeight: 1.1 }}>
                    {val === null ? "…" : s.isVND ? fmtVND(val) : fmtNum(val)}
                  </div>
                  <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginTop: 3 }}>{s.label}</div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* ── Row 2: Revenue Bar + Order Status Donut ── */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 20 }}>
        {/* Revenue Bar Chart */}
        <div className="admin-card" style={{ padding: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
            <div>
              <div style={{ fontSize: "1rem", fontWeight: 700, color: "var(--text-primary)" }}>
                📊 Doanh thu năm {new Date().getFullYear()}
              </div>
              <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginTop: 2 }}>
                Tổng: <span style={{ color: "#6c63ff", fontWeight: 700 }}>{loading ? "…" : fmtVND(totalRevenue)}</span>
                &nbsp;·&nbsp;
                <span style={{ color: "var(--admin-success)", fontWeight: 600 }}>{loading ? "…" : fmtNum(totalOrders)} đơn</span>
              </div>
            </div>
            <span style={{ fontSize: "0.72rem", background: "rgba(108,99,255,0.15)", color: "#6c63ff", borderRadius: 20, padding: "3px 10px" }}>
              Tháng hiện tại được tô đậm
            </span>
          </div>
          {loading ? (
            <div className="admin-loading" style={{ padding: 40 }}><div className="spinner" /></div>
          ) : (
            <BarChart
              data={revenueMonth.map((r, i) => ({ label: MONTHS[i], value: r.revenue }))}
              color="#6c63ff"
              height={140}
            />
          )}
        </div>

        {/* Order Status Donut */}
        <div className="admin-card" style={{ padding: 24 }}>
          <div style={{ fontSize: "1rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: 16 }}>
            🛒 Trạng thái đơn hàng
          </div>
          {loading ? (
            <div className="admin-loading" style={{ padding: 40 }}><div className="spinner" /></div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
              <div style={{ position: "relative" }}>
                <DonutChart segments={orderStatusSegments} size={160} />
                <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", textAlign: "center", pointerEvents: "none" }}>
                  <div style={{ fontSize: "1.3rem", fontWeight: 800, color: "var(--text-primary)" }}>{fmtNum(orderStatus.reduce((a, o) => a + o.total, 0))}</div>
                  <div style={{ fontSize: "0.65rem", color: "var(--text-muted)" }}>Tổng đơn</div>
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6, width: "100%" }}>
                {orderStatusSegments.map((s, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <div style={{ width: 8, height: 8, borderRadius: 2, background: s.color, flexShrink: 0 }} />
                      <span style={{ fontSize: "0.77rem", color: "var(--text-secondary)" }}>{s.label}</span>
                    </div>
                    <span style={{ fontSize: "0.82rem", fontWeight: 700, color: s.color }}>{fmtNum(s.value)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Row 3: Category Donut + Payment Donut + Top Products ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1.5fr", gap: 20 }}>
        {/* Category Revenue Donut */}
        <div className="admin-card" style={{ padding: 24 }}>
          <div style={{ fontSize: "1rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: 16 }}>
            🗂️ Doanh thu theo danh mục
          </div>
          {loading ? (
            <div className="admin-loading" style={{ padding: 30 }}><div className="spinner" /></div>
          ) : catTotal === 0 ? (
            <div className="admin-empty" style={{ padding: 32 }}>
              <div className="admin-empty-icon">📊</div>
              <p>Chưa có dữ liệu</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
              <div style={{ position: "relative" }}>
                <DonutChart segments={categorySegments} size={150} />
                <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", textAlign: "center", pointerEvents: "none" }}>
                  <div style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>Tổng DT</div>
                  <div style={{ fontSize: "0.75rem", fontWeight: 800, color: "#6c63ff", whiteSpace: "nowrap" }}>{fmtVND(catTotal)}</div>
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 5, width: "100%" }}>
                {categorySegments.map((c, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 6 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, minWidth: 0, flex: 1 }}>
                      <div style={{ width: 8, height: 8, borderRadius: 2, background: c.color, flexShrink: 0 }} />
                      <span style={{ fontSize: "0.73rem", color: "var(--text-secondary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.label}</span>
                    </div>
                    <span style={{ fontSize: "0.72rem", fontWeight: 700, color: c.color, flexShrink: 0 }}>
                      {catTotal > 0 ? ((c.value / catTotal) * 100).toFixed(0) : 0}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Payment Method Donut */}
        <div className="admin-card" style={{ padding: 24 }}>
          <div style={{ fontSize: "1rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: 16 }}>
            💳 Hình thức thanh toán
          </div>
          {loading ? (
            <div className="admin-loading" style={{ padding: 30 }}><div className="spinner" /></div>
          ) : payments.length === 0 ? (
            <div className="admin-empty" style={{ padding: 32 }}>
              <div className="admin-empty-icon">💳</div>
              <p>Chưa có dữ liệu</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
              <div style={{ position: "relative" }}>
                <DonutChart segments={paymentSegments} size={150} />
                <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", textAlign: "center", pointerEvents: "none" }}>
                  <div style={{ fontSize: "0.65rem", color: "var(--text-muted)" }}>Tổng đơn</div>
                  <div style={{ fontSize: "1.1rem", fontWeight: 800, color: "var(--text-primary)" }}>{fmtNum(payments.reduce((a, p) => a + p.total, 0))}</div>
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6, width: "100%" }}>
                {paymentSegments.map((p, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <div style={{ width: 8, height: 8, borderRadius: 2, background: p.color, flexShrink: 0 }} />
                      <span style={{ fontSize: "0.77rem", color: "var(--text-secondary)" }}>{p.label}</span>
                    </div>
                    <span style={{ fontSize: "0.82rem", fontWeight: 700, color: p.color }}>{fmtNum(p.value)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Top Products */}
        <div className="admin-card" style={{ padding: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <div style={{ fontSize: "1rem", fontWeight: 700, color: "var(--text-primary)" }}>🏆 Top sản phẩm bán chạy</div>
            <Link to="/admin/orders" className="btn btn-secondary btn-sm">Xem đơn</Link>
          </div>
          {loading ? (
            <div className="admin-loading" style={{ padding: 30 }}><div className="spinner" /></div>
          ) : topProducts.length === 0 ? (
            <div className="admin-empty" style={{ padding: 32 }}>
              <div className="admin-empty-icon">🏆</div>
              <p>Chưa có dữ liệu</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {topProducts.slice(0, 6).map((p, i) => {
                const maxSold = Math.max(...topProducts.map(x => x.totalSold), 1);
                const medal = ["🥇","🥈","🥉"][i];
                return (
                  <div key={p.MaSP} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ fontSize: "1.1rem", width: 24, flexShrink: 0 }}>{medal || `${i + 1}.`}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: "0.82rem", fontWeight: 600, color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {p.TenSP}
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 3 }}>
                        <div style={{ flex: 1, height: 5, background: "var(--admin-surface-2)", borderRadius: 3 }}>
                          <div style={{ width: `${(p.totalSold / maxSold) * 100}%`, height: "100%", background: CATEGORY_PALETTE[i % CATEGORY_PALETTE.length], borderRadius: 3 }} />
                        </div>
                        <span style={{ fontSize: "0.72rem", color: "var(--text-muted)", flexShrink: 0 }}>{fmtNum(p.totalSold)} sp</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ── Row 4: Quick Modules ── */}
      <div className="admin-card" style={{ padding: 24 }}>
        <div style={{ fontSize: "1rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: 16 }}>⚡ Truy cập nhanh</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: 10 }}>
          {[
            { to: "/admin/orders",     icon: "🛒", label: "Đơn hàng",       sub: "Xem & xử lý đơn" },
            { to: "/admin/products",   icon: "📦", label: "Sản phẩm",       sub: "Quản lý kho" },
            { to: "/admin/shipping",   icon: "🚚", label: "Giao hàng",      sub: "Theo dõi vận chuyển" },
            { to: "/admin/promotions", icon: "🏷️", label: "Khuyến mãi",    sub: "Chương trình KM" },
            { to: "/admin/customers",  icon: "👤", label: "Khách hàng",     sub: "Tài khoản KH" },
            { to: "/admin/staff",      icon: "👥", label: "Nhân viên",      sub: "Quản lý NV" },
            { to: "/admin/suppliers",  icon: "🏭", label: "Nhà cung cấp",   sub: "Quản lý NCC" },
            { to: "/admin/reports",    icon: "📊", label: "Báo cáo",        sub: "Thống kê chi tiết" },
          ].map((m) => (
            <Link
              key={m.to}
              to={m.to}
              style={{ textDecoration: "none" }}
            >
              <div
                style={{
                  background: "var(--admin-surface-2)", border: "1px solid var(--admin-border)",
                  borderRadius: 10, padding: "14px 16px", cursor: "pointer",
                  transition: "all 0.2s",
                  display: "flex", flexDirection: "column", gap: 4,
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = "#6c63ff"; e.currentTarget.style.transform = "translateY(-2px)"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--admin-border)"; e.currentTarget.style.transform = "none"; }}
              >
                <span style={{ fontSize: "1.3rem" }}>{m.icon}</span>
                <span style={{ fontSize: "0.84rem", fontWeight: 700, color: "var(--text-primary)" }}>{m.label}</span>
                <span style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>{m.sub}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
      `}</style>
    </div>
  );
};

export default AdminDashboard;
