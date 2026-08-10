import bcrypt from "bcryptjs";
import crypto from "crypto";
import pool from "../config/db.js";

const genMaNV = () => "NV" + crypto.randomBytes(3).toString("hex").toUpperCase();

/**
 * GET /api/admin/staff?q=...&page=1&limit=15
 */
export const getStaff = async (req, res) => {
  const { q = "", page = 1, limit = 15 } = req.query;
  const offset = (parseInt(page) - 1) * parseInt(limit);
  const search = `%${q}%`;
  try {
    const [rows] = await pool.query(
      `SELECT nv.MaNV, nv.TenNV, nv.TaiKhoan, nv.SDT, nv.DiaChi, nv.MaTL, tl.TenTL, nv.TrangThai
       FROM NHAN_VIEN nv
       LEFT JOIN TRO_LY_CUA_HANG tl ON nv.MaTL = tl.MaTL
       WHERE nv.TenNV LIKE ? OR nv.TaiKhoan LIKE ? OR nv.SDT LIKE ?
       ORDER BY nv.MaNV DESC
       LIMIT ? OFFSET ?`,
      [search, search, search, parseInt(limit), offset]
    );
    const [[{ total }]] = await pool.query(
      `SELECT COUNT(*) AS total FROM NHAN_VIEN
       WHERE TenNV LIKE ? OR TaiKhoan LIKE ? OR SDT LIKE ?`,
      [search, search, search]
    );
    res.json({ data: rows, total, page: parseInt(page), limit: parseInt(limit) });
  } catch (err) {
    res.status(500).json({ message: "Lỗi lấy danh sách nhân viên", error: err.message });
  }
};

/**
 * GET /api/admin/staff/options — lấy danh sách trợ lý để dropdown
 */
export const getTrolyOptions = async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT MaTL, TenTL FROM TRO_LY_CUA_HANG");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: "Lỗi lấy danh sách trợ lý", error: err.message });
  }
};

/**
 * POST /api/admin/staff
 */
export const createStaff = async (req, res) => {
  const { TenNV, TaiKhoan, MatKhau, SDT, DiaChi, MaTL } = req.body;
  if (!TenNV || !TaiKhoan || !MatKhau || !MaTL) {
    return res.status(400).json({ message: "Thiếu thông tin bắt buộc" });
  }
  try {
    const [existing] = await pool.query("SELECT MaNV FROM NHAN_VIEN WHERE TaiKhoan = ?", [TaiKhoan]);
    if (existing.length > 0) {
      return res.status(400).json({ message: "Tài khoản đã tồn tại" });
    }

    let MaNV = genMaNV();
    let [check] = await pool.query("SELECT MaNV FROM NHAN_VIEN WHERE MaNV = ?", [MaNV]);
    while (check.length > 0) {
      MaNV = genMaNV();
      [check] = await pool.query("SELECT MaNV FROM NHAN_VIEN WHERE MaNV = ?", [MaNV]);
    }

    const hashed = await bcrypt.hash(MatKhau, 12);
    await pool.query(
      `INSERT INTO NHAN_VIEN (MaNV, TenNV, TaiKhoan, MatKhau, SDT, DiaChi, MaTL, TrangThai)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'active')`,
      [MaNV, TenNV, TaiKhoan, hashed, SDT || null, DiaChi || null, MaTL]
    );
    res.status(201).json({ message: "Tạo nhân viên thành công", MaNV });
  } catch (err) {
    res.status(500).json({ message: "Lỗi tạo nhân viên", error: err.message });
  }
};

/**
 * GET /api/admin/staff/:id
 */
export const getStaffById = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT nv.*, tl.TenTL FROM NHAN_VIEN nv
       LEFT JOIN TRO_LY_CUA_HANG tl ON nv.MaTL = tl.MaTL
       WHERE nv.MaNV = ?`,
      [req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ message: "Không tìm thấy nhân viên" });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: "Lỗi lấy nhân viên", error: err.message });
  }
};

/**
 * PUT /api/admin/staff/:id
 */
export const updateStaff = async (req, res) => {
  const { TenNV, TaiKhoan, MatKhau, SDT, DiaChi, MaTL, TrangThai } = req.body;
  const { id } = req.params;
  if (!TenNV || !TaiKhoan || !MaTL) {
    return res.status(400).json({ message: "Thiếu thông tin bắt buộc" });
  }
  try {
    const [existing] = await pool.query(
      "SELECT MaNV FROM NHAN_VIEN WHERE TaiKhoan = ? AND MaNV != ?",
      [TaiKhoan, id]
    );
    if (existing.length > 0) {
      return res.status(400).json({ message: "Tài khoản đã được dùng bởi người khác" });
    }

    const validStatus = ["active", "inactive"];
    const newStatus = validStatus.includes(TrangThai) ? TrangThai : undefined;

    if (MatKhau) {
      const hashed = await bcrypt.hash(MatKhau, 12);
      await pool.query(
        `UPDATE NHAN_VIEN SET TenNV=?, TaiKhoan=?, MatKhau=?, SDT=?, DiaChi=?, MaTL=?${newStatus ? ", TrangThai=?" : ""} WHERE MaNV=?`,
        newStatus
          ? [TenNV, TaiKhoan, hashed, SDT || null, DiaChi || null, MaTL, newStatus, id]
          : [TenNV, TaiKhoan, hashed, SDT || null, DiaChi || null, MaTL, id]
      );
    } else {
      await pool.query(
        `UPDATE NHAN_VIEN SET TenNV=?, TaiKhoan=?, SDT=?, DiaChi=?, MaTL=?${newStatus ? ", TrangThai=?" : ""} WHERE MaNV=?`,
        newStatus
          ? [TenNV, TaiKhoan, SDT || null, DiaChi || null, MaTL, newStatus, id]
          : [TenNV, TaiKhoan, SDT || null, DiaChi || null, MaTL, id]
      );
    }
    res.json({ message: "Cập nhật nhân viên thành công" });
  } catch (err) {
    res.status(500).json({ message: "Lỗi cập nhật nhân viên", error: err.message });
  }
};

/**
 * DELETE /api/admin/staff/:id — Vô hiệu hóa (soft delete)
 */
export const deleteStaff = async (req, res) => {
  try {
    await pool.query("UPDATE NHAN_VIEN SET TrangThai='inactive' WHERE MaNV=?", [req.params.id]);
    res.json({ message: "Nhân viên đã được vô hiệu hóa" });
  } catch (err) {
    res.status(500).json({ message: "Lỗi xóa nhân viên", error: err.message });
  }
};
