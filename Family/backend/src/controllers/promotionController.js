import crypto from "crypto";
import pool from "../config/db.js";

// Bảng DOT_KHUYEN_MAI: MaKM, TenCT, TuNgay, DenNgay, MoTa
// Bảng CT_KHUYEN_MAI: MaKM, MaSP, GiamGiaPhanTram, GiamGiaTien, MuaToiThieu

const genMaKM = () => "KM" + crypto.randomBytes(3).toString("hex").toUpperCase();

/**
 * GET /api/admin/promotions?q=...&page=1&limit=15
 */
export const getPromotions = async (req, res) => {
  const { q = "", page = 1, limit = 15 } = req.query;
  const offset = (parseInt(page) - 1) * parseInt(limit);
  const search = `%${q}%`;
  try {
    const [rows] = await pool.query(
      `SELECT * FROM DOT_KHUYEN_MAI
       WHERE MaKM LIKE ? OR TenCT LIKE ?
       ORDER BY MaKM DESC LIMIT ? OFFSET ?`,
      [search, search, parseInt(limit), offset]
    );
    const [[{ total }]] = await pool.query(
      "SELECT COUNT(*) AS total FROM DOT_KHUYEN_MAI WHERE MaKM LIKE ? OR TenCT LIKE ?",
      [search, search]
    );
    res.json({ data: rows, total, page: parseInt(page), limit: parseInt(limit) });
  } catch (err) {
    res.status(500).json({ message: "Lỗi lấy danh sách khuyến mãi", error: err.message });
  }
};

/**
 * GET /api/admin/promotions/:id — Lấy đợt KM + chi tiết sản phẩm KM
 */
export const getPromotionById = async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT * FROM DOT_KHUYEN_MAI WHERE MaKM = ?",
      [req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ message: "Không tìm thấy khuyến mãi" });

    const [chiTiet] = await pool.query(
      `SELECT ct.*, sp.TenSP FROM CT_KHUYEN_MAI ct
       LEFT JOIN SAN_PHAM sp ON ct.MaSP = sp.MaSP
       WHERE ct.MaKM = ?`,
      [req.params.id]
    );
    res.json({ ...rows[0], chiTiet });
  } catch (err) {
    res.status(500).json({ message: "Lỗi lấy khuyến mãi", error: err.message });
  }
};

/**
 * POST /api/admin/promotions
 */
export const createPromotion = async (req, res) => {
  const { TenCT, TuNgay, DenNgay, MoTa } = req.body;
  if (!TenCT || !TuNgay || !DenNgay) {
    return res.status(400).json({ message: "Thiếu thông tin bắt buộc (TenCT, TuNgay, DenNgay)" });
  }
  try {
    let MaKM = genMaKM();
    let [check] = await pool.query("SELECT MaKM FROM DOT_KHUYEN_MAI WHERE MaKM = ?", [MaKM]);
    while (check.length > 0) {
      MaKM = genMaKM();
      [check] = await pool.query("SELECT MaKM FROM DOT_KHUYEN_MAI WHERE MaKM = ?", [MaKM]);
    }
    await pool.query(
      `INSERT INTO DOT_KHUYEN_MAI (MaKM, TenCT, TuNgay, DenNgay, MoTa)
       VALUES (?, ?, ?, ?, ?)`,
      [MaKM, TenCT, TuNgay, DenNgay, MoTa || null]
    );
    res.status(201).json({ message: "Tạo khuyến mãi thành công", MaKM });
  } catch (err) {
    res.status(500).json({ message: "Lỗi tạo khuyến mãi", error: err.message });
  }
};

/**
 * PUT /api/admin/promotions/:id
 */
export const updatePromotion = async (req, res) => {
  const { TenCT, TuNgay, DenNgay, MoTa } = req.body;
  if (!TenCT || !TuNgay || !DenNgay) {
    return res.status(400).json({ message: "Thiếu thông tin bắt buộc" });
  }
  try {
    await pool.query(
      `UPDATE DOT_KHUYEN_MAI SET TenCT=?, TuNgay=?, DenNgay=?, MoTa=? WHERE MaKM=?`,
      [TenCT, TuNgay, DenNgay, MoTa || null, req.params.id]
    );
    res.json({ message: "Cập nhật khuyến mãi thành công" });
  } catch (err) {
    res.status(500).json({ message: "Lỗi cập nhật khuyến mãi", error: err.message });
  }
};

/**
 * DELETE /api/admin/promotions/:id
 */
export const deletePromotion = async (req, res) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    // Xóa chi tiết KM trước (FK constraint)
    await conn.query("DELETE FROM CT_KHUYEN_MAI WHERE MaKM=?", [req.params.id]);
    await conn.query("DELETE FROM DOT_KHUYEN_MAI WHERE MaKM=?", [req.params.id]);
    await conn.commit();
    res.json({ message: "Xóa khuyến mãi thành công" });
  } catch (err) {
    await conn.rollback();
    res.status(500).json({ message: "Lỗi xóa khuyến mãi", error: err.message });
  } finally {
    conn.release();
  }
};
