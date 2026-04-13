import pool from "../config/db.js";

/**
 * GET /api/products — Lấy danh sách sản phẩm cho trang khách hàng
 */
export const getProducts = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT sp.MaSP, sp.TenSP, sp.QuyCach, sp.DonViTinh,
              sp.GiaBan, sp.TonKho, sp.HinhAnh,
              sp.MaDanhMuc, dm.TenDanhMuc
       FROM SAN_PHAM sp
       LEFT JOIN DANH_MUC_SP dm ON sp.MaDanhMuc = dm.MaDanhMuc
       ORDER BY sp.MaSP DESC`
    );
    res.json(rows);
  } catch (err) {
    console.error("getProducts error:", err);
    res.status(500).json({ message: "Lỗi lấy sản phẩm", error: err.message });
  }
};

/**
 * GET /api/products/:id — Chi tiết sản phẩm cho trang khách hàng
 */
export const getProductById = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT sp.*, dm.TenDanhMuc FROM SAN_PHAM sp
       LEFT JOIN DANH_MUC_SP dm ON sp.MaDanhMuc = dm.MaDanhMuc
       WHERE sp.MaSP = ?`,
      [req.params.id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ message: "Không tìm thấy sản phẩm" });
    }
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: "Lỗi lấy sản phẩm", error: err.message });
  }
};