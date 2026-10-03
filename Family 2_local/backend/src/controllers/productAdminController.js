import crypto from "crypto";
import pool from "../config/db.js";

const genMaSP = () => "SP" + crypto.randomBytes(3).toString("hex").toUpperCase();

/**
 * GET /api/admin/products?q=...&page=1&limit=15
 */
export const getProducts = async (req, res) => {
  const { q = "", page = 1, limit = 15 } = req.query;
  const offset = (parseInt(page) - 1) * parseInt(limit);
  const search = `%${q}%`;
  try {
    const [rows] = await pool.query(
      `SELECT sp.MaSP, sp.TenSP, sp.QuyCach, sp.DonViTinh,
              sp.GiaVon, sp.GiaBan, sp.TonKho, sp.HinhAnh,
              sp.MaDanhMuc, dm.TenDanhMuc,
              sp.MaNCC, ncc.TenNCC
       FROM SAN_PHAM sp
       LEFT JOIN DANH_MUC_SP dm ON sp.MaDanhMuc = dm.MaDanhMuc
       LEFT JOIN NHA_CUNG_CAP ncc ON sp.MaNCC = ncc.MaNCC
       WHERE sp.TenSP LIKE ? OR sp.MaSP LIKE ?
       ORDER BY sp.MaSP DESC
       LIMIT ? OFFSET ?`,
      [search, search, parseInt(limit), offset]
    );
    const [[{ total }]] = await pool.query(
      "SELECT COUNT(*) AS total FROM SAN_PHAM WHERE TenSP LIKE ? OR MaSP LIKE ?",
      [search, search]
    );
    res.json({ data: rows, total, page: parseInt(page), limit: parseInt(limit) });
  } catch (err) {
    res.status(500).json({ message: "Lỗi lấy danh sách sản phẩm", error: err.message });
  }
};

/**
 * GET /api/admin/products/categories — Danh mục để dropdown
 */
export const getCategories = async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT MaDanhMuc, TenDanhMuc FROM DANH_MUC_SP");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: "Lỗi lấy danh mục", error: err.message });
  }
};

/**
 * GET /api/admin/products/:id
 */
export const getProductById = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT sp.*, dm.TenDanhMuc, ncc.TenNCC FROM SAN_PHAM sp
       LEFT JOIN DANH_MUC_SP dm ON sp.MaDanhMuc = dm.MaDanhMuc
       LEFT JOIN NHA_CUNG_CAP ncc ON sp.MaNCC = ncc.MaNCC
       WHERE sp.MaSP = ?`,
      [req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ message: "Không tìm thấy sản phẩm" });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: "Lỗi lấy sản phẩm", error: err.message });
  }
};

/**
 * POST /api/admin/products
 */
export const createProduct = async (req, res) => {
  const { TenSP, QuyCach, DonViTinh, GiaVon, GiaBan, TonKho, HinhAnh, MaDanhMuc, MaNCC } = req.body;
  if (!TenSP || GiaBan === undefined || TonKho === undefined || !MaNCC) {
    return res.status(400).json({ message: "Thiếu thông tin bắt buộc (TenSP, GiaBan, TonKho, MaNCC)" });
  }
  try {
    let MaSP = genMaSP();
    let [check] = await pool.query("SELECT MaSP FROM SAN_PHAM WHERE MaSP = ?", [MaSP]);
    while (check.length > 0) {
      MaSP = genMaSP();
      [check] = await pool.query("SELECT MaSP FROM SAN_PHAM WHERE MaSP = ?", [MaSP]);
    }
    await pool.query(
      `INSERT INTO SAN_PHAM (MaSP, TenSP, QuyCach, DonViTinh, GiaVon, GiaBan, TonKho, HinhAnh, MaDanhMuc, MaNCC)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [MaSP, TenSP, QuyCach || null, DonViTinh || null, GiaVon || 0, GiaBan, TonKho, HinhAnh || null, MaDanhMuc || null, MaNCC]
    );
    res.status(201).json({ message: "Tạo sản phẩm thành công", MaSP });
  } catch (err) {
    res.status(500).json({ message: "Lỗi tạo sản phẩm", error: err.message });
  }
};

/**
 * PUT /api/admin/products/:id
 */
export const updateProduct = async (req, res) => {
  const { TenSP, QuyCach, DonViTinh, GiaVon, GiaBan, TonKho, HinhAnh, MaDanhMuc, MaNCC } = req.body;
  if (!TenSP || GiaBan === undefined || TonKho === undefined) {
    return res.status(400).json({ message: "Thiếu thông tin bắt buộc" });
  }
  try {
    await pool.query(
      `UPDATE SAN_PHAM
       SET TenSP=?, QuyCach=?, DonViTinh=?, GiaVon=?, GiaBan=?, TonKho=?, HinhAnh=?, MaDanhMuc=?, MaNCC=?
       WHERE MaSP=?`,
      [TenSP, QuyCach || null, DonViTinh || null, GiaVon || 0, GiaBan, TonKho, HinhAnh || null, MaDanhMuc || null, MaNCC || null, req.params.id]
    );
    res.json({ message: "Cập nhật sản phẩm thành công" });
  } catch (err) {
    res.status(500).json({ message: "Lỗi cập nhật sản phẩm", error: err.message });
  }
};

/**
 * DELETE /api/admin/products/:id
 */
export const deleteProduct = async (req, res) => {
  try {
    // Kiểm tra sản phẩm có trong đơn hàng nào không (FK constraint)
    const [inOrders] = await pool.query(
      "SELECT COUNT(*) AS cnt FROM CT_DON_BAN WHERE MaSP = ?",
      [req.params.id]
    );
    if (inOrders[0].cnt > 0) {
      return res.status(400).json({
        message: `Không thể xóa! Sản phẩm này đang có trong ${inOrders[0].cnt} đơn hàng. Hãy hủy hoặc xóa các đơn hàng liên quan trước.`,
      });
    }
    const [result] = await pool.query("DELETE FROM SAN_PHAM WHERE MaSP=?", [req.params.id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Không tìm thấy sản phẩm" });
    }
    res.json({ message: "Xóa sản phẩm thành công" });
  } catch (err) {
    res.status(500).json({ message: "Lỗi xóa sản phẩm: " + err.message });
  }
};
