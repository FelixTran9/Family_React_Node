import pool from "../config/db.js";

/**
 * GET /api/admin/dashboard
 */
export const getDashboardStats = async (req, res) => {
  try {
    const [[{ staffCount }]]    = await pool.query("SELECT COUNT(*) AS staffCount FROM NHAN_VIEN");
    const [[{ productCount }]]  = await pool.query("SELECT COUNT(*) AS productCount FROM SAN_PHAM");
    const [[{ orderCount }]]    = await pool.query("SELECT COUNT(*) AS orderCount FROM DON_BAN_HANG");
    const [[{ shippingCount }]] = await pool.query("SELECT COUNT(*) AS shippingCount FROM PHIEU_GIAO_HANG");
    const [[{ revenue }]]       = await pool.query("SELECT COALESCE(SUM(TongThanhToan),0) AS revenue FROM DON_BAN_HANG WHERE TrangThai='đã_giao'");
    const [[{ customerCount }]] = await pool.query("SELECT COUNT(*) AS customerCount FROM KHACH_HANG");
    const [[{ pendingCount }]]  = await pool.query("SELECT COUNT(*) AS pendingCount FROM DON_BAN_HANG WHERE TrangThai='chờ_xác_nhận'");
    const [[{ lowStock }]]      = await pool.query("SELECT COUNT(*) AS lowStock FROM SAN_PHAM WHERE TonKho < 10");

    res.json({ staffCount, productCount, orderCount, shippingCount, revenue, customerCount, pendingCount, lowStock });
  } catch (err) {
    console.error("Dashboard error:", err);
    res.status(500).json({ message: "Lỗi lấy dữ liệu dashboard", error: err.message });
  }
};

/**
 * GET /api/admin/dashboard/revenue-by-month?year=2026
 */
export const getRevenueByMonth = async (req, res) => {
  try {
    const targetYear = req.query.year || new Date().getFullYear();
    const [rows] = await pool.query(
      `SELECT MONTH(NgayDat) AS month,
              COALESCE(SUM(TongThanhToan), 0) AS revenue,
              COUNT(*) AS orderCount
       FROM DON_BAN_HANG
       WHERE YEAR(NgayDat) = ? AND TrangThai != 'đã_hủy'
       GROUP BY MONTH(NgayDat)
       ORDER BY MONTH(NgayDat)`,
      [targetYear]
    );
    const monthData = Array.from({ length: 12 }, (_, i) => {
      const found = rows.find((r) => r.month === i + 1);
      return { month: i + 1, revenue: found ? Number(found.revenue) : 0, orderCount: found ? Number(found.orderCount) : 0 };
    });
    res.json(monthData);
  } catch (err) {
    res.status(500).json({ message: "Lỗi thống kê doanh thu", error: err.message });
  }
};

/**
 * GET /api/admin/dashboard/revenue-by-day (30 ngày gần nhất)
 */
export const getRevenueByDay = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT DATE(NgayDat) AS day,
              COALESCE(SUM(TongThanhToan), 0) AS revenue,
              COUNT(*) AS orderCount
       FROM DON_BAN_HANG
       WHERE NgayDat >= DATE_SUB(CURDATE(), INTERVAL 30 DAY) AND TrangThai != 'đã_hủy'
       GROUP BY DATE(NgayDat)
       ORDER BY DATE(NgayDat)`
    );
    res.json(rows.map((r) => ({ ...r, revenue: Number(r.revenue) })));
  } catch (err) {
    res.status(500).json({ message: "Lỗi thống kê doanh thu ngày", error: err.message });
  }
};

/**
 * GET /api/admin/dashboard/order-status
 */
export const getOrderByStatus = async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT TrangThai, COUNT(*) AS total FROM DON_BAN_HANG GROUP BY TrangThai"
    );
    res.json(rows.map(r => ({ ...r, total: Number(r.total) })));
  } catch (err) {
    res.status(500).json({ message: "Lỗi thống kê trạng thái đơn", error: err.message });
  }
};

/**
 * GET /api/admin/dashboard/top-products
 */
export const getTopProducts = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT sp.MaSP, sp.TenSP,
              COALESCE(SUM(ct.SoLuong), 0) AS totalSold,
              COALESCE(SUM(ct.ThanhTien), 0) AS totalRevenue
       FROM SAN_PHAM sp
       LEFT JOIN CT_DON_BAN ct ON sp.MaSP = ct.MaSP
       LEFT JOIN DON_BAN_HANG d ON ct.MaDon = d.MaDon AND d.TrangThai != 'đã_hủy'
       GROUP BY sp.MaSP, sp.TenSP
       ORDER BY totalSold DESC
       LIMIT 10`
    );
    res.json(rows.map(r => ({ ...r, totalSold: Number(r.totalSold), totalRevenue: Number(r.totalRevenue) })));
  } catch (err) {
    res.status(500).json({ message: "Lỗi thống kê sản phẩm bán chạy", error: err.message });
  }
};

