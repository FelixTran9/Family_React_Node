import crypto from "crypto";
import pool from "../config/db.js";

// KHACH_HANG: MaKH, TenKH, SDT, DiaChi, Email, MatKhau, DiemTichLuy, LoaiKH, TongTieuDung

const genMaKH = () => "KH" + crypto.randomBytes(4).toString("hex");

/**
 * GET /api/admin/customers?q=...&page=1&limit=15
 */
export const getCustomers = async (req, res) => {
  const { q = "", page = 1, limit = 15 } = req.query;
  const offset = (parseInt(page) - 1) * parseInt(limit);
  const search = `%${q}%`;
  try {
    const [rows] = await pool.query(
      `SELECT MaKH, TenKH, SDT, DiaChi, Email, DiemTichLuy, LoaiKH, TongTieuDung
       FROM KHACH_HANG
       WHERE TenKH LIKE ? OR SDT LIKE ? OR Email LIKE ?
       ORDER BY MaKH DESC LIMIT ? OFFSET ?`,
      [search, search, search, parseInt(limit), offset]
    );
    const [[{ total }]] = await pool.query(
      "SELECT COUNT(*) AS total FROM KHACH_HANG WHERE TenKH LIKE ? OR SDT LIKE ? OR Email LIKE ?",
      [search, search, search]
    );
    res.json({ data: rows, total, page: parseInt(page), limit: parseInt(limit) });
  } catch (err) {
    res.status(500).json({ message: "Lỗi lấy danh sách khách hàng", error: err.message });
  }
};

/**
 * GET /api/admin/customers/:id
 */
export const getCustomerById = async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT MaKH, TenKH, SDT, DiaChi, Email, DiemTichLuy, LoaiKH, TongTieuDung FROM KHACH_HANG WHERE MaKH = ?",
      [req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ message: "Không tìm thấy khách hàng" });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: "Lỗi lấy khách hàng", error: err.message });
  }
};

/**
 * POST /api/admin/customers
 */
export const createCustomer = async (req, res) => {
  const { TenKH, MatKhau, SDT, DiaChi, Email } = req.body;
  if (!TenKH) {
    return res.status(400).json({ message: "Tên khách hàng là bắt buộc" });
  }
  try {
    // Kiểm tra email trùng
    if (Email) {
      const [existing] = await pool.query("SELECT MaKH FROM KHACH_HANG WHERE Email = ?", [Email]);
      if (existing.length > 0) return res.status(400).json({ message: "Email đã tồn tại" });
    }

    let MaKH = genMaKH();
    let [check] = await pool.query("SELECT MaKH FROM KHACH_HANG WHERE MaKH = ?", [MaKH]);
    while (check.length > 0) {
      MaKH = genMaKH();
      [check] = await pool.query("SELECT MaKH FROM KHACH_HANG WHERE MaKH = ?", [MaKH]);
    }

    const { default: bcrypt } = await import("bcryptjs");
    const hashed = MatKhau ? await bcrypt.hash(MatKhau, 12) : null;

    await pool.query(
      `INSERT INTO KHACH_HANG (MaKH, TenKH, MatKhau, SDT, DiaChi, Email)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [MaKH, TenKH, hashed, SDT || null, DiaChi || null, Email || null]
    );
    res.status(201).json({ message: "Tạo khách hàng thành công", MaKH });
  } catch (err) {
    res.status(500).json({ message: "Lỗi tạo khách hàng", error: err.message });
  }
};

/**
 * PUT /api/admin/customers/:id
 */
export const updateCustomer = async (req, res) => {
  const { TenKH, SDT, DiaChi, Email } = req.body;
  if (!TenKH) {
    return res.status(400).json({ message: "Tên khách hàng là bắt buộc" });
  }
  try {
    await pool.query(
      "UPDATE KHACH_HANG SET TenKH=?, SDT=?, DiaChi=?, Email=? WHERE MaKH=?",
      [TenKH, SDT || null, DiaChi || null, Email || null, req.params.id]
    );
    res.json({ message: "Cập nhật khách hàng thành công" });
  } catch (err) {
    res.status(500).json({ message: "Lỗi cập nhật khách hàng", error: err.message });
  }
};

/**
 * DELETE /api/admin/customers/:id
 */
export const deleteCustomer = async (req, res) => {
  try {
    await pool.query("DELETE FROM KHACH_HANG WHERE MaKH=?", [req.params.id]);
    res.json({ message: "Xóa khách hàng thành công" });
  } catch (err) {
    res.status(500).json({ message: "Lỗi xóa khách hàng", error: err.message });
  }
};
