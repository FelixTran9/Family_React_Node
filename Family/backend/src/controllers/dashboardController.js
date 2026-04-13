import pool from "../config/db.js";

/**
 * GET /api/admin/dashboard
 * Trả về số lượng thống kê cho dashboard
 */
export const getDashboardStats = async (req, res) => {
  try {
    const [[{ staffCount }]] = await pool.query(
      "SELECT COUNT(*) AS staffCount FROM NHAN_VIEN"
    );
    const [[{ productCount }]] = await pool.query(
      "SELECT COUNT(*) AS productCount FROM SAN_PHAM"
    );
    const [[{ orderCount }]] = await pool.query(
      "SELECT COUNT(*) AS orderCount FROM DON_BAN_HANG"
    );
    const [[{ shippingCount }]] = await pool.query(
      "SELECT COUNT(*) AS shippingCount FROM PHIEU_GIAO_HANG"
    );

    res.json({ staffCount, productCount, orderCount, shippingCount });
  } catch (err) {
    console.error("Dashboard error:", err);
    res.status(500).json({ message: "Lỗi lấy dữ liệu dashboard", error: err.message });
  }
};