/**
 * GET /api/admin/dashboard/inventory-report
 */
export const getInventoryReport = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT sp.MaSP, sp.TenSP, sp.TonKho,
              COALESCE(SUM(ct.SoLuong), 0) AS totalExport,
              sp.GiaBan
       FROM SAN_PHAM sp
       LEFT JOIN CT_DON_BAN ct ON sp.MaSP = ct.MaSP
       LEFT JOIN DON_BAN_HANG d ON ct.MaDon = d.MaDon AND d.TrangThai != 'đã_hủy'
       GROUP BY sp.MaSP, sp.TenSP, sp.TonKho, sp.GiaBan
       ORDER BY totalExport DESC`
    );
    res.json(rows.map(r => ({ ...r, TonKho: Number(r.TonKho), totalExport: Number(r.totalExport), GiaBan: Number(r.GiaBan) })));
  } catch (err) {
    res.status(500).json({ message: "Lỗi báo cáo kho", error: err.message });
  }
};

/**
 * GET /api/admin/dashboard/promotion-stats
 * Sử dụng bảng DOT_KHUYEN_MAI (TenCT, TuNgay, DenNgay)
 */
export const getPromotionStats = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT km.MaKM, km.TenCT AS TenKM,
              km.TuNgay, km.DenNgay, km.MoTa,
              COUNT(DISTINCT ctk.MaSP) AS productCount,
              COALESCE(AVG(ctk.GiamGiaPhanTram), 0) AS avgDiscount
       FROM DOT_KHUYEN_MAI km
       LEFT JOIN CT_KHUYEN_MAI ctk ON km.MaKM = ctk.MaKM
       GROUP BY km.MaKM, km.TenCT, km.TuNgay, km.DenNgay, km.MoTa
       ORDER BY km.TuNgay DESC`
    );
    const now = new Date();
    res.json(rows.map(r => ({
      ...r,
      productCount: Number(r.productCount),
      avgDiscount: Number(r.avgDiscount),
      isActive: new Date(r.TuNgay) <= now && new Date(r.DenNgay) >= now,
    })));
  } catch (err) {
    console.error("Promotion stats error:", err);
    res.status(500).json({ message: "Lỗi thống kê khuyến mãi", error: err.message });
  }
};

/**
 * GET /api/admin/dashboard/payment-stats
 */
export const getPaymentStats = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT HinhThucTT, COUNT(*) AS total, COALESCE(SUM(TongThanhToan), 0) AS revenue
       FROM DON_BAN_HANG WHERE TrangThai != 'đã_hủy'
       GROUP BY HinhThucTT`
    );
    res.json(rows.map(r => ({ ...r, total: Number(r.total), revenue: Number(r.revenue) })));
  } catch (err) {
    res.status(500).json({ message: "Lỗi thống kê thanh toán", error: err.message });
  }
};

/**
 * GET /api/admin/dashboard/category-stats
 * Doanh thu theo danh mục sản phẩm
 */
export const getCategoryStats = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT dm.MaDanhMuc, dm.TenDanhMuc,
              COUNT(DISTINCT sp.MaSP) AS productCount,
              COALESCE(SUM(ct.SoLuong), 0) AS totalSold,
              COALESCE(SUM(ct.ThanhTien), 0) AS totalRevenue
       FROM DANH_MUC_SP dm
       LEFT JOIN SAN_PHAM sp ON sp.MaDanhMuc = dm.MaDanhMuc
       LEFT JOIN CT_DON_BAN ct ON ct.MaSP = sp.MaSP
       LEFT JOIN DON_BAN_HANG d ON d.MaDon = ct.MaDon AND d.TrangThai != 'đã_hủy'
       GROUP BY dm.MaDanhMuc, dm.TenDanhMuc
       ORDER BY totalRevenue DESC`
    );
    res.json(rows.map(r => ({ ...r, productCount: Number(r.productCount), totalSold: Number(r.totalSold), totalRevenue: Number(r.totalRevenue) })));
  } catch (err) {
    console.error("Category stats error:", err);
    res.status(500).json({ message: "Lỗi thống kê danh mục", error: err.message });
  }
};
